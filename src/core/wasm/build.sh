#!/bin/bash
# Build gaesup_core_wasm for WebAssembly.
# Requires: rustup target add wasm32-unknown-unknown
#
# Usage: bash src/core/wasm/build.sh
# Output: public/wasm/gaesup_core.wasm

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)/public/wasm"

mkdir -p "$OUT_DIR"

# Build with SIMD support for maximum performance.
RUSTFLAGS="-C target-feature=+simd128" \
  cargo build \
    --manifest-path "$SCRIPT_DIR/Cargo.toml" \
    --target wasm32-unknown-unknown \
    --release

# Copy the output.
cp "$SCRIPT_DIR/target/wasm32-unknown-unknown/release/gaesup_core_wasm.wasm" "$OUT_DIR/gaesup_core.wasm"

# Optional: strip debug info for smaller binary.
if command -v wasm-opt &> /dev/null; then
  wasm-opt -O3 "$OUT_DIR/gaesup_core.wasm" -o "$OUT_DIR/gaesup_core.wasm"
  echo "wasm-opt applied."
fi

echo "Built: $OUT_DIR/gaesup_core.wasm"
ls -lh "$OUT_DIR/gaesup_core.wasm"
