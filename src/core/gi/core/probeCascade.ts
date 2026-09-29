import type { Vec3 } from '../../grid';
import type {
  Aabb,
  GiEnvironment,
  MutableRgb,
  ProbeVolumeConfig,
  Rgb,
  VoxelGrid,
} from '../types';
import { BACKFACE_FLOOR, FEED_BACKFACE_FLOOR } from './probeField';
import { ProbeVolume } from './probeVolume';

/**
 * 성긴 프로브 볼륨 위에 촘촘한 볼륨을 한 겹 더 얹은 2단계 캐스케이드.
 * 촘촘한 영역(건물 실내 등) 안에서는 촘촘한 값을, 경계 밖에서는 성긴 값을 쓰고 경계에서 부드럽게 섞는다.
 * 히트 지점의 간접광 되먹임도 두 레벨을 같은 방식으로 섞어 읽어 레벨 사이 값이 어긋나지 않는다.
 */
export class ProbeCascade {
  readonly coarse: ProbeVolume;
  readonly fine: ProbeVolume | null;
  readonly levels: readonly ProbeVolume[];
  private readonly scratchFine: MutableRgb = [0, 0, 0];
  private readonly scratchCoarse: MutableRgb = [0, 0, 0];

  constructor(
    grid: VoxelGrid,
    coarseConfig: ProbeVolumeConfig,
    fineConfig: ProbeVolumeConfig | null,
    environment: GiEnvironment,
  ) {
    this.coarse = new ProbeVolume(grid, coarseConfig, environment);
    this.fine = fineConfig ? new ProbeVolume(grid, fineConfig, environment) : null;
    this.levels = this.fine ? [this.coarse, this.fine] : [this.coarse];
    if (this.fine) {
      const feed = (
        px: number,
        py: number,
        pz: number,
        nx: number,
        ny: number,
        nz: number,
        out: MutableRgb,
      ) => this.sampleInto(px, py, pz, nx, ny, nz, out, FEED_BACKFACE_FLOOR);
      this.coarse.setFeed(feed);
      this.fine.setFeed(feed);
    }
  }

  get probeCount(): number {
    return this.levels.reduce((sum, level) => sum + level.probeCount, 0);
  }

  get version(): number {
    return this.levels.reduce((sum, level) => sum + level.version, 0);
  }

  setEnvironment(environment: GiEnvironment): void {
    for (const level of this.levels) level.setEnvironment(environment);
  }

  markAllDirty(): void {
    for (const level of this.levels) level.markAllDirty();
  }

  markDirtyBox(box: Aabb): void {
    for (const level of this.levels) level.markDirtyBox(box);
  }

  /**
   * 예산을 두 레벨의 프로브 수 비율로 나눠 갱신한다. 처리한 프로브 수를 반환한다.
   */
  update(probeBudget: number): number {
    const total = this.probeCount;
    const budget = Math.min(Math.max(0, Math.floor(probeBudget)), total);
    if (!this.fine || budget === 0) return this.coarse.update(budget);
    const fineShare = Math.min(
      this.fine.probeCount,
      Math.max(1, Math.round((budget * this.fine.probeCount) / total)),
    );
    return this.coarse.update(budget - fineShare) + this.fine.update(fineShare);
  }

  /**
   * 촘촘한 영역 안쪽에서 1, 경계 밖에서 0인 혼합 가중치. 경계에서 촘촘한 볼륨의 간격만큼 서서히 줄어든다.
   */
  fineWeight(px: number, py: number, pz: number): number {
    const fine = this.fine;
    if (!fine) return 0;
    const { origin, spacing, counts } = fine.config;
    const edge = (value: number, low: number, count: number) => {
      const high = low + (count - 1) * spacing;
      return Math.min(1, Math.max(0, Math.min(value - low, high - value) / spacing));
    };
    return (
      edge(px, origin.x, counts[0]) * edge(py, origin.y, counts[1]) * edge(pz, origin.z, counts[2])
    );
  }

  sample(position: Vec3, normal: Vec3): Rgb {
    const out: MutableRgb = [0, 0, 0];
    this.sampleInto(position.x, position.y, position.z, normal.x, normal.y, normal.z, out);
    return out;
  }

  sampleInto(
    px: number,
    py: number,
    pz: number,
    nx: number,
    ny: number,
    nz: number,
    out: MutableRgb,
    backfaceFloor: number = BACKFACE_FLOOR,
  ): void {
    const weight = this.fineWeight(px, py, pz);
    if (!this.fine || weight <= 0) {
      this.coarse.sampleInto(px, py, pz, nx, ny, nz, out, backfaceFloor);
      return;
    }
    const fine = this.scratchFine;
    this.fine.sampleInto(px, py, pz, nx, ny, nz, fine, backfaceFloor);
    if (weight >= 1) {
      out[0] = fine[0];
      out[1] = fine[1];
      out[2] = fine[2];
      return;
    }
    const coarse = this.scratchCoarse;
    this.coarse.sampleInto(px, py, pz, nx, ny, nz, coarse, backfaceFloor);
    out[0] = coarse[0] + (fine[0] - coarse[0]) * weight;
    out[1] = coarse[1] + (fine[1] - coarse[1]) * weight;
    out[2] = coarse[2] + (fine[2] - coarse[2]) * weight;
  }
}
