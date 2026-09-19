import { forwardRef, useEffect, useImperativeHandle, useRef, type HTMLAttributes } from 'react';

import { useWorldInputScope } from './useWorldInputScope';

/** DOM boundary for a world's canvas, controls and overlays. Nested worlds take precedence. */
export const WorldInputSurface = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function WorldInputSurface({ children, tabIndex = 0, ...props }, forwardedRef) {
  const scope = useWorldInputScope(); const ref = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => ref.current!, []);
  useEffect(() => ref.current ? scope.registerSurface(ref.current) : undefined, [scope]);
  return <div {...props} tabIndex={tabIndex} ref={ref}>{children}</div>;
});
