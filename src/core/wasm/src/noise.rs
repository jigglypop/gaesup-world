// 2D Simplex noise (OpenSimplex variant) with WASM SIMD-friendly layout.
// Generates grass offsets (x, y, z) with noise-based Y positioning.

const SKEW_2D: f32 = 0.366025403784; // (sqrt(3) - 1) / 2
const UNSKEW_2D: f32 = 0.211324865405; // (3 - sqrt(3)) / 6

// Gradient table for 2D simplex noise (12 directions).
static GRAD2: [(f32, f32); 12] = [
    (1.0, 0.0), (-1.0, 0.0), (0.0, 1.0), (0.0, -1.0),
    (1.0, 1.0), (-1.0, 1.0), (1.0, -1.0), (-1.0, -1.0),
    (1.0, 0.5), (-1.0, 0.5), (0.5, 1.0), (-0.5, 1.0),
];

#[inline]
fn xorshift32(state: &mut u32) -> u32 {
    let mut x = *state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    *state = x;
    x
}

fn build_perm(seed: u32) -> [u8; 512] {
    let mut perm = [0u8; 512];
    let mut st = if seed == 0 { 0x1234_5678 } else { seed };
    // Fisher-Yates shuffle on [0..255].
    let mut base = [0u8; 256];
    for i in 0..256 {
        base[i] = i as u8;
    }
    for i in (1..256).rev() {
        let j = (xorshift32(&mut st) as usize) % (i + 1);
        base.swap(i, j);
    }
    for i in 0..256 {
        perm[i] = base[i];
        perm[i + 256] = base[i];
    }
    perm
}

