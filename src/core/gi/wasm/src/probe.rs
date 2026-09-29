use crate::trace::{trace, Grid};
use core::f64::consts::PI;

const CUBE_STRIDE: usize = 18;
const CUBE_CHANNELS: usize = 3;
const MATERIAL_STRIDE: usize = 6;
const RADIANCE_LIMIT: f64 = 64.0;
const FEED_BACKFACE_FLOOR: f64 = 0.02;
const HALF: f64 = 0.5;
const WEIGHT_EPSILON: f64 = 1e-6;
const DISTANCE_EPSILON: f64 = 1e-6;
const CUBE_WEIGHT_EPSILON: f64 = 1e-12;
const CONTACT_BIAS_RATIO: f64 = 1e-3;
const ESTIMATOR_SCALE: f64 = 4.0;
const GOLDEN_FRACTION: f64 = 0.6180339887498949;
const R2_ALPHA_X: f64 = 0.7548776662466927;
const R2_ALPHA_Y: f64 = 0.5698402909980532;
const SAMPLE_CENTER: f64 = 0.5;
const CHANGE_LOW: f64 = 0.25;
const CHANGE_HIGH: f64 = 0.7;
const CHANGE_EPSILON: f64 = 1e-6;
const RELOCATION_REACH: f64 = 0.35;
const RELOCATION_STEPS: u32 = 3;

pub struct Environment {
    pub sun_direction: [f64; 3],
    pub sun_irradiance: [f64; 3],
    pub sky_zenith: [f64; 3],
    pub sky_horizon: [f64; 3],
    pub sky_ground: [f64; 3],
}

pub struct Level {
    pub origin: [f64; 3],
    pub spacing: f64,
    pub counts: [i32; 3],
    pub rays: usize,
    pub blend: f64,
    pub normal_bias: f64,
    pub max_distance: f64,
    pub cube: *mut f32,
    pub valid: *mut u8,
    pub offsets: *mut f32,
    pub age: *mut u32,
    pub directions: *const f64,
}

pub struct Scene {
    pub grid: Grid,
    pub materials: *const f64,
    pub material_count: usize,
    pub environment: Environment,
    pub levels: [Level; 2],
    pub level_count: usize,
}

fn clamp_finite(value: f64, limit: f64) -> f64 {
    if !(value > 0.0) {
        0.0
    } else if value < limit {
        value
    } else {
        limit
    }
}

fn fract(value: f64) -> f64 {
    value - value.floor()
}

fn face_offset(axis: usize, component: f64) -> usize {
    (axis * 2 + if component >= 0.0 { 0 } else { 1 }) * CUBE_CHANNELS
}

impl Level {
    fn probe_position(&self, index: usize) -> [f64; 3] {
        let cx = self.counts[0] as usize;
        let cy = self.counts[1] as usize;
        [
            self.origin[0] + (index % cx) as f64 * self.spacing,
            self.origin[1] + ((index / cx) % cy) as f64 * self.spacing,
            self.origin[2] + (index / (cx * cy)) as f64 * self.spacing,
        ]
    }

    unsafe fn cube_at(&self, index: usize) -> f64 {
        *self.cube.add(index) as f64
    }

    unsafe fn evaluate_cube(&self, base: usize, n: [f64; 3]) -> [f64; 3] {
        let wx = n[0] * n[0];
        let wy = n[1] * n[1];
        let wz = n[2] * n[2];
        let sum = wx + wy + wz;
        if sum < CUBE_WEIGHT_EPSILON {
            return [0.0; 3];
        }
        let ox = base + face_offset(0, n[0]);
        let oy = base + face_offset(1, n[1]);
        let oz = base + face_offset(2, n[2]);
        let mut out = [0.0; 3];
        for c in 0..3 {
            out[c] =
                (wx * self.cube_at(ox + c) + wy * self.cube_at(oy + c) + wz * self.cube_at(oz + c))
                    / sum;
        }
        out
    }

