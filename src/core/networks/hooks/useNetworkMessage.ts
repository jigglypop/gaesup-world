import { useCallback, useRef, useState } from 'react';

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
  sendMessage: (receiverId: string, content: unknown, type?: string, options?: MessageSendOptions) => string;
  broadcastMessage: (content: unknown, type?: string, options?: BroadcastOptions) => string;
  
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
  void onMessageReceived;
  void onMessageFailed;
  void messageFilter;

  const {
    executeCommand,
    isReady
  } = useNetworkBridge(bridgeOptions);

  const [receivedMessages, setReceivedMessages] = useState<NetworkMessage[]>([]);
  const [sentMessages, setSentMessages] = useState<NetworkMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<NetworkMessage[]>([]);

  const messageCounterRef = useRef<number>(0);

  const sendMessage = useCallback((
    receiverId: string,
    content: unknown,
    type: string = 'chat',
    messageOptions?: MessageSendOptions
  ): string => {
    if (!isReady) return '';

    const messageId = `${senderId}-${++messageCounterRef.current}-${Date.now()}`;
    const timestamp = Date.now();

    const message: NetworkMessage = {
      id: messageId,
      from: senderId,
      to: receiverId,
      type: type === 'action' || type === 'state' || type === 'system' ? type : 'chat',
      payload: content,
      priority: messageOptions?.priority ?? 'normal',
      timestamp,
      reliability: messageOptions?.reliable ? 'reliable' : 'unreliable',
      ...(messageOptions?.retries !== undefined ? { retryCount: messageOptions.retries } : {})
    };

    executeCommand({
      type: 'sendMessage',
      message
    });

    setSentMessages(prev => [...prev, message]);
    onMessageSent?.(message);

    return messageId;
  }, [isReady, executeCommand, senderId, onMessageSent]);

  const broadcastMessage = useCallback((
    content: unknown,
    type: string = 'chat',
    broadcastOptions?: BroadcastOptions
  ): string => {
    if (!isReady) return '';

    const messageId = `${senderId}-broadcast-${++messageCounterRef.current}-${Date.now()}`;
    const timestamp = Date.now();

    const message: Omit<NetworkMessage, 'to'> = {
      id: messageId,
      from: senderId,
      type: type === 'action' || type === 'state' || type === 'system' ? type : 'chat',
      payload: content,
      priority: broadcastOptions?.priority ?? 'normal',
      timestamp,
      reliability: broadcastOptions?.reliable ? 'reliable' : 'unreliable',
      ...(broadcastOptions?.groupId ? { groupId: broadcastOptions.groupId } : {}),
      ...(broadcastOptions?.retries !== undefined ? { retryCount: broadcastOptions.retries } : {})
    };

    executeCommand({
      type: 'broadcast',
      message
    });

    // broadcast는 시스템에서 to를 추가하므로, UI용으로는 가상 to를 채워서 저장
    const localMessage: NetworkMessage = { ...message, to: 'broadcast' };
    setSentMessages(prev => [...prev, localMessage]);
    onMessageSent?.(localMessage);

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
        msg.from === withUserId || 
        msg.to === withUserId ||
        (msg.from === senderId && msg.to === withUserId) ||
        (msg.to === senderId && msg.from === withUserId)
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