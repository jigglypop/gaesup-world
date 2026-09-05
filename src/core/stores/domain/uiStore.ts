import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { ModeSlice, UrlsSlice, SizesSlice, PerformanceState } from '../slices';
import { createModeSlice, createUrlsSlice, createSizesSlice, createPerformanceSlice } from '../slices';

export type UIStore = ModeSlice & UrlsSlice & SizesSlice & PerformanceState;

export const useUIStore = create<UIStore>()(
  devtools(
    (...a) => ({
      ...createModeSlice(...a),
      ...createUrlsSlice(...a),
      ...createSizesSlice(...a),
      ...createPerformanceSlice(...a),
    }),
    { name: 'ui-store' }
  )
); 