    /// sampleProbeField 포팅. 유효한 이웃 프로브 8개를 삼선형 가중치와 뒤쪽 감쇠로 평균한다.
    unsafe fn sample(&self, p: [f64; 3], n: [f64; 3], backface_floor: f64) -> [f64; 3] {
        let mut base_cell = [0_i32; 3];
        let mut fraction = [0.0_f64; 3];
        for a in 0..3 {
            let g = (p[a] - self.origin[a]) / self.spacing;
            let count = self.counts[a];
            if count <= 1 {
                continue;
            }
            let floor = g.floor().max(0.0).min((count - 2) as f64);
            base_cell[a] = floor as i32;
            fraction[a] = (g - floor).max(0.0).min(1.0);
        }
        let mut sum = [0.0_f64; 3];
        let mut weight_sum = 0.0_f64;
        for corner in 0..8 {
            let offset = [corner & 1, (corner >> 1) & 1, (corner >> 2) & 1];
            let mut cell = [0_i32; 3];
            let mut weight = 1.0_f64;
            for a in 0..3 {
                cell[a] = (base_cell[a] + offset[a]).min(self.counts[a] - 1);
                weight *= if offset[a] == 1 {
                    fraction[a]
                } else {
                    1.0 - fraction[a]
                };
            }
            let index = (cell[0] + self.counts[0] * (cell[1] + self.counts[1] * cell[2])) as usize;
            if *self.valid.add(index) != 1 || weight <= 0.0 {
                continue;
            }
            let v = [
                self.origin[0] + cell[0] as f64 * self.spacing - p[0],
                self.origin[1] + cell[1] as f64 * self.spacing - p[1],
                self.origin[2] + cell[2] as f64 * self.spacing - p[2],
            ];
            let distance = (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]).sqrt();
            if distance > DISTANCE_EPSILON {
                let facing = HALF * (distance + v[0] * n[0] + v[1] * n[1] + v[2] * n[2]) / distance;
                weight *= facing * facing + backface_floor;
            }
            let value = self.evaluate_cube(index * CUBE_STRIDE, n);
            for c in 0..3 {
                sum[c] += weight * value[c];
            }
            weight_sum += weight;
        }
        if weight_sum < WEIGHT_EPSILON {
            return [0.0; 3];
        }
        [
            sum[0] / weight_sum,
            sum[1] / weight_sum,
            sum[2] / weight_sum,
        ]
    }

    /// ProbeCascade.fineWeight 포팅. 촘촘한 레벨 영역 안쪽 1, 밖 0, 경계에서 간격만큼 선형 감소.
    fn fine_weight(&self, p: [f64; 3]) -> f64 {
        let mut weight = 1.0;
        for a in 0..3 {
            let low = self.origin[a];
            let high = low + (self.counts[a] - 1) as f64 * self.spacing;
            weight *= ((p[a] - low).min(high - p[a]) / self.spacing)
                .max(0.0)
                .min(1.0);
        }
        weight
    }
}

impl Scene {
    unsafe fn material(&self, id: u8) -> ([f64; 3], [f64; 3]) {
        let id = id as usize;
        if id >= self.material_count {
            return ([0.0; 3], [0.0; 3]);
        }
        let base = self.materials.add(id * MATERIAL_STRIDE);
        (
            [*base, *base.add(1), *base.add(2)],
            [*base.add(3), *base.add(4), *base.add(5)],
        )
    }

    /// 히트 지점의 간접광 되먹임. 레벨이 둘이면 캐스케이드와 같은 식으로 섞는다.
    unsafe fn feed(&self, p: [f64; 3], n: [f64; 3]) -> [f64; 3] {
        let coarse = &self.levels[0];
        if self.level_count < 2 {
            return coarse.sample(p, n, FEED_BACKFACE_FLOOR);
        }
        let fine = &self.levels[1];
        let weight = fine.fine_weight(p);
        if weight <= 0.0 {
            return coarse.sample(p, n, FEED_BACKFACE_FLOOR);
        }
        let fine_value = fine.sample(p, n, FEED_BACKFACE_FLOOR);
        if weight >= 1.0 {
            return fine_value;
        }
        let coarse_value = coarse.sample(p, n, FEED_BACKFACE_FLOOR);
        [
            coarse_value[0] + (fine_value[0] - coarse_value[0]) * weight,
            coarse_value[1] + (fine_value[1] - coarse_value[1]) * weight,
            coarse_value[2] + (fine_value[2] - coarse_value[2]) * weight,
        ]
    }

