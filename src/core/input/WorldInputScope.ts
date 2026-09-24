type KeyType = 'keydown' | 'keyup';
type KeyListener = (event: KeyboardEvent) => void;
type KeySubscription = { type: KeyType; listener: KeyListener; capture: boolean; priority: number };
const routers = new WeakMap<Window, DomInputRouter>();
const explicitEvents = new WeakMap<Event, { scope: WorldInputScope; source: string }>();
const focusableSurfaces = new WeakMap<HTMLElement, { owners: number; original: string | null }>();

function reportInputError(error: unknown): void {
  // Match independent DOM listeners: report a failure without skipping other owners' cleanup.
  if (typeof globalThis.reportError === 'function') globalThis.reportError(error);
  else console.error('World input listener failed', error);
}

function pathOf(event: Event): EventTarget[] {
  return event.composedPath?.() ?? (event.target ? [event.target] : []);
}

export function isEditableInputEvent(event: Event): boolean {
  return pathOf(event).some(target => typeof (target as Element).closest === 'function'
    && (target as Element).closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null);
}

/** One DOM router per window. World construction itself never accesses the DOM. */
class DomInputRouter {
  readonly scopes = new Set<WorldInputScope>();
  readonly surfaces = new Map<HTMLElement, Map<WorldInputScope, number>>();
  private selected: WorldInputScope | null | undefined;
  private eventOwners = new WeakMap<Event, { scope: WorldInputScope | null; generation: number }>();
  private generation = 0;
  private listening = false;

  constructor(readonly target: Window) {}

  add(scope: WorldInputScope): void {
    if (this.scopes.size === 0) this.selected = undefined;
    this.scopes.add(scope); this.refresh();
  }

  remove(scope: WorldInputScope): void {
    this.scopes.delete(scope);
    if (this.selected === scope) this.select(null);
    this.refresh();
  }

  refresh(): void {
    const enabled = Array.from(this.scopes).some(scope => scope.isEnabled());
    if (enabled === this.listening) return;
    this.listening = enabled;
    const method = enabled ? 'addEventListener' : 'removeEventListener';
    for (const type of ['keydown', 'keyup'] as const) {
      this.target[method](type, this.capture, true);
      this.target[method](type, this.bubble);
    }
    this.target[method]('pointerdown', this.focus, true);
    this.target[method]('focusin', this.focus, true);
    this.target[method]('blur', this.blur);
    this.target.document[method]('visibilitychange', this.visibility);
  }

  select(scope: WorldInputScope | null): void {
    if (this.selected === scope) return;
    this.generation++;
    this.selected = scope;
    for (const other of this.scopes) if (other !== scope) other.releaseFocus();
  }

  owns(scope: WorldInputScope, event: KeyboardEvent): boolean {
    const owner = this.eventOwners.get(event);
    return owner ? owner.generation === this.generation && owner.scope === scope : this.route(event) === scope;
  }

  ownsFocus(scope: WorldInputScope): boolean {
    const document = this.target.document;
    const active = document.activeElement;
    if (active?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return false;
    for (let index = 0; index < 2; index++) {
      let element = index === 0 ? document.pointerLockElement : active;
      while (element) {
        const owners = this.surfaces.get(element as HTMLElement);
        if (owners) return owners.size === 1 ? owners.has(scope) : this.selected === scope && owners.has(scope);
        element = element.parentElement;
      }
    }
    if (this.selected !== undefined) return this.selected === scope;
    let owner: WorldInputScope | undefined;
    for (const candidate of this.scopes) if (candidate.isEnabled()) { if (owner) return false; owner = candidate; }
    return owner === scope;
  }

  private surfaceOwner(path: EventTarget[]): WorldInputScope | null | undefined {
    for (const target of path) {
      const owners = this.surfaces.get(target as HTMLElement);
      if (!owners) continue;
      if (owners.size === 1) return owners.keys().next().value;
      // A shared canvas needs an explicit owner, never broadcast to overlapping worlds.
      return this.selected && owners.has(this.selected) ? this.selected : null;
    }
    return undefined;
  }

  private route(event: Event): WorldInputScope | null {
    const explicit = explicitEvents.get(event);
    if (explicit) return explicit.scope;
    const path = pathOf(event);
    let element = this.target.document.pointerLockElement;
    const lockedPath: EventTarget[] = [];
    while (element) { lockedPath.push(element); element = element.parentElement; }
    path.unshift(...lockedPath);
    const owner = this.surfaceOwner(path);
    if (owner !== undefined) return owner;
    if (this.selected !== undefined) return this.selected;
    const active = Array.from(this.scopes).filter(scope => scope.isEnabled());
    return active.length === 1 ? active[0]! : null;
  }

  private focus = (event: Event) => {
    this.select(this.surfaceOwner(pathOf(event)) ?? null);
    if (isEditableInputEvent(event)) this.blur();
  };
  private blur = () => { this.generation++; for (const scope of this.scopes) scope.releaseFocus(); };
  private visibility = () => { if (this.target.document.hidden) this.blur(); };
  private capture = (raw: Event) => {
    const event = raw as KeyboardEvent;
    if (!explicitEvents.has(event) && (isEditableInputEvent(event) || event.isComposing)) {
      this.blur(); this.eventOwners.set(event, { scope: null, generation: this.generation }); return;
    }
    const scope = this.route(event);
    const generation = this.generation;
    this.eventOwners.set(event, { scope, generation });
    scope?.deliver(event, true, () => this.generation === generation);
  };
  private bubble = (event: Event) => {
    const owner = this.eventOwners.get(event);
    if (owner) owner.scope?.deliver(event as KeyboardEvent, false, () => owner.generation === this.generation);
  };
}

export class WorldInputScope {
  private enabled = true;
  private keys = new Set<KeySubscription>();
  private blurListeners = new Set<{ listener: () => void }>();
  private connections = new Map<Window, { router: DomInputRouter; owners: number }>();

