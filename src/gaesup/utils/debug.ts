import { useControls } from "leva";
import * as THREE from "three";

type valueType =
  | string
  | boolean
  | number
  | THREE.Vector3
  | THREE.Quaternion
  | THREE.Euler;

type constantType = {
  [key: string]: valueType;
};

type changeDebugMapItem = {
  min: number;
  max: number;
  step: number;
};

type chagneDebugVectorMapItem = {
  x: changeDebugMapItem;
  y: changeDebugMapItem;
  z: changeDebugMapItem;
};

type changeDebugOptionItem = {
  options: string[];
};

type changeDebugMapType<T> = {
  [K in keyof T]:
    | changeDebugMapItem
    | chagneDebugVectorMapItem
    | changeDebugOptionItem;
};

type resultMap<T> = {
  [K in keyof T]: {
    value: valueType;
  } & (changeDebugMapItem | changeDebugOptionItem);
};

export type debugPropType<T extends constantType> = {
  debug: boolean;
  tag: string;
  debugProps: T;
} & {
  debugMap: changeDebugMapType<T>;
};
export default function debug<T extends constantType>(props: debugPropType<T>) {
  const { debug, tag, debugMap } = props;

  if (debug) {
    const resultMap: resultMap<constantType> = Object.keys(
      props.debugProps
    ).reduce<resultMap<constantType>>((map, key) => {
      if (key in debugMap) {
        const debugMapItem = debugMap[key];
        if ("max" in debugMapItem) {
          map[key] = { value: props.debugProps[key], ...debugMapItem };
        } else if ("options" in debugMapItem) {
          map[key] = {
            value: props.debugProps[key],
            ...debugMapItem,
          };
        } else {
          map[key] = {
            value: props.debugProps[key],
            ...debugMapItem.x,
            ...debugMapItem.y,
            ...debugMapItem.z,
          };
        }
      }
      return map;
    }, {});
    props.debugProps = useControls(
      tag,
      {
        ...resultMap,
      },
      {
        collapsed: true,
      }
    ) as unknown as T;
  }
  return props.debugProps;
}