    fn sky(&self, dy: f64) -> [f64; 3] {
        let env = &self.environment;
        if dy < 0.0 {
            return env.sky_ground;
        }
        let t = dy.min(1.0);
        [
            env.sky_horizon[0] + (env.sky_zenith[0] - env.sky_horizon[0]) * t,
            env.sky_horizon[1] + (env.sky_zenith[1] - env.sky_horizon[1]) * t,
            env.sky_horizon[2] + (env.sky_zenith[2] - env.sky_horizon[2]) * t,
        ]
    }

    /// traceRadiance/shadeHit 포팅. 하늘, 발광, 그림자 레이를 거친 직사광, 되먹임 간접광을 더한다.
    unsafe fn radiance(&self, level: &Level, origin: [f64; 3], d: [f64; 3]) -> [f64; 3] {
        let grid = &self.grid;
        let hit = match trace(grid, origin, d, level.max_distance) {
            Some(hit) => hit,
            None => return self.sky(d[1]),
        };
        let (albedo, emissive) =
            self.material(grid.material_at(hit.cell[0], hit.cell[1], hit.cell[2]));
        let p = [
            origin[0] + d[0] * hit.distance,
            origin[1] + d[1] * hit.distance,
            origin[2] + d[2] * hit.distance,
        ];
        let n = hit.normal;
        let sun = self.environment.sun_direction;
        let cos_sun = n[0] * sun[0] + n[1] * sun[1] + n[2] * sun[2];
        let mut sun_factor = 0.0;
        if cos_sun > 0.0 {
            let contact = grid.voxel * CONTACT_BIAS_RATIO;
            let start = [
                p[0] + n[0] * contact,
                p[1] + n[1] * contact,
                p[2] + n[2] * contact,
            ];
            if trace(grid, start, sun, level.max_distance).is_none() {
                sun_factor = cos_sun / PI;
            }
        }
        let bias = level.normal_bias;
        let fed = self.feed(
            [p[0] + n[0] * bias, p[1] + n[1] * bias, p[2] + n[2] * bias],
            n,
        );
        let irradiance = self.environment.sun_irradiance;
        let mut out = [0.0; 3];
        for c in 0..3 {
            let incoming = irradiance[c] * sun_factor + fed[c];
            out[c] = clamp_finite(emissive[c] + albedo[c] * incoming, RADIANCE_LIMIT);
        }
        out
    }

    /// placeProbe 포팅. 격자점이 복셀 안이면 축 방향으로 가장 가까운 빈 곳으로 옮기고, 양쪽이 동시에 비면 무효.
    unsafe fn place_probe(&self, level: &Level, index: usize, p: [f64; 3]) -> bool {
        let base = index * 3;
        for a in 0..3 {
            *level.offsets.add(base + a) = 0.0;
        }
        if !self.grid.solid_at(p) {
            return true;
        }
        let reach = level.spacing * RELOCATION_REACH;
        for step in 1..=RELOCATION_STEPS {
            let distance = reach * step as f64 / RELOCATION_STEPS as f64;
            let mut escape: Option<(usize, f64)> = None;
            for axis in 0..3 {
                let mut open_sides = 0;
                for sign in [1.0, -1.0] {
                    let mut candidate = p;
                    candidate[axis] += sign * distance;
                    if self.grid.solid_at(candidate) {
                        continue;
                    }
                    open_sides += 1;
                    if escape.is_none() {
                        escape = Some((axis, sign));
                    }
                }
                if open_sides > 1 {
                    return false;
                }
            }
            if let Some((axis, sign)) = escape {
                *level.offsets.add(base + axis) = (sign * distance) as f32;
                return true;
            }
        }
        false
    }
}

