mod probe;
mod trace;

use probe::{Environment, Level, Scene};
use trace::Grid;

const HEADER_GRID_ORIGIN: usize = 0;
const HEADER_VOXEL_SIZE: usize = 3;
const HEADER_DIMS: usize = 4;
const HEADER_MATERIAL_COUNT: usize = 7;
const HEADER_ENVIRONMENT: usize = 8;
const HEADER_LEVEL_COUNT: usize = 23;
const HEADER_LEVELS: usize = 24;
const LEVEL_STRIDE: usize = 12;
const POINTER_OCCUPANCY: usize = 0;
const POINTER_MATERIALS: usize = 1;
const POINTER_LEVELS: usize = 2;
const POINTERS_PER_LEVEL: usize = 5;
const MAX_LEVELS: usize = 2;

fn alloc<T>(len: usize) -> *mut T {
    let mut buffer = Vec::<T>::with_capacity(len);
    let ptr = buffer.as_mut_ptr();
    core::mem::forget(buffer);
    ptr
}

#[no_mangle]
pub extern "C" fn alloc_f32(len: usize) -> *mut f32 {
    alloc::<f32>(len)
}

#[no_mangle]
pub extern "C" fn alloc_f64(len: usize) -> *mut f64 {
    alloc::<f64>(len)
}

#[no_mangle]
pub extern "C" fn alloc_u8(len: usize) -> *mut u8 {
    alloc::<u8>(len)
}

#[no_mangle]
pub extern "C" fn alloc_u32(len: usize) -> *mut u32 {
    alloc::<u32>(len)
}

unsafe fn read_triple(header: *const f64, at: usize) -> [f64; 3] {
    [*header.add(at), *header.add(at + 1), *header.add(at + 2)]
}

unsafe fn read_level(header: *const f64, pointers: *const u32, index: usize) -> Level {
    let base = HEADER_LEVELS + index * LEVEL_STRIDE;
    let slot = POINTER_LEVELS + index * POINTERS_PER_LEVEL;
    Level {
        origin: read_triple(header, base),
        spacing: *header.add(base + 3),
        counts: [
            *header.add(base + 4) as i32,
            *header.add(base + 5) as i32,
            *header.add(base + 6) as i32,
        ],
        rays: *header.add(base + 7) as usize,
        blend: *header.add(base + 8),
        normal_bias: *header.add(base + 9),
        max_distance: *header.add(base + 10),
        cube: *pointers.add(slot) as usize as *mut f32,
        valid: *pointers.add(slot + 1) as usize as *mut u8,
        offsets: *pointers.add(slot + 2) as usize as *mut f32,
        age: *pointers.add(slot + 3) as usize as *mut u32,
        directions: *pointers.add(slot + 4) as usize as *const f64,
    }
}

/// 한 레벨에서 indices에 담긴 프로브 count개를 순서대로 갱신한다. 헤더와 포인터 배치는 probeWasmKernel.ts와 같다.
/// 헤더(f64): 격자 원점 3, 복셀 크기, 차원 3, 재질 수, 환경 15, 레벨 수, 레벨마다 12
/// (원점 3, 간격, 개수 3, 레이 수, blend, normalBias, 최대 거리, 예약).
/// 포인터(u32): 점유, 재질(f64 x 6), 레벨마다 조도 큐브(f32), 유효(u8), 재배치(f32), 갱신 횟수(u32), 기본 방향(f64).
#[no_mangle]
pub extern "C" fn gi_update_probes(
    header: *const f64,
    pointers: *const u32,
    level_index: u32,
    indices: *const u32,
    count: u32,
) {
    if header.is_null() || pointers.is_null() || indices.is_null() {
        return;
    }
    unsafe {
        let level_count = (*header.add(HEADER_LEVEL_COUNT) as usize).min(MAX_LEVELS);
        let target = level_index as usize;
        if target >= level_count {
            return;
        }
        let grid = Grid {
            occupancy: *pointers.add(POINTER_OCCUPANCY) as usize as *const u8,
            dims: [
                *header.add(HEADER_DIMS) as i32,
                *header.add(HEADER_DIMS + 1) as i32,
                *header.add(HEADER_DIMS + 2) as i32,
            ],
            origin: read_triple(header, HEADER_GRID_ORIGIN),
            voxel: *header.add(HEADER_VOXEL_SIZE),
        };
        let env = HEADER_ENVIRONMENT;
        let scene = Scene {
            grid,
            materials: *pointers.add(POINTER_MATERIALS) as usize as *const f64,
            material_count: *header.add(HEADER_MATERIAL_COUNT) as usize,
            environment: Environment {
                sun_direction: read_triple(header, env),
                sun_irradiance: read_triple(header, env + 3),
                sky_zenith: read_triple(header, env + 6),
                sky_horizon: read_triple(header, env + 9),
                sky_ground: read_triple(header, env + 12),
            },
            levels: [
                read_level(header, pointers, 0),
                read_level(header, pointers, if level_count > 1 { 1 } else { 0 }),
            ],
            level_count,
        };
        for i in 0..count as usize {
            probe::update_probe(&scene, target, *indices.add(i) as usize);
        }
    }
}
