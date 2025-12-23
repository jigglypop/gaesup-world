import { useCallback, useRef, useEffect, useState } from 'react';

import { useNetworkBridge, UseNetworkBridgeOptions } from './useNetworkBridge';
import { NetworkGroup, NetworkMessage } from '../types';

export interface GroupCreateOptions {
  maxSize?: number;
  isPrivate?: boolean;
  requireInvite?: boolean;
  metadata?: Record<string, any>;
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
  sendGroupMessage: (groupId: string, content: any, type?: string) => string;
  
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
    getSnapshot,
    isReady
  } = useNetworkBridge(bridgeOptions);

  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [ownedGroups, setOwnedGroups] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<NetworkGroup[]>([]);
  const [groupMessages, setGroupMessages] = useState<Map<string, NetworkMessage[]>>(new Map());

  const messageCounterRef = useRef<number>(0);

  // 그룹 상태 업데이트 (스냅샷에서 그룹 정보 가져오기)
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      const snapshot = getSnapshot();
      if (snapshot && snapshot.groups) {
        const groups = Array.from(snapshot.groups.values());
        setAvailableGroups(groups);

        // 참여 중인 그룹 업데이트
        const currentJoinedGroups = groups
          .filter(group => group.members.includes(npcId))
          .map(group => group.id);
        
        const newJoinedGroups = currentJoinedGroups.filter(groupId => !joinedGroups.includes(groupId));
        const leftGroups = joinedGroups.filter(groupId => !currentJoinedGroups.includes(groupId));

        if (newJoinedGroups.length > 0 || leftGroups.length > 0) {
          setJoinedGroups(currentJoinedGroups);
          
          // 콜백 호출
          newJoinedGroups.forEach(groupId => {
            const group = groups.find(g => g.id === groupId);
            if (group) {
              onGroupJoined?.(groupId, group);
            }
          });
          
          leftGroups.forEach(groupId => {
            onGroupLeft?.(groupId);
          });
        }

        // 소유 중인 그룹 업데이트
        const currentOwnedGroups = groups
          .filter(group => group.ownerId === npcId)
          .map(group => group.id);
        setOwnedGroups(currentOwnedGroups);

        // 그룹 메시지 업데이트
        if (snapshot.messages) {
          const newGroupMessages = new Map(groupMessages);
          
          snapshot.messages
            .filter(msg => msg.receiverId.startsWith('group:'))
            .forEach(msg => {
              const groupId = msg.receiverId.replace('group:', '');
              if (currentJoinedGroups.includes(groupId)) {
                const messages = newGroupMessages.get(groupId) || [];
                if (!messages.find(existing => existing.id === msg.id)) {
                  messages.push(msg);
                  newGroupMessages.set(groupId, messages);
                  onGroupMessage?.(msg, groupId);
                }
              }
            });
          
          setGroupMessages(newGroupMessages);
        }
      }
    }, 100); // 100ms마다 체크

    return () => clearInterval(interval);
  }, [isReady, getSnapshot, npcId, joinedGroups, groupMessages, onGroupJoined, onGroupLeft, onGroupMessage]);

  const createGroup = useCallback((
    groupId: string,
    initialMembers: string[] = [],
    groupOptions?: GroupCreateOptions
  ) => {
    if (!isReady) return;

    const members = [npcId, ...initialMembers.filter(id => id !== npcId)];

    executeCommand({
      type: 'createGroup',
      data: {
        groupId,
        npcIds: members,
        options: {
          maxSize: groupOptions?.maxSize || 20,
          isPrivate: groupOptions?.isPrivate || false,
          requireInvite: groupOptions?.requireInvite || false,
          metadata: groupOptions?.metadata || {}
        }
      }
    });

    setOwnedGroups(prev => [...prev, groupId]);
  }, [isReady, executeCommand, npcId]);

  const joinGroup = useCallback((groupId: string) => {
    if (!isReady) return;

    executeCommand({
      type: 'joinGroup',
      data: {
        npcId,
        groupId
      }
    });
  }, [isReady, executeCommand, npcId]);

  const leaveGroup = useCallback((groupId: string) => {
    if (!isReady) return;

    executeCommand({
      type: 'leaveGroup',
      data: {
        npcId,
        groupId
      }
    });
  }, [isReady, executeCommand, npcId]);

  const sendGroupMessage = useCallback((
    groupId: string,
    content: any,
    type: string = 'group-chat'
  ): string => {
    if (!isReady || !joinedGroups.includes(groupId)) return '';

    const messageId = `${npcId}-group-${++messageCounterRef.current}-${Date.now()}`;
    const timestamp = Date.now();

    const message: NetworkMessage = {
      id: messageId,
      type,
      content,
      timestamp,
      senderId: npcId,
      receiverId: `group:${groupId}`
    };

    executeCommand({
      type: 'sendMessage',
      data: {
        fromId: npcId,
        toId: `group:${groupId}`,
        message
      }
    });

    return messageId;
  }, [isReady, executeCommand, npcId, joinedGroups]);

  const inviteToGroup = useCallback((groupId: string, targetNpcId: string) => {
    if (!isReady || !ownedGroups.includes(groupId)) return;

    // 그룹 초대는 시스템 메시지로 처리
    executeCommand({
      type: 'sendMessage',
      data: {
        fromId: npcId,
        toId: targetNpcId,
        message: {
          id: `invite-${Date.now()}`,
          type: 'group-invite',
          content: { groupId, inviterId: npcId },
          timestamp: Date.now(),
          senderId: npcId,
          receiverId: targetNpcId
        }
      }
    });
  }, [isReady, executeCommand, npcId, ownedGroups]);

  const kickFromGroup = useCallback((groupId: string, targetNpcId: string) => {
    if (!isReady || !ownedGroups.includes(groupId)) return;

    executeCommand({
      type: 'leaveGroup',
      data: {
        npcId: targetNpcId,
        groupId
      }
    });
  }, [isReady, executeCommand, ownedGroups]);

  const getGroupInfo = useCallback((groupId: string): NetworkGroup | null => {
    return availableGroups.find(group => group.id === groupId) || null;
  }, [availableGroups]);

  const getGroupMembers = useCallback((groupId: string): string[] => {
    const group = getGroupInfo(groupId);
    return group ? group.members : [];
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