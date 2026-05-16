import ze, { useRef as S, useState as _, useEffect as J, useCallback as z, useMemo as re, Suspense as $e } from "react";
import { useFrame as Se, Canvas as Ve } from "@react-three/fiber";
import { B as qe, u as Ne } from "./gaesupStore-x2iiDzsY.js";
import * as B from "three";
import { M as wn, c as vn } from "./types-Ck0ueY4N.js";
import { c as Cn, a as Mn, b as Pn, d as kn, e as Tn, f as Rn, g as zn } from "./authority-CysRQudy.js";
import { jsx as c, jsxs as d } from "react/jsx-runtime";
import { Text as ce, Sphere as Ae, Line as Je, useGLTF as He, useAnimations as Ye, Environment as je, Grid as Ke } from "@react-three/drei";
import { RigidBody as Fe, CapsuleCollider as Xe, Physics as Ze, euler as et } from "@react-three/rapier";
import { SkeletonUtils as tt } from "three-stdlib";
import { w as nt } from "./sfe-CRsG1dTW.js";
import { S as Oe } from "./index-CUYKx17r.js";
import "reflect-metadata";
import { W as st, G as ot } from "./index-BzhEldhU.js";
import { C as rt, a as it, G as at } from "./index-Bgb2rlWx.js";
import { create as _e } from "zustand";
import { $ as ct, a0 as lt, a1 as ut, a2 as dt, a3 as ht, a8 as pt } from "./index-DmHVuHAr.js";
import { W as gt } from "./snapshot-OExk53wq.js";
class ft {
  availableConnections = [];
  activeConnections = /* @__PURE__ */ new Map();
  connectionIdCounter = 1;
  maxPoolSize;
  defaultOptions;
  constructor(e = 50, t) {
    this.maxPoolSize = e, this.defaultOptions = {
      timeout: 3e4,
      retries: 3,
      bandwidth: 1e3,
      encryption: !1,
      ...t
    };
  }
  // 새 연결 생성
  createConnection(e, t, n) {
    const s = { ...this.defaultOptions, ...n };
    return {
      id: `conn_${this.connectionIdCounter++}`,
      nodeA: e,
      nodeB: t,
      strength: 1,
      latency: Math.random() * 50 + 10,
      // 10-60ms
      bandwidth: s.bandwidth,
      status: "establishing",
      lastActivity: Date.now()
    };
  }
  // 연결 가져오기 또는 생성
  getConnection(e, t, n) {
    const s = { ...this.defaultOptions, ...n }, o = this.availableConnections.pop();
    if (o)
      return o.nodeA = e, o.nodeB = t, o.status = "establishing", o.strength = 1, o.latency = 0, o.bandwidth = s.bandwidth, o.lastActivity = Date.now(), this.activeConnections.set(o.id, o), o;
    const i = this.createConnection(e, t, n);
    return this.activeConnections.set(i.id, i), i;
  }
  // 연결 해제 및 풀로 반환
  releaseConnection(e) {
    const t = this.activeConnections.get(e);
    return t ? (this.activeConnections.delete(e), this.resetConnection(t), this.availableConnections.length < this.maxPoolSize && this.availableConnections.push(t), !0) : !1;
  }
  // 연결 상태 리셋
  resetConnection(e) {
    e.nodeA = "", e.nodeB = "", e.status = "disconnected", e.strength = 0, e.latency = 0, e.lastActivity = 0;
  }
  // 활성 연결 가져오기
  getActiveConnection(e) {
    return this.activeConnections.get(e) || null;
  }
  // 두 노드 간 활성 연결 찾기
  findActiveConnection(e, t) {
    for (const n of this.activeConnections.values())
      if (n.nodeA === e && n.nodeB === t || n.nodeA === t && n.nodeB === e)
        return n;
    return null;
  }
  // 연결 상태 업데이트
  updateConnectionStatus(e, t) {
    const n = this.activeConnections.get(e);
    return n ? (n.status = t, n.lastActivity = Date.now(), !0) : !1;
  }
  // 연결 성능 업데이트
  updateConnectionMetrics(e, t) {
    const n = this.activeConnections.get(e);
    return n ? (t.latency !== void 0 && (n.latency = t.latency), t.bandwidth !== void 0 && (n.bandwidth = t.bandwidth), t.strength !== void 0 && (n.strength = t.strength), n.lastActivity = Date.now(), !0) : !1;
  }
  // 오래된 연결 정리
  cleanupInactiveConnections(e = 3e5) {
    const t = Date.now();
    let n = 0;
    const s = [];
    for (const [o, i] of this.activeConnections.entries())
      t - i.lastActivity > e && s.push(o);
    for (const o of s)
      this.releaseConnection(o) && n++;
    return n;
  }
  // 풀 통계 정보
  getPoolStats() {
    const e = this.availableConnections.length, t = this.activeConnections.size, n = e + t, s = n > 0 ? t / n : 0;
    return {
      available: e,
      active: t,
      total: n,
      maxSize: this.maxPoolSize,
      utilizationRate: s
    };
  }
  // 풀 비우기
  clear() {
    this.activeConnections.clear(), this.availableConnections = [], this.connectionIdCounter = 1;
  }
  // 특정 노드의 모든 연결 해제
  disconnectNode(e) {
    let t = 0;
    const n = [];
    for (const [s, o] of this.activeConnections.entries())
      (o.nodeA === e || o.nodeB === e) && n.push(s);
    return n.forEach((s) => {
      this.releaseConnection(s), t++;
    }), t;
  }
  // 풀 설정 업데이트
  updatePoolSettings(e, t) {
    for (this.maxPoolSize = Math.max(0, e), t && (this.defaultOptions = { ...this.defaultOptions, ...t }); this.availableConnections.length > this.maxPoolSize; )
      this.availableConnections.pop();
  }
}
class we {
  queues = /* @__PURE__ */ new Map();
  maxSize;
  batchSize;
  enableBatching;
  totalSize = 0;
  static prioritiesLowToHigh = [
    "low",
    "normal",
    "high",
    "critical"
  ];
  static prioritiesHighToLow = [
    "critical",
    "high",
    "normal",
    "low"
  ];
  constructor(e = 1e3, t = 10, n = !0) {
    this.maxSize = Math.max(1, e), this.batchSize = t, this.enableBatching = n;
  }
  getOrCreateQueue(e) {
    const t = this.queues.get(e);
    if (t) return t;
    const n = { items: [], head: 0 };
    return this.queues.set(e, n), n;
  }
  getQueueSizeInternal(e) {
    return e.items.length - e.head;
  }
  compactQueueIfNeeded(e) {
    if (e.head !== 0) {
      if (e.head >= e.items.length) {
        e.items = [], e.head = 0;
        return;
      }
      e.head > 64 && e.head * 2 >= e.items.length && (e.items = e.items.slice(e.head), e.head = 0);
    }
  }
  shiftOne(e) {
    if (this.getQueueSizeInternal(e) <= 0) return null;
    const t = e.items[e.head] ?? null;
    return e.head += 1, this.totalSize = Math.max(0, this.totalSize - 1), this.compactQueueIfNeeded(e), t;
  }
  // 메시지를 우선순위별 큐에 추가
  enqueue(e) {
    const t = e.priority;
    for (; this.totalSize >= this.maxSize; )
      if (!this.evictOne(t)) return !1;
    return this.getOrCreateQueue(t).items.push(e), this.totalSize += 1, !0;
  }
  // 현재 우선순위보다 낮은 큐에서 가장 오래된 항목 1개 제거
  evictOne(e) {
    const t = we.prioritiesLowToHigh, n = t.indexOf(e);
    for (let o = 0; o < n; o++) {
      const i = t[o];
      if (!i) continue;
      const r = this.queues.get(i);
      if (r && this.shiftOne(r))
        return !0;
    }
    const s = this.queues.get(e);
    return !!(s && this.shiftOne(s));
  }
  // 우선순위에 따라 메시지 처리
  dequeue() {
    for (const e of we.prioritiesHighToLow) {
      const t = this.queues.get(e);
      if (!t) continue;
      const n = this.shiftOne(t);
      if (n) return n;
    }
    return null;
  }
  // 배치 처리용 여러 메시지 가져오기
  dequeueBatch() {
    if (!this.enableBatching) {
      const t = this.dequeue();
      return t ? [t] : [];
    }
    const e = [];
    for (const t of we.prioritiesHighToLow) {
      if (e.length >= this.batchSize) break;
      const n = this.queues.get(t);
      if (!n) continue;
      const s = this.batchSize - e.length, o = this.getQueueSizeInternal(n), i = Math.min(s, o);
      for (let r = 0; r < i; r++) {
        const p = this.shiftOne(n);
        if (!p) break;
        e.push(p);
      }
    }
    return e;
  }
  // 특정 우선순위 큐 크기
  getQueueSize(e) {
    const t = this.queues.get(e);
    return t ? this.getQueueSizeInternal(t) : 0;
  }
  // 전체 큐 크기
  getTotalSize() {
    return this.totalSize;
  }
  // 큐 비우기
  clear() {
    this.queues.clear(), this.totalSize = 0;
  }
  // 특정 메시지 찾기
  findMessage(e) {
    for (const t of this.queues.values())
      for (let n = t.head; n < t.items.length; n++) {
        const s = t.items[n];
        if (s && s.id === e) return s;
      }
    return null;
  }
  // 특정 메시지 제거
  removeMessage(e) {
    for (const t of this.queues.values())
      for (let n = t.head; n < t.items.length; n++) {
        const s = t.items[n];
        if (!(!s || s.id !== e))
          return n === t.head ? (this.shiftOne(t), !0) : (t.items.splice(n, 1), this.totalSize = Math.max(0, this.totalSize - 1), this.compactQueueIfNeeded(t), !0);
      }
    return !1;
  }
  // 배치 설정 업데이트
  updateBatchSettings(e, t) {
    this.batchSize = Math.max(1, e), this.enableBatching = t;
  }
  // 큐 최대 크기 업데이트
  updateMaxSize(e) {
    for (this.maxSize = Math.max(1, e); this.totalSize > this.maxSize && this.evictOne("critical"); )
      ;
  }
  // 큐 통계 정보
  getStats() {
    const e = {};
    for (const [t, n] of this.queues.entries())
      e[t] = this.getQueueSizeInternal(n);
    return {
      totalMessages: this.getTotalSize(),
      queueSizes: e,
      maxSize: this.maxSize,
      batchSize: this.batchSize,
      enableBatching: this.enableBatching
    };
  }
}
class mt {
  nodes = /* @__PURE__ */ new Map();
  groups = /* @__PURE__ */ new Map();
  eventCallbacks = /* @__PURE__ */ new Map();
  performanceMetrics;
  proximityRange;
  maxDistance;
  groupIdCounter = 1;
  maxMessageQueueSize;
  gridCellSize;
  grid = /* @__PURE__ */ new Map();
  nodeCellKey = /* @__PURE__ */ new Map();
  scratchNearbyNodeIds = /* @__PURE__ */ new Set();
  scratchDisconnectIds = [];
  scratchCenter = new B.Vector3();
  constructor(e = 50, t = 100, n = 200) {
    this.proximityRange = e, this.maxDistance = t, this.maxMessageQueueSize = n, this.gridCellSize = Math.max(1, e), this.performanceMetrics = {
      messagesProcessed: 0,
      averageLatency: 0,
      bandwidth: 0,
      connectionCount: 0,
      errorRate: 0,
      lastUpdate: Date.now()
    };
  }
  // NPC 노드 등록
  registerNode(e, t, n) {
    const s = `node_${e}`;
    if (this.nodes.has(s))
      throw new Error(`Node ${s} is already registered`);
    const o = {
      id: s,
      npcId: e,
      position: t.clone(),
      connections: /* @__PURE__ */ new Set(),
      messageQueue: [],
      lastUpdate: Date.now(),
      status: "active",
      communicationRange: n?.communicationRange || this.proximityRange,
      signalStrength: n?.signalStrength || 1
    };
    return this.nodes.set(s, o), this.addToGrid(s, o.position), this.emitEvent({
      type: "nodeConnected",
      nodeId: s,
      data: { npcId: e, position: t },
      timestamp: Date.now()
    }), o;
  }
  // NPC 노드 제거
  unregisterNode(e) {
    const t = `node_${e}`;
    return this.nodes.get(t) ? (this.disconnectAllConnections(t), this.leaveAllGroups(t), this.nodes.delete(t), this.removeFromGrid(t), this.emitEvent({
      type: "nodeDisconnected",
      nodeId: t,
      data: { npcId: e },
      timestamp: Date.now()
    }), !0) : !1;
  }
  // 노드 위치 업데이트
  updateNodePosition(e, t) {
    const n = `node_${e}`, s = this.nodes.get(n);
    return s ? (s.position.copy(t), s.lastUpdate = Date.now(), this.updateGridPosition(n, s.position), this.updateProximityConnections(n), !0) : !1;
  }
  // 두 노드 간 직접 연결
  connectNodes(e, t) {
    const n = `node_${e}`, s = `node_${t}`, o = this.nodes.get(n), i = this.nodes.get(s);
    if (!o || !i)
      return !1;
    const r = this.maxDistance * this.maxDistance;
    return o.position.distanceToSquared(i.position) > r ? !1 : (o.connections.add(s), i.connections.add(n), this.performanceMetrics.connectionCount = this.getTotalConnections(), !0);
  }
  // 두 노드 간 연결 해제
  disconnectNodes(e, t) {
    const n = `node_${e}`, s = `node_${t}`, o = this.nodes.get(n), i = this.nodes.get(s);
    return !o || !i ? !1 : (o.connections.delete(s), i.connections.delete(n), this.performanceMetrics.connectionCount = this.getTotalConnections(), !0);
  }
  // 노드의 모든 연결 해제
  disconnectAllConnections(e) {
    const t = this.nodes.get(e);
    if (t) {
      for (const n of t.connections) {
        const s = this.nodes.get(n);
        s && s.connections.delete(e);
      }
      t.connections.clear();
    }
  }
  // 근접 기반 자동 연결 업데이트
  updateProximityConnections(e) {
    const t = this.nodes.get(e);
    if (!t) return;
    const n = (i, r) => {
      const p = Math.min(i.communicationRange, r.communicationRange);
      return i.position.distanceToSquared(r.position) <= p * p;
    }, s = this.scratchDisconnectIds;
    s.length = 0;
    for (const i of t.connections) {
      const r = this.nodes.get(i);
      if (!r) {
        s.push(i);
        continue;
      }
      n(t, r) || s.push(i);
    }
    for (const i of s) {
      t.connections.delete(i);
      const r = this.nodes.get(i);
      r && r.connections.delete(e);
    }
    const o = this.getNearbyNodeIds(t, this.scratchNearbyNodeIds);
    for (const i of o) {
      if (e === i || t.connections.has(i)) continue;
      const r = this.nodes.get(i);
      r && n(t, r) && (t.connections.add(i), r.connections.add(e));
    }
  }
  // nodeId 정규화: npcId 또는 nodeId 모두 받아서 nodeId로 통일
  resolveNodeId(e) {
    return e.startsWith("node_") ? e : `node_${e}`;
  }
  getCellKey(e) {
    const t = this.gridCellSize, n = Math.floor(e.x / t), s = Math.floor(e.z / t);
    return `${n},${s}`;
  }
  addToGrid(e, t) {
    const n = this.getCellKey(t), s = this.grid.get(n) ?? /* @__PURE__ */ new Set();
    s.add(e), this.grid.set(n, s), this.nodeCellKey.set(e, n);
  }
  removeFromGrid(e) {
    const t = this.nodeCellKey.get(e);
    if (!t) return;
    const n = this.grid.get(t);
    n && (n.delete(e), n.size === 0 && this.grid.delete(t)), this.nodeCellKey.delete(e);
  }
  updateGridPosition(e, t) {
    const n = this.nodeCellKey.get(e), s = this.getCellKey(t);
    if (n === s) return;
    this.removeFromGrid(e);
    const o = this.grid.get(s) ?? /* @__PURE__ */ new Set();
    o.add(e), this.grid.set(s, o), this.nodeCellKey.set(e, s);
  }
  collectNearbyNodeIdsByPosition(e, t, n) {
    n.clear();
    const s = this.gridCellSize, o = Math.max(1, Math.ceil(Math.max(1, t) / s)), i = Math.floor(e.x / s), r = Math.floor(e.z / s);
    for (let p = -o; p <= o; p++)
      for (let l = -o; l <= o; l++) {
        const y = `${i + p},${r + l}`, M = this.grid.get(y);
        M && M.forEach((x) => n.add(x));
      }
  }
  getNearbyNodeIds(e, t) {
    const n = t ?? /* @__PURE__ */ new Set();
    return this.collectNearbyNodeIdsByPosition(e.position, e.communicationRange, n), n;
  }
  // 노드에 메시지를 추가하되 큐 크기를 제한
  enqueueMessage(e, t) {
    e.messageQueue.length >= this.maxMessageQueueSize && e.messageQueue.shift(), e.messageQueue.push(t);
  }
  // 메시지 전송
  sendMessage(e) {
    return this.nodes.get(this.resolveNodeId(e.from)) ? e.to === "broadcast" ? this.broadcastMessage(e) : e.to === "group" && e.groupId ? this.sendGroupMessage(e) : this.sendDirectMessage(e) : !1;
  }
  // 직접 메시지 전송
  sendDirectMessage(e) {
    const t = e.to.startsWith("node_") ? e.to : `node_${e.to}`, n = this.nodes.get(t);
    if (!n)
      return !1;
    this.enqueueMessage(n, e);
    const s = Date.now();
    return this.performanceMetrics.messagesProcessed++, this.performanceMetrics.lastUpdate = s, this.emitEvent({
      type: "messageReceived",
      nodeId: t,
      data: e,
      timestamp: s
    }), !0;
  }
  // 브로드캐스트 메시지 전송
  broadcastMessage(e) {
    let t = 0;
    const n = this.resolveNodeId(e.from);
    for (const o of this.nodes.values()) {
      if (o.id === n) continue;
      const i = {
        ...e,
        to: o.id
      };
      this.enqueueMessage(o, i), t++;
    }
    const s = Date.now();
    return this.performanceMetrics.messagesProcessed += t, this.performanceMetrics.lastUpdate = s, t > 0;
  }
  // 그룹 메시지 전송
  sendGroupMessage(e) {
    if (!e.groupId) return !1;
    const t = this.groups.get(e.groupId);
    if (!t) return !1;
    let n = 0;
    const s = this.resolveNodeId(e.from);
    for (const i of t.members) {
      if (i === s) continue;
      const r = this.nodes.get(i);
      if (r) {
        const p = {
          ...e,
          to: i
        };
        this.enqueueMessage(r, p), n++;
      }
    }
    const o = Date.now();
    return this.performanceMetrics.messagesProcessed += n, this.performanceMetrics.lastUpdate = o, n > 0;
  }
  // 노드의 메시지 가져오기
  getMessages(e) {
    const t = `node_${e}`, n = this.nodes.get(t);
    if (!n)
      return [];
    const s = [...n.messageQueue];
    return n.messageQueue = [], s;
  }
  // 그룹 생성
  createGroup(e, t) {
    const n = `group_${this.groupIdCounter++}`, s = {
      id: n,
      type: e,
      members: /* @__PURE__ */ new Set(),
      maxMembers: t?.maxMembers || (e === "party" ? 8 : e === "guild" ? 100 : 20),
      range: t?.range || (e === "proximity" ? 30 : 1e3),
      persistent: t?.persistent !== void 0 ? t.persistent : e === "guild",
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    return this.groups.set(n, s), s;
  }
  // 그룹 참여
  joinGroup(e, t) {
    const n = `node_${e}`, s = this.nodes.get(n), o = this.groups.get(t);
    return !s || !o || o.members.size >= o.maxMembers ? !1 : (o.members.add(n), o.lastActivity = Date.now(), this.emitEvent({
      type: "groupJoined",
      nodeId: n,
      data: { groupId: t },
      timestamp: Date.now()
    }), !0);
  }
  // 그룹 탈퇴
  leaveGroup(e, t) {
    const n = `node_${e}`, s = this.groups.get(t);
    return !s || !s.members.has(n) ? !1 : (s.members.delete(n), s.lastActivity = Date.now(), !s.persistent && s.members.size === 0 && this.groups.delete(t), this.emitEvent({
      type: "groupLeft",
      nodeId: n,
      data: { groupId: t },
      timestamp: Date.now()
    }), !0);
  }
  // 노드의 모든 그룹 탈퇴
  leaveAllGroups(e) {
    for (const [t, n] of this.groups.entries())
      n.members.has(e) && (n.members.delete(e), !n.persistent && n.members.size === 0 && this.groups.delete(t));
  }
  // 근접 그룹 자동 참여
  updateProximityGroups() {
    const e = this.scratchCenter, t = this.scratchNearbyNodeIds;
    for (const n of this.groups.values()) {
      if (n.type !== "proximity" || n.members.size === 0 || n.range <= 0) continue;
      let s = 0, o = 0, i = 0, r = 0;
      for (const l of n.members) {
        const y = this.nodes.get(l);
        y && (s += y.position.x, o += y.position.y, i += y.position.z, r += 1);
      }
      if (r === 0) continue;
      e.set(s / r, o / r, i / r), this.collectNearbyNodeIdsByPosition(e, n.range, t);
      const p = n.range * n.range;
      for (const l of t) {
        if (n.members.size >= n.maxMembers) break;
        if (n.members.has(l)) continue;
        const y = this.nodes.get(l);
        if (!y) continue;
        const M = y.position.x - e.x, x = y.position.y - e.y, R = y.position.z - e.z;
        M * M + x * x + R * R <= p && n.members.add(l);
      }
    }
  }
  // 이벤트 리스너 등록
  addEventListener(e, t) {
    this.eventCallbacks.has(e) || this.eventCallbacks.set(e, []), this.eventCallbacks.get(e).push(t);
  }
  // 이벤트 리스너 제거
  removeEventListener(e, t) {
    const n = this.eventCallbacks.get(e);
    if (n) {
      const s = n.indexOf(t);
      s !== -1 && n.splice(s, 1);
    }
  }
  // 이벤트 발생
  emitEvent(e) {
    const t = this.eventCallbacks.get(e.type);
    t && t.forEach((n) => {
      try {
        n(e);
      } catch (s) {
        console.error("Error in event callback:", s);
      }
    });
  }
  // 총 연결 수 계산
  getTotalConnections() {
    let e = 0;
    for (const t of this.nodes.values())
      e += t.connections.size;
    return e / 2;
  }
  // 성능 메트릭 가져오기
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
  // 노드 정보 가져오기
  getNode(e) {
    const t = `node_${e}`;
    return this.nodes.get(t) || null;
  }
  // 모든 노드 가져오기
  getAllNodes() {
    return Array.from(this.nodes.values());
  }
  // Map을 array로 만들지 않고 순회
  forEachNode(e) {
    for (const t of this.nodes.values()) e(t);
  }
  // 그룹 정보 가져오기
  getGroup(e) {
    return this.groups.get(e) || null;
  }
  // 모든 그룹 가져오기
  getAllGroups() {
    return Array.from(this.groups.values());
  }
  // Map을 array로 만들지 않고 순회
  forEachGroup(e) {
    for (const t of this.groups.values()) e(t);
  }
  // 매니저 초기화
  clear() {
    this.nodes.clear(), this.groups.clear(), this.eventCallbacks.clear(), this.grid.clear(), this.nodeCellKey.clear(), this.performanceMetrics = {
      messagesProcessed: 0,
      averageLatency: 0,
      bandwidth: 0,
      connectionCount: 0,
      errorRate: 0,
      lastUpdate: Date.now()
    }, this.groupIdCounter = 1;
  }
  // 설정 업데이트
  updateSettings(e, t) {
    e !== void 0 && (this.proximityRange = Math.max(0, e)), t !== void 0 && (this.maxDistance = Math.max(0, t));
  }
  // 네트워크 통계 정보
  getNetworkStats() {
    const e = this.nodes.size, t = this.getTotalConnections(), n = this.groups.size, s = e > 0 ? t / e : 0;
    let o = 0;
    for (const i of this.nodes.values())
      o += i.messageQueue.length;
    return {
      nodeCount: e,
      connectionCount: t,
      groupCount: n,
      averageConnections: s,
      totalMessages: o
    };
  }
}
class yt {
  state;
  npcManager;
  messageQueue;
  connectionPool;
  config;
  lastCleanupTime = 0;
  lastStatsUpdateAt = 0;
  updateTimer;
  scratchNodeIds = /* @__PURE__ */ new Set();
  scratchGroupIds = /* @__PURE__ */ new Set();
  scratchRemoveIds = [];
  messageQueueSig = /* @__PURE__ */ new Map();
  constructor(e) {
    this.config = { ...e }, this.npcManager = new mt(e.proximityRange, e.maxDistance), this.messageQueue = new we(e.messageQueueSize, e.batchSize, e.enableBatching), this.connectionPool = new ft(e.connectionPoolSize), this.state = {
      nodes: /* @__PURE__ */ new Map(),
      connections: /* @__PURE__ */ new Map(),
      groups: /* @__PURE__ */ new Map(),
      messageQueues: /* @__PURE__ */ new Map(),
      stats: {
        totalNodes: 0,
        activeConnections: 0,
        messagesPerSecond: 0,
        averageLatency: 0,
        bandwidth: 0,
        lastUpdate: Date.now()
      },
      isRunning: !1,
      lastUpdate: Date.now()
    };
  }
  // 시스템 시작
  start() {
    this.state.isRunning || (this.state.isRunning = !0, this.lastCleanupTime = Date.now(), this.startUpdateLoop());
  }
  // 시스템 정지
  stop() {
    this.state.isRunning && (this.state.isRunning = !1, this.updateTimer && (clearTimeout(this.updateTimer), this.updateTimer = void 0));
  }
  // 업데이트 루프 시작
  startUpdateLoop() {
    this.updateTimer && clearTimeout(this.updateTimer);
    const e = Math.max(1, this.config.updateFrequency), t = Math.max(1, Math.floor(1e3 / e));
    let n = Date.now() + t;
    const s = () => {
      if (!this.state.isRunning) return;
      this.update();
      const o = Date.now();
      n += t, n < o && (n = o + t);
      const i = Math.max(0, n - Date.now());
      this.updateTimer = setTimeout(s, i);
    };
    this.updateTimer = setTimeout(s, t);
  }
  // 시스템 업데이트
  update() {
    if (!this.state.isRunning) return;
    const e = Date.now();
    this.processMessageBatch(), this.npcManager.updateProximityGroups(), e - this.lastCleanupTime >= this.config.connectionTimeout && (this.connectionPool.cleanupInactiveConnections(this.config.connectionTimeout), this.lastCleanupTime = e), this.updateStatistics(e), this.syncState(), this.state.lastUpdate = e;
  }
  // 메시지 배치 처리
  processMessageBatch() {
    const e = this.messageQueue.dequeueBatch();
    for (const t of e)
      try {
        this.npcManager.sendMessage(t);
      } catch (n) {
        console.error("Error processing message:", n);
      }
  }
  // 통계 업데이트
  updateStatistics(e) {
    const t = Math.max(0, this.config.debugUpdateInterval ?? 250);
    if (t > 0 && e - this.lastStatsUpdateAt < t)
      return;
    this.lastStatsUpdateAt = e;
    const n = this.npcManager.getNetworkStats(), s = this.npcManager.getPerformanceMetrics();
    this.state.stats = {
      totalNodes: n.nodeCount,
      activeConnections: n.connectionCount,
      messagesPerSecond: this.calculateMessagesPerSecond(s),
      averageLatency: s.averageLatency,
      bandwidth: s.bandwidth,
      lastUpdate: e
    };
  }
  // 초당 메시지 수 계산
  calculateMessagesPerSecond(e) {
    const t = (Date.now() - e.lastUpdate) / 1e3, n = Math.max(1e-3, t);
    return e.messagesProcessed / n;
  }
  // 상태 동기화
  syncState() {
    const e = this.scratchNodeIds;
    e.clear(), this.npcManager.forEachNode((s) => {
      e.add(s.id), this.state.nodes.set(s.id, s);
    });
    const t = this.scratchRemoveIds;
    t.length = 0;
    for (const s of this.state.nodes.keys())
      e.has(s) || t.push(s);
    for (const s of t) this.state.nodes.delete(s);
    const n = this.scratchGroupIds;
    n.clear(), this.npcManager.forEachGroup((s) => {
      n.add(s.id), this.state.groups.set(s.id, s);
    }), t.length = 0;
    for (const s of this.state.groups.keys())
      n.has(s) || t.push(s);
    for (const s of t) this.state.groups.delete(s);
    for (const s of e) {
      const o = this.state.nodes.get(s);
      if (!o || o.messageQueue.length === 0) {
        this.state.messageQueues.delete(s), this.messageQueueSig.delete(s);
        continue;
      }
      const i = o.messageQueue, r = i[i.length - 1]?.id ?? null, p = this.messageQueueSig.get(s);
      p && p.len === i.length && p.tailId === r || (p ? (p.len = i.length, p.tailId = r) : this.messageQueueSig.set(s, { len: i.length, tailId: r }), this.state.messageQueues.set(s, i.slice()));
    }
    t.length = 0;
    for (const s of this.state.messageQueues.keys())
      e.has(s) || t.push(s);
    for (const s of t)
      this.state.messageQueues.delete(s), this.messageQueueSig.delete(s);
  }
  // 명령 실행
  executeCommand(e) {
    try {
      switch (e.type) {
        case "registerNPC":
          return this.registerNPC(e.npcId, e.position, e.options), !0;
        case "unregisterNPC":
          return this.unregisterNPC(e.npcId);
        case "updateNPCPosition":
          return this.updateNPCPosition(e.npcId, e.position);
        case "connect":
          return this.npcManager.connectNodes(e.npcId, e.targetId);
        case "disconnect":
          return e.targetId ? this.npcManager.disconnectNodes(e.npcId, e.targetId) : this.npcManager.unregisterNode(e.npcId);
        case "sendMessage":
          return this.messageQueue.enqueue(e.message), !0;
        case "broadcast":
          const t = {
            ...e.message,
            to: "broadcast"
          };
          return this.messageQueue.enqueue(t), !0;
        case "joinGroup":
          return this.npcManager.joinGroup(e.npcId, e.groupId);
        case "leaveGroup":
          return this.npcManager.leaveGroup(e.npcId, e.groupId);
        case "createGroup":
          return !!this.npcManager.createGroup(e.group.type, {
            maxMembers: e.group.maxMembers,
            range: e.group.range,
            persistent: e.group.persistent
          });
        case "updateSettings":
          return this.updateConfig(e.settings), !0;
        case "updateConfig":
          return this.updateConfig(e.data.config), !0;
        case "startMonitoring":
          return !0;
        case "stopMonitoring":
          return !0;
        default:
          return console.warn("Unknown network command:", e), !1;
      }
    } catch (t) {
      return console.error("Error executing network command:", t), !1;
    }
  }
  // 스냅샷 생성
  createSnapshot() {
    return {
      nodeCount: this.state.stats.totalNodes,
      connectionCount: this.state.stats.activeConnections,
      activeGroups: this.state.groups.size,
      messagesPerSecond: this.state.stats.messagesPerSecond,
      averageLatency: this.state.stats.averageLatency,
      lastUpdate: this.state.lastUpdate
    };
  }
  // 설정 업데이트
  updateConfig(e) {
    this.config = { ...this.config, ...e }, (e.messageQueueSize || e.batchSize || e.enableBatching) && (this.messageQueue.updateBatchSettings(
      this.config.batchSize,
      this.config.enableBatching
    ), this.messageQueue.updateMaxSize(this.config.messageQueueSize)), e.connectionPoolSize && this.connectionPool.updatePoolSettings(this.config.connectionPoolSize), (e.proximityRange || e.maxDistance) && this.npcManager.updateSettings(this.config.proximityRange, this.config.maxDistance), e.updateFrequency && this.state.isRunning && this.startUpdateLoop();
  }
  // NPC 등록
  registerNPC(e, t, n) {
    return this.npcManager.registerNode(e, t, n);
  }
  // NPC 제거
  unregisterNPC(e) {
    return this.npcManager.unregisterNode(e);
  }
  // NPC 위치 업데이트
  updateNPCPosition(e, t) {
    return this.npcManager.updateNodePosition(e, t);
  }
  // 메시지 가져오기
  getMessages(e) {
    return this.npcManager.getMessages(e);
  }
  // 시스템 상태 가져오기
  getState() {
    return { ...this.state };
  }
  // 설정 가져오기
  getConfig() {
    return { ...this.config };
  }
  // 시스템 정리
  dispose() {
    this.stop(), this.npcManager.clear(), this.messageQueue.clear(), this.connectionPool.clear(), this.state.nodes.clear(), this.state.connections.clear(), this.state.groups.clear(), this.state.messageQueues.clear();
  }
  // 이벤트 리스너 등록
  addEventListener(e, t) {
    this.npcManager.addEventListener(e, t);
  }
  // 이벤트 리스너 제거
  removeEventListener(e, t) {
    this.npcManager.removeEventListener(e, t);
  }
  // 디버그 정보
  getDebugInfo() {
    return {
      isRunning: this.state.isRunning,
      config: this.config,
      stats: this.state.stats,
      networkStats: this.npcManager.getNetworkStats(),
      performanceMetrics: this.npcManager.getPerformanceMetrics(),
      poolStats: this.connectionPool.getPoolStats(),
      messageQueueStats: this.messageQueue.getStats()
    };
  }
}
const bt = (a) => typeof a != "object" || a === null ? !1 : "text" in a && typeof a.text == "function";
class Qe {
  ws = null;
  url;
  roomId;
  playerName;
  playerColor;
  players = /* @__PURE__ */ new Map();
  localPlayerId = null;
  isConnected = !1;
  isConnecting = !1;
  logLevel;
  logToConsole;
  reconnectAttemptsMax;
  reconnectDelayMs;
  reconnectAttemptsUsed = 0;
  reconnectTimer = null;
  shouldReconnect = !1;
  pingIntervalMs;
  pingTimer = null;
  lastPingSentAt = 0;
  updateRateLimitMs;
  lastUpdateSentAt = 0;
  pendingUpdate = null;
  updateFlushTimer = null;
  offlineQueueSize;
  pendingChats = [];
  // Optional app-level ACK (server must echo Ack for dedupe/retry).
  enableAck;
  reliableTimeoutMs;
  reliableRetryCount;
  ackIdCounter = 1;
  pendingAcks = /* @__PURE__ */ new Map();
  // 콜백 함수들
  onConnect;
  onDisconnect;
  onWelcome;
  onPlayerJoin;
  onPlayerUpdate;
  onPlayerLeave;
  onChat;
  onPing;
  onReliableFailed;
  onError;
  constructor(e) {
    this.url = e.url, this.roomId = e.roomId, this.playerName = e.playerName, this.playerColor = e.playerColor, this.reconnectAttemptsMax = Math.max(0, Math.floor(e.reconnectAttempts ?? 0)), this.reconnectDelayMs = Math.max(0, Math.floor(e.reconnectDelay ?? 1e3)), this.pingIntervalMs = Math.max(0, Math.floor(e.pingInterval ?? 0)), this.updateRateLimitMs = Math.max(0, Math.floor(e.sendRateLimit ?? 0)), this.offlineQueueSize = Math.max(0, Math.floor(e.offlineQueueSize ?? 50)), this.enableAck = !!e.enableAck, this.reliableTimeoutMs = Math.max(0, Math.floor(e.reliableTimeout ?? 5e3)), this.reliableRetryCount = Math.max(0, Math.floor(e.reliableRetryCount ?? 0)), this.logLevel = e.logLevel ?? "none", this.logToConsole = e.logToConsole ?? !1, e.onConnect && (this.onConnect = e.onConnect), e.onDisconnect && (this.onDisconnect = e.onDisconnect), e.onWelcome && (this.onWelcome = e.onWelcome), e.onPlayerJoin && (this.onPlayerJoin = e.onPlayerJoin), e.onPlayerUpdate && (this.onPlayerUpdate = e.onPlayerUpdate), e.onPlayerLeave && (this.onPlayerLeave = e.onPlayerLeave), e.onChat && (this.onChat = e.onChat), e.onPing && (this.onPing = e.onPing), e.onReliableFailed && (this.onReliableFailed = e.onReliableFailed), e.onError && (this.onError = e.onError);
  }
  shouldLog(e) {
    if (!this.logToConsole) return !1;
    const t = {
      none: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4
    };
    return t[e] <= t[this.logLevel];
  }
  debug(e, ...t) {
    this.shouldLog("debug") && console.log(e, ...t);
  }
  info(e, ...t) {
    this.shouldLog("info") && console.info(e, ...t);
  }
  warn(e, ...t) {
    this.shouldLog("warn") && console.warn(e, ...t);
  }
  error(e, ...t) {
    this.shouldLog("error") && console.error(e, ...t);
  }
  getConnectionStatus() {
    return this.isConnected;
  }
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.warn("[PlayerNetworkManager] Already connected");
      return;
    }
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      this.warn("[PlayerNetworkManager] Already connecting");
      return;
    }
    if (this.isConnecting) {
      this.warn("[PlayerNetworkManager] Already connecting");
      return;
    }
    this.shouldReconnect = this.reconnectAttemptsMax > 0, this.clearReconnectTimer(), this.isConnecting = !0, this.info("[PlayerNetworkManager] Connecting WebSocket", this.url);
    let e;
    try {
      e = new WebSocket(this.url);
    } catch {
      this.isConnecting = !1, this.isConnected = !1, this.onError?.("WebSocket 연결 실패");
      return;
    }
    this.ws = e, e.onopen = () => {
      this.info("[PlayerNetworkManager] WebSocket connected"), this.isConnected = !0, this.isConnecting = !1, this.reconnectAttemptsUsed = 0, this.startPingLoop(), e.send(JSON.stringify({
        type: "Join",
        room_id: this.roomId,
        name: this.playerName,
        color: this.playerColor
      })), this.flushOfflineQueue(), this.resumePendingAcks(), this.onConnect && this.onConnect();
    }, e.onmessage = (t) => {
      const n = (o) => {
        try {
          const i = JSON.parse(o);
          this.handleServerMessage(i);
        } catch {
          this.onError?.("서버 메시지 파싱 실패");
        }
      }, s = t.data;
      if (typeof s == "string") {
        n(s);
        return;
      }
      if (bt(s)) {
        s.text().then((o) => n(o)).catch(() => this.onError?.("서버 메시지 수신 실패"));
        return;
      }
      if (s instanceof ArrayBuffer)
        try {
          const o = new TextDecoder().decode(new Uint8Array(s));
          n(o);
        } catch {
          this.onError?.("서버 메시지 디코딩 실패");
        }
    }, e.onerror = (t) => {
      this.error("[PlayerNetworkManager] WebSocket error", t), this.isConnected = !1, this.isConnecting = !1, this.onError && this.onError("WebSocket 연결 에러");
    }, e.onclose = (t) => {
      this.info("[PlayerNetworkManager] WebSocket closed", { code: t.code, reason: t.reason });
      const n = this.isConnected || this.isConnecting;
      this.isConnected = !1, this.isConnecting = !1, this.stopPingLoop(), this.pausePendingAcks(), this.players.clear(), this.localPlayerId = null, this.onDisconnect && this.onDisconnect(), (t.code === 1e3 || t.code === 1001) && (this.shouldReconnect = !1), n && this.tryReconnect();
    };
  }
  disconnect() {
    if (this.shouldReconnect = !1, this.clearReconnectTimer(), this.stopPingLoop(), this.clearUpdateFlushTimer(), this.clearAllPendingAcks(!0), !this.ws) {
      this.players.clear(), this.isConnected = !1, this.isConnecting = !1, this.localPlayerId = null, this.onDisconnect?.();
      return;
    }
    const e = this.ws;
    if (e.onopen = null, e.onmessage = null, e.onerror = null, e.onclose = null, e.readyState === WebSocket.OPEN)
      try {
        e.send(JSON.stringify({ type: "Leave" }));
      } catch {
      }
    try {
      e.close();
    } catch {
    }
    this.ws = null, this.players.clear(), this.isConnected = !1, this.isConnecting = !1, this.localPlayerId = null, this.pendingUpdate = null, this.pendingChats = [], this.onDisconnect?.();
  }
  updateLocalPlayer(e) {
    this.pendingUpdate = this.pendingUpdate ? { ...this.pendingUpdate, ...e } : { ...e };
    const t = this.ws;
    if (!t || t.readyState !== WebSocket.OPEN) return;
    const n = Date.now();
    if (this.updateRateLimitMs <= 0 || n - this.lastUpdateSentAt >= this.updateRateLimitMs) {
      this.lastUpdateSentAt = n;
      const o = this.pendingUpdate;
      if (this.pendingUpdate = null, !o) return;
      t.send(JSON.stringify({ type: "Update", state: o }));
      return;
    }
    if (this.updateFlushTimer) return;
    const s = Math.max(0, this.updateRateLimitMs - (n - this.lastUpdateSentAt));
    this.updateFlushTimer = setTimeout(() => {
      this.updateFlushTimer = null;
      const o = this.pendingUpdate;
      o && this.updateLocalPlayer(o);
    }, s);
  }
  sendChat(e, t) {
    const n = String(e ?? "").trim().slice(0, 200);
    if (!n) return;
    const s = this.ws;
    if (!s || s.readyState !== WebSocket.OPEN) {
      if (this.offlineQueueSize <= 0) return;
      this.pendingChats.length >= this.offlineQueueSize && this.pendingChats.shift(), t?.range !== void 0 ? this.pendingChats.push({ text: n, range: t.range }) : this.pendingChats.push({ text: n });
      return;
    }
    const o = {
      type: "Chat",
      text: n,
      ...t?.range !== void 0 ? { range: t.range } : {}
    };
    if (this.enableAck) {
      this.sendReliable(o);
      return;
    }
    s.send(JSON.stringify(o));
  }
  handleServerMessage(e) {
    switch (this.debug("[PlayerNetworkManager] Server message", e.type, e), e.type) {
      case "Ack": {
        typeof e.ackId == "string" && e.ackId && this.ackReceived(e.ackId);
        break;
      }
      case "Pong": {
        if (typeof e.ts == "number" && e.ts > 0) {
          const t = Math.max(0, Date.now() - e.ts);
          this.onPing?.(t);
        } else if (this.lastPingSentAt > 0) {
          const t = Math.max(0, Date.now() - this.lastPingSentAt);
          this.onPing?.(t);
        }
        break;
      }
      case "Welcome":
        if (this.localPlayerId = e.client_id, this.onWelcome?.(this.localPlayerId, e.room_state), e.room_state)
          for (const [t, n] of Object.entries(e.room_state))
            t !== this.localPlayerId && (this.players.set(t, n), this.onPlayerJoin && this.onPlayerJoin(t, n));
        break;
      case "PlayerJoined":
        this.debug("[PlayerNetworkManager] PlayerJoined", e.client_id), e.client_id !== this.localPlayerId && (this.players.set(e.client_id, e.state), this.onPlayerJoin && this.onPlayerJoin(e.client_id, e.state));
        break;
      case "PlayerLeft":
        this.debug("[PlayerNetworkManager] PlayerLeft", e.client_id), this.players.delete(e.client_id), this.onPlayerLeave && this.onPlayerLeave(e.client_id);
        break;
      case "PlayerUpdate":
        this.debug("[PlayerNetworkManager] PlayerUpdate", e.client_id);
        {
          const t = this.players.get(e.client_id);
          if (t) {
            const o = { ...t, ...e.state };
            this.players.set(e.client_id, o), this.onPlayerUpdate?.(e.client_id, o);
            break;
          }
          const n = e.state, s = {
            name: n?.name ?? "Player",
            color: n?.color ?? "#ffffff",
            position: n?.position ?? [0, 0, 0],
            rotation: n?.rotation ?? [1, 0, 0, 0],
            ...n ?? {}
          };
          this.players.set(e.client_id, s), this.onPlayerJoin?.(e.client_id, s), this.onPlayerUpdate?.(e.client_id, s);
        }
        break;
      case "Chat":
        this.onChat?.(e.client_id, e.text, e.timestamp);
        break;
    }
  }
  setCallbacks(e) {
    e.onConnect && (this.onConnect = e.onConnect), e.onDisconnect && (this.onDisconnect = e.onDisconnect), e.onWelcome && (this.onWelcome = e.onWelcome), e.onPlayerJoin && (this.onPlayerJoin = e.onPlayerJoin), e.onPlayerUpdate && (this.onPlayerUpdate = e.onPlayerUpdate), e.onPlayerLeave && (this.onPlayerLeave = e.onPlayerLeave), e.onChat && (this.onChat = e.onChat), e.onPing && (this.onPing = e.onPing), e.onReliableFailed && (this.onReliableFailed = e.onReliableFailed), e.onError && (this.onError = e.onError);
  }
  getPlayers() {
    return new Map(this.players);
  }
  clearReconnectTimer() {
    this.reconnectTimer && (clearTimeout(this.reconnectTimer), this.reconnectTimer = null);
  }
  startPingLoop() {
    this.pingIntervalMs <= 0 || (this.stopPingLoop(), this.pingTimer = setInterval(() => {
      const e = this.ws;
      if (!e || e.readyState !== WebSocket.OPEN) return;
      const t = Date.now();
      this.lastPingSentAt = t;
      try {
        e.send(JSON.stringify({ type: "Ping", ts: t }));
      } catch {
      }
    }, this.pingIntervalMs));
  }
  stopPingLoop() {
    this.pingTimer && (clearInterval(this.pingTimer), this.pingTimer = null);
  }
  clearUpdateFlushTimer() {
    this.updateFlushTimer && (clearTimeout(this.updateFlushTimer), this.updateFlushTimer = null);
  }
  flushOfflineQueue() {
    const e = this.ws;
    if (!(!e || e.readyState !== WebSocket.OPEN)) {
      if (this.pendingChats.length > 0) {
        const t = this.pendingChats;
        this.pendingChats = [];
        for (const n of t)
          try {
            const s = {
              type: "Chat",
              text: n.text,
              ...n.range !== void 0 ? { range: n.range } : {}
            };
            this.enableAck ? this.sendReliable(s) : e.send(JSON.stringify(s));
          } catch {
            this.offlineQueueSize > 0 && (this.pendingChats = t.slice(t.indexOf(n)));
            break;
          }
      }
      if (this.pendingUpdate) {
        const t = this.pendingUpdate;
        this.pendingUpdate = null, this.updateLocalPlayer(t);
      }
    }
  }
  tryReconnect() {
    if (!this.shouldReconnect || this.reconnectAttemptsMax <= 0 || this.reconnectAttemptsUsed >= this.reconnectAttemptsMax || this.isConnecting) return;
    const e = this.reconnectAttemptsUsed + 1, t = this.reconnectDelayMs || 0, n = Math.min(3e4, Math.floor(t * Math.pow(2, this.reconnectAttemptsUsed)));
    this.reconnectAttemptsUsed = e, this.warn("[PlayerNetworkManager] Reconnecting...", { attempt: e, delay: n }), this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null, this.shouldReconnect && this.connect();
    }, n);
  }
  nextAckId() {
    const e = this.ackIdCounter++;
    return `ack_${Date.now()}_${e}`;
  }
  sendReliable(e) {
    const t = this.ws;
    if (!t || t.readyState !== WebSocket.OPEN) return;
    const n = this.nextAckId(), s = String(e.type ?? "Unknown"), o = JSON.stringify({ ...e, ackId: n });
    try {
      t.send(o);
    } catch {
      return;
    }
    this.trackPendingAck({ ackId: n, raw: o, messageType: s });
  }
  trackPendingAck(e) {
    this.enableAck && (this.stopAckTimer(e.ackId), this.pendingAcks.set(e.ackId, {
      raw: e.raw,
      messageType: e.messageType,
      retriesLeft: this.reliableRetryCount,
      timer: null
    }), this.scheduleAckTimeout(e.ackId));
  }
  scheduleAckTimeout(e) {
    if (!this.enableAck) return;
    const t = this.pendingAcks.get(e);
    t && (this.reliableTimeoutMs <= 0 || (t.timer = setTimeout(() => {
      const n = this.pendingAcks.get(e);
      if (!n) return;
      const s = this.ws;
      if (!s || s.readyState !== WebSocket.OPEN) {
        n.timer = null;
        return;
      }
      if (n.retriesLeft <= 0) {
        this.pendingAcks.delete(e), this.onReliableFailed?.({ ackId: e, messageType: n.messageType });
        return;
      }
      n.retriesLeft -= 1;
      try {
        s.send(n.raw);
      } catch {
        n.timer = null;
        return;
      }
      this.scheduleAckTimeout(e);
    }, this.reliableTimeoutMs)));
  }
  stopAckTimer(e) {
    const t = this.pendingAcks.get(e);
    !t || !t.timer || (clearTimeout(t.timer), t.timer = null);
  }
  ackReceived(e) {
    this.pendingAcks.get(e) && (this.stopAckTimer(e), this.pendingAcks.delete(e));
  }
  pausePendingAcks() {
    for (const [e, t] of this.pendingAcks.entries())
      t.timer && (clearTimeout(t.timer), t.timer = null), this.enableAck || this.pendingAcks.delete(e);
  }
  resumePendingAcks() {
    if (!this.enableAck) return;
    const e = this.ws;
    if (!(!e || e.readyState !== WebSocket.OPEN))
      for (const [t, n] of this.pendingAcks.entries()) {
        try {
          e.send(n.raw);
        } catch {
          continue;
        }
        this.scheduleAckTimeout(t);
      }
  }
  clearAllPendingAcks(e) {
    for (const [t, n] of this.pendingAcks.entries())
      n.timer && clearTimeout(n.timer), n.timer = null, e && this.pendingAcks.delete(t);
    e && this.pendingAcks.clear();
  }
}
class xt {
  lastPosition = new B.Vector3();
  lastRotation = new B.Quaternion();
  lastAnimation = "idle";
  velocity = new B.Vector3();
  lastUpdateTime = 0;
  config;
  tempPos = new B.Vector3();
  tempRot = new B.Quaternion();
  tempSendRot = new B.Quaternion();
  tempEuler = new B.Euler();
  baseYaw = null;
  scratchUpdate = {
    name: "",
    color: "",
    position: [0, 0, 0],
    rotation: [1, 0, 0, 0],
    animation: "idle",
    velocity: [0, 0, 0]
  };
  constructor(e) {
    this.config = e;
  }
  trackPosition(e, t, n, s, o) {
    if (!e.current) return null;
    const i = Date.now();
    if (i - this.lastUpdateTime < this.config.sendRateLimit)
      return null;
    const r = e.current.translation(), p = e.current.rotation();
    this.tempPos.set(r.x, r.y, r.z), this.tempRot.set(p.x, p.y, p.z, p.w);
    const l = e.current.linvel();
    if (l)
      this.velocity.set(l.x, l.y, l.z);
    else {
      const I = (i - this.lastUpdateTime) / 1e3;
      I > 0 && this.velocity.set(
        (r.x - this.lastPosition.x) / I,
        (r.y - this.lastPosition.y) / I,
        (r.z - this.lastPosition.z) / I
      );
    }
    const y = this.velocity.length(), M = typeof o == "string" ? o.trim() : "", x = this.config.velocityThreshold, R = this.config.velocityThreshold * 0.6, P = this.lastAnimation === "run" ? y < R ? "idle" : "run" : y > x ? "run" : "idle", w = M.length > 0 ? M : P;
    this.tempSendRot.copy(this.tempRot);
    const v = this.velocity.x, u = this.velocity.z;
    if (Math.hypot(v, u) > 0.05) {
      this.baseYaw === null && (this.tempEuler.setFromQuaternion(this.tempRot, "YXZ"), this.baseYaw = this.tempEuler.y + Math.PI);
      const I = Math.atan2(v, u) + (this.baseYaw ?? 0);
      this.tempEuler.set(0, I, 0, "YXZ"), this.tempSendRot.setFromEuler(this.tempEuler);
    }
    const h = !this.lastPosition.equals(this.tempPos), b = !this.lastRotation.equals(this.tempSendRot), m = this.lastAnimation !== w;
    if (!h && !b && !m)
      return null;
    const g = this.scratchUpdate;
    return g.name = t, g.color = n, g.position[0] = r.x, g.position[1] = r.y, g.position[2] = r.z, g.rotation[0] = this.tempSendRot.w, g.rotation[1] = this.tempSendRot.x, g.rotation[2] = this.tempSendRot.y, g.rotation[3] = this.tempSendRot.z, g.animation = w, g.velocity[0] = this.velocity.x, g.velocity[1] = this.velocity.y, g.velocity[2] = this.velocity.z, g.modelUrl = s, this.lastPosition.copy(this.tempPos), this.lastRotation.copy(this.tempSendRot), this.lastAnimation = w, this.lastUpdateTime = i, g;
  }
  updateConfig(e) {
    this.config = { ...this.config, ...e };
  }
  reset() {
    this.lastPosition.set(0, 0, 0), this.lastRotation.set(0, 0, 0, 1), this.lastAnimation = "idle", this.velocity.set(0, 0, 0), this.lastUpdateTime = 0, this.baseYaw = null;
  }
}
function fe(a = {}) {
  const {
    systemId: e = "main",
    config: t,
    enableAutoUpdate: n = !0
  } = a, s = S(null), [o, i] = _(null), [r, p] = _(!1);
  J(() => {
    s.current || (s.current = qe.getOrCreate("networks"));
    const P = s.current;
    return P ? (e === "main" ? P.ensureMainEngine() : P.getEngine(e) || P.register(e), t && Object.keys(t).length > 0 && P.execute(e, { type: "updateConfig", data: { config: t } }), i(P), p(!0), () => {
    }) : (i(null), p(!1), () => {
    });
  }, [e, t]), Se((P, w) => {
    n && s.current && r && s.current.updateSystem(e, w);
  });
  const l = z((P) => {
    s.current && r && s.current.execute(e, P);
  }, [e, r]), y = z(() => s.current && r ? s.current.snapshot(e) : null, [e, r]), M = z(() => s.current && r ? s.current.getNetworkStats(e) : null, [e, r]), x = z(() => s.current && r ? s.current.getSystemState(e) : null, [e, r]), R = z((P) => {
    s.current && r && s.current.updateSystem(e, P);
  }, [e, r]);
  return {
    bridge: o,
    executeCommand: l,
    getSnapshot: y,
    getNetworkStats: M,
    getSystemState: x,
    updateSystem: R,
    isReady: r
  };
}
function Kt(a) {
  const { npcId: e, initialOptions: t, ...n } = a, {
    executeCommand: s,
    getSnapshot: o,
    isReady: i
  } = fe(n), r = S(!1), p = S(null), l = S(/* @__PURE__ */ new Set());
  J(() => (i && t && !r.current && y(t), () => {
    r.current && M();
  }), [i, t]);
  const y = z((u) => {
    !i || r.current || (s({
      type: "registerNPC",
      npcId: e,
      position: u.position,
      ...u.connectionRange !== void 0 ? { options: { communicationRange: u.connectionRange } } : {}
    }), r.current = !0, p.current = u.position.clone(), u.autoConnect);
  }, [i, s, e]), M = z(() => {
    !i || !r.current || (s({
      type: "unregisterNPC",
      npcId: e
    }), r.current = !1, p.current = null, l.current.clear());
  }, [i, s, e]), x = z((u) => {
    !i || !r.current || (s({
      type: "updateNPCPosition",
      npcId: e,
      position: u
    }), p.current = u.clone());
  }, [i, s, e]), R = z((u, k) => {
    !i || !r.current || (s({
      type: "connect",
      npcId: e,
      targetId: u
    }), l.current.add(u));
  }, [i, s, e]), P = z((u) => {
    !i || !r.current || (s({
      type: "disconnect",
      npcId: e,
      targetId: u
    }), l.current.delete(u));
  }, [i, s, e]), w = z(() => Array.from(l.current), []), v = z(() => p.current ? p.current.clone() : null, []);
  return {
    // NPC 관리
    registerNPC: y,
    unregisterNPC: M,
    updatePosition: x,
    // 연결 관리
    connectTo: R,
    disconnectFrom: P,
    // 상태 조회
    isRegistered: r.current,
    getConnections: w,
    getPosition: v,
    // 브릿지 기능
    executeCommand: s,
    getSnapshot: o,
    isReady: i
  };
}
function Xt(a) {
  const { senderId: e, onMessageSent: t, ...n } = a, {
    executeCommand: s,
    isReady: o
  } = fe(n), i = 500, [r, p] = _([]), [l, y] = _([]), [M, x] = _([]), R = S(0), P = z((b, m, g = "chat", I) => {
    if (!o) return "";
    const U = `${e}-${++R.current}-${Date.now()}`, $ = Date.now(), Q = {
      id: U,
      from: e,
      to: b,
      type: g === "action" || g === "state" || g === "system" ? g : "chat",
      payload: m,
      priority: I?.priority ?? "normal",
      timestamp: $,
      reliability: I?.reliable ? "reliable" : "unreliable",
      ...I?.retries !== void 0 ? { retryCount: I.retries } : {}
    };
    return s({
      type: "sendMessage",
      message: Q
    }), y((C) => {
      const L = [...C, Q];
      return L.length > i ? L.slice(-i) : L;
    }), t?.(Q), U;
  }, [o, s, e, t]), w = z((b, m = "chat", g) => {
    if (!o) return "";
    const I = `${e}-broadcast-${++R.current}-${Date.now()}`, U = Date.now(), $ = {
      id: I,
      from: e,
      type: m === "action" || m === "state" || m === "system" ? m : "chat",
      payload: b,
      priority: g?.priority ?? "normal",
      timestamp: U,
      reliability: g?.reliable ? "reliable" : "unreliable",
      ...g?.groupId ? { groupId: g.groupId } : {},
      ...g?.retries !== void 0 ? { retryCount: g.retries } : {}
    };
    s({
      type: "broadcast",
      message: $
    });
    const Q = { ...$, to: "broadcast" };
    return y((C) => {
      const L = [...C, Q];
      return L.length > i ? L.slice(-i) : L;
    }), t?.(Q), I;
  }, [o, s, e, t]), v = z(() => {
    p([]), y([]), x([]);
  }, []), u = z((b) => b ? [...r, ...l].filter(
    (m) => m.from === b || m.to === b || m.from === e && m.to === b || m.to === e && m.from === b
  ).sort((m, g) => m.timestamp - g.timestamp) : [...r, ...l].sort((m, g) => m.timestamp - g.timestamp), [r, l, e]), k = z((b) => [...r, ...l].find((m) => m.id === b) || null, [r, l]), h = z(() => ({
    totalSent: l.length,
    totalReceived: r.length,
    totalPending: M.length,
    averageLatency: 0
  }), [l, r, M]);
  return {
    sendMessage: P,
    broadcastMessage: w,
    receivedMessages: r,
    sentMessages: l,
    pendingMessages: M,
    clearMessages: v,
    getMessageHistory: u,
    getMessageById: k,
    getMessageStats: h,
    isReady: o
  };
}
function Zt(a) {
  const {
    npcId: e,
    onGroupJoined: t,
    onGroupLeft: n,
    onGroupMessage: s,
    onGroupMemberJoined: o,
    onGroupMemberLeft: i,
    ...r
  } = a, {
    executeCommand: p,
    getSystemState: l,
    isReady: y
  } = fe(r), [M, x] = _([]), [R, P] = _([]), [w, v] = _([]), [u, k] = _(/* @__PURE__ */ new Map()), h = S(0), b = S(/* @__PURE__ */ new Map()), m = S(/* @__PURE__ */ new Set()), g = S([]);
  g.current = M;
  const I = S(/* @__PURE__ */ new Set()), U = S(""), $ = S(null), Q = 2e3, C = 500;
  J(() => {
    if (!y) return;
    const G = `node_${e}`, V = setInterval(() => {
      const O = l();
      if (!O) return;
      const ne = Array.from(O.groups.values()), ie = ne.map((H) => `${H.id}:${H.members.size}:${H.lastActivity}`).join("|");
      if (ie !== U.current) {
        U.current = ie, v(ne);
        const H = ne.filter((f) => f.members.has(G)).map((f) => f.id);
        I.current.clear();
        for (const f of H) I.current.add(f);
        const ae = g.current, D = H.filter((f) => !ae.includes(f)), T = ae.filter((f) => !H.includes(f));
        if ((D.length > 0 || T.length > 0) && (x(H), P(H), $.current = null, D.forEach((f) => {
          const E = ne.find((q) => q.id === f);
          E && t?.(f, E);
        }), T.forEach((f) => n?.(f)), T.length > 0)) {
          for (const f of T)
            b.current.delete(f);
          k((f) => {
            const E = new Map(f);
            for (const q of T) E.delete(q);
            return E;
          });
        }
        for (const f of ne) {
          const E = new Set(
            Array.from(f.members).map(
              (A) => A.startsWith("node_") ? A.slice(5) : A
            )
          ), q = b.current.get(f.id);
          if (q) {
            for (const A of E)
              q.has(A) || o?.(A, f.id);
            for (const A of q)
              E.has(A) || i?.(A, f.id);
          }
          b.current.set(f.id, E);
        }
      }
      const se = O.messageQueues.get(G) ?? [];
      if (se.length === 0) return;
      const me = se[se.length - 1]?.id ?? null, de = $.current;
      if (de && de === me) return;
      let he = 0;
      if (de) {
        for (let H = se.length - 1; H >= 0; H--)
          if (se[H]?.id === de) {
            he = H + 1;
            break;
          }
      }
      $.current = me, !(he >= se.length) && I.current.size !== 0 && k((H) => {
        const ae = new Map(H), D = /* @__PURE__ */ new Set();
        for (let T = he; T < se.length; T++) {
          const f = se[T];
          if (!f || f.to !== "group" || !f.groupId || !I.current.has(f.groupId) || m.current.has(f.id)) continue;
          if (m.current.size >= Q) {
            const A = Array.from(m.current);
            m.current = new Set(A.slice(A.length - Math.floor(Q / 2)));
          }
          m.current.add(f.id);
          const E = ae.get(f.groupId), q = D.has(f.groupId) ? E ?? [] : E ? E.slice() : [];
          D.has(f.groupId) || (D.add(f.groupId), ae.set(f.groupId, q)), q.push(f), s?.(f, f.groupId);
        }
        if (D.size === 0) return H;
        for (const T of D) {
          const f = ae.get(T);
          f && f.length > C && ae.set(T, f.slice(-C));
        }
        return ae;
      });
    }, 250);
    return () => clearInterval(V);
  }, [y, l, e, t, n, s, o, i]);
  const L = z((G, V = [], O) => {
    if (!y) return;
    const ne = Date.now();
    p({
      type: "createGroup",
      group: {
        type: "party",
        members: /* @__PURE__ */ new Set(),
        maxMembers: O?.maxSize ?? 20,
        range: 1e3,
        persistent: !1,
        createdAt: ne,
        lastActivity: ne
      }
    });
  }, [y, p, e]), N = z((G) => {
    y && p({
      type: "joinGroup",
      npcId: e,
      groupId: G
    });
  }, [y, p, e]), F = z((G) => {
    y && p({
      type: "leaveGroup",
      npcId: e,
      groupId: G
    });
  }, [y, p, e]), W = z((G, V, O = "chat") => {
    if (!y || !M.includes(G)) return "";
    const ne = `${e}-group-${++h.current}-${Date.now()}`, ie = Date.now();
    return p({
      type: "sendMessage",
      message: {
        id: ne,
        from: e,
        to: "group",
        groupId: G,
        type: O === "action" || O === "state" || O === "system" ? O : "chat",
        payload: V,
        priority: "normal",
        timestamp: ie,
        reliability: "reliable"
      }
    }), ne;
  }, [y, p, e, M]), Y = z((G, V) => {
    if (!y || !R.includes(G)) return;
    const O = {
      id: `invite-${Date.now()}`,
      from: e,
      to: V,
      type: "system",
      payload: { groupId: G, inviterId: e },
      priority: "normal",
      timestamp: Date.now(),
      reliability: "reliable"
    };
    p({
      type: "sendMessage",
      message: O
    });
  }, [y, p, e, R]), Z = z((G, V) => {
    !y || !R.includes(G) || p({
      type: "leaveGroup",
      npcId: V,
      groupId: G
    });
  }, [y, p, R]), j = z((G) => w.find((V) => V.id === G) || null, [w]), ee = z((G) => {
    const V = j(G);
    return V ? Array.from(V.members).map(
      (O) => O.startsWith("node_") ? O.slice(5) : O
    ) : [];
  }, [j]), te = z((G) => u.get(G) || [], [u]);
  return {
    // 그룹 생성 및 관리
    createGroup: L,
    joinGroup: N,
    leaveGroup: F,
    // 그룹 메시지
    sendGroupMessage: W,
    // 그룹 멤버 관리
    inviteToGroup: Y,
    kickFromGroup: Z,
    // 그룹 상태
    joinedGroups: M,
    ownedGroups: R,
    availableGroups: w,
    // 그룹 정보 조회
    getGroupInfo: j,
    getGroupMembers: ee,
    getGroupMessages: te,
    // 브릿지 기능
    isReady: y
  };
}
function wt(a = {}) {
  const {
    updateInterval: e = 1e3,
    enableRealTime: t = !0,
    trackHistory: n = !1,
    historyLength: s = 100,
    ...o
  } = a, {
    getSnapshot: i,
    getNetworkStats: r,
    getSystemState: p,
    isReady: l
  } = fe(o), [y, M] = _(null), [x, R] = _([]), [P, w] = _(!1), [v, u] = _(0), k = z(() => {
    if (!l) return null;
    const g = i(), I = r(), U = p();
    if (!g || !I) return null;
    const $ = g.nodeCount, Q = g.connectionCount, C = I.totalMessages ?? 0, L = Q, N = 0, F = (Q > 0, 100), W = g.messagesPerSecond, Y = {
      updateTime: 0,
      messageProcessingTime: 0,
      connectionProcessingTime: 0
    }, Z = U ? Array.from(U.groups.values()) : [], j = U ? U.groups.size : g.activeGroups, ee = j, te = j > 0 ? Z.reduce((G, V) => G + V.members.size, 0) / j : 0;
    return {
      // 기본 통계
      totalNodes: $,
      totalConnections: Q,
      totalMessages: C,
      averageLatency: g.averageLatency,
      messagesPerSecond: W,
      // 연결 통계
      activeConnections: L,
      failedConnections: N,
      connectionSuccessRate: F,
      // 메시지 통계
      sentMessages: C,
      receivedMessages: C,
      failedMessages: 0,
      messageSuccessRate: 100,
      // 성능 통계
      updateTime: Y.updateTime,
      messageProcessingTime: Y.messageProcessingTime,
      connectionProcessingTime: Y.connectionProcessingTime,
      // 그룹 통계
      totalGroups: j,
      activeGroups: ee,
      averageGroupSize: te
    };
  }, [l, i, r, p, e]), h = z(() => {
    w(!0);
    const g = k();
    g && (M(g), u(Date.now()), n && R((I) => {
      const U = [...I, g];
      return U.length > s ? U.slice(-s) : U;
    })), w(!1);
  }, [k, n, s]);
  J(() => {
    if (!t || !l) return;
    const g = setInterval(() => {
      h();
    }, e);
    return () => clearInterval(g);
  }, [t, l, h, e]), J(() => {
    l && h();
  }, [l, h]);
  const b = z((g) => x.length === 0 ? 0 : x.reduce((U, $) => U + $[g], 0) / x.length, [x]), m = z((g) => x.length === 0 ? 0 : Math.max(...x.map((I) => I[g])), [x]);
  return {
    // 현재 통계
    stats: y,
    // 기록된 통계
    statsHistory: n ? x : [],
    // 통계 조회
    refreshStats: h,
    getHistoricalAverage: b,
    getPeakValue: m,
    // 상태
    isLoading: P,
    lastUpdate: v,
    // 브릿지 기능
    isReady: l
  };
}
function en(a) {
  const [e, t] = _(!1), [n, s] = _(/* @__PURE__ */ new Map()), [o, i] = _(), r = S(null), p = z((M) => {
    const x = { ...a, ...M };
    r.current && r.current.disconnect();
    const R = new Qe({
      url: x.url,
      roomId: x.roomId,
      playerName: x.playerName,
      playerColor: x.playerColor,
      onConnect: () => {
        t(!0), i(void 0);
      },
      onDisconnect: () => {
        t(!1), s(/* @__PURE__ */ new Map());
      },
      onPlayerJoin: (P, w) => {
        s((v) => {
          const u = new Map(v);
          return u.set(P, w), u;
        });
      },
      onPlayerUpdate: (P, w) => {
        s((v) => {
          const u = new Map(v);
          return u.set(P, w), u;
        });
      },
      onPlayerLeave: (P) => {
        s((w) => {
          const v = new Map(w);
          return v.delete(P), v;
        });
      },
      onError: (P) => {
        i(P);
      }
    });
    r.current = R, R.connect();
  }, [a]), l = z(() => {
    r.current?.disconnect(), t(!1), s(/* @__PURE__ */ new Map());
  }, []), y = z((M) => {
    r.current?.updateLocalPlayer(M);
  }, []);
  return J(() => () => {
    r.current?.disconnect(), r.current = null;
  }, []), {
    isConnected: e,
    players: n,
    error: o,
    connect: p,
    disconnect: l,
    updateLocalPlayer: y
  };
}
function tn(a) {
  const { config: e, characterUrl: t, rigidBodyRef: n } = a, s = Ne((C) => C.mode?.type ?? "character"), o = Ne((C) => C.animationState), [i, r] = _({
    isConnected: !1,
    connectionStatus: "disconnected",
    players: /* @__PURE__ */ new Map(),
    localPlayerId: null,
    roomId: null,
    error: null,
    ping: 0,
    lastUpdate: 0
  }), p = S(null), l = S(null), y = S(null), M = S(null), x = S(e), R = S(i), P = S(s), w = S(o);
  J(() => {
    R.current = i;
  }, [i]), J(() => {
    P.current = s;
  }, [s]), J(() => {
    w.current = o;
  }, [o]);
  const [v, u] = _(
    () => /* @__PURE__ */ new Map()
  ), k = S(/* @__PURE__ */ new Map());
  J(() => {
    k.current = v;
  }, [v]), J(() => {
    n && (M.current = n);
  }, [n]), J(() => {
    const C = {
      updateRate: e.tracking.updateRate,
      velocityThreshold: e.tracking.velocityThreshold,
      sendRateLimit: e.tracking.sendRateLimit
    };
    y.current = new xt(C);
  }, [e.tracking]);
  const h = z((C) => {
    l.current && l.current.disconnect(), p.current = {
      playerName: C.playerName,
      playerColor: C.playerColor
    }, r((N) => ({
      ...N,
      connectionStatus: "connecting",
      error: null,
      roomId: C.roomId
    }));
    const L = new Qe({
      url: e.websocket.url,
      roomId: C.roomId,
      playerName: C.playerName,
      playerColor: C.playerColor,
      reconnectAttempts: e.websocket.reconnectAttempts,
      reconnectDelay: e.websocket.reconnectDelay,
      pingInterval: e.websocket.pingInterval,
      sendRateLimit: e.tracking.sendRateLimit,
      enableAck: e.enableAck,
      reliableTimeout: e.reliableTimeout,
      reliableRetryCount: e.reliableRetryCount,
      logLevel: e.logLevel,
      logToConsole: e.logToConsole,
      onConnect: () => {
        r((N) => ({
          ...N,
          isConnected: !0,
          connectionStatus: "connected",
          error: null,
          lastUpdate: Date.now()
        }));
      },
      onWelcome: (N) => {
        r((F) => ({
          ...F,
          localPlayerId: N,
          lastUpdate: Date.now()
        }));
      },
      onDisconnect: () => {
        r((N) => ({
          ...N,
          isConnected: !1,
          connectionStatus: "disconnected",
          players: /* @__PURE__ */ new Map(),
          localPlayerId: null,
          lastUpdate: Date.now()
        }));
      },
      onPlayerJoin: (N, F) => {
        r((W) => {
          const Y = new Map(W.players);
          return Y.set(N, F), {
            ...W,
            players: Y,
            lastUpdate: Date.now()
          };
        });
      },
      onPlayerUpdate: (N, F) => {
        r((W) => {
          const Y = new Map(W.players);
          return Y.set(N, F), {
            ...W,
            players: Y,
            lastUpdate: Date.now()
          };
        });
      },
      onPlayerLeave: (N) => {
        r((F) => {
          const W = new Map(F.players);
          return W.delete(N), {
            ...F,
            players: W,
            lastUpdate: Date.now()
          };
        });
      },
      onChat: (N, F, W) => {
        u((Z) => {
          const j = new Map(Z);
          return j.set(N, { text: F, expiresAt: Date.now() + 2500 }), j;
        });
      },
      onPing: (N) => {
        r((F) => ({
          ...F,
          ping: N,
          lastUpdate: Date.now()
        }));
      },
      onError: (N) => {
        r((F) => ({
          ...F,
          connectionStatus: "error",
          error: N,
          lastUpdate: Date.now()
        }));
      }
    });
    l.current = L, L.connect();
  }, [
    e.websocket.url,
    e.websocket.reconnectAttempts,
    e.websocket.reconnectDelay,
    e.websocket.pingInterval,
    e.tracking.sendRateLimit,
    e.logLevel,
    e.logToConsole
  ]), b = z(() => {
    l.current?.disconnect(), y.current?.reset(), M.current = null, u(/* @__PURE__ */ new Map()), r((C) => ({
      ...C,
      isConnected: !1,
      connectionStatus: "disconnected",
      players: /* @__PURE__ */ new Map(),
      localPlayerId: null,
      roomId: null,
      error: null
    }));
  }, []), m = z((C) => {
    M.current = C;
  }, []), g = z(() => {
    M.current = null, y.current?.reset();
  }, []), I = z((C) => {
    x.current = { ...x.current, ...C }, C.tracking && y.current && y.current.updateConfig(C.tracking);
  }, []), U = z((C, L) => {
    const N = l.current;
    if (!N) return;
    const F = L?.range ?? x.current.proximityRange;
    N.sendChat(C, { range: F });
    const W = i.localPlayerId;
    if (!W) return;
    const Y = L?.ttlMs ?? 2500, Z = String(C ?? "").trim().slice(0, 200);
    Z && u((j) => {
      const ee = new Map(j);
      return ee.set(W, { text: Z, expiresAt: Date.now() + Y }), ee;
    });
  }, [i.localPlayerId]);
  J(() => {
    if (!i.isConnected) return;
    const C = Math.max(15, Math.floor(1e3 / Math.max(1, x.current.tracking.updateRate))), L = window.setInterval(() => {
      if (!R.current.isConnected || !l.current || !y.current || !M.current?.current || !p.current) return;
      const { playerName: F, playerColor: W } = p.current, Y = P.current, Z = w.current?.[Y]?.current ?? "idle", j = y.current.trackPosition(
        M.current,
        F,
        W,
        t,
        Z
      );
      if (j) {
        const { modelUrl: ee, ...te } = j;
        l.current.updateLocalPlayer(
          ee ? { ...te, modelUrl: ee } : te
        );
      }
      if (k.current.size > 0) {
        const ee = Date.now(), te = [];
        if (k.current.forEach((G, V) => {
          G.expiresAt <= ee && te.push(V);
        }), te.length > 0) {
          const G = new Map(k.current);
          for (const V of te) G.delete(V);
          u(G);
        }
      }
    }, C);
    return () => window.clearInterval(L);
  }, [i.isConnected, t]), J(() => () => {
    l.current?.disconnect();
  }, []);
  const $ = re(() => {
    const C = /* @__PURE__ */ new Map();
    return v.forEach((L, N) => {
      C.set(N, L.text);
    }), C;
  }, [v]), Q = i.localPlayerId ? v.get(i.localPlayerId)?.text ?? null : null;
  return {
    ...i,
    connect: h,
    disconnect: b,
    startTracking: m,
    stopTracking: g,
    updateConfig: I,
    sendChat: U,
    speechByPlayerId: $,
    localSpeechText: Q
  };
}
function vt(a, e) {
  const t = [];
  for (const n of a.values())
    for (const s of n)
      t.length >= e && t.shift(), t.push(s);
  return t;
}
const nn = ({
  systemId: a = "main",
  className: e,
  style: t,
  onClose: n
}) => {
  const { getSnapshot: s, getSystemState: o, isReady: i } = fe({ systemId: a }), { stats: r, refreshStats: p } = wt({ systemId: a, enableRealTime: !0 }), [l, y] = _({
    snapshot: null,
    system: null,
    messages: [],
    isExpanded: !0,
    activeTab: "overview"
  });
  J(() => {
    if (!i) return;
    const u = setInterval(() => {
      const k = s(), h = o();
      if (!k && !h) return;
      const b = h ? vt(h.messageQueues, 50) : [];
      y((m) => ({
        ...m,
        snapshot: k ?? m.snapshot,
        system: h ?? m.system,
        messages: b
      }));
    }, 500);
    return () => clearInterval(u);
  }, [i, s, o]);
  const M = () => {
    if (!l.snapshot) return /* @__PURE__ */ c("div", { children: "No data available" });
    const { snapshot: u } = l, k = l.system?.groups.size ?? u.activeGroups;
    return /* @__PURE__ */ d("div", { style: { padding: "10px" }, children: [
      /* @__PURE__ */ c("h4", { children: "Network Overview" }),
      /* @__PURE__ */ d("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }, children: [
        /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ c("strong", { children: "Total Nodes:" }),
          " ",
          u.nodeCount
        ] }),
        /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ c("strong", { children: "Total Connections:" }),
          " ",
          u.connectionCount
        ] }),
        /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ c("strong", { children: "Total Groups:" }),
          " ",
          k
        ] }),
        /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ c("strong", { children: "Recent Messages:" }),
          " ",
          l.messages.length
        ] })
      ] }),
      r && /* @__PURE__ */ d("div", { style: { marginTop: "15px" }, children: [
        /* @__PURE__ */ c("h5", { children: "Performance Metrics" }),
        /* @__PURE__ */ d("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }, children: [
          /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ c("strong", { children: "Messages/sec:" }),
            " ",
            r.messagesPerSecond.toFixed(2)
          ] }),
          /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ c("strong", { children: "Avg Latency:" }),
            " ",
            r.averageLatency.toFixed(2),
            "ms"
          ] }),
          /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ c("strong", { children: "Connection Success:" }),
            " ",
            r.connectionSuccessRate.toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ c("strong", { children: "Update Time:" }),
            " ",
            r.updateTime.toFixed(2),
            "ms"
          ] })
        ] })
      ] })
    ] });
  }, x = () => {
    const u = l.system;
    if (!u) return /* @__PURE__ */ c("div", { children: "No data available" });
    const k = Array.from(u.nodes.values());
    return /* @__PURE__ */ d("div", { style: { padding: "10px" }, children: [
      /* @__PURE__ */ d("h4", { children: [
        "Network Nodes (",
        k.length,
        ")"
      ] }),
      /* @__PURE__ */ c("div", { style: { maxHeight: "300px", overflowY: "auto" }, children: k.map((h) => /* @__PURE__ */ d(
        "div",
        {
          style: {
            border: "1px solid #ccc",
            margin: "5px 0",
            padding: "8px",
            borderRadius: "4px"
          },
          children: [
            /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ c("strong", { children: "ID:" }),
              " ",
              h.id
            ] }),
            /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ c("strong", { children: "Position:" }),
              " (",
              h.position.x.toFixed(1),
              ", ",
              h.position.y.toFixed(1),
              ", ",
              h.position.z.toFixed(1),
              ")"
            ] }),
            /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ c("strong", { children: "Connections:" }),
              " ",
              h.connections.size
            ] }),
            /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ c("strong", { children: "Groups:" }),
              " ",
              Array.from(u.groups.values()).filter((b) => b.members.has(h.id)).map((b) => b.id).join(", ") || "None"
            ] })
          ]
        },
        h.id
      )) })
    ] });
  }, R = () => {
    const u = l.system;
    if (!u) return /* @__PURE__ */ c("div", { children: "No data available" });
    const k = Array.from(u.connections.values());
    return /* @__PURE__ */ d("div", { style: { padding: "10px" }, children: [
      /* @__PURE__ */ d("h4", { children: [
        "Network Connections (",
        k.length,
        ")"
      ] }),
      /* @__PURE__ */ c("div", { style: { maxHeight: "300px", overflowY: "auto" }, children: k.map((h) => /* @__PURE__ */ d(
        "div",
        {
          style: {
            border: "1px solid #ccc",
            margin: "5px 0",
            padding: "8px",
            borderRadius: "4px"
          },
          children: [
            /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ c("strong", { children: "ID:" }),
              " ",
              h.id
            ] }),
            /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ c("strong", { children: "From:" }),
              " ",
              h.nodeA,
              " → ",
              /* @__PURE__ */ c("strong", { children: "To:" }),
              " ",
              h.nodeB
            ] }),
            /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ c("strong", { children: "Status:" }),
              " ",
              h.status
            ] }),
            /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ c("strong", { children: "Latency:" }),
              " ",
              h.latency.toFixed(1),
              "ms"
            ] }),
            /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ c("strong", { children: "Last Activity:" }),
              " ",
              new Date(h.lastActivity).toLocaleTimeString()
            ] })
          ]
        },
        h.id
      )) })
    ] });
  }, P = () => /* @__PURE__ */ d("div", { style: { padding: "10px" }, children: [
    /* @__PURE__ */ d("h4", { children: [
      "Recent Messages (",
      l.messages.length,
      ")"
    ] }),
    /* @__PURE__ */ c("div", { style: { maxHeight: "300px", overflowY: "auto" }, children: l.messages.slice().reverse().map((u, k) => /* @__PURE__ */ d(
      "div",
      {
        style: {
          border: "1px solid #ccc",
          margin: "5px 0",
          padding: "8px",
          borderRadius: "4px",
          backgroundColor: u.type === "system" ? "#f0f8ff" : "#ffffff"
        },
        children: [
          /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ c("strong", { children: "ID:" }),
            " ",
            u.id
          ] }),
          /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ c("strong", { children: "Type:" }),
            " ",
            u.type
          ] }),
          /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ c("strong", { children: "From:" }),
            " ",
            u.from,
            " → ",
            /* @__PURE__ */ c("strong", { children: "To:" }),
            " ",
            u.to === "group" ? `group:${u.groupId ?? "unknown"}` : u.to
          ] }),
          /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ c("strong", { children: "Time:" }),
            " ",
            new Date(u.timestamp).toLocaleTimeString()
          ] }),
          /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ c("strong", { children: "Payload:" }),
            " ",
            JSON.stringify(u.payload)
          ] })
        ]
      },
      `${u.id}-${k}`
    )) })
  ] }), w = () => r ? /* @__PURE__ */ d("div", { style: { padding: "10px" }, children: [
    /* @__PURE__ */ d("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "10px" }, children: [
      /* @__PURE__ */ c("h4", { children: "Network Statistics" }),
      /* @__PURE__ */ c("button", { onClick: p, children: "Refresh" })
    ] }),
    /* @__PURE__ */ d("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }, children: [
      /* @__PURE__ */ d("div", { children: [
        /* @__PURE__ */ c("h5", { children: "Basic Stats" }),
        /* @__PURE__ */ d("div", { children: [
          "Total Nodes: ",
          r.totalNodes
        ] }),
        /* @__PURE__ */ d("div", { children: [
          "Total Connections: ",
          r.totalConnections
        ] }),
        /* @__PURE__ */ d("div", { children: [
          "Total Messages: ",
          r.totalMessages
        ] })
      ] }),
      /* @__PURE__ */ d("div", { children: [
        /* @__PURE__ */ c("h5", { children: "Performance" }),
        /* @__PURE__ */ d("div", { children: [
          "Messages/sec: ",
          r.messagesPerSecond.toFixed(2)
        ] }),
        /* @__PURE__ */ d("div", { children: [
          "Avg Latency: ",
          r.averageLatency.toFixed(2),
          "ms"
        ] }),
        /* @__PURE__ */ d("div", { children: [
          "Update Time: ",
          r.updateTime.toFixed(2),
          "ms"
        ] })
      ] }),
      /* @__PURE__ */ d("div", { children: [
        /* @__PURE__ */ c("h5", { children: "Connection Stats" }),
        /* @__PURE__ */ d("div", { children: [
          "Active: ",
          r.activeConnections
        ] }),
        /* @__PURE__ */ d("div", { children: [
          "Failed: ",
          r.failedConnections
        ] }),
        /* @__PURE__ */ d("div", { children: [
          "Success Rate: ",
          r.connectionSuccessRate.toFixed(1),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ d("div", { children: [
        /* @__PURE__ */ c("h5", { children: "Group Stats" }),
        /* @__PURE__ */ d("div", { children: [
          "Total Groups: ",
          r.totalGroups
        ] }),
        /* @__PURE__ */ d("div", { children: [
          "Active Groups: ",
          r.activeGroups
        ] }),
        /* @__PURE__ */ d("div", { children: [
          "Avg Group Size: ",
          r.averageGroupSize.toFixed(1)
        ] })
      ] })
    ] })
  ] }) : /* @__PURE__ */ c("div", { children: "Loading stats..." }), v = () => {
    switch (l.activeTab) {
      case "overview":
        return M();
      case "nodes":
        return x();
      case "connections":
        return R();
      case "messages":
        return P();
      case "stats":
        return w();
      default:
        return M();
    }
  };
  return l.isExpanded ? /* @__PURE__ */ d(
    "div",
    {
      className: e,
      style: {
        position: "fixed",
        top: "10px",
        right: "10px",
        width: "600px",
        height: "500px",
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        zIndex: 1e3,
        display: "flex",
        flexDirection: "column",
        ...t
      },
      children: [
        /* @__PURE__ */ d("div", { style: {
          padding: "10px",
          borderBottom: "1px solid #ccc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }, children: [
          /* @__PURE__ */ c("h3", { style: { margin: 0 }, children: "Network Debug Panel" }),
          /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ c("button", { onClick: () => y((u) => ({ ...u, isExpanded: !1 })), children: "−" }),
            n && /* @__PURE__ */ c("button", { onClick: n, style: { marginLeft: "5px" }, children: "×" })
          ] })
        ] }),
        /* @__PURE__ */ c("div", { style: {
          display: "flex",
          borderBottom: "1px solid #ccc",
          backgroundColor: "#f9f9f9"
        }, children: ["overview", "nodes", "connections", "messages", "stats"].map((u) => /* @__PURE__ */ c(
          "button",
          {
            style: {
              flex: 1,
              padding: "8px 12px",
              border: "none",
              backgroundColor: l.activeTab === u ? "white" : "transparent",
              borderBottom: l.activeTab === u ? "2px solid #007acc" : "none",
              cursor: "pointer"
            },
            onClick: () => y((k) => ({ ...k, activeTab: u })),
            children: u.charAt(0).toUpperCase() + u.slice(1)
          },
          u
        )) }),
        /* @__PURE__ */ c("div", { style: { flex: 1, overflow: "auto" }, children: v() }),
        /* @__PURE__ */ d("div", { style: {
          padding: "5px 10px",
          borderTop: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          fontSize: "12px",
          color: "#666"
        }, children: [
          "Status: ",
          i ? "Connected" : "Disconnected",
          " | System: ",
          a,
          " | Last Update: ",
          (/* @__PURE__ */ new Date()).toLocaleTimeString()
        ] })
      ]
    }
  ) : /* @__PURE__ */ c(
    "div",
    {
      className: e,
      style: {
        position: "fixed",
        top: "10px",
        right: "10px",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "5px 10px",
        cursor: "pointer",
        zIndex: 1e3,
        ...t
      },
      onClick: () => y((u) => ({ ...u, isExpanded: !0 })),
      children: "Network Debug"
    }
  );
}, Le = [
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#96ceb4",
  "#feca57",
  "#ff9ff3",
  "#54a0ff",
  "#5f27cd",
  "#00d2d3",
  "#ff9f43"
], Pe = "#cccccc", De = "#4a90e2", St = {
  active: "#00ff00",
  establishing: "#ffff00",
  unstable: "#ff9f43",
  disconnected: "#cccccc"
}, Ct = (a) => St[a] ?? "#666666", sn = ({
  systemId: a = "main",
  showLabels: e = !0,
  showConnectionLines: t = !0,
  showGroups: n = !0,
  nodeSize: s = 0.5,
  connectionWidth: o = 0.05,
  updateInterval: i = 100,
  maxRenderDistance: r = 100
}) => {
  const { getSystemState: p, isReady: l } = fe({ systemId: a }), y = S(null), M = S(0), [x, R] = ze.useState({
    nodes: [],
    connections: [],
    groups: /* @__PURE__ */ new Map()
  });
  Se(() => {
    const h = Date.now();
    if (!l || h - M.current < i) return;
    const b = p();
    if (!b) return;
    const m = /* @__PURE__ */ new Map();
    b.groups.forEach((g, I) => {
      m.set(I, Array.from(g.members));
    }), R({
      nodes: Array.from(b.nodes.values()),
      connections: Array.from(b.connections.values()),
      groups: m
    }), M.current = h;
  });
  const P = re(() => {
    const h = /* @__PURE__ */ new Map();
    let b = 0;
    return x.groups.forEach((m, g) => {
      h.set(g, Le[b % Le.length] ?? Pe), b++;
    }), h;
  }, [x.groups]), w = re(() => {
    const h = /* @__PURE__ */ new Map();
    return x.groups.forEach((b, m) => {
      for (const g of b) {
        const I = h.get(g);
        I ? I.push(m) : h.set(g, [m]);
      }
    }), h;
  }, [x.groups]), v = re(() => {
    const h = /* @__PURE__ */ new Map();
    for (const b of x.nodes) h.set(b.id, b);
    return h;
  }, [x.nodes]), u = re(() => {
    const h = [];
    return x.groups.forEach((b, m) => {
      const g = [];
      for (const C of b) {
        const L = v.get(C);
        L && g.push(L);
      }
      if (g.length < 2) return;
      let I = 0, U = 0, $ = 0;
      for (const C of g)
        I += C.position.x, U += C.position.y, $ += C.position.z;
      I /= g.length, U /= g.length, $ /= g.length;
      let Q = 0;
      for (const C of g) {
        const L = C.position.x - I, N = C.position.y - U, F = C.position.z - $, W = L * L + N * N + F * F;
        W > Q && (Q = W);
      }
      h.push({ groupId: m, center: [I, U, $], radius: Math.sqrt(Q) + 1 });
    }), h;
  }, [x.groups, v]);
  if (!l)
    return /* @__PURE__ */ c(ce, { position: [0, 0, 0], fontSize: 1, color: "#ff0000", anchorX: "center", anchorY: "middle", children: "Network not ready" });
  const k = (h) => {
    if (!n) return De;
    const m = w.get(h)?.[0];
    return m ? P.get(m) ?? Pe : De;
  };
  return /* @__PURE__ */ d("group", { ref: y, children: [
    x.nodes.map((h) => {
      const b = k(h.id), m = w.get(h.id);
      return /* @__PURE__ */ d("group", { position: [h.position.x, h.position.y, h.position.z], children: [
        /* @__PURE__ */ c(Ae, { args: [s], position: [0, 0, 0], children: /* @__PURE__ */ c("meshBasicMaterial", { color: b }) }),
        h.connections.size > 0 && /* @__PURE__ */ c(Ae, { args: [s * 0.3], position: [0, s + 0.2, 0], children: /* @__PURE__ */ c("meshBasicMaterial", { color: "#ffffff" }) }),
        e && /* @__PURE__ */ c(
          ce,
          {
            position: [0, s + 0.5, 0],
            fontSize: 0.3,
            color: "#ffffff",
            anchorX: "center",
            anchorY: "middle",
            children: h.id
          }
        ),
        n && m && m.length > 0 && /* @__PURE__ */ c(
          ce,
          {
            position: [0, s + 0.8, 0],
            fontSize: 0.2,
            color: b,
            anchorX: "center",
            anchorY: "middle",
            children: m.join(", ")
          }
        )
      ] }, h.id);
    }),
    t && x.connections.map((h) => {
      const b = v.get(h.nodeA), m = v.get(h.nodeB);
      return !b || !m ? null : /* @__PURE__ */ c(
        Je,
        {
          points: [
            [b.position.x, b.position.y, b.position.z],
            [m.position.x, m.position.y, m.position.z]
          ],
          color: Ct(h.status),
          lineWidth: o,
          transparent: !0,
          opacity: h.status === "active" ? 0.8 : 0.4
        },
        h.id
      );
    }),
    n && u.map(({ groupId: h, center: b, radius: m }) => {
      const g = P.get(h) ?? Pe;
      return /* @__PURE__ */ d("group", { children: [
        /* @__PURE__ */ d("mesh", { position: b, children: [
          /* @__PURE__ */ c("ringGeometry", { args: [m - 0.1, m + 0.1, 32] }),
          /* @__PURE__ */ c("meshBasicMaterial", { color: g, transparent: !0, opacity: 0.3 })
        ] }),
        /* @__PURE__ */ d(
          ce,
          {
            position: [b[0], b[1] + m + 0.5, b[2]],
            fontSize: 0.4,
            color: g,
            anchorX: "center",
            anchorY: "middle",
            children: [
              "Group: ",
              h
            ]
          }
        )
      ] }, `group-${h}`);
    }),
    /* @__PURE__ */ d("group", { position: [-10, 10, 0], children: [
      /* @__PURE__ */ c(ce, { position: [0, 2, 0], fontSize: 0.5, color: "#ffffff", anchorX: "left", anchorY: "middle", children: "Network Visualization" }),
      /* @__PURE__ */ d(ce, { position: [0, 1, 0], fontSize: 0.3, color: "#ffffff", anchorX: "left", anchorY: "middle", children: [
        "Nodes: ",
        x.nodes.length
      ] }),
      /* @__PURE__ */ d(ce, { position: [0, 0.5, 0], fontSize: 0.3, color: "#ffffff", anchorX: "left", anchorY: "middle", children: [
        "Connections: ",
        x.connections.length
      ] }),
      /* @__PURE__ */ d(ce, { position: [0, 0, 0], fontSize: 0.3, color: "#ffffff", anchorX: "left", anchorY: "middle", children: [
        "Groups: ",
        x.groups.size
      ] })
    ] })
  ] });
};
function Ee(a) {
  return "color" in a && a.color instanceof B.Color;
}
const Mt = ze.memo(function({ state: e, characterUrl: t, config: n, speechText: s }) {
  const o = S(null), i = S(null), r = S(null);
  r.current || (r.current = [e.position[0], e.position[1], e.position[2]]);
  const p = S(new B.Vector3()), l = S(new B.Quaternion()), y = S(new B.Vector3()), M = S(performance.now()), x = S(new B.Vector3()), R = S(new B.Quaternion()), P = S(new B.Vector3()), w = S(new B.Vector3()), v = S(new B.Vector3()), u = S(new B.Quaternion()), k = S(!1), h = S(new B.Vector3()), b = S(new B.Vector3()), m = S(new B.Vector3()), g = S(new B.Vector3()), I = S(new B.Vector3()), U = S(new B.Vector3()), $ = S({ x: 0, y: 0, z: 0 }), Q = S({ x: 0, y: 0, z: 0, w: 1 }), C = S(0), L = S(0), N = t || e.modelUrl || "";
  if (!N) return null;
  const F = (D) => {
    if (typeof D != "string") return null;
    const T = D.trim();
    if (!T) return null;
    const f = T.startsWith("#") ? T : `#${T}`;
    return /^#[0-9a-fA-F]{3}$/.test(f) || /^#[0-9a-fA-F]{6}$/.test(f) ? f : null;
  }, W = re(() => F(e.color), [e.color]), Y = n?.tracking?.interpolationSpeed || 0.15, Z = n?.rendering?.characterScale || 1, j = n?.rendering?.nameTagHeight || 3.5, ee = n?.rendering?.nameTagSize || 0.5, { scene: te, animations: G } = He(N), V = re(() => tt.clone(te), [te]), { actions: O, ref: ne } = Ye(G, i), ie = S([]), se = S(null), me = S(null), de = S(performance.now()), he = S(new B.Vector3());
  J(() => {
    for (const T of ie.current)
      try {
        T.dispose();
      } catch {
      }
    if (ie.current = [], !W) return;
    const D = (T) => {
      if (!Ee(T)) return T;
      const f = T.clone();
      return Ee(f) ? (f.color.set(W), ie.current.push(f), f) : T;
    };
    return V.traverse((T) => {
      (T instanceof B.Mesh || T instanceof B.SkinnedMesh) && T.material && (Array.isArray(T.material) ? T.material = T.material.map((f) => D(f)) : T.material = D(T.material));
    }), () => {
      for (const T of ie.current)
        try {
          T.dispose();
        } catch {
        }
      ie.current = [];
    };
  }, [V, W]);
  const H = (D) => {
    if (!O) return null;
    const T = O[D];
    if (T) return T;
    const f = D.toLowerCase(), E = Object.keys(O), q = E.find((A) => A.toLowerCase().includes(f));
    if (q) return O[q] ?? null;
    if (f === "run") {
      const A = E.find((K) => K.toLowerCase().includes("walk")) ?? E[0];
      return A ? O[A] ?? null : null;
    }
    if (f === "idle") {
      const A = E.find((K) => K.toLowerCase().includes("idle")) ?? E[0];
      return A ? O[A] ?? null : null;
    }
    return E[0] ? O[E[0]] ?? null : null;
  }, ae = (D, T, f, E, q, A, K) => {
    const le = Math.max(1e-4, E), pe = Math.max(0, A), X = 2 / le, oe = X * pe, Me = 1 / (1 + oe + 0.48 * oe * oe + 0.235 * oe * oe * oe);
    m.current.copy(T), h.current.copy(D).sub(T);
    const ye = q * le, ue = h.current.length();
    ue > ye && ue > 0 && h.current.multiplyScalar(ye / ue), g.current.copy(D).sub(h.current), b.current.copy(f).addScaledVector(h.current, X).multiplyScalar(pe), f.addScaledVector(b.current, -X).multiplyScalar(Me), K.copy(h.current).add(b.current).multiplyScalar(Me).add(g.current), I.current.copy(m.current).sub(D), U.current.copy(K).sub(m.current), I.current.dot(U.current) > 0 && (K.copy(m.current), f.set(0, 0, 0));
  };
  return J(() => {
    if (!O) return;
    const D = n?.tracking?.velocityThreshold ?? 0.5, T = D, f = D * 0.6, E = 180, q = e.velocity ? Math.hypot(e.velocity[0], e.velocity[1], e.velocity[2]) : y.current.length(), A = e.animation?.trim(), K = (se.current ?? "idle") === "run" ? q < f ? "idle" : "run" : q > T ? "run" : "idle", le = (A && A.length > 0 ? A : K) || "idle";
    if (se.current === le) return;
    const pe = performance.now();
    if (pe - de.current < E) return;
    const X = H(le);
    if (!X) return;
    const oe = me.current;
    return X.enabled = !0, X.setEffectiveTimeScale(1), X.setEffectiveWeight(1), X.reset().play(), oe && oe !== X ? X.crossFadeFrom(oe, 0.18, !0) : X.fadeIn(0.18), se.current = le, me.current = X, de.current = pe, () => {
    };
  }, [O, e.animation, e.velocity, n?.tracking?.velocityThreshold]), J(() => {
    if (M.current = performance.now(), p.current.set(
      e.position[0],
      e.position[1],
      e.position[2]
    ), he.current.set(e.position[0], e.position[1], e.position[2]), !k.current && o.current) {
      const E = p.current;
      k.current = !0, w.current.copy(E), v.current.set(0, 0, 0), u.current.copy(l.current);
      const q = o.current, A = $.current;
      A.x = E.x, A.y = E.y, A.z = E.z, q.setNextKinematicTranslation(A);
      const K = Q.current;
      K.x = l.current.x, K.y = l.current.y, K.z = l.current.z, K.w = l.current.w, q.setNextKinematicRotation(K);
    }
    const D = e.rotation, f = Math.abs(D[0]) < 1e-6 && Math.abs(D[1]) < 1e-6 && Math.abs(D[2]) < 1e-6 && Math.abs(D[3] - 1) < 1e-6 ? [1, 0, 0, 0] : D;
    l.current.set(
      f[1],
      f[2],
      f[3],
      f[0]
    ), e.velocity && y.current.set(
      e.velocity[0],
      e.velocity[1],
      e.velocity[2]
    );
  }, [e.position, e.rotation, e.velocity]), Se((D, T) => {
    if (!o.current || !i.current) return;
    const f = L.current;
    if (f > 0) {
      if (C.current += Math.max(0, T), C.current < f) return;
      C.current = 0;
    } else
      C.current = 0;
    const E = k.current ? w.current : p.current, q = D.camera.position.distanceTo(E), A = k.current ? nt(q, 25, 140, 4) : 1;
    L.current = A >= 0.7 ? 0 : A >= 0.4 ? 1 / 30 : A >= 0.2 ? 1 / 15 : 1 / 8;
    const K = (performance.now() - M.current) / 1e3, le = Math.max(0, Math.min(0.12, K));
    if (P.current.copy(p.current).addScaledVector(y.current, le), !k.current) {
      const xe = o.current.translation(), ge = o.current.rotation();
      k.current = !0, w.current.set(xe.x, xe.y, xe.z), v.current.set(0, 0, 0), u.current.set(ge.x, ge.y, ge.z, ge.w);
    }
    const pe = Math.max(0.01, Math.min(0.9, Y)), X = Math.max(0.03, Math.min(0.22, 0.03 + (1 - pe) * 0.19)), oe = 120;
    if (w.current.distanceTo(P.current) > 10 || T > 0.25)
      w.current.copy(P.current), v.current.set(0, 0, 0), u.current.copy(l.current);
    else {
      ae(
        w.current,
        P.current,
        v.current,
        X,
        oe,
        T,
        x.current
      ), w.current.copy(x.current);
      const xe = Math.max(0.025, X * 0.7), ge = 1 - Math.exp(-Math.max(0, T) / xe);
      R.current.copy(u.current).slerp(l.current, ge), u.current.copy(R.current);
    }
    he.current.copy(w.current);
    const ye = o.current, ue = $.current;
    ue.x = w.current.x, ue.y = w.current.y, ue.z = w.current.z, ye.setNextKinematicTranslation(ue);
    const be = Q.current;
    be.x = u.current.x, be.y = u.current.y, be.z = u.current.z, be.w = u.current.w, ye.setNextKinematicRotation(be);
  }), /* @__PURE__ */ d("group", { children: [
    /* @__PURE__ */ d(
      Fe,
      {
        ref: o,
        type: "kinematicPosition",
        position: r.current ?? void 0,
        colliders: !1,
        children: [
          /* @__PURE__ */ c(Xe, { args: [0.5, 0.5], position: [0, 1.5, 0] }),
          /* @__PURE__ */ c("group", { ref: i, children: /* @__PURE__ */ c("group", { ref: ne, scale: [Z, Z, Z], children: /* @__PURE__ */ c("primitive", { object: V }) }) }),
          /* @__PURE__ */ c(
            ce,
            {
              position: [0, j, 0],
              fontSize: ee,
              color: "white",
              anchorX: "center",
              anchorY: "middle",
              outlineWidth: 0.05,
              outlineColor: "black",
              children: e.name
            }
          )
        ]
      }
    ),
    s ? /* @__PURE__ */ c(
      Oe,
      {
        text: s,
        position: he.current
      }
    ) : null
  ] });
});
function on({ onConnect: a, error: e, isConnecting: t }) {
  const [n, s] = _(""), [o, i] = _("room1"), [r] = _(() => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`);
  return /* @__PURE__ */ c("div", { style: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1a1a1a"
  }, children: /* @__PURE__ */ d(
    "form",
    {
      onSubmit: (l) => {
        l.preventDefault(), n.trim() && a({
          roomId: o,
          playerName: n.trim(),
          playerColor: r
        });
      },
      style: {
        background: "rgba(0, 0, 0, 0.8)",
        padding: "40px",
        borderRadius: "10px",
        color: "white",
        minWidth: "300px"
      },
      children: [
        /* @__PURE__ */ c("h2", { style: { marginBottom: "20px", textAlign: "center" }, children: "네트워크 멀티플레이어" }),
        /* @__PURE__ */ d("div", { style: { marginBottom: "15px" }, children: [
          /* @__PURE__ */ c("label", { style: { display: "block", marginBottom: "5px" }, children: "플레이어 이름" }),
          /* @__PURE__ */ c(
            "input",
            {
              type: "text",
              placeholder: "이름을 입력하세요",
              value: n,
              onChange: (l) => s(l.target.value),
              disabled: t,
              style: {
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                background: "#333",
                color: "white",
                fontSize: "14px"
              }
            }
          )
        ] }),
        /* @__PURE__ */ d("div", { style: { marginBottom: "20px" }, children: [
          /* @__PURE__ */ c("label", { style: { display: "block", marginBottom: "5px" }, children: "방 코드" }),
          /* @__PURE__ */ c(
            "input",
            {
              type: "text",
              placeholder: "방 코드",
              value: o,
              onChange: (l) => i(l.target.value),
              disabled: t,
              style: {
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                background: "#333",
                color: "white",
                fontSize: "14px"
              }
            }
          )
        ] }),
        /* @__PURE__ */ d("div", { style: { marginBottom: "20px" }, children: [
          /* @__PURE__ */ c("label", { style: { display: "block", marginBottom: "5px" }, children: "플레이어 색상" }),
          /* @__PURE__ */ c(
            "div",
            {
              style: {
                width: "30px",
                height: "30px",
                backgroundColor: r,
                borderRadius: "50%",
                border: "2px solid #ccc"
              }
            }
          )
        ] }),
        /* @__PURE__ */ c(
          "button",
          {
            type: "submit",
            disabled: !n.trim() || t,
            style: {
              width: "100%",
              padding: "12px",
              borderRadius: "5px",
              border: "none",
              background: !n.trim() || t ? "#666" : "#4CAF50",
              color: "white",
              fontSize: "16px",
              cursor: !n.trim() || t ? "not-allowed" : "pointer",
              transition: "background-color 0.2s"
            },
            children: t ? "연결 중..." : "연결하기"
          }
        ),
        e && /* @__PURE__ */ c("div", { style: {
          color: "#ff6b6b",
          marginTop: "15px",
          padding: "10px",
          background: "rgba(255, 107, 107, 0.1)",
          borderRadius: "5px",
          fontSize: "14px"
        }, children: e })
      ]
    }
  ) });
}
function rn({ state: a, playerName: e, onDisconnect: t, onSendChat: n }) {
  const { isConnected: s, connectionStatus: o, players: i, roomId: r, error: p, ping: l, localPlayerId: y, lastUpdate: M } = a, [x, R] = _("");
  if (!s) return null;
  const P = z(() => {
    if (!n) return;
    const w = x.trim();
    w && (n(w), R(""));
  }, [n, x]);
  return /* @__PURE__ */ d("div", { style: {
    position: "fixed",
    top: 10,
    left: 10,
    background: "rgba(0, 0, 0, 0.8)",
    padding: "8px",
    borderRadius: "6px",
    color: "white",
    minWidth: "160px",
    backdropFilter: "blur(5px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    lineHeight: 1.2
  }, children: [
    /* @__PURE__ */ c("h3", { style: {
      marginTop: 0,
      marginBottom: "6px",
      fontSize: "12px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
      paddingBottom: "6px"
    }, children: "네트워크 정보" }),
    /* @__PURE__ */ d("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c("strong", { children: "상태:" }),
      /* @__PURE__ */ c("span", { style: {
        marginLeft: "8px",
        color: o === "connected" ? "#4CAF50" : "#ff6b6b"
      }, children: o === "connected" ? "연결됨" : o === "connecting" ? "연결 중" : o === "error" ? "오류" : "연결 끊김" })
    ] }),
    e && /* @__PURE__ */ d("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c("strong", { children: "플레이어:" }),
      " ",
      /* @__PURE__ */ c("span", { style: { marginLeft: "8px" }, children: e })
    ] }),
    r && /* @__PURE__ */ d("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c("strong", { children: "방:" }),
      " ",
      /* @__PURE__ */ c("span", { style: { marginLeft: "8px" }, children: r })
    ] }),
    y && /* @__PURE__ */ d("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c("strong", { children: "내 ID:" }),
      " ",
      /* @__PURE__ */ c("span", { style: { marginLeft: "8px" }, children: y })
    ] }),
    /* @__PURE__ */ d("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c("strong", { children: "최근 업데이트:" }),
      /* @__PURE__ */ c("span", { style: { marginLeft: "8px" }, children: M ? `${Math.max(0, Date.now() - M)}ms 전` : "-" })
    ] }),
    /* @__PURE__ */ d("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c("strong", { children: "접속자:" }),
      /* @__PURE__ */ d("span", { style: { marginLeft: "8px" }, children: [
        i.size + (s ? 1 : 0),
        "명"
      ] })
    ] }),
    l > 0 && /* @__PURE__ */ d("div", { style: { marginBottom: "8px", fontSize: "12px" }, children: [
      /* @__PURE__ */ c("strong", { children: "핑:" }),
      /* @__PURE__ */ d("span", { style: {
        marginLeft: "8px",
        color: l < 50 ? "#4CAF50" : l < 100 ? "#FFA726" : "#ff6b6b"
      }, children: [
        l,
        "ms"
      ] })
    ] }),
    i.size > 0 && /* @__PURE__ */ d("div", { style: { marginBottom: "8px" }, children: [
      /* @__PURE__ */ c("strong", { children: "다른 플레이어:" }),
      /* @__PURE__ */ c("div", { style: {
        marginTop: "6px",
        maxHeight: "80px",
        overflowY: "auto",
        fontSize: "11px"
      }, children: Array.from(i.entries()).map(([w, v]) => /* @__PURE__ */ d(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            marginBottom: "4px",
            padding: "3px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "3px"
          },
          children: [
            /* @__PURE__ */ c(
              "div",
              {
                style: {
                  width: "10px",
                  height: "10px",
                  backgroundColor: v.color,
                  borderRadius: "50%",
                  marginRight: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.3)"
                }
              }
            ),
            /* @__PURE__ */ d("span", { style: { flex: 1 }, children: [
              v.name,
              /* @__PURE__ */ d("span", { style: { opacity: 0.7, marginLeft: "8px" }, children: [
                "(",
                v.position[0].toFixed(1),
                ",",
                v.position[1].toFixed(1),
                ",",
                v.position[2].toFixed(1),
                ")"
              ] }),
              v.animation ? /* @__PURE__ */ c("span", { style: { opacity: 0.7, marginLeft: "8px" }, children: v.animation }) : null
            ] })
          ]
        },
        w
      )) })
    ] }),
    p && /* @__PURE__ */ c("div", { style: {
      color: "#ff6b6b",
      marginBottom: "15px",
      padding: "8px",
      background: "rgba(255, 107, 107, 0.1)",
      borderRadius: "5px",
      fontSize: "14px"
    }, children: p }),
    n ? /* @__PURE__ */ d("div", { style: { marginBottom: "8px" }, children: [
      /* @__PURE__ */ c("strong", { children: "채팅:" }),
      /* @__PURE__ */ d("div", { style: { display: "flex", gap: "6px", marginTop: "6px" }, children: [
        /* @__PURE__ */ c(
          "input",
          {
            value: x,
            onChange: (w) => R(w.target.value),
            placeholder: "Enter로 전송",
            style: {
              flex: 1,
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "white",
              fontSize: "12px"
            },
            onKeyDown: (w) => {
              w.key === "Enter" && (w.preventDefault(), P());
            }
          }
        ),
        /* @__PURE__ */ c(
          "button",
          {
            onClick: P,
            style: {
              padding: "6px 8px",
              borderRadius: "4px",
              border: "none",
              background: "#4CAF50",
              color: "white",
              fontSize: "12px",
              cursor: "pointer"
            },
            disabled: !x.trim(),
            children: "전송"
          }
        )
      ] })
    ] }) : null,
    /* @__PURE__ */ c(
      "button",
      {
        onClick: t,
        style: {
          width: "100%",
          padding: "8px",
          borderRadius: "4px",
          border: "none",
          background: "#ff6b6b",
          color: "white",
          fontSize: "12px",
          cursor: "pointer",
          transition: "background-color 0.2s"
        },
        onMouseEnter: (w) => {
          w.currentTarget.style.backgroundColor = "#ff5252";
        },
        onMouseLeave: (w) => {
          w.currentTarget.style.backgroundColor = "#ff6b6b";
        },
        children: "연결 끊기"
      }
    )
  ] });
}
const Pt = 6, kt = 1e-4;
function Tt({
  playerRef: a,
  onChange: e
}) {
  const t = S({ x: 0, y: 0, z: 0 }), n = S(0);
  return Se(() => {
    if (n.current++, n.current % Pt !== 0) return;
    const s = a.current;
    if (!s) return;
    const o = s.translation(), i = t.current, r = o.x - i.x, p = o.y - i.y, l = o.z - i.z;
    r * r + p * p + l * l < kt || (i.x = o.x, i.y = o.y, i.z = o.z, e(o.x, o.y, o.z));
  }), null;
}
const an = ze.memo(function({
  players: e,
  characterUrl: t,
  vehicleUrl: n,
  airplaneUrl: s,
  playerRef: o,
  config: i,
  localPlayerColor: r,
  proximityRange: p,
  speechByPlayerId: l,
  localSpeechText: y
}) {
  J(() => {
    window.CHARACTER_URL = t;
  }, [t]);
  const [M, x] = _([0, 0, 0]), R = re(() => new B.Vector3(), []), P = re(
    () => (v, u, k) => {
      R.set(v, u, k), x([v, u, k]);
    },
    [R]
  ), w = re(() => {
    const v = p;
    if (!v || v <= 0) return e;
    const [u, k, h] = M, b = /* @__PURE__ */ new Map();
    return e.forEach((m, g) => {
      const [I, U, $] = m.position, Q = I - u, C = U - k, L = $ - h;
      Q * Q + C * C + L * L <= v * v && b.set(g, m);
    }), b;
  }, [e, p, M]);
  return /* @__PURE__ */ c(
    st,
    {
      urls: {
        characterUrl: t,
        vehicleUrl: n,
        airplaneUrl: s
      },
      children: /* @__PURE__ */ d(
        Ve,
        {
          shadows: !0,
          dpr: [1, 1.5],
          camera: { position: [0, 10, 20], fov: 75, near: 0.1, far: 1e3 },
          style: { width: "100vw", height: "100vh" },
          children: [
            /* @__PURE__ */ c(je, { background: !0, preset: "sunset", backgroundBlurriness: 1 }),
            /* @__PURE__ */ c(
              "directionalLight",
              {
                castShadow: !0,
                "shadow-normalBias": 0.06,
                position: [20, 30, 10],
                intensity: 0.5,
                "shadow-mapSize": [1024, 1024],
                "shadow-camera-near": 1,
                "shadow-camera-far": 120,
                "shadow-camera-top": 90,
                "shadow-camera-right": 90,
                "shadow-camera-bottom": -90,
                "shadow-camera-left": -90
              }
            ),
            /* @__PURE__ */ c($e, { fallback: null, children: /* @__PURE__ */ c(ot, { children: /* @__PURE__ */ d(Ze, { children: [
              /* @__PURE__ */ c(
                Tt,
                {
                  playerRef: o,
                  onChange: P
                }
              ),
              /* @__PURE__ */ c(
                rt,
                {
                  rigidBodyRef: o,
                  rotation: et({ x: 0, y: Math.PI, z: 0 }),
                  parts: [],
                  ...r ? { baseColor: r } : {}
                }
              ),
              y ? /* @__PURE__ */ c(
                Oe,
                {
                  text: y,
                  position: R
                }
              ) : null,
              Array.from(w.entries()).map(([v, u]) => /* @__PURE__ */ c(
                Mt,
                {
                  playerId: v,
                  state: u,
                  characterUrl: t,
                  config: i,
                  ...(() => {
                    const k = l?.get(v);
                    return k ? { speechText: k } : {};
                  })()
                },
                v
              )),
              /* @__PURE__ */ c(
                Ke,
                {
                  renderOrder: -1,
                  position: [0, 0.01, 0],
                  infiniteGrid: !0,
                  cellSize: 2,
                  cellThickness: 1,
                  cellColor: "#1d1d1d",
                  sectionSize: 5,
                  sectionThickness: 0,
                  fadeDistance: 1e3
                }
              ),
              /* @__PURE__ */ c(Fe, { type: "fixed", children: /* @__PURE__ */ d("mesh", { receiveShadow: !0, position: [0, -1, 0], children: [
                /* @__PURE__ */ c("boxGeometry", { args: [1e3, 2, 1e3] }),
                /* @__PURE__ */ c("meshStandardMaterial", { color: "#3d3d3d" })
              ] }) }),
              /* @__PURE__ */ c(it, {}),
              /* @__PURE__ */ c(at, {})
            ] }) }) })
          ]
        }
      )
    }
  );
}), cn = {
  // 기본 NetworkConfig
  updateFrequency: 30,
  maxConnections: 100,
  messageQueueSize: 1e3,
  // 통신 설정
  maxDistance: 100,
  signalStrength: 1,
  bandwidth: 1e3,
  proximityRange: 10,
  // 최적화 설정
  enableBatching: !0,
  batchSize: 10,
  compressionLevel: 1,
  connectionPoolSize: 50,
  // 메시지 설정
  enableChatMessages: !0,
  enableActionMessages: !0,
  enableStateMessages: !0,
  enableSystemMessages: !0,
  // 신뢰성 설정
  reliableRetryCount: 3,
  reliableTimeout: 5e3,
  enableAck: !0,
  // 그룹 설정
  maxGroupSize: 20,
  autoJoinProximity: !0,
  groupMessagePriority: "normal",
  // 디버깅 설정
  enableDebugPanel: !1,
  enableVisualizer: !1,
  showConnectionLines: !1,
  showMessageFlow: !1,
  debugUpdateInterval: 500,
  logLevel: "warn",
  logToConsole: !0,
  logToFile: !1,
  maxLogEntries: 1e3,
  // 보안 설정
  enableEncryption: !1,
  enableRateLimit: !0,
  maxMessagesPerSecond: 100,
  // 메모리 관리
  messageGCInterval: 3e4,
  connectionTimeout: 3e4,
  inactiveNodeCleanup: 6e4,
  // 멀티플레이어 전용 설정
  websocket: {
    url: "ws://localhost:8090",
    reconnectAttempts: 5,
    reconnectDelay: 1e3,
    pingInterval: 3e4
  },
  tracking: {
    updateRate: 20,
    // 20Hz (50ms)
    velocityThreshold: 0.5,
    sendRateLimit: 50,
    // 50ms
    interpolationSpeed: 0.15
  },
  rendering: {
    nameTagHeight: 3.5,
    nameTagSize: 0.5,
    characterScale: 1
  }
}, Ge = {
  // 성능 설정
  updateFrequency: 30,
  maxConnections: 100,
  messageQueueSize: 1e3,
  // 통신 설정
  maxDistance: 100,
  signalStrength: 1,
  bandwidth: 1e3,
  proximityRange: 10,
  // 최적화 설정
  enableBatching: !0,
  batchSize: 10,
  compressionLevel: 1,
  connectionPoolSize: 50,
  // 메시지 설정
  enableChatMessages: !0,
  enableActionMessages: !0,
  enableStateMessages: !0,
  enableSystemMessages: !0,
  // 신뢰성 설정
  reliableRetryCount: 3,
  reliableTimeout: 5e3,
  enableAck: !0,
  // 그룹 설정
  maxGroupSize: 20,
  autoJoinProximity: !0,
  groupMessagePriority: "normal",
  // 디버깅 설정
  enableDebugPanel: !1,
  enableVisualizer: !1,
  showConnectionLines: !1,
  showMessageFlow: !1,
  debugUpdateInterval: 500,
  logLevel: "warn",
  logToConsole: !0,
  logToFile: !1,
  maxLogEntries: 1e3,
  // 보안 설정
  enableEncryption: !1,
  enableRateLimit: !0,
  maxMessagesPerSecond: 100,
  // 메모리 관리
  messageGCInterval: 3e4,
  connectionTimeout: 3e4,
  inactiveNodeCleanup: 6e4
}, Rt = {
  high: {
    updateFrequency: 60,
    maxConnections: 200,
    messageQueueSize: 2e3,
    enableBatching: !0,
    batchSize: 20,
    compressionLevel: 3,
    connectionPoolSize: 100,
    bandwidth: 2e3,
    signalStrength: 2
  },
  balanced: {
    updateFrequency: 30,
    maxConnections: 100,
    messageQueueSize: 1e3,
    enableBatching: !0,
    batchSize: 10,
    compressionLevel: 1,
    connectionPoolSize: 50,
    bandwidth: 1e3,
    signalStrength: 1
  },
  low: {
    updateFrequency: 15,
    maxConnections: 50,
    messageQueueSize: 500,
    enableBatching: !1,
    batchSize: 5,
    compressionLevel: 0,
    connectionPoolSize: 25,
    bandwidth: 500,
    signalStrength: 0.5
  }
}, zt = (a) => {
  const e = [];
  return (a.updateFrequency <= 0 || a.updateFrequency > 120) && e.push("updateFrequency must be between 1 and 120"), a.maxConnections <= 0 && e.push("maxConnections must be greater than 0"), a.messageQueueSize <= 0 && e.push("messageQueueSize must be greater than 0"), a.maxDistance <= 0 && e.push("maxDistance must be greater than 0"), a.signalStrength <= 0 && e.push("signalStrength must be greater than 0"), a.bandwidth <= 0 && e.push("bandwidth must be greater than 0"), a.proximityRange <= 0 && e.push("proximityRange must be greater than 0"), a.batchSize <= 0 && e.push("batchSize must be greater than 0"), (a.compressionLevel < 0 || a.compressionLevel > 9) && e.push("compressionLevel must be between 0 and 9"), a.connectionPoolSize < 0 && e.push("connectionPoolSize must be non-negative"), a.reliableRetryCount < 0 && e.push("reliableRetryCount must be non-negative"), a.reliableTimeout <= 0 && e.push("reliableTimeout must be greater than 0"), a.maxGroupSize <= 0 && e.push("maxGroupSize must be greater than 0"), a.debugUpdateInterval <= 0 && e.push("debugUpdateInterval must be greater than 0"), a.maxLogEntries <= 0 && e.push("maxLogEntries must be greater than 0"), a.maxMessagesPerSecond <= 0 && e.push("maxMessagesPerSecond must be greater than 0"), a.messageGCInterval <= 0 && e.push("messageGCInterval must be greater than 0"), a.connectionTimeout <= 0 && e.push("connectionTimeout must be greater than 0"), a.inactiveNodeCleanup <= 0 && e.push("inactiveNodeCleanup must be greater than 0"), {
    isValid: e.length === 0,
    errors: e
  };
}, ln = _e((a, e) => ({
  config: Ge,
  updateConfig: (t) => a((n) => ({
    config: { ...n.config, ...t }
  })),
  updatePerformanceConfig: (t) => a((n) => ({
    config: { ...n.config, ...t }
  })),
  updateCommunicationConfig: (t) => a((n) => ({
    config: { ...n.config, ...t }
  })),
  updateOptimizationConfig: (t) => a((n) => ({
    config: { ...n.config, ...t }
  })),
  updateDebugConfig: (t) => a((n) => ({
    config: { ...n.config, ...t }
  })),
  resetConfig: () => a({ config: { ...Ge } }),
  resetToProfile: (t) => a((n) => ({
    config: {
      ...n.config,
      ...Rt[t]
    }
  })),
  validateConfig: () => zt(e().config)
})), Ue = {
  snapshot: null,
  connectedNodes: /* @__PURE__ */ new Map(),
  activeGroups: /* @__PURE__ */ new Map(),
  recentMessages: [],
  isConnected: !1,
  connectionStatus: "disconnected",
  lastError: null,
  lastUpdate: 0
}, Ce = _e((a, e) => ({
  state: { ...Ue },
  updateSnapshot: (t) => a((n) => ({
    state: {
      ...n.state,
      snapshot: { ...t },
      lastUpdate: Date.now()
    }
  })),
  updateConnectedNodes: (t) => a((n) => {
    const s = /* @__PURE__ */ new Map();
    return t.forEach((o) => {
      s.set(o.id, { ...o });
    }), {
      state: {
        ...n.state,
        connectedNodes: s,
        lastUpdate: Date.now()
      }
    };
  }),
  updateActiveGroups: (t) => a((n) => {
    const s = /* @__PURE__ */ new Map();
    return t.forEach((o) => {
      s.set(o.id, {
        ...o,
        members: new Set(o.members)
        // Set 복사
      });
    }), {
      state: {
        ...n.state,
        activeGroups: s,
        lastUpdate: Date.now()
      }
    };
  }),
  addRecentMessage: (t) => a((n) => {
    const s = [...n.state.recentMessages, { ...t }];
    return s.length > 100 && s.shift(), {
      state: {
        ...n.state,
        recentMessages: s,
        lastUpdate: Date.now()
      }
    };
  }),
  setConnectionStatus: (t, n) => a((s) => ({
    state: {
      ...s.state,
      connectionStatus: t,
      isConnected: t === "connected",
      lastError: n || null,
      lastUpdate: Date.now()
    }
  })),
  clearRecentMessages: () => a((t) => ({
    state: {
      ...t.state,
      recentMessages: [],
      lastUpdate: Date.now()
    }
  })),
  getNodeById: (t) => {
    const { state: n } = e();
    return n.connectedNodes.get(t) || null;
  },
  getGroupById: (t) => {
    const { state: n } = e();
    return n.activeGroups.get(t) || null;
  },
  getNodesByGroup: (t) => {
    const { state: n } = e(), s = n.activeGroups.get(t);
    if (!s) return [];
    const o = [];
    return s.members.forEach((i) => {
      const r = n.connectedNodes.get(i);
      r && o.push(r);
    }), o;
  },
  getMessagesForNode: (t) => {
    const { state: n } = e();
    return n.recentMessages.filter(
      (s) => s.from === t || s.to === t
    );
  },
  resetState: () => a({
    state: {
      ...Ue,
      connectedNodes: /* @__PURE__ */ new Map(),
      activeGroups: /* @__PURE__ */ new Map(),
      recentMessages: []
    }
  })
})), un = () => {
  const { connectionStatus: a, isConnected: e, lastError: t } = Ce((n) => n.state);
  return {
    status: a,
    isConnected: e,
    lastError: t,
    isConnecting: a === "connecting",
    hasError: a === "error"
  };
}, dn = (a) => {
  const e = Ce((t) => t.state.recentMessages);
  return a && a > 0 ? e.slice(-a) : e;
}, hn = () => {
  const a = Ce((e) => e.state.connectedNodes);
  return Array.from(a.values());
}, pn = () => {
  const a = Ce((e) => e.state.activeGroups);
  return Array.from(a.values());
};
var It = Object.defineProperty, Nt = Object.getOwnPropertyDescriptor, Ie = (a, e, t, n) => {
  for (var s = n > 1 ? void 0 : n ? Nt(e, t) : e, o = a.length - 1, i; o >= 0; o--)
    (i = a[o]) && (s = (n ? i(e, t, s) : i(s)) || s);
  return n && s && It(e, t, s), s;
};
let ve = class extends ct {
  constructor() {
    super(), this.setupEngineSubscriptions();
  }
  /**
   * Register the 'main' engine with default config (call from consumer, not constructor).
   */
  ensureMainEngine(a) {
    this.getEngine("main") || this.register("main", a ?? this.createDefaultConfig());
  }
  buildEngine(a, e) {
    try {
      const t = new yt(e ?? this.createDefaultConfig());
      return t.start(), {
        system: t,
        dispose: () => t.dispose()
      };
    } catch (t) {
      return console.error("[NetworkBridge] Failed to build engine:", t), null;
    }
  }
  executeCommand(a, e, t) {
    const { system: n } = a;
    n.executeCommand(e);
  }
  // 60fps에서 16프레임마다 캐싱
  createSnapshot(a, e) {
    const { system: t } = a;
    return t.createSnapshot();
  }
  /**
   * 시스템 업데이트 (매 프레임 호출)
   */
  updateSystem(a, e) {
    this.getEngine(a) && this.notifyListeners(a);
  }
  /**
   * 기본 설정으로 시스템 등록
   */
  createDefaultConfig() {
    return {
      // 성능 설정
      updateFrequency: 30,
      maxConnections: 100,
      messageQueueSize: 1e3,
      // 통신 설정
      maxDistance: 100,
      signalStrength: 1,
      bandwidth: 1e3,
      proximityRange: 10,
      // 최적화 설정
      enableBatching: !0,
      batchSize: 10,
      compressionLevel: 1,
      connectionPoolSize: 50,
      // 메시지 설정
      enableChatMessages: !0,
      enableActionMessages: !0,
      enableStateMessages: !0,
      enableSystemMessages: !0,
      // 신뢰성 설정
      reliableRetryCount: 3,
      reliableTimeout: 5e3,
      enableAck: !0,
      // 그룹 설정
      maxGroupSize: 20,
      autoJoinProximity: !0,
      groupMessagePriority: "normal",
      // 디버깅 설정
      enableDebugPanel: !1,
      enableVisualizer: !1,
      showConnectionLines: !1,
      showMessageFlow: !1,
      debugUpdateInterval: 500,
      logLevel: "warn",
      logToConsole: !0,
      logToFile: !1,
      maxLogEntries: 1e3,
      // 보안 설정
      enableEncryption: !1,
      enableRateLimit: !0,
      maxMessagesPerSecond: 100,
      // 메모리 관리
      messageGCInterval: 3e4,
      connectionTimeout: 3e4,
      inactiveNodeCleanup: 6e4
    };
  }
  /**
   * 엔진 구독 설정
   */
  setupEngineSubscriptions() {
    this.on("snapshot", (a) => {
    });
  }
  /**
   * 네트워크 통계 조회
   */
  getNetworkStats(a = "main") {
    const e = this.getEngine(a);
    return e ? e.system.getDebugInfo()?.networkStats ?? null : null;
  }
  /**
   * 시스템 상태 조회
   */
  getSystemState(a = "main") {
    const e = this.getEngine(a);
    return e ? e.system.getState() : null;
  }
};
Ie([
  lt()
], ve.prototype, "executeCommand", 1);
Ie([
  ut(),
  dt(16)
], ve.prototype, "createSnapshot", 1);
ve = Ie([
  ht("networks"),
  pt()
], ve);
const At = gt;
function We(a) {
  const e = /* @__PURE__ */ new Map();
  for (const t of a())
    !t || typeof t.key != "string" || e.set(t.key, t);
  return e;
}
function Lt(a, e) {
  const t = We(a), n = e.domains ?? At, s = {};
  for (const i of n) {
    const r = t.get(i);
    if (r)
      try {
        s[i] = r.serialize();
      } catch {
        s[i] = null;
      }
  }
  const o = e.savedAt ?? Date.now();
  return {
    kind: "world",
    worldId: e.worldId ?? e.hostId,
    version: e.version ?? 1,
    hostId: e.hostId,
    ...e.hostName ? { hostName: e.hostName } : {},
    savedAt: o,
    capturedAt: o,
    domains: s
  };
}
function Be(a, e, t = {}) {
  const n = We(a), s = t.allowedDomains ? new Set(t.allowedDomains) : null, o = [], i = [];
  for (const [r, p] of Object.entries(e.domains ?? {})) {
    if (s && !s.has(r)) {
      i.push(r);
      continue;
    }
    if (t.filter && !t.filter(r, p)) {
      i.push(r);
      continue;
    }
    const l = n.get(r);
    if (!l) {
      i.push(r);
      continue;
    }
    try {
      l.hydrate(p), o.push(r);
    } catch {
      i.push(r);
    }
  }
  return { applied: o, skipped: i };
}
function gn(a) {
  return () => a.getBindings();
}
class Dt {
  listeners = /* @__PURE__ */ new Set();
  latest = null;
  publish(e) {
    this.latest = e, this.emit({ type: "snapshot", snapshot: e });
  }
  leave(e) {
    this.emit({ type: "leave", hostId: e });
  }
  subscribe(e) {
    if (this.listeners.add(e), this.latest)
      try {
        e({ type: "snapshot", snapshot: this.latest });
      } catch {
      }
    return () => {
      this.listeners.delete(e);
    };
  }
  close() {
    this.listeners.clear(), this.latest = null;
  }
  emit(e) {
    for (const t of this.listeners)
      try {
        t(e);
      } catch {
      }
  }
}
function fn() {
  return new Dt();
}
const ke = 1, Te = "VisitSnapshot", Re = "VisitLeave";
function Et(a) {
  try {
    const e = JSON.parse(a);
    return !e || typeof e != "object" || e.type !== Te && e.type !== Re || typeof e.v != "number" || e.v !== ke ? null : e;
  } catch {
    return null;
  }
}
function mn(a) {
  const e = /* @__PURE__ */ new Set();
  let t = a.onMessage((s) => {
    const o = Et(s);
    o && (o.type === Te ? n({ type: "snapshot", snapshot: o.snapshot }) : o.type === Re && n({ type: "leave", hostId: o.hostId }));
  });
  function n(s) {
    for (const o of e)
      try {
        o(s);
      } catch {
      }
  }
  return {
    publish(s) {
      const o = { type: Te, v: ke, snapshot: s };
      try {
        a.send(JSON.stringify(o));
      } catch {
      }
    },
    leave(s) {
      const o = { type: Re, v: ke, hostId: s };
      try {
        a.send(JSON.stringify(o));
      } catch {
      }
    },
    subscribe(s) {
      return e.add(s), () => {
        e.delete(s);
      };
    },
    close() {
      if (t) {
        try {
          t();
        } catch {
        }
        t = null;
      }
      e.clear();
    }
  };
}
function yn(a) {
  const {
    hostId: e,
    hostName: t,
    channel: n,
    bindings: s,
    hostMode: o = !0,
    autoApply: i = !1,
    allowedDomains: r
  } = a, [p, l] = _(null), [y, M] = _(null), x = S(s);
  x.current = s;
  const R = S(r);
  R.current = r;
  const P = S(i);
  P.current = i, J(() => {
    const h = n.subscribe((b) => {
      if (b.type === "snapshot") {
        if (b.snapshot.hostId === e) return;
        l(b.snapshot), P.current && Be(x.current, b.snapshot, {
          ...R.current ? { allowedDomains: R.current } : {}
        });
      } else b.type === "leave" && l((m) => m && m.hostId === b.hostId ? null : m);
    });
    return () => {
      h();
    };
  }, [n, e]);
  const w = z(() => {
    const h = Lt(x.current, {
      hostId: e,
      ...t ? { hostName: t } : {}
    });
    return o && n.publish(h), M(h), h;
  }, [n, e, t, o]), v = z(() => {
    const h = p;
    return h ? Be(x.current, h, {
      ...R.current ? { allowedDomains: R.current } : {}
    }).applied.length > 0 : !1;
  }, [p]), u = z(() => {
    l(null);
  }, []), k = z(() => {
    n.leave(e);
  }, [n, e]);
  return re(() => ({
    remoteSnapshot: p,
    lastPublished: y,
    publishNow: w,
    acceptRemote: v,
    dismissRemote: u,
    announceLeave: k
  }), [p, y, w, v, u, k]);
}
export {
  on as ConnectionForm,
  ft as ConnectionPool,
  At as DEFAULT_VISIT_DOMAINS,
  we as MessageQueue,
  wn as MockNetworkAdapter,
  an as MultiplayerCanvas,
  mt as NPCNetworkManager,
  sn as NPCNetworkVisualizer,
  ve as NetworkBridge,
  nn as NetworkDebugPanel,
  yt as NetworkSystem,
  rn as PlayerInfoOverlay,
  Qe as PlayerNetworkManager,
  xt as PlayerPositionTracker,
  Mt as RemotePlayer,
  Be as applyVisitSnapshot,
  Cn as createCommandAcceptedResult,
  Mn as createCommandAuthorityRouter,
  Pn as createCommandRejectedResult,
  kn as createGameCommand,
  fn as createLocalVisitChannel,
  vn as createNetworkEnvelope,
  Tn as createServerEvent,
  Rn as createSnapshotAck,
  zn as createStateDelta,
  mn as createWebSocketVisitChannel,
  cn as defaultMultiplayerConfig,
  Lt as serializeVisit,
  tn as useMultiplayer,
  Kt as useNPCConnection,
  fe as useNetworkBridge,
  ln as useNetworkConfigStore,
  un as useNetworkConnection,
  Zt as useNetworkGroup,
  pn as useNetworkGroups,
  Xt as useNetworkMessage,
  hn as useNetworkNodes,
  Ce as useNetworkStateStore,
  wt as useNetworkStats,
  en as usePlayerNetwork,
  dn as useRecentMessages,
  yn as useVisitRoom,
  gn as visitProviderFromSaveSystem
};
