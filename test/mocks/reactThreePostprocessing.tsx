import { createElement, type ReactNode } from 'react';

type MockPostprocessingProps = {
  children?: ReactNode;
};

function createMockPostprocessingComponent(name: string) {
  return function MockPostprocessingComponent({ children }: MockPostprocessingProps) {
    return createElement('mock-postprocessing', { 'data-name': name }, children);
  };
}

export const BrightnessContrast = createMockPostprocessingComponent('BrightnessContrast');
export const EffectComposer = createMockPostprocessingComponent('EffectComposer');
export const HueSaturation = createMockPostprocessingComponent('HueSaturation');
export const LUT = createMockPostprocessingComponent('LUT');
export const Outline = createMockPostprocessingComponent('Outline');
export const Select = createMockPostprocessingComponent('Select');
export const Selection = createMockPostprocessingComponent('Selection');
export const ToneMapping = createMockPostprocessingComponent('ToneMapping');
export const Vignette = createMockPostprocessingComponent('Vignette');