  isEnabled(): boolean { return this.enabled; }
  isFocused(): boolean { if (!this.enabled) return false; for (const { router } of this.connections.values()) if (router.ownsFocus(this)) return true; return false; }
  suspend(): void {
    this.enabled = false; this.releaseFocus();
    for (const { router } of this.connections.values()) router.refresh();
  }
  resume(): void {
    this.enabled = true;
    for (const { router } of this.connections.values()) router.refresh();
  }

  private connect(target: Window): { router: DomInputRouter; release: () => void } {
    let connection = this.connections.get(target);
    if (!connection) {
      const router = routers.get(target) ?? new DomInputRouter(target); routers.set(target, router);
      connection = { router, owners: 0 }; this.connections.set(target, connection); router.add(this);
    }
    connection.owners++;
    const owned = connection; let released = false;
    return { router: owned.router, release: () => {
      if (released) return; released = true;
      if (--owned.owners === 0) { this.connections.delete(target); owned.router.remove(this); }
    } };
  }

  listen(type: KeyType, listener: KeyListener, capture = false, priority = 0): () => void {
    const subscription = { type, listener, capture, priority }; this.keys.add(subscription);
    const connection = typeof window !== 'undefined' ? this.connect(window) : undefined;
    return () => { this.keys.delete(subscription); connection?.release(); };
  }

  onBlur(listener: () => void): () => void {
    const subscription = { listener }; this.blurListeners.add(subscription);
    const connection = typeof window !== 'undefined' ? this.connect(window) : undefined;
    return () => { this.blurListeners.delete(subscription); connection?.release(); };
  }

  registerSurface(element: HTMLElement, options: { focusable?: boolean } = {}): () => void {
    const target = element.ownerDocument.defaultView;
    if (!target) return () => {};
    const { router, release } = this.connect(target);
    let owners = router.surfaces.get(element);
    if (!owners) { owners = new Map(); router.surfaces.set(element, owners); }
    owners.set(this, (owners.get(this) ?? 0) + 1);
    const focusable = options.focusable ? focusableSurfaces.get(element) ?? { owners: 0, original: element.getAttribute('tabindex') } : undefined;
    if (focusable) {
      if (focusable.owners++ === 0 && focusable.original === null) element.setAttribute('tabindex', '0');
      focusableSurfaces.set(element, focusable);
    }
    let released = false;
    return () => {
      if (released) return; released = true;
      const count = owners!.get(this) ?? 0;
      if (count <= 1) owners!.delete(this); else owners!.set(this, count - 1);
      if (owners!.size === 0) router.surfaces.delete(element);
      if (focusable && --focusable.owners === 0) {
        if (focusable.original === null && element.getAttribute('tabindex') === '0') element.removeAttribute('tabindex');
        focusableSurfaces.delete(element);
      }
      if (count <= 1 && element.contains(element.ownerDocument.activeElement)) this.releaseFocus();
      release();
    };
  }

  /** Useful for overlays and multiple world views sharing one canvas. */
  activate(): void { if (this.enabled) for (const { router } of this.connections.values()) router.select(this); }
  acceptsKeyboard(event: KeyboardEvent): boolean {
    return this.enabled && Array.from(this.connections.values()).some(({ router }) => router.owns(this, event));
  }
  eventSource(event: KeyboardEvent): string { return explicitEvents.get(event)?.source ?? event.code; }

  dispatchKey(type: KeyType, key: string, source = 'virtual'): void {
    if (!this.enabled || typeof window === 'undefined') return;
    const code = /^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : key === ' ' ? 'Space' : key;
    const event = new KeyboardEvent(type, { key: key.length === 1 ? key.toLowerCase() : key, code, bubbles: true, cancelable: true });
    explicitEvents.set(event, { scope: this, source: `${source}:${code}` });
    window.dispatchEvent(event);
  }

  /** Internal router entry points. */
  releaseFocus(): void {
    for (const entry of [...this.blurListeners]) if (this.blurListeners.has(entry)) {
      try { entry.listener(); } catch (error) { reportInputError(error); }
    }
  }
  deliver(event: KeyboardEvent, capture: boolean, current: () => boolean): void {
    if (!this.enabled || (event.type === 'keydown' && event.defaultPrevented)) return;
    for (const subscription of [...this.keys].sort((a, b) => a.priority - b.priority)) {
      if (!this.enabled || !current() || (capture && event.defaultPrevented)) return;
      if (this.keys.has(subscription) && subscription.type === event.type && subscription.capture === capture) {
        try { subscription.listener(event); } catch (error) { reportInputError(error); }
      }
    }
  }
}

export function createWorldInputScope(): WorldInputScope { return new WorldInputScope(); }
let legacy: WorldInputScope | undefined;
export function getDefaultWorldInputScope(): WorldInputScope { return legacy ??= createWorldInputScope(); }
