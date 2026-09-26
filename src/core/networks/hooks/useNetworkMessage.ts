import { useCallback, useEffect, useRef, useState } from 'react';

import { takeNewMessages, type QueueCursor } from './queueCursor';
import { useNetworkBridge, UseNetworkBridgeOptions } from './useNetworkBridge';
import { createUniqueId } from '../../utils/id';
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
  /** Direct and broadcast messages from others; group messages arrive through `useNetworkGroup`. */
  onMessageReceived?: (message: NetworkMessage) => void;
  onMessageSent?: (message: NetworkMessage) => void;
  /** @deprecated Has no effect; the network does not report delivery failures. */
  onMessageFailed?: (message: NetworkMessage, error: string) => void;
  /** Drops an incoming message before it reaches `receivedMessages` and `onMessageReceived`. */
  messageFilter?: (message: NetworkMessage) => boolean;
}

const RECEIVE_POLL_MS = 250;
const MAX_SEEN_IDS = 2000;

export interface UseNetworkMessageResult {
  // 메시지 전송
  sendMessage: (receiverId: string, content: NetworkPayload, type?: string, options?: MessageSendOptions) => string;
  broadcastMessage: (content: NetworkPayload, type?: string, options?: BroadcastOptions) => string;
  
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
  const { senderId, onMessageSent, onMessageReceived, messageFilter, ...bridgeOptions } = options;
  const {
    executeCommand,
    getSystemState,
    isReady
  } = useNetworkBridge(bridgeOptions);

  const MAX_MESSAGE_HISTORY = 500;
  const [receivedMessages, setReceivedMessages] = useState<NetworkMessage[]>([]);
  const [sentMessages, setSentMessages] = useState<NetworkMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<NetworkMessage[]>([]);
  const receiving = useRef({ onMessageReceived, messageFilter });
  receiving.current = { onMessageReceived, messageFilter };
  const queueCursor = useRef<QueueCursor>({ tailId: null });
  const seenIds = useRef(new Set<string>());

  // Incoming messages land in this sender's node queue.
  useEffect(() => {
    if (!isReady) return undefined;
    const nodeId = `node_${senderId}`;
    const interval = setInterval(() => {
      const { onMessageReceived: notify, messageFilter: accepts } = receiving.current;
      const arrived = takeNewMessages(getSystemState()?.messageQueues.get(nodeId) ?? [], queueCursor.current).filter((message) =>
        message.to !== 'group' && message.from !== senderId && !seenIds.current.has(message.id) && (accepts?.(message) ?? true));
      if (arrived.length === 0) return;
      if (seenIds.current.size > MAX_SEEN_IDS) seenIds.current = new Set(Array.from(seenIds.current).slice(-MAX_SEEN_IDS / 2));
      for (const message of arrived) {
        seenIds.current.add(message.id);
        notify?.(message);
      }
      setReceivedMessages((prev) => {
        const next = [...prev, ...arrived];
        return next.length > MAX_MESSAGE_HISTORY ? next.slice(-MAX_MESSAGE_HISTORY) : next;
      });
    }, RECEIVE_POLL_MS);
    return () => clearInterval(interval);
  }, [isReady, senderId, getSystemState]);

  const sendMessage = useCallback((
    receiverId: string,
    content: NetworkPayload,
    type: string = 'chat',
    messageOptions?: MessageSendOptions
  ): string => {
    if (!isReady) return '';

    const messageId = createUniqueId(senderId);
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

    setSentMessages(prev => {
      const next = [...prev, message];
      return next.length > MAX_MESSAGE_HISTORY ? next.slice(-MAX_MESSAGE_HISTORY) : next;
    });
    onMessageSent?.(message);

    return messageId;
  }, [isReady, executeCommand, senderId, onMessageSent]);

  const broadcastMessage = useCallback((
    content: NetworkPayload,
    type: string = 'chat',
    broadcastOptions?: BroadcastOptions
  ): string => {
    if (!isReady) return '';

    const messageId = createUniqueId(`${senderId}-broadcast`);
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
    setSentMessages(prev => {
      const next = [...prev, localMessage];
      return next.length > MAX_MESSAGE_HISTORY ? next.slice(-MAX_MESSAGE_HISTORY) : next;
    });
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
