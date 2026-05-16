import { UseNetworkBridgeOptions } from './useNetworkBridge';
import { NetworkMessage, NetworkPayload } from '../types';
export interface MessageSendOptions {
    reliable?: boolean;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    timeout?: number;
    retries?: number;
}
export interface BroadcastOptions extends MessageSendOptions {
    range?: number;
    groupId?: string;
    excludeIds?: string[];
}
export interface UseNetworkMessageOptions extends UseNetworkBridgeOptions {
    senderId: string;
    onMessageReceived?: (message: NetworkMessage) => void;
    onMessageSent?: (message: NetworkMessage) => void;
    onMessageFailed?: (message: NetworkMessage, error: string) => void;
    messageFilter?: (message: NetworkMessage) => boolean;
}
export interface UseNetworkMessageResult {
    sendMessage: (receiverId: string, content: NetworkPayload, type?: string, options?: MessageSendOptions) => string;
    broadcastMessage: (content: NetworkPayload, type?: string, options?: BroadcastOptions) => string;
    receivedMessages: NetworkMessage[];
    sentMessages: NetworkMessage[];
    pendingMessages: NetworkMessage[];
    clearMessages: () => void;
    getMessageHistory: (withUserId?: string) => NetworkMessage[];
    getMessageById: (messageId: string) => NetworkMessage | null;
    getMessageStats: () => {
        totalSent: number;
        totalReceived: number;
        totalPending: number;
        averageLatency: number;
    };
    isReady: boolean;
}
/**
 * 네트워크 메시지 송수신을 위한 훅
 */
export declare function useNetworkMessage(options: UseNetworkMessageOptions): UseNetworkMessageResult;
