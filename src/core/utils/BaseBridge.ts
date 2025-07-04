export type IDisposable = {
  dispose(): void;
};

export abstract class BaseBridge<
  Engine extends IDisposable,
  Snapshot,
  Command,
> {
  protected engines: Map<string, Engine>;
  private eventListeners: Set<(snapshot: Snapshot, id: string) => void>;
  protected unsubscribeFunctions: Map<string, () => void>;

  constructor() {
    this.engines = new Map();
    this.eventListeners = new Set();
    this.unsubscribeFunctions = new Map();
  }

  protected addEngine(id: string, engine: Engine): void {
    this.engines.set(id, engine);
  }

  protected removeEngine(id: string): void {
    const engine = this.engines.get(id);
    if (engine) {
      engine.dispose();
      this.engines.delete(id);
    }
    const unsubscribe = this.unsubscribeFunctions.get(id);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribeFunctions.delete(id);
    }
  }

  protected getEngine(id: string): Engine | undefined {
    return this.engines.get(id);
  }

  abstract execute(id: string, command: Command): void;

  abstract snapshot(id: string): Snapshot | null;

  subscribe(listener: (snapshot: Snapshot, id: string) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  protected notifyListeners(id: string): void {
    if (this.eventListeners.size > 0) {
      const snapshot = this.snapshot(id);
      if (snapshot) {
        this.eventListeners.forEach(listener => listener(snapshot, id));
      }
    }
  }

  dispose(): void {
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions.clear();
    this.engines.forEach(engine => engine.dispose());
    this.engines.clear();
    this.eventListeners.clear();
  }
} 