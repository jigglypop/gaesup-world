import { useCallback, useRef, useEffect, useState } from 'react';

import { useNetworkBridge, UseNetworkBridgeOptions } from './useNetworkBridge';
import type { NetworkGroup, NetworkMessage } from '../types';

export interface GroupCreateOptions {
  maxSize?: number;
  isPrivate?: boolean;
  requireInvite?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UseNetworkGroupOptions extends UseNetworkBridgeOptions {
  npcId: string;
  onGroupJoined?: (groupId: string, group: NetworkGroup) => void;
  onGroupLeft?: (groupId: string) => void;
  onGroupMessage?: (message: NetworkMessage, groupId: string) => void;
  onGroupMemberJoined?: (memberId: string, groupId: string) => void;
  onGroupMemberLeft?: (memberId: string, groupId: string) => void;
}

export interface UseNetworkGroupResult {
  // 그룹 생성 및 관리
  createGroup: (groupId: string, initialMembers?: string[], options?: GroupCreateOptions) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  
  // 그룹 메시지
  sendGroupMessage: (groupId: string, content: unknown, type?: string) => string;
  
  // 그룹 멤버 관리
  inviteToGroup: (groupId: string, npcId: string) => void;
  kickFromGroup: (groupId: string, npcId: string) => void;
  
  // 그룹 상태
  joinedGroups: string[];
  ownedGroups: string[];
  availableGroups: NetworkGroup[];
  
  // 그룹 정보 조회
  getGroupInfo: (groupId: string) => NetworkGroup | null;
  getGroupMembers: (groupId: string) => string[];
  getGroupMessages: (groupId: string) => NetworkMessage[];
  
