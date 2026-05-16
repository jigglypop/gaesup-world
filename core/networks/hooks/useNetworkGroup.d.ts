import { UseNetworkBridgeOptions } from './useNetworkBridge';
import type { NetworkGroup, NetworkMessage, NetworkPayload } from '../types';
export interface GroupCreateOptions {
    maxSize?: number;
    isPrivate?: boolean;
    requireInvite?: boolean;
    metadata?: Record<string, NetworkPayload>;
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
    createGroup: (groupId: string, initialMembers?: string[], options?: GroupCreateOptions) => void;
    joinGroup: (groupId: string) => void;
    leaveGroup: (groupId: string) => void;
    sendGroupMessage: (groupId: string, content: NetworkPayload, type?: string) => string;
    inviteToGroup: (groupId: string, npcId: string) => void;
    kickFromGroup: (groupId: string, npcId: string) => void;
    joinedGroups: string[];
    ownedGroups: string[];
    availableGroups: NetworkGroup[];
    getGroupInfo: (groupId: string) => NetworkGroup | null;
    getGroupMembers: (groupId: string) => string[];
    getGroupMessages: (groupId: string) => NetworkMessage[];
    isReady: boolean;
}
/**
 * 네트워크 그룹 관리를 위한 훅
 */
export declare function useNetworkGroup(options: UseNetworkGroupOptions): UseNetworkGroupResult;
