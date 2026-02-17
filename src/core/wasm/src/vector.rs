// Batch vector/quaternion math for remote player interpolation.
// Implements Unity-style SmoothDamp and quaternion slerp in batch.

/// Batch SmoothDamp (critically-damped spring) for `count` Vector3 pairs.
///
/// All arrays are count * 3 floats (x, y, z interleaved).
///   current:  in/out current positions
///   target:   target positions (read-only)
///   velocity: in/out velocity state
///   smooth_time: shared smoothing constant
///   max_speed: shared max speed
///   dt: delta time
#[no_mangle]
pub extern "C" fn batch_smooth_damp(
    count: usize,
    current_ptr: *mut f32,
    target_ptr: *const f32,
    velocity_ptr: *mut f32,
    smooth_time: f32,
    max_speed: f32,
    dt: f32,
) {
    if count == 0 || current_ptr.is_null() || target_ptr.is_null() || velocity_ptr.is_null() {
        return;
    }

    let current = unsafe { core::slice::from_raw_parts_mut(current_ptr, count * 3) };
    let target = unsafe { core::slice::from_raw_parts(target_ptr, count * 3) };
    let velocity = unsafe { core::slice::from_raw_parts_mut(velocity_ptr, count * 3) };

    let st = smooth_time.max(0.0001);
    let delta = dt.max(0.0);
    let omega = 2.0 / st;
    let x = omega * delta;
    let exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);
    let max_change = max_speed * st;
    let max_change_sq = max_change * max_change;

    for i in 0..count {
        let idx = i * 3;

        // change = current - target
        let cx = current[idx] - target[idx];
        let cy = current[idx + 1] - target[idx + 1];
        let cz = current[idx + 2] - target[idx + 2];

        // Clamp change length.
        let len_sq = cx * cx + cy * cy + cz * cz;
        let (cx, cy, cz) = if len_sq > max_change_sq && len_sq > 0.0 {
            let scale = max_change / len_sq.sqrt();
            (cx * scale, cy * scale, cz * scale)
        } else {
            (cx, cy, cz)
        };

        // adjusted_target = current - change
        let atx = current[idx] - cx;
        let aty = current[idx + 1] - cy;
        let atz = current[idx + 2] - cz;

        // temp = (velocity + omega * change) * dt
        let tx = (velocity[idx] + omega * cx) * delta;
        let ty = (velocity[idx + 1] + omega * cy) * delta;
        let tz = (velocity[idx + 2] + omega * cz) * delta;

        // velocity = (velocity - omega * temp) * exp
        velocity[idx] = (velocity[idx] - omega * tx) * exp;
        velocity[idx + 1] = (velocity[idx + 1] - omega * ty) * exp;
        velocity[idx + 2] = (velocity[idx + 2] - omega * tz) * exp;

        // out = adjusted_target + (change + temp) * exp
        let ox = atx + (cx + tx) * exp;
        let oy = aty + (cy + ty) * exp;
        let oz = atz + (cz + tz) * exp;

        // Prevent overshooting.
        let d1x = target[idx] - current[idx];
        let d1y = target[idx + 1] - current[idx + 1];
        let d1z = target[idx + 2] - current[idx + 2];
        let d2x = ox - target[idx];
        let d2y = oy - target[idx + 1];
        let d2z = oz - target[idx + 2];

        if d1x * d2x + d1y * d2y + d1z * d2z > 0.0 {
            current[idx] = target[idx];
            current[idx + 1] = target[idx + 1];
            current[idx + 2] = target[idx + 2];
            velocity[idx] = 0.0;
            velocity[idx + 1] = 0.0;
            velocity[idx + 2] = 0.0;
        } else {
            current[idx] = ox;
            current[idx + 1] = oy;
            current[idx + 2] = oz;
        }
    }
}

/// Batch quaternion slerp for `count` quaternions.
///
/// Arrays: count * 4 floats (x, y, z, w).
///   current: in/out
///   target: read-only
///   alpha: interpolation factor [0, 1]
#[no_mangle]
pub extern "C" fn batch_quat_slerp(
    count: usize,
    current_ptr: *mut f32,
    target_ptr: *const f32,
    alpha: f32,
) {
    if count == 0 || current_ptr.is_null() || target_ptr.is_null() {
        return;
    }

    let current = unsafe { core::slice::from_raw_parts_mut(current_ptr, count * 4) };
    let target = unsafe { core::slice::from_raw_parts(target_ptr, count * 4) };
    let t = alpha.max(0.0).min(1.0);

    for i in 0..count {
        let idx = i * 4;
        let ax = current[idx];
        let ay = current[idx + 1];
        let az = current[idx + 2];
        let aw = current[idx + 3];

        let mut bx = target[idx];
        let mut by = target[idx + 1];
        let mut bz = target[idx + 2];
        let mut bw = target[idx + 3];

        // Ensure shortest path.
        let mut dot = ax * bx + ay * by + az * bz + aw * bw;
        if dot < 0.0 {
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
            dot = -dot;
        }

        let (s0, s1) = if dot > 0.9995 {
            // Linear fallback for near-identical quaternions.
            (1.0 - t, t)
        } else {
            let theta = dot.min(1.0).acos();
            let sin_theta = theta.sin();
            let inv_sin = 1.0 / sin_theta;
            (((1.0 - t) * theta).sin() * inv_sin, (t * theta).sin() * inv_sin)
        };

        let rx = s0 * ax + s1 * bx;
        let ry = s0 * ay + s1 * by;
        let rz = s0 * az + s1 * bz;
        let rw = s0 * aw + s1 * bw;

        // Normalize.
        let len = (rx * rx + ry * ry + rz * rz + rw * rw).sqrt();
        if len > 1e-8 {
            let inv = 1.0 / len;
            current[idx] = rx * inv;
            current[idx + 1] = ry * inv;
            current[idx + 2] = rz * inv;
            current[idx + 3] = rw * inv;
        }
    }
}

/// Batch distance calculation: returns exp(-sigma) weights for LOD.
///   positions: count * 3 (object positions)
///   camera: 3 floats (camera position)
///   near, far, strength: SFE parameters
///   out_weights: count floats
#[no_mangle]
pub extern "C" fn batch_sfe_weights(
    count: usize,
    positions_ptr: *const f32,
    camera_x: f32,
    camera_y: f32,
    camera_z: f32,
    near: f32,
    far: f32,
    strength: f32,
    out_ptr: *mut f32,
) {
    if count == 0 || positions_ptr.is_null() || out_ptr.is_null() {
        return;
    }

    let positions = unsafe { core::slice::from_raw_parts(positions_ptr, count * 3) };
    let out = unsafe { core::slice::from_raw_parts_mut(out_ptr, count) };
    let n = near.max(0.0);
    let f = far.max(n + 1e-6);
    let s = strength.max(0.0);
    let inv_range = 1.0 / (f - n);

    for i in 0..count {
        let idx = i * 3;
        let dx = positions[idx] - camera_x;
        let dy = positions[idx + 1] - camera_y;
        let dz = positions[idx + 2] - camera_z;
        let dist = (dx * dx + dy * dy + dz * dz).sqrt();

        if dist <= n {
            out[i] = 1.0;
        } else if dist >= f {
            out[i] = 0.0;
        } else {
            let t = (dist - n) * inv_range;
            let sigma = t * s;
            out[i] = (-sigma).exp();
        }
    }
}