fn rotation(u1: f64, u2: f64, u3: f64) -> [f64; 9] {
    let a = (1.0 - u1).sqrt();
    let b = u1.sqrt();
    let two_pi = PI * 2.0;
    let x = a * (two_pi * u2).sin();
    let y = a * (two_pi * u2).cos();
    let z = b * (two_pi * u3).sin();
    let w = b * (two_pi * u3).cos();
    [
        1.0 - 2.0 * (y * y + z * z),
        2.0 * (x * y - z * w),
        2.0 * (x * z + y * w),
        2.0 * (x * y + z * w),
        1.0 - 2.0 * (x * x + z * z),
        2.0 * (y * z - x * w),
        2.0 * (x * z - y * w),
        2.0 * (y * z + x * w),
        1.0 - 2.0 * (x * x + y * y),
    ]
}

fn accumulate(target: &mut [f64; CUBE_STRIDE], d: [f64; 3], radiance: [f64; 3]) {
    for axis in 0..3 {
        let offset = face_offset(axis, d[axis]);
        let weight = d[axis].abs();
        for c in 0..3 {
            target[offset + c] += radiance[c] * weight;
        }
    }
}

/// ProbeVolume.updateProbe 포팅. 재배치, 회전된 구면 레이 추적, 조도 큐브 누적, 적응형 blend를 수행한다.
pub unsafe fn update_probe(scene: &Scene, level_index: usize, index: usize) {
    let level = &scene.levels[level_index];
    let age = *level.age.add(index);
    let grid_point = level.probe_position(index);
    if age == 0 {
        let placed = scene.place_probe(level, index, grid_point);
        *level.valid.add(index) = if placed { 1 } else { 0 };
        if !placed {
            return;
        }
    }
    let o = [
        grid_point[0] + *level.offsets.add(index * 3) as f64,
        grid_point[1] + *level.offsets.add(index * 3 + 1) as f64,
        grid_point[2] + *level.offsets.add(index * 3 + 2) as f64,
    ];
    let age_value = age as f64;
    let u1 = fract(SAMPLE_CENTER + age_value * R2_ALPHA_X);
    let u2 = fract(SAMPLE_CENTER + age_value * R2_ALPHA_Y);
    let r = rotation(u1, u2, (age_value * GOLDEN_FRACTION) % 1.0);
    let mut accumulator = [0.0_f64; CUBE_STRIDE];
    for ray in 0..level.rays {
        let b = [
            *level.directions.add(ray * 3),
            *level.directions.add(ray * 3 + 1),
            *level.directions.add(ray * 3 + 2),
        ];
        let d = [
            r[0] * b[0] + r[1] * b[1] + r[2] * b[2],
            r[3] * b[0] + r[4] * b[1] + r[5] * b[2],
            r[6] * b[0] + r[7] * b[1] + r[8] * b[2],
        ];
        let radiance = scene.radiance(level, o, d);
        accumulate(&mut accumulator, d, radiance);
    }
    let scale = ESTIMATOR_SCALE / level.rays as f64;
    let base = index * CUBE_STRIDE;
    let alpha = if age == 0 {
        1.0
    } else {
        let mut previous = 0.0;
        let mut next = 0.0;
        for i in 0..CUBE_STRIDE {
            previous += level.cube_at(base + i);
            next += accumulator[i] * scale;
        }
        let change = (next - previous).abs() / (next + previous).max(CHANGE_EPSILON);
        let t = ((change - CHANGE_LOW) / (CHANGE_HIGH - CHANGE_LOW))
            .max(0.0)
            .min(1.0);
        level.blend + (1.0 - level.blend) * t * t * (3.0 - 2.0 * t)
    };
    for i in 0..CUBE_STRIDE {
        let previous = level.cube_at(base + i);
        let next = previous + alpha * (accumulator[i] * scale - previous);
        let stored = if next.is_finite() { next } else { previous };
        *level.cube.add(base + i) = stored as f32;
    }
    *level.age.add(index) = age.wrapping_add(1);
}
