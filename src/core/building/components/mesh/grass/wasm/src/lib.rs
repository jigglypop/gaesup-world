use std::f32::consts::PI;

#[inline]
fn xorshift32(state: &mut u32) -> u32 {
  let mut x = *state;
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  *state = x;
  x
}

#[inline]
fn rand01(state: &mut u32) -> f32 {
  // Uniform in [0, 1).
  // Use the upper 24 bits to match typical JS float granularity better.
  let x = xorshift32(state) >> 8;
  (x as f32) * (1.0 / 16_777_216.0) // 2^24
}

#[no_mangle]
pub extern "C" fn alloc_f32(len: usize) -> *mut f32 {
  let mut buf = Vec::<f32>::with_capacity(len);
  let ptr = buf.as_mut_ptr();
  std::mem::forget(buf);
  ptr
}

#[no_mangle]
pub extern "C" fn dealloc_f32(ptr: *mut f32, len: usize) {
  if ptr.is_null() || len == 0 {
    return;
  }
  unsafe {
    let _ = Vec::<f32>::from_raw_parts(ptr, 0, len);
  }
}

/// Fills:
/// - orientations: len = instances * 4 (x,y,z,w)
/// - stretches: len = instances
/// - half_root_angle_sin: len = instances
/// - half_root_angle_cos: len = instances
///
/// The distribution matches the original JS logic:
/// - angle = PI - rand() * (PI / 6)
/// - tilt  = rand() * (PI / 8)
/// - stretch = 0.8 + rand() * 0.2
#[no_mangle]
pub extern "C" fn fill_orientation_data(
  instances: usize,
  seed: u32,
  orientations_ptr: *mut f32,
  stretches_ptr: *mut f32,
  half_root_angle_sin_ptr: *mut f32,
  half_root_angle_cos_ptr: *mut f32,
) {
  if instances == 0 {
    return;
  }
  if orientations_ptr.is_null()
    || stretches_ptr.is_null()
    || half_root_angle_sin_ptr.is_null()
    || half_root_angle_cos_ptr.is_null()
  {
    return;
  }

  let orientations_len = instances * 4;
  let orientations = unsafe { std::slice::from_raw_parts_mut(orientations_ptr, orientations_len) };
  let stretches = unsafe { std::slice::from_raw_parts_mut(stretches_ptr, instances) };
  let half_sin = unsafe { std::slice::from_raw_parts_mut(half_root_angle_sin_ptr, instances) };
  let half_cos = unsafe { std::slice::from_raw_parts_mut(half_root_angle_cos_ptr, instances) };

  let mut st = if seed == 0 { 0x1234_5678 } else { seed };
  let max_angle_delta = PI / 6.0;
  let max_tilt = PI / 8.0;

  for idx in 0..instances {
    let r1 = rand01(&mut st);
    let r2 = rand01(&mut st);
    let r3 = rand01(&mut st);

    let angle = PI - r1 * max_angle_delta;
    let half = 0.5 * angle;
    let sz = half.sin();
    let cz = half.cos();

    let tilt = r2 * max_tilt;
    let half_tilt = 0.5 * tilt;
    let sx = half_tilt.sin();
    let cx = half_tilt.cos();

    // q = qz * qx (Three.js multiply order).
    // qz = (0,0,sz,cz), qx = (sx,0,0,cx)
    let qxv = cz * sx;
    let qyv = sz * sx;
    let qzv = sz * cx;
    let qwv = cz * cx;

    let j = idx * 4;
    orientations[j] = qxv;
    orientations[j + 1] = qyv;
    orientations[j + 2] = qzv;
    orientations[j + 3] = qwv;

    half_sin[idx] = sz;
    half_cos[idx] = cz;

    stretches[idx] = 0.8 + r3 * 0.2;
  }
}

