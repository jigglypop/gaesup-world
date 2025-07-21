import { useCallback, useRef, useEffect, useState } from 'react';
import { useNetworkBridge, UseNetworkBridgeOptions } from './useNetworkBridge';
import { NetworkMessage } from '../types';

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
  // 메시지 전송
  sendMessage: (receiverId: string, content: any, type?: string, options?: MessageSendOptions) => string;
  broadcastMessage: (content: any, type?: string, options?: BroadcastOptions) => string;
  
  // 메시지 상태
  receivedMessages: NetworkMessage[];
  sentMessages: NetworkMessage[];
  pendingMessages: NetworkMessage[];
  
  // 메시지 관리
  clearMessages: () => void;
  getMessageHistory: (withUserId?: string) => NetworkMessage[];
  getMessageById: (messageId: string) => NetworkMessage | null;
  
  // 통계
  getMessageStats: () => {
    totalSent: number;
    totalReceived: number;
    totalPending: number;
    averageLatency: number;
  };
  
  // 브릿지 기능
  isReady: boolean;
}

/**
 * 네트워크 메시지 송수신을 위한 훅
 */
export function useNetworkMessage(options: UseNetworkMessageOptions): UseNetworkMessageResult {
  const {
    senderId,
    onMessageReceived,
    onMessageSent,
    onMessageFailed,
    messageFilter,
    ...bridgeOptions
  } = options;

  const {
    executeCommand,
    getSnapshot,
    isReady
  } = useNetworkBridge(bridgeOptions);

  const [receivedMessages, setReceivedMessages] = useState<NetworkMessage[]>([]);
  const [sentMessages, setSentMessages] = useState<NetworkMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<NetworkMessage[]>([]);

  const messageCounterRef = useRef<number>(0);

  const sendMessage = useCallback((
    receiverId: string,
    content: any,
    type: string = 'chat',
    messageOptions?: MessageSendOptions
  ): string => {
    if (!isReady) return '';

    const messageId = `${senderId}-${++messageCounterRef.current}-${Date.now()}`;
    const timestamp = Date.now();

    const message: NetworkMessage = {
      id: messageId,
      type,
      content,
      timestamp,
      senderId,
      receiverId
    };

    executeCommand({
      type: 'sendMessage',
      data: {
        fromId: senderId,
        toId: receiverId,
        message
      }
    });

    setSentMessages(prev => [...prev, message]);
    onMessageSent?.(message);

    return messageId;
  }, [isReady, executeCommand, senderId, onMessageSent]);

  const broadcastMessage = useCallback((
    content: any,
    type: string = 'broadcast',
    broadcastOptions?: BroadcastOptions
  ): string => {
    if (!isReady) return '';

    const messageId = `${senderId}-broadcast-${++messageCounterRef.current}-${Date.now()}`;
    const timestamp = Date.now();

    const message: NetworkMessage = {
      id: messageId,
      type,
      content,
      timestamp,
      senderId,
      receiverId: 'broadcast'
    };

    executeCommand({
      type: 'broadcastMessage',
      data: {
        fromId: senderId,
        message,
        options: broadcastOptions || {}
      }
    });

    setSentMessages(prev => [...prev, message]);
    onMessageSent?.(message);

    return messageId;
  }, [isReady, executeCommand, senderId, onMessageSent]);

  const clearMessages = useCallback(() => {
    setReceivedMessages([]);
    setSentMessages([]);
    setPendingMessages([]);
  }, []);

  const getMessageHistory = useCallback((withUserId?: string): NetworkMessage[] => {
    if (!withUserId) {
      return [...receivedMessages, ...sentMessages].sort((a, b) => a.timestamp - b.timestamp);
    }

    return [...receivedMessages, ...sentMessages]
      .filter(msg => 
        msg.senderId === withUserId || 
        msg.receiverId === withUserId ||
        (msg.senderId === senderId && msg.receiverId === withUserId) ||
        (msg.receiverId === senderId && msg.senderId === withUserId)
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [receivedMessages, sentMessages, senderId]);

  const getMessageById = useCallback((messageId: string): NetworkMessage | null => {
    return [...receivedMessages, ...sentMessages].find(msg => msg.id === messageId) || null;
  }, [receivedMessages, sentMessages]);

  const getMessageStats = useCallback(() => {
    return {
      totalSent: sentMessages.length,
      totalReceived: receivedMessages.length,
      totalPending: pendingMessages.length,
      averageLatency: 0
    };
  }, [sentMessages, receivedMessages, pendingMessages]);

  return {
    sendMessage,
    broadcastMessage,
    receivedMessages,
    sentMessages,
    pendingMessages,
    clearMessages,
    getMessageHistory,
    getMessageById,
    getMessageStats,
    isReady
  };
} 