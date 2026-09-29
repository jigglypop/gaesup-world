#!/bin/bash
# Build gaesup_gi for WebAssembly.
# Requires: rustup target add wasm32-unknown-unknown
#
# Usage: bash src/core/gi/wasm/build.sh
# Output: public/wasm/gaesup_gi.wasm

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)/public/wasm"

mkdir -p "$OUT_DIR"

RUSTFLAGS="-C target-feature=+simd128" \
  cargo build \
    --manifest-path "$SCRIPT_DIR/Cargo.toml" \
    --target wasm32-unknown-unknown \
    --release

cp "$SCRIPT_DIR/target/wasm32-unknown-unknown/release/gaesup_gi.wasm" "$OUT_DIR/gaesup_gi.wasm"

if command -v wasm-opt &> /dev/null; then
  wasm-opt -O3 "$OUT_DIR/gaesup_gi.wasm" -o "$OUT_DIR/gaesup_gi.wasm"
  echo "wasm-opt applied."
fi

echo "Built: $OUT_DIR/gaesup_gi.wasm"
ls -lh "$OUT_DIR/gaesup_gi.wasm"
