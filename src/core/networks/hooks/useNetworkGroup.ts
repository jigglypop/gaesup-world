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

  // 그룹 상태 업데이트 (시스템 상태에서 그룹 정보 가져오기)
  useEffect(() => {
    if (!isReady) return;

    const nodeId = `node_${npcId}`;

    const interval = setInterval(() => {
      const state = getSystemState();
      if (!state) return;

      const groups = Array.from(state.groups.values());
      setAvailableGroups(groups);

      // 참여 중인 그룹 업데이트
      const currentJoinedGroups = groups
        .filter(group => group.members.has(nodeId))
        .map(group => group.id);

      const newJoinedGroups = currentJoinedGroups.filter(groupId => !joinedGroups.includes(groupId));
      const leftGroups = joinedGroups.filter(groupId => !currentJoinedGroups.includes(groupId));

      if (newJoinedGroups.length > 0 || leftGroups.length > 0) {
        setJoinedGroups(currentJoinedGroups);
        // "owner" 개념이 없어서, 일단 내가 속한 그룹을 제어 가능 그룹으로 취급
        setOwnedGroups(currentJoinedGroups);

        newJoinedGroups.forEach(groupId => {
          const group = groups.find(g => g.id === groupId);
          if (group) onGroupJoined?.(groupId, group);
        });

        leftGroups.forEach(groupId => onGroupLeft?.(groupId));
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

      // 메시지 업데이트 (현재 노드 큐 기준)
      const queue = state.messageQueues.get(nodeId) ?? [];
      if (queue.length === 0) return;

      setGroupMessages((prev) => {
        const next = new Map(prev);
        for (const msg of queue) {
          if (msg.to !== 'group' || !msg.groupId) continue;
          if (!currentJoinedGroups.includes(msg.groupId)) continue;
          if (seenMessageIdsRef.current.has(msg.id)) continue;

          seenMessageIdsRef.current.add(msg.id);
          const list = next.get(msg.groupId) ?? [];
          list.push(msg);
          next.set(msg.groupId, list);
          onGroupMessage?.(msg, msg.groupId);
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isReady, getSystemState, npcId, joinedGroups, onGroupJoined, onGroupLeft, onGroupMessage, onGroupMemberJoined, onGroupMemberLeft]);

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