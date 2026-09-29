import { resolveWasmUrl } from '../../wasm/loader';
import type { GiWasmExports } from '../types';

const GI_WASM_FILE = 'gaesup_gi.wasm';

let modulePromise: Promise<WebAssembly.Module | null> | null = null;

function isGiWasmExports(
  exports: WebAssembly.Exports,
): exports is WebAssembly.Exports & GiWasmExports {
  return (
    exports['memory'] instanceof WebAssembly.Memory &&
    typeof exports['alloc_f32'] === 'function' &&
    typeof exports['alloc_f64'] === 'function' &&
    typeof exports['alloc_u8'] === 'function' &&
    typeof exports['alloc_u32'] === 'function' &&
    typeof exports['gi_update_probes'] === 'function'
  );
}

/**
 * GI 프로브 갱신 커널 모듈을 한 번만 받아 컴파일한다. 받을 수 없으면 null이며 호출자는 JS 경로를 쓴다.
 */
export function loadGiWasmModule(): Promise<WebAssembly.Module | null> {
  if (typeof WebAssembly === 'undefined' || typeof fetch === 'undefined')
    return Promise.resolve(null);
  modulePromise ??= (async () => {
    try {
      const response = await fetch(resolveWasmUrl(GI_WASM_FILE));
      if (!response.ok) return null;
      return await WebAssembly.compile(await response.arrayBuffer());
    } catch {
      return null;
    }
  })();
  return modulePromise;
}

/**
 * 캐스케이드마다 독립된 인스턴스를 만든다. 인스턴스 메모리는 캐스케이드와 함께 가비지 수집되므로 해제 호출이 없다.
 */
export async function instantiateGiWasm(
  source: WebAssembly.Module | BufferSource,
): Promise<GiWasmExports | null> {
  try {
    const instance =
      source instanceof WebAssembly.Module
        ? await WebAssembly.instantiate(source, {})
        : (await WebAssembly.instantiate(source, {})).instance;
    return isGiWasmExports(instance.exports) ? instance.exports : null;
  } catch {
    return null;
  }
}