  // 브릿지 기능
  isReady: boolean;
}

/**
 * 네트워크 그룹 관리를 위한 훅
 */
export function useNetworkGroup(options: UseNetworkGroupOptions): UseNetworkGroupResult {
  const {
    npcId,
    onGroupJoined,
    onGroupLeft,
    onGroupMessage,
    onGroupMemberJoined,
    onGroupMemberLeft,
    ...bridgeOptions
  } = options;

  const {
    executeCommand,
    getSystemState,
    isReady
  } = useNetworkBridge(bridgeOptions);

  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [ownedGroups, setOwnedGroups] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<NetworkGroup[]>([]);
  const [groupMessages, setGroupMessages] = useState<Map<string, NetworkMessage[]>>(new Map());

  const messageCounterRef = useRef<number>(0);
  const groupMembersRef = useRef<Map<string, Set<string>>>(new Map());
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const joinedGroupsRef = useRef<string[]>([]);
  joinedGroupsRef.current = joinedGroups;
  const joinedGroupIdsRef = useRef<Set<string>>(new Set());
  const lastGroupsSigRef = useRef<string>('');
  const lastQueueTailIdRef = useRef<string | null>(null);
  const MAX_SEEN_IDS = 2000;
  const MAX_GROUP_MESSAGE_HISTORY = 500;

  // 그룹 상태 업데이트 (시스템 상태에서 그룹 정보 가져오기)
  useEffect(() => {
    if (!isReady) return;

    const nodeId = `node_${npcId}`;

    const interval = setInterval(() => {
      const state = getSystemState();
      if (!state) return;

      const groups = Array.from(state.groups.values());
      // 그룹/멤버 상태는 변동이 없으면 업데이트하지 않음 (불필요한 리렌더/계산 방지)
      const groupsSig = groups.map(g => `${g.id}:${g.members.size}:${g.lastActivity}`).join('|');
      if (groupsSig !== lastGroupsSigRef.current) {
        lastGroupsSigRef.current = groupsSig;
        setAvailableGroups(groups);

        // 참여 중인 그룹 업데이트 (ref 기반 비교로 무한루프 방지)
        const currentJoinedGroups = groups
          .filter(group => group.members.has(nodeId))
          .map(group => group.id);

        // 빠른 membership 체크용 Set 유지
        joinedGroupIdsRef.current.clear();
        for (const gid of currentJoinedGroups) joinedGroupIdsRef.current.add(gid);

        const prevJoined = joinedGroupsRef.current;
        const newJoinedGroups = currentJoinedGroups.filter(groupId => !prevJoined.includes(groupId));
        const leftGroups = prevJoined.filter(groupId => !currentJoinedGroups.includes(groupId));

        if (newJoinedGroups.length > 0 || leftGroups.length > 0) {
          setJoinedGroups(currentJoinedGroups);
          // "owner" 개념이 없어서, 일단 내가 속한 그룹을 제어 가능 그룹으로 취급
          setOwnedGroups(currentJoinedGroups);

          // 그룹 멤버십이 바뀌면 메시지 큐를 한 번 전체 스캔 (조인 직후 backlog 처리)
          lastQueueTailIdRef.current = null;

          newJoinedGroups.forEach(groupId => {
            const group = groups.find(g => g.id === groupId);
            if (group) onGroupJoined?.(groupId, group);
          });

          leftGroups.forEach(groupId => onGroupLeft?.(groupId));

          if (leftGroups.length > 0) {
            // leftGroups 관련 캐시 정리
            for (const groupId of leftGroups) {
              groupMembersRef.current.delete(groupId);
            }
            setGroupMessages((prev) => {
              const next = new Map(prev);
              for (const groupId of leftGroups) next.delete(groupId);
              return next;
            });
          }
        }

        // 멤버 변화 콜백
        for (const group of groups) {
          const currentMembers = new Set(
            Array.from(group.members).map((memberNodeId) =>
              memberNodeId.startsWith('node_') ? memberNodeId.slice(5) : memberNodeId
            ),
          );

          const prevMembers = groupMembersRef.current.get(group.id);
          if (prevMembers) {
            for (const memberId of currentMembers) {
              if (!prevMembers.has(memberId)) onGroupMemberJoined?.(memberId, group.id);
            }
            for (const memberId of prevMembers) {
              if (!currentMembers.has(memberId)) onGroupMemberLeft?.(memberId, group.id);
            }
          }
          groupMembersRef.current.set(group.id, currentMembers);
        }
      }

      // 메시지 업데이트 (현재 노드 큐 기준)
      const queue = state.messageQueues.get(nodeId) ?? [];
      if (queue.length === 0) return;

      const tailId = queue[queue.length - 1]?.id ?? null;
      const prevTailId = lastQueueTailIdRef.current;
      if (prevTailId && prevTailId === tailId) return;

      // 새 메시지가 없으면 skip, 새 메시지가 있으면 마지막 처리 지점부터만 처리
      let startIdx = 0;
      if (prevTailId) {
        for (let i = queue.length - 1; i >= 0; i--) {
          if (queue[i]?.id === prevTailId) {
            startIdx = i + 1;
            break;
          }
        }
      }
      lastQueueTailIdRef.current = tailId;
      if (startIdx >= queue.length) return;

      // 그룹에 속해있지 않으면 group 메시지는 처리할 게 없음
      if (joinedGroupIdsRef.current.size === 0) return;

      setGroupMessages((prev) => {
        const next = new Map(prev);
        const touchedGroups = new Set<string>();
        for (let i = startIdx; i < queue.length; i++) {
          const msg = queue[i];
          if (msg.to !== 'group' || !msg.groupId) continue;
          if (!joinedGroupIdsRef.current.has(msg.groupId)) continue;
          if (seenMessageIdsRef.current.has(msg.id)) continue;

          // 크기 제한: 오래된 항목 일괄 정리
          if (seenMessageIdsRef.current.size >= MAX_SEEN_IDS) {
            const entries = Array.from(seenMessageIdsRef.current);
            seenMessageIdsRef.current = new Set(entries.slice(entries.length - Math.floor(MAX_SEEN_IDS / 2)));
          }
          seenMessageIdsRef.current.add(msg.id);
          const existing = next.get(msg.groupId);
          const list = touchedGroups.has(msg.groupId)
            ? (existing ?? [])
            : (existing ? existing.slice() : []);
          if (!touchedGroups.has(msg.groupId)) {
            touchedGroups.add(msg.groupId);
            next.set(msg.groupId, list);
          }
          list.push(msg);
          onGroupMessage?.(msg, msg.groupId);
        }
        if (touchedGroups.size === 0) return prev;

        // 그룹별 히스토리 상한 (무한 증가 방지)
        for (const groupId of touchedGroups) {
          const list = next.get(groupId);
          if (list && list.length > MAX_GROUP_MESSAGE_HISTORY) {
            next.set(groupId, list.slice(-MAX_GROUP_MESSAGE_HISTORY));
          }
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isReady, getSystemState, npcId, onGroupJoined, onGroupLeft, onGroupMessage, onGroupMemberJoined, onGroupMemberLeft]);

  const createGroup = useCallback((
    groupId: string,
    initialMembers: string[] = [],
    groupOptions?: GroupCreateOptions
  ) => {
    if (!isReady) return;
    void groupId;
    void initialMembers;

    const now = Date.now();
    executeCommand({
      type: 'createGroup',
      group: {
        type: 'party',
        members: new Set<string>(),
        maxMembers: groupOptions?.maxSize ?? 20,
        range: 1000,
        persistent: false,
        createdAt: now,
        lastActivity: now,
      },
    });
  }, [isReady, executeCommand, npcId]);

  const joinGroup = useCallback((groupId: string) => {
    if (!isReady) return;

    executeCommand({
      type: 'joinGroup',
      npcId,
      groupId
    });
  }, [isReady, executeCommand, npcId]);

  const leaveGroup = useCallback((groupId: string) => {
    if (!isReady) return;

    executeCommand({
      type: 'leaveGroup',
      npcId,
      groupId
    });
  }, [isReady, executeCommand, npcId]);

  const sendGroupMessage = useCallback((
    groupId: string,
    content: unknown,
    type: string = 'chat'
  ): string => {
    if (!isReady || !joinedGroups.includes(groupId)) return '';

    const messageId = `${npcId}-group-${++messageCounterRef.current}-${Date.now()}`;
    const timestamp = Date.now();

    const message: NetworkMessage = {
      id: messageId,
      from: npcId,
      to: 'group',
      groupId,
      type: type === 'action' || type === 'state' || type === 'system' ? type : 'chat',
      payload: content,
      priority: 'normal',
      timestamp,
      reliability: 'reliable',
    };

    executeCommand({
      type: 'sendMessage',
      message
    });

    return messageId;
  }, [isReady, executeCommand, npcId, joinedGroups]);

  const inviteToGroup = useCallback((groupId: string, targetNpcId: string) => {
    if (!isReady || !ownedGroups.includes(groupId)) return;

    // 그룹 초대는 시스템 메시지로 처리
    const message: NetworkMessage = {
      id: `invite-${Date.now()}`,
      from: npcId,
      to: targetNpcId,
      type: 'system',
      payload: { groupId, inviterId: npcId },
      priority: 'normal',
      timestamp: Date.now(),
      reliability: 'reliable',
    };
    executeCommand({
      type: 'sendMessage',
      message
    });
  }, [isReady, executeCommand, npcId, ownedGroups]);

  const kickFromGroup = useCallback((groupId: string, targetNpcId: string) => {
    if (!isReady || !ownedGroups.includes(groupId)) return;

    executeCommand({
      type: 'leaveGroup',
      npcId: targetNpcId,
      groupId
    });
  }, [isReady, executeCommand, ownedGroups]);

  const getGroupInfo = useCallback((groupId: string): NetworkGroup | null => {
    return availableGroups.find(group => group.id === groupId) || null;
  }, [availableGroups]);

  const getGroupMembers = useCallback((groupId: string): string[] => {
    const group = getGroupInfo(groupId);
    if (!group) return [];
    return Array.from(group.members).map((memberNodeId) =>
      memberNodeId.startsWith('node_') ? memberNodeId.slice(5) : memberNodeId
    );
  }, [getGroupInfo]);

  const getGroupMessages = useCallback((groupId: string): NetworkMessage[] => {
    return groupMessages.get(groupId) || [];
  }, [groupMessages]);

  return {
    // 그룹 생성 및 관리
    createGroup,
    joinGroup,
    leaveGroup,
    
    // 그룹 메시지
    sendGroupMessage,
    
    // 그룹 멤버 관리
    inviteToGroup,
    kickFromGroup,
    
    // 그룹 상태
    joinedGroups,
    ownedGroups,
    availableGroups,
    
    // 그룹 정보 조회
    getGroupInfo,
    getGroupMembers,
    getGroupMessages,
    
    // 브릿지 기능
    isReady
  };
} 