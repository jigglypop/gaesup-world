import { useControls } from "leva";

interface constantType {
  [key: string]: number;
}

type changeDebugMapType<T> = {
  [K in keyof T]: {
    value: number;
    min: number;
    max: number;
    step: number;
  };
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
    props.debugMap = Object.keys(props.debugProps).reduce(
      (map, key) => {
        map[key].value = props.debugProps[key];
        return map;
      },
      { ...debugMap }
    );
    props.debugProps = useControls(tag, { ...props.debugMap }) as unknown as T;
  }
  return props.debugProps;
}
