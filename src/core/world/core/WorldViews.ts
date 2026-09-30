import type { Camera, Object3D } from 'three';

export type WorldView = { camera: Camera; scene: Object3D; surface?: HTMLElement; pointer?: { x: number; y: number } };
type Entry = { view: WorldView; detach?: () => void };

/** DOM focus selects the view used by commands issued outside a Canvas. */
export class WorldViews {
  private entries = new Set<Entry>();
  private selected: Entry | undefined;
  private enabled = true;

  register(view: WorldView): () => void {
    const entry: Entry = { view }; this.entries.add(entry); this.selected = entry;
    if (this.enabled) this.attach(entry);
    return () => {
      if (!this.entries.delete(entry)) return;
      entry.detach?.();
      if (this.selected === entry) this.selected = [...this.entries].at(-1);
    };
  }
  private attach(entry: Entry): void {
    const surface = entry.view.surface; if (!surface) return;
    const select = () => { if (this.enabled) this.selected = entry; };
    surface.addEventListener('pointerdown', select); surface.addEventListener('focusin', select);
    entry.detach = () => { surface.removeEventListener('pointerdown', select); surface.removeEventListener('focusin', select); };
  }
  current(): WorldView | null { return this.enabled ? this.selected?.view ?? null : null; }
  suspend(): void { this.enabled = false; for (const entry of this.entries) { entry.detach?.(); delete entry.detach; } }
  resume(): void { if (this.enabled) return; this.enabled = true; for (const entry of this.entries) this.attach(entry); }
  dispose(): void { this.suspend(); this.entries.clear(); this.selected = undefined; }
}
