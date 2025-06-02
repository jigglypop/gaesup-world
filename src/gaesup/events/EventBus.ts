import * as THREE from 'three';
import { useEffect, useRef } from 'react';

export type EventType = 
  | 'playerMoveStart'
  | 'playerMoveStop'
  | 'playerJumpStart'
  | 'playerJumpEnd'
  | 'playerLanded'
  | 'playerFalling'
  | 'playerRunningStart'
  | 'playerRunningStop'
  | 'playerGroundTouch'
  | 'playerGroundLeave'
  | 'playerRideStart'
  | 'playerRideEnd'
  | 'npcStateChange'
  | 'uiToggle'
  | 'globalKeyEvent';

export interface EventPayload {
  playerMoveStart: { position: THREE.Vector3; velocity: THREE.Vector3 };
  playerMoveStop: { position: THREE.Vector3 };
  playerJumpStart: { position: THREE.Vector3; velocity: THREE.Vector3 };
  playerJumpEnd: { position: THREE.Vector3 };
  playerLanded: { position: THREE.Vector3; impact: number };
  playerFalling: { position: THREE.Vector3; velocity: THREE.Vector3 };
  playerRunningStart: { position: THREE.Vector3 };
  playerRunningStop: { position: THREE.Vector3 };
  playerGroundTouch: { position: THREE.Vector3; normal: THREE.Vector3 };
  playerGroundLeave: { position: THREE.Vector3; lastGroundY: number };
  playerRideStart: { rideableId: string; position: THREE.Vector3 };
  playerRideEnd: { rideableId: string; position: THREE.Vector3 };
  npcStateChange: { npcId: string; state: string; data: any };
  uiToggle: { uiType: string; isOpen: boolean };
  globalKeyEvent: { key: string; action: 'down' | 'up' | 'pressed' };
}

type EventCallback<T extends EventType> = (payload: EventPayload[T]) => void;
type AnyEventCallback = (payload: any) => void;

/**
 * 전역 이벤트 버스 시스템
 * CustomEvent API를 활용한 pub/sub 패턴 구현
 */
class EventBusManager {
  private element: EventTarget;
  private listeners: Map<string, AnyEventCallback> = new Map();

  constructor() {
    // 전용 이벤트 타겟 생성 (document 대신 사용)
    this.element = new EventTarget();
  }

  /**
   * 이벤트 구독
   * @param eventType 이벤트 타입
   * @param callback 콜백 함수
   * @returns 구독 해제 함수
   */
  on<T extends EventType>(
    eventType: T,
    callback: EventCallback<T>
  ): () => void {
    const wrappedCallback = (event: Event) => {
      const customEvent = event as CustomEvent<EventPayload[T]>;
      callback(customEvent.detail);
    };

    const listenerId = `${eventType}_${Date.now()}_${Math.random()}`;
    this.listeners.set(listenerId, wrappedCallback);
    this.element.addEventListener(eventType, wrappedCallback);

    // 구독 해제 함수 반환
    return () => {
      this.element.removeEventListener(eventType, wrappedCallback);
      this.listeners.delete(listenerId);
    };
  }

  /**
   * 이벤트 발행
   * @param eventType 이벤트 타입
   * @param payload 이벤트 데이터
   */
  dispatch<T extends EventType>(
    eventType: T,
    payload: EventPayload[T]
  ): void {
    const event = new CustomEvent(eventType, {
      detail: payload,
      bubbles: false,
      cancelable: false,
    });

    this.element.dispatchEvent(event);
  }

  /**
   * 한 번만 실행되는 이벤트 구독
   * @param eventType 이벤트 타입
   * @param callback 콜백 함수
   */
  once<T extends EventType>(
    eventType: T,
    callback: EventCallback<T>
  ): void {
    const unsubscribe = this.on(eventType, (payload) => {
      callback(payload);
      unsubscribe();
    });
  }

  /**
   * 모든 구독 해제 (메모리 정리용)
   */
  clear(): void {
    this.listeners.forEach((callback, listenerId) => {
      const [eventType] = listenerId.split('_');
      this.element.removeEventListener(eventType, callback);
    });
    this.listeners.clear();
  }

  /**
   * 개발용 디버깅 정보
   */
  getStats() {
    return {
      totalListeners: this.listeners.size,
      listeners: Array.from(this.listeners.keys()),
    };
  }
}

// 전역 이벤트 버스 인스턴스
export const EventBus = new EventBusManager();

// React Hook for 컴포넌트에서 쉽게 사용할 수 있도록
export function useEventBus<T extends EventType>(
  eventType: T,
  callback: EventCallback<T>,
  deps: React.DependencyList = []
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const unsubscribe = EventBus.on(eventType, (payload) => {
      callbackRef.current(payload);
    });

    return unsubscribe;
  }, [eventType, ...deps]);
}

export default EventBus; 