#[inline]
fn noise2d(perm: &[u8; 512], x: f32, y: f32) -> f32 {
    let s = (x + y) * SKEW_2D;
    let i = (x + s).floor();
    let j = (y + s).floor();
    let t = (i + j) * UNSKEW_2D;

    let x0 = x - (i - t);
    let y0 = y - (j - t);

    let (i1, j1) = if x0 > y0 { (1.0_f32, 0.0_f32) } else { (0.0, 1.0) };

    let x1 = x0 - i1 + UNSKEW_2D;
    let y1 = y0 - j1 + UNSKEW_2D;
    let x2 = x0 - 1.0 + 2.0 * UNSKEW_2D;
    let y2 = y0 - 1.0 + 2.0 * UNSKEW_2D;

    let ii = (i as i32 & 255) as usize;
    let jj = (j as i32 & 255) as usize;

    let mut n = 0.0_f32;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if t0 > 0.0 {
        let t0sq = t0 * t0;
        let gi = (perm[ii + perm[jj] as usize] % 12) as usize;
        n += t0sq * t0sq * (GRAD2[gi].0 * x0 + GRAD2[gi].1 * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if t1 > 0.0 {
        let t1sq = t1 * t1;
        let gi = (perm[ii + i1 as usize + perm[jj + j1 as usize] as usize] % 12) as usize;
        n += t1sq * t1sq * (GRAD2[gi].0 * x1 + GRAD2[gi].1 * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if t2 > 0.0 {
        let t2sq = t2 * t2;
        let gi = (perm[ii + 1 + perm[jj + 1] as usize] % 12) as usize;
        n += t2sq * t2sq * (GRAD2[gi].0 * x2 + GRAD2[gi].1 * y2);
    }

    // Scale to approximately [-1, 1].
    70.0 * n
}

#[inline]
fn get_y_position(perm: &[u8; 512], x: f32, z: f32) -> f32 {
    0.05 * noise2d(perm, x / 50.0, z / 50.0) + 0.05 * noise2d(perm, x / 100.0, z / 100.0)
}

/// Fills grass offset data (x, y, z) for `instances` blades spread over `width`.
/// Also fills orientation data (orientations, stretches, halfRootAngleSin, halfRootAngleCos).
///
/// Buffer layout:
///   offsets: instances * 3 floats
///   orientations: instances * 4 floats
///   stretches: instances floats
///   half_sin: instances floats
///   half_cos: instances floats
#[no_mangle]
pub extern "C" fn fill_grass_data(
    instances: usize,
    width: f32,
    seed: u32,
    offsets_ptr: *mut f32,
    orientations_ptr: *mut f32,
    stretches_ptr: *mut f32,
    half_sin_ptr: *mut f32,
    half_cos_ptr: *mut f32,
) {
    if instances == 0 {
        return;
    }
    if offsets_ptr.is_null()
        || orientations_ptr.is_null()
        || stretches_ptr.is_null()
        || half_sin_ptr.is_null()
        || half_cos_ptr.is_null()
    {
        return;
    }

    let perm = build_perm(seed);

    let offsets = unsafe { core::slice::from_raw_parts_mut(offsets_ptr, instances * 3) };
    let orientations = unsafe { core::slice::from_raw_parts_mut(orientations_ptr, instances * 4) };
    let stretches = unsafe { core::slice::from_raw_parts_mut(stretches_ptr, instances) };
    let half_sin = unsafe { core::slice::from_raw_parts_mut(half_sin_ptr, instances) };
    let half_cos = unsafe { core::slice::from_raw_parts_mut(half_cos_ptr, instances) };

    let grid_size = (instances as f32).sqrt().ceil() as usize;
    let cell_size = width / grid_size as f32;
    let half_width = width / 2.0;

    let mut rng_state = if seed == 0 { 0xDEAD_BEEF } else { seed.wrapping_add(0x9E37_79B9) };
    let max_angle_delta = core::f32::consts::PI / 6.0;
    let max_tilt = core::f32::consts::PI / 8.0;

    for idx in 0..instances {
        let ix = idx % grid_size;
        let iz = idx / grid_size;

        let x = (ix as f32 + 0.5) * cell_size - half_width;
        let z = (iz as f32 + 0.5) * cell_size - half_width;
        let y = get_y_position(&perm, x, z);

        let oi = idx * 3;
        offsets[oi] = x;
        offsets[oi + 1] = y;
        offsets[oi + 2] = z;

        // Orientation (same logic as existing grass wasm).
        let r1 = (xorshift32(&mut rng_state) >> 8) as f32 * (1.0 / 16_777_216.0);
        let r2 = (xorshift32(&mut rng_state) >> 8) as f32 * (1.0 / 16_777_216.0);
        let r3 = (xorshift32(&mut rng_state) >> 8) as f32 * (1.0 / 16_777_216.0);

        let angle = core::f32::consts::PI - r1 * max_angle_delta;
        let half = 0.5 * angle;
        let sz = half.sin();
        let cz = half.cos();

        let tilt = r2 * max_tilt;
        let half_tilt = 0.5 * tilt;
        let sx = half_tilt.sin();
        let cx = half_tilt.cos();

        // q = qz * qx (Three.js multiply order).
        let ji = idx * 4;
        orientations[ji] = cz * sx;
        orientations[ji + 1] = sz * sx;
        orientations[ji + 2] = sz * cx;
        orientations[ji + 3] = cz * cx;

        half_sin[idx] = sz;
        half_cos[idx] = cz;
        stretches[idx] = 0.8 + r3 * 0.2;
    }
}

/// Generate only Y-position noise for a terrain mesh (ground plane vertices).
/// Writes `count` floats at `out_ptr`.
#[no_mangle]
pub extern "C" fn fill_terrain_y(
    count: usize,
    xs_ptr: *const f32,
    zs_ptr: *const f32,
    seed: u32,
    out_ptr: *mut f32,
) {
    if count == 0 || xs_ptr.is_null() || zs_ptr.is_null() || out_ptr.is_null() {
        return;
    }
    let perm = build_perm(seed);
    let xs = unsafe { core::slice::from_raw_parts(xs_ptr, count) };
    let zs = unsafe { core::slice::from_raw_parts(zs_ptr, count) };
    let out = unsafe { core::slice::from_raw_parts_mut(out_ptr, count) };

    for i in 0..count {
        out[i] = get_y_position(&perm, xs[i], zs[i]);
    }
}
