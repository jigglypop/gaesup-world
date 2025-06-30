import { ExampleConfig } from './types';

export const S3 = 'https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/gltf';
export const CHARACTER_URL = 'gltf/ally_body.glb';
export const AIRPLANE_URL = S3 + '/gaebird.glb';
export const VEHICLE_URL = S3 + '/gorani.glb';

export const EXAMPLE_CONFIG: ExampleConfig = {
  editor: {
    enabled: true,
    defaultLayout: 'full',
    panels: {
      hierarchy: true,
      inspector: true,
      assetBrowser: true,
      nodeEditor: true,
    }
  },
  debug: false,
  showPerformance: true,
  showGrid: false,
  showAxes: false,
};
