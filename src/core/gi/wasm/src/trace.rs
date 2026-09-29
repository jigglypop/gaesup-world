const PARALLEL_EPSILON: f64 = 1e-9;

pub struct Grid {
    pub occupancy: *const u8,
    pub dims: [i32; 3],
    pub origin: [f64; 3],
    pub voxel: f64,
}

pub struct Hit {
    pub distance: f64,
    pub cell: [i32; 3],
    pub normal: [f64; 3],
}

impl Grid {
    /// 복셀 좌표의 재질 번호. 범위 밖은 빈 칸(0)이다.
    pub fn material_at(&self, x: i32, y: i32, z: i32) -> u8 {
        let [dx, dy, dz] = self.dims;
        if x < 0 || y < 0 || z < 0 || x >= dx || y >= dy || z >= dz {
            return 0;
        }
        unsafe { *self.occupancy.add((x + dx * (y + dy * z)) as usize) }
    }

    fn cell_of(&self, value: f64, axis: usize) -> Option<i32> {
        let cell = ((value - self.origin[axis]) / self.voxel).floor();
        if cell.is_finite() && cell >= i32::MIN as f64 && cell <= i32::MAX as f64 {
            Some(cell as i32)
        } else {
            None
        }
    }

    /// 월드 좌표가 점유 복셀 안에 있는지. traceVoxels.ts와 같은 반열린 복셀 구간을 쓴다.
    pub fn solid_at(&self, p: [f64; 3]) -> bool {
        match (
            self.cell_of(p[0], 0),
            self.cell_of(p[1], 1),
            self.cell_of(p[2], 2),
        ) {
            (Some(x), Some(y), Some(z)) => self.material_at(x, y, z) != 0,
            _ => false,
        }
    }
}

/// Amanatides-Woo 3D DDA(traceVoxelRayInto 포팅). 첫 점유 복셀에 진입하는 거리와 진입 면 법선을 반환한다.
pub fn trace(grid: &Grid, origin: [f64; 3], direction: [f64; 3], max_distance: f64) -> Option<Hit> {
    let length =
        (direction[0] * direction[0] + direction[1] * direction[1] + direction[2] * direction[2])
            .sqrt();
    if !(length > PARALLEL_EPSILON) || !(max_distance > 0.0) {
        return None;
    }
    let d = [
        direction[0] / length,
        direction[1] / length,
        direction[2] / length,
    ];
    let lower = grid.origin;
    let size = grid.voxel;
    let mut t_near = 0.0_f64;
    let mut t_far = max_distance;
    let mut entry_axis: i32 = -1;
    for a in 0..3 {
        let lo = lower[a];
        let hi = lo + grid.dims[a] as f64 * size;
        if d[a].abs() < PARALLEL_EPSILON {
            if origin[a] < lo || origin[a] >= hi {
                return None;
            }
            continue;
        }
        let t1 = (lo - origin[a]) / d[a];
        let t2 = (hi - origin[a]) / d[a];
        let enter = t1.min(t2);
        let leave = t1.max(t2);
        if enter > t_near {
            t_near = enter;
            entry_axis = a as i32;
        }
        t_far = t_far.min(leave);
        if t_near > t_far {
            return None;
        }
    }

    let mut cell = [0_i32; 3];
    let mut step = [0_i32; 3];
    let mut t_max = [f64::INFINITY; 3];
    let mut t_delta = [f64::INFINITY; 3];
    for a in 0..3 {
        let p = origin[a] + d[a] * t_near;
        let raw = ((p - lower[a]) / size).floor();
        cell[a] = raw.max(0.0).min((grid.dims[a] - 1) as f64) as i32;
        if d[a].abs() < PARALLEL_EPSILON {
            continue;
        }
        step[a] = if d[a] > 0.0 { 1 } else { -1 };
        t_delta[a] = size / d[a].abs();
        let boundary_cell = if d[a] > 0.0 { cell[a] + 1 } else { cell[a] };
        t_max[a] = (lower[a] + boundary_cell as f64 * size - origin[a]) / d[a];
    }

    let mut t = t_near;
    let mut axis = entry_axis;
    loop {
        if grid.material_at(cell[0], cell[1], cell[2]) != 0 {
            let normal = if axis < 0 {
                [-d[0], -d[1], -d[2]]
            } else {
                let mut n = [0.0; 3];
                n[axis as usize] = -(step[axis as usize] as f64);
                n
            };
            return Some(Hit {
                distance: t,
                cell,
                normal,
            });
        }
        let next = if t_max[0] <= t_max[1] {
            if t_max[0] <= t_max[2] {
                0
            } else {
                2
            }
        } else if t_max[1] <= t_max[2] {
            1
        } else {
            2
        };
        t = t_max[next];
        if !(t <= max_distance) {
            return None;
        }
        cell[next] += step[next];
        if cell[next] < 0 || cell[next] >= grid.dims[next] {
            return None;
        }
        t_max[next] += t_delta[next];
        axis = next as i32;
    }
}
