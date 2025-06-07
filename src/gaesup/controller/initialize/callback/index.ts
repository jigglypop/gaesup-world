import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { initCallbackType } from './type';

const initCallback = ({ props, actions, componentType }: initCallbackType) => {
  const { animations } = useGLTF(props.url);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    if (props.onLoad && animations) {
      props.onLoad({
        ...props,
        animations,
        actions,
      });
    }
    isInitialized.current = true;
  }, [props, actions, animations, componentType]);

  return null;
};

export default initCallback;
