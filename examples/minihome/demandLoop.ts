type FrameSource = { request: (callback: (time: number) => void) => number; cancel: (id: number) => void };

/** No RAF remains scheduled once movement/damping and invalidations have settled. */
export function createDemandLoop(draw: (time: number) => boolean, source: FrameSource = {
  request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id),
}) {
  let pending: number | undefined; let active = true; let disposed = false;
  const invalidate = () => {
    if (disposed || !active || pending !== undefined) return;
    pending = source.request(time => { pending = undefined; if (!disposed && active && draw(time)) invalidate(); });
  };
  return {
    invalidate,
    get pending() { return pending !== undefined; },
    setActive(value: boolean) {
      active = value;
      if (!value && pending !== undefined) { source.cancel(pending); pending = undefined; }
      if (value) invalidate();
    },
    dispose() { disposed = true; if (pending !== undefined) source.cancel(pending); pending = undefined; },
  };
}
