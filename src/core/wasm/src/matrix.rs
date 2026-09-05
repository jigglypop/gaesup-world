// Batch instance matrix generation for TileSystem / WallSystem.
// Produces a flat Float32Array of 4x4 column-major matrices (Three.js layout).

/// Build instance matrices for tiles.
///
/// Input per tile (SoA layout):
///   positions: [x0, y0, z0, x1, y1, z1, ...] (count * 3)
///   rotations: [ry0, ry1, ...] (count) -- Y-axis rotation only
///   scales:    [sx0, sy0, sz0, ...] (count * 3)
///
/// Output:
///   out_matrices: count * 16 floats (column-major 4x4)
#[no_mangle]
pub extern "C" fn fill_instance_matrices(
    count: usize,
    positions_ptr: *const f32,
    rotations_ptr: *const f32,
    scales_ptr: *const f32,
    out_ptr: *mut f32,
) {
    if count == 0
        || positions_ptr.is_null()
        || rotations_ptr.is_null()
        || scales_ptr.is_null()
        || out_ptr.is_null()
    {
        return;
    }

    let positions = unsafe { core::slice::from_raw_parts(positions_ptr, count * 3) };
    let rotations = unsafe { core::slice::from_raw_parts(rotations_ptr, count) };
    let scales = unsafe { core::slice::from_raw_parts(scales_ptr, count * 3) };
    let out = unsafe { core::slice::from_raw_parts_mut(out_ptr, count * 16) };

    for i in 0..count {
        let pi = i * 3;
        let px = positions[pi];
        let py = positions[pi + 1];
        let pz = positions[pi + 2];

        let ry = rotations[i];
        let sy = ry.sin();
        let cy = ry.cos();

        let si = i * 3;
        let sx = scales[si];
        let s_y = scales[si + 1];
        let sz = scales[si + 2];

        // Column-major 4x4 = compose(position, rotationY, scale).
        // R_y = [cy 0 sy; 0 1 0; -sy 0 cy]
        // M = T * R * S
        let oi = i * 16;
        // col 0
        out[oi]      = cy * sx;
        out[oi + 1]  = 0.0;
        out[oi + 2]  = -sy * sx;
        out[oi + 3]  = 0.0;
        // col 1
        out[oi + 4]  = 0.0;
        out[oi + 5]  = s_y;
        out[oi + 6]  = 0.0;
        out[oi + 7]  = 0.0;
        // col 2
        out[oi + 8]  = sy * sz;
        out[oi + 9]  = 0.0;
        out[oi + 10] = cy * sz;
        out[oi + 11] = 0.0;
        // col 3
        out[oi + 12] = px;
        out[oi + 13] = py;
        out[oi + 14] = pz;
        out[oi + 15] = 1.0;
    }
}

/// Simpler variant for walls: uniform scale (1,1,1), just position + Y rotation.
#[no_mangle]
pub extern "C" fn fill_wall_matrices(
    count: usize,
    positions_ptr: *const f32,
    rotations_ptr: *const f32,
    out_ptr: *mut f32,
) {
    if count == 0 || positions_ptr.is_null() || rotations_ptr.is_null() || out_ptr.is_null() {
        return;
    }

    let positions = unsafe { core::slice::from_raw_parts(positions_ptr, count * 3) };
    let rotations = unsafe { core::slice::from_raw_parts(rotations_ptr, count) };
    let out = unsafe { core::slice::from_raw_parts_mut(out_ptr, count * 16) };

    for i in 0..count {
        let pi = i * 3;
        let px = positions[pi];
        let py = positions[pi + 1];
        let pz = positions[pi + 2];

        let ry = rotations[i];
        let sy = ry.sin();
        let cy = ry.cos();

        let oi = i * 16;
        out[oi]      = cy;
        out[oi + 1]  = 0.0;
        out[oi + 2]  = -sy;
        out[oi + 3]  = 0.0;

        out[oi + 4]  = 0.0;
        out[oi + 5]  = 1.0;
        out[oi + 6]  = 0.0;
        out[oi + 7]  = 0.0;

        out[oi + 8]  = sy;
        out[oi + 9]  = 0.0;
        out[oi + 10] = cy;
        out[oi + 11] = 0.0;

        out[oi + 12] = px;
        out[oi + 13] = py;
        out[oi + 14] = pz;
        out[oi + 15] = 1.0;
    }
}
