// A* pathfinding on a 2D grid with 8-directional movement.
// Outputs a sequence of (x, z) grid coordinates from start to goal.

use core::cmp::Ordering;

struct OpenNode {
    f_score: u32,
    index: u32,
}

impl Eq for OpenNode {}

impl PartialEq for OpenNode {
    fn eq(&self, other: &Self) -> bool {
        self.f_score == other.f_score
    }
}

impl Ord for OpenNode {
    fn cmp(&self, other: &Self) -> Ordering {
        other
            .f_score
            .cmp(&self.f_score)
            .then_with(|| self.index.cmp(&other.index))
    }
}

impl PartialOrd for OpenNode {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

// 8-directional neighbors: (dx, dz, cost * 10).
// Straight = 10, diagonal = 14 (approx sqrt(2) * 10).
const DIRS: [(i32, i32, u32); 8] = [
    (1, 0, 10),
    (-1, 0, 10),
    (0, 1, 10),
    (0, -1, 10),
    (1, 1, 14),
    (1, -1, 14),
    (-1, 1, 14),
    (-1, -1, 14),
];

// Octile distance heuristic (admissible for 8-directional movement).
fn octile_h(x: u32, z: u32, gx: u32, gz: u32) -> u32 {
    let dx = if x > gx { x - gx } else { gx - x };
    let dz = if z > gz { z - gz } else { gz - z };
    let (mn, mx) = if dx < dz { (dx, dz) } else { (dz, dx) };
    mx * 10 + mn * 4
}

/// A* pathfinding on a uniform-cost walkable grid.
///
/// grid: row-major u8 bitmap (grid[z * width + x]). 0 = blocked, nonzero = walkable.
/// out_path: pairs of (x, z) u32 values in order from start to goal.
/// Returns number of waypoints written (0 = no path found).
#[no_mangle]
pub extern "C" fn astar_find_path(
    grid_ptr: *const u8,
    grid_width: u32,
    grid_height: u32,
    start_x: u32,
    start_z: u32,
    goal_x: u32,
    goal_z: u32,
    out_path_ptr: *mut u32,
    out_capacity: u32,
) -> u32 {
    if grid_ptr.is_null() || out_path_ptr.is_null() || out_capacity == 0 {
        return 0;
    }
    let w = grid_width as usize;
    let h = grid_height as usize;
    if w == 0 || h == 0 {
        return 0;
    }
    if start_x >= grid_width || start_z >= grid_height {
        return 0;
    }
    if goal_x >= grid_width || goal_z >= grid_height {
        return 0;
    }

    let grid = unsafe { core::slice::from_raw_parts(grid_ptr, w * h) };
    let out = unsafe { core::slice::from_raw_parts_mut(out_path_ptr, (out_capacity as usize) * 2) };

    let start_idx = (start_z as usize) * w + (start_x as usize);
    let goal_idx = (goal_z as usize) * w + (goal_x as usize);

    if grid[start_idx] == 0 || grid[goal_idx] == 0 {
        return 0;
    }
    if start_idx == goal_idx {
        out[0] = goal_x;
        out[1] = goal_z;
        return 1;
    }

    let total = w * h;
    let mut g_score = vec![u32::MAX; total];
    let mut came_from = vec![u32::MAX; total];
    let mut closed = vec![false; total];

    g_score[start_idx] = 0;

    // BinaryHeap with reversed Ord acts as a min-heap.
    let mut open = Vec::<OpenNode>::new();
    open.push(OpenNode {
        f_score: octile_h(start_x, start_z, goal_x, goal_z),
        index: start_idx as u32,
    });

    while !open.is_empty() {
        // Find minimum f-score (linear scan; avoids BinaryHeap import).
        let mut min_pos = 0usize;
        for i in 1..open.len() {
            if open[i].f_score < open[min_pos].f_score {
                min_pos = i;
            }
        }
        let current = open.swap_remove(min_pos);

        let ci = current.index as usize;
        if ci == goal_idx {
            break;
        }
        if closed[ci] {
            continue;
        }
        closed[ci] = true;

        let cx = (ci % w) as i32;
        let cz = (ci / w) as i32;
        let cg = g_score[ci];

        for &(dx, dz, move_cost) in &DIRS {
            let nx = cx + dx;
            let nz = cz + dz;
            if nx < 0 || nz < 0 || nx >= w as i32 || nz >= h as i32 {
                continue;
            }

            let ni = (nz as usize) * w + (nx as usize);
            if closed[ni] || grid[ni] == 0 {
                continue;
            }

            // Prevent corner-cutting through diagonal walls.
            if dx != 0 && dz != 0 {
                let adj1 = (cz as usize) * w + (nx as usize);
                let adj2 = (nz as usize) * w + (cx as usize);
                if grid[adj1] == 0 || grid[adj2] == 0 {
                    continue;
                }
            }

            let tentative_g = cg + move_cost;
            if tentative_g < g_score[ni] {
                g_score[ni] = tentative_g;
                came_from[ni] = ci as u32;
                let h = octile_h(nx as u32, nz as u32, goal_x, goal_z);
                open.push(OpenNode {
                    f_score: tentative_g + h,
                    index: ni as u32,
                });
            }
        }
    }

    if g_score[goal_idx] == u32::MAX {
        return 0;
    }

    reconstruct_path(w, start_idx, goal_idx, &came_from, out, out_capacity)
}

/// A* with per-cell movement costs.
///
/// cost_grid: row-major u8 grid. 0 = blocked, 1-255 = movement cost.
/// Lower cost = easier terrain (road=1, grass=2, mud=5, water=10).
#[no_mangle]
pub extern "C" fn astar_find_path_weighted(
    cost_ptr: *const u8,
    grid_width: u32,
    grid_height: u32,
    start_x: u32,
    start_z: u32,
    goal_x: u32,
    goal_z: u32,
    out_path_ptr: *mut u32,
    out_capacity: u32,
) -> u32 {
    if cost_ptr.is_null() || out_path_ptr.is_null() || out_capacity == 0 {
        return 0;
    }
    let w = grid_width as usize;
    let h = grid_height as usize;
    if w == 0 || h == 0 {
        return 0;
    }
    if start_x >= grid_width || start_z >= grid_height {
        return 0;
    }
    if goal_x >= grid_width || goal_z >= grid_height {
        return 0;
    }

    let cost_grid = unsafe { core::slice::from_raw_parts(cost_ptr, w * h) };
    let out = unsafe { core::slice::from_raw_parts_mut(out_path_ptr, (out_capacity as usize) * 2) };

    let start_idx = (start_z as usize) * w + (start_x as usize);
    let goal_idx = (goal_z as usize) * w + (goal_x as usize);

    if cost_grid[start_idx] == 0 || cost_grid[goal_idx] == 0 {
        return 0;
    }
    if start_idx == goal_idx {
        out[0] = goal_x;
        out[1] = goal_z;
        return 1;
    }

    let total = w * h;
    let mut g_score = vec![u32::MAX; total];
    let mut came_from = vec![u32::MAX; total];
    let mut closed = vec![false; total];

    g_score[start_idx] = 0;

    let mut open = Vec::<OpenNode>::new();
    open.push(OpenNode {
        f_score: octile_h(start_x, start_z, goal_x, goal_z),
        index: start_idx as u32,
    });

    while !open.is_empty() {
        let mut min_pos = 0usize;
        for i in 1..open.len() {
            if open[i].f_score < open[min_pos].f_score {
                min_pos = i;
            }
        }
        let current = open.swap_remove(min_pos);

        let ci = current.index as usize;
        if ci == goal_idx {
            break;
        }
        if closed[ci] {
            continue;
        }
        closed[ci] = true;

        let cx = (ci % w) as i32;
        let cz = (ci / w) as i32;
        let cg = g_score[ci];

        for &(dx, dz, base_cost) in &DIRS {
            let nx = cx + dx;
            let nz = cz + dz;
            if nx < 0 || nz < 0 || nx >= w as i32 || nz >= h as i32 {
                continue;
            }

            let ni = (nz as usize) * w + (nx as usize);
            let cell_cost = cost_grid[ni];
            if closed[ni] || cell_cost == 0 {
                continue;
            }

            if dx != 0 && dz != 0 {
                let adj1 = (cz as usize) * w + (nx as usize);
                let adj2 = (nz as usize) * w + (cx as usize);
                if cost_grid[adj1] == 0 || cost_grid[adj2] == 0 {
                    continue;
                }
            }

            let move_cost = base_cost * (cell_cost as u32);
            let tentative_g = cg + move_cost;
            if tentative_g < g_score[ni] {
                g_score[ni] = tentative_g;
                came_from[ni] = ci as u32;
                let h = octile_h(nx as u32, nz as u32, goal_x, goal_z);
                open.push(OpenNode {
                    f_score: tentative_g + h,
                    index: ni as u32,
                });
            }
        }
    }

    if g_score[goal_idx] == u32::MAX {
        return 0;
    }

    reconstruct_path(w, start_idx, goal_idx, &came_from, out, out_capacity)
}

// Shared path reconstruction: trace came_from from goal to start, then reverse.
fn reconstruct_path(
    w: usize,
    start_idx: usize,
    goal_idx: usize,
    came_from: &[u32],
    out: &mut [u32],
    out_capacity: u32,
) -> u32 {
    let mut path: Vec<(u32, u32)> = Vec::new();
    let mut trace = goal_idx;
    while trace != start_idx {
        let tx = (trace % w) as u32;
        let tz = (trace / w) as u32;
        path.push((tx, tz));
        let parent = came_from[trace] as usize;
        if parent == u32::MAX as usize || parent == trace {
            return 0;
        }
        trace = parent;
    }
    path.push(((start_idx % w) as u32, (start_idx / w) as u32));
    path.reverse();

    let write_count = (out_capacity as usize).min(path.len());
    for i in 0..write_count {
        out[i * 2] = path[i].0;
        out[i * 2 + 1] = path[i].1;
    }
    write_count as u32
}
