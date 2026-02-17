mod noise;
mod matrix;
mod vector;
mod spatial;

// Shared allocator for JS<->WASM memory transfer.
#[no_mangle]
pub extern "C" fn alloc_f32(len: usize) -> *mut f32 {
    let mut buf = Vec::<f32>::with_capacity(len);
    let ptr = buf.as_mut_ptr();
    core::mem::forget(buf);
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

// Re-export all public functions from submodules.
pub use noise::*;
pub use matrix::*;
pub use vector::*;
pub use spatial::*;
