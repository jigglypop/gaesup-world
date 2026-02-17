// Batch spatial query: given N object positions and a query (pos, radius),
// write matching indices into an output buffer.
// This avoids the overhead of JS Map/Set iteration for large object counts.

/// Query nearby objects by brute-force distance check (optimized via SIMD-friendly layout).
///
/// positions: count * 3 floats (all objects)
/// query_x/y/z: query center
/// radius: search radius
/// out_indices: buffer to write matching indices (u32)
/// out_capacity: max number of results
///
/// Returns: actual number of matches written.
#[no_mangle]
pub extern "C" fn spatial_query_nearby(
    count: usize,
    positions_ptr: *const f32,
    query_x: f32,
    query_y: f32,
    query_z: f32,
    radius: f32,
    out_indices_ptr: *mut u32,
    out_capacity: usize,
) -> usize {
    if count == 0 || positions_ptr.is_null() || out_indices_ptr.is_null() || out_capacity == 0 {
        return 0;
    }

    let positions = unsafe { core::slice::from_raw_parts(positions_ptr, count * 3) };
    let out = unsafe { core::slice::from_raw_parts_mut(out_indices_ptr, out_capacity) };
    let radius_sq = radius * radius;
    let mut found = 0usize;

    for i in 0..count {
        let idx = i * 3;
        let dx = positions[idx] - query_x;
        let dy = positions[idx + 1] - query_y;
        let dz = positions[idx + 2] - query_z;
        let dist_sq = dx * dx + dy * dy + dz * dz;

        if dist_sq <= radius_sq {
            if found >= out_capacity {
                break;
            }
            out[found] = i as u32;
            found += 1;
        }
    }

    found
}

/// Cell-based spatial query: hash positions into cells, then query by cell neighborhood.
/// Uses Cantor pairing (matching the JS SpatialGrid).
///
/// This is a stateless "build + query in one pass" approach suitable for per-frame use.
///
/// positions: count * 3
/// cell_size: grid cell size
/// query_x/y/z: center
/// radius: search radius
/// out_indices: output buffer
/// out_capacity: max results
///
/// Returns actual count.
#[no_mangle]
pub extern "C" fn spatial_grid_query(
    count: usize,
    positions_ptr: *const f32,
    cell_size: f32,
    query_x: f32,
    query_y: f32,
    query_z: f32,
    radius: f32,
    out_indices_ptr: *mut u32,
    out_capacity: usize,
) -> usize {
    if count == 0 || positions_ptr.is_null() || out_indices_ptr.is_null() || out_capacity == 0 {
        return 0;
    }

    let positions = unsafe { core::slice::from_raw_parts(positions_ptr, count * 3) };
    let out = unsafe { core::slice::from_raw_parts_mut(out_indices_ptr, out_capacity) };
    let radius_sq = radius * radius;
    let inv_cell = 1.0 / cell_size;

    // Determine cell range to search.
    let cell_radius = (radius * inv_cell).ceil() as i32;
    let center_cx = (query_x * inv_cell).floor() as i32;
    let center_cz = (query_z * inv_cell).floor() as i32;

    let min_cx = center_cx - cell_radius;
    let max_cx = center_cx + cell_radius;
    let min_cz = center_cz - cell_radius;
    let max_cz = center_cz + cell_radius;

    let mut found = 0usize;

    // Single pass: check each object's cell membership and distance.
    for i in 0..count {
        let idx = i * 3;
        let px = positions[idx];
        let py = positions[idx + 1];
        let pz = positions[idx + 2];

        let cx = (px * inv_cell).floor() as i32;
        let cz = (pz * inv_cell).floor() as i32;

        // Quick cell-level rejection.
        if cx < min_cx || cx > max_cx || cz < min_cz || cz > max_cz {
            continue;
        }

        let dx = px - query_x;
        let dy = py - query_y;
        let dz = pz - query_z;
        if dx * dx + dy * dy + dz * dz <= radius_sq {
            if found >= out_capacity {
                break;
            }
            out[found] = i as u32;
            found += 1;
        }
    }

    found
}
