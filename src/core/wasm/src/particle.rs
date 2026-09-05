// Batch particle physics for snow and fire effects.
// Positions: count * 3 (x, y, z interleaved)
// Velocities: count * 3

/// Update snow particles: gravity + wind drift + bounds wrapping.
///
/// positions/velocities: count * 3 floats (in/out)
/// bounds: [minX, maxX, minY, maxY, minZ, maxZ]
/// wind: [wx, wy, wz]
#[no_mangle]
pub extern "C" fn update_snow_particles(
    count: usize,
    positions_ptr: *mut f32,
    velocities_ptr: *mut f32,
    bounds_ptr: *const f32,
    wind_x: f32,
    wind_y: f32,
    wind_z: f32,
    gravity: f32,
    damping: f32,
    dt: f32,
) {
    if count == 0 || positions_ptr.is_null() || velocities_ptr.is_null() || bounds_ptr.is_null() {
        return;
    }

    let pos = unsafe { core::slice::from_raw_parts_mut(positions_ptr, count * 3) };
    let vel = unsafe { core::slice::from_raw_parts_mut(velocities_ptr, count * 3) };
    let bounds = unsafe { core::slice::from_raw_parts(bounds_ptr, 6) };

    let (min_x, max_x) = (bounds[0], bounds[1]);
    let (min_y, max_y) = (bounds[2], bounds[3]);
    let (min_z, max_z) = (bounds[4], bounds[5]);
    let range_x = max_x - min_x;
    let range_y = max_y - min_y;
    let range_z = max_z - min_z;

    let damp = 1.0 - damping.min(1.0).max(0.0);

    for i in 0..count {
        let idx = i * 3;

        vel[idx]     = (vel[idx]     + wind_x * dt) * damp;
        vel[idx + 1] = (vel[idx + 1] - gravity * dt + wind_y * dt) * damp;
        vel[idx + 2] = (vel[idx + 2] + wind_z * dt) * damp;

        pos[idx]     += vel[idx] * dt;
        pos[idx + 1] += vel[idx + 1] * dt;
        pos[idx + 2] += vel[idx + 2] * dt;

        // Wrap around bounds (camera-relative box)
        if pos[idx] < min_x { pos[idx] += range_x; }
        else if pos[idx] > max_x { pos[idx] -= range_x; }

        if pos[idx + 1] < min_y {
            pos[idx + 1] = max_y;
            vel[idx + 1] = 0.0;
        }

        if pos[idx + 2] < min_z { pos[idx + 2] += range_z; }
        else if pos[idx + 2] > max_z { pos[idx + 2] -= range_z; }
    }
}

/// Update fire particles: upward motion + turbulence + lifetime fade.
///
/// positions: count * 3 (in/out)
/// lifetimes: count floats (in/out, 0..1 remaining)
/// out_alphas: count floats (output, for rendering)
/// origin: [ox, oy, oz] - respawn center
/// spread: horizontal spread radius
#[no_mangle]
pub extern "C" fn update_fire_particles(
    count: usize,
    positions_ptr: *mut f32,
    lifetimes_ptr: *mut f32,
    out_alphas_ptr: *mut f32,
    origin_x: f32,
    origin_y: f32,
    origin_z: f32,
    spread: f32,
    rise_speed: f32,
    turbulence: f32,
    dt: f32,
    seed: u32,
) {
    if count == 0 || positions_ptr.is_null() || lifetimes_ptr.is_null() || out_alphas_ptr.is_null()
    {
        return;
    }

    let pos = unsafe { core::slice::from_raw_parts_mut(positions_ptr, count * 3) };
    let life = unsafe { core::slice::from_raw_parts_mut(lifetimes_ptr, count) };
    let alphas = unsafe { core::slice::from_raw_parts_mut(out_alphas_ptr, count) };

    let mut rng = if seed == 0 { 0xBEEF_CAFE } else { seed };

    for i in 0..count {
        life[i] -= dt;

        if life[i] <= 0.0 {
            // Respawn at origin with random offset
            let r1 = xorshift(&mut rng);
            let r2 = xorshift(&mut rng);
            let r3 = xorshift(&mut rng);

            pos[i * 3]     = origin_x + (r1 - 0.5) * spread;
            pos[i * 3 + 1] = origin_y;
            pos[i * 3 + 2] = origin_z + (r2 - 0.5) * spread;
            life[i] = 0.5 + r3 * 1.0;
        } else {
            let t = xorshift(&mut rng);
            let t2 = xorshift(&mut rng);

            pos[i * 3]     += (t - 0.5) * turbulence * dt;
            pos[i * 3 + 1] += rise_speed * dt;
            pos[i * 3 + 2] += (t2 - 0.5) * turbulence * dt;
        }

        // Alpha: fade in quickly, fade out at end of life
        let ratio = life[i].max(0.0).min(1.5) / 1.5;
        alphas[i] = if ratio > 0.8 {
            (1.0 - ratio) * 5.0
        } else {
            ratio.min(1.0)
        };
    }
}

#[inline]
fn xorshift(state: &mut u32) -> f32 {
    let mut x = *state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    *state = x;
    (x >> 8) as f32 * (1.0 / 16_777_216.0)
}
