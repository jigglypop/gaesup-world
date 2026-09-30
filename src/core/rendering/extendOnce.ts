import { extend } from '@react-three/fiber';

/** R3F catalogue registration moved from import to first use: call the result where the elements render. */
export function extendOnce(objects: Parameters<typeof extend>[0]): () => void {
  let extended = false;
  return () => {
    if (extended) return;
    extended = true;
    extend(objects);
  };
}
