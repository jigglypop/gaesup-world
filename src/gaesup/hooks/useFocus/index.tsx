import { useContext } from "react";
import { makeNormalCameraPosition } from "../../camera/control/normal";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function useFocus() {
  const { cameraOption, activeState, block } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const dispatchAsync = async () => {
    dispatch({
      type: "update",
      payload: {
        cameraOption: cameraOption,
      },
    });
  };

  const close = async () => {
    block.control = true;
    block.animation = true;
    dispatch({
      type: "update",
      payload: {
        block: block,
      },
    });
  };

  const open = async () => {
    block.control = false;
    block.animation = false;
    dispatch({
      type: "update",
      payload: {
        block: block,
      },
    });
  };

  const on = async () => {
    cameraOption.focus = true;

    dispatch({
      type: "update",
      payload: {
        cameraOption: cameraOption,
      },
    });
  };

  const off = async () => {
    cameraOption.focus = false;
    dispatch({
      type: "update",
      payload: {
        cameraOption: cameraOption,
      },
    });
  };

  const focus = async ({
    zoom,
    target,
    position,
  }: {
    zoom?: number;
    target: THREE.Vector3;
    position: THREE.Vector3;
  }) => {
    if (zoom) cameraOption.zoom = zoom;
    cameraOption.position.lerp(position, 0.1);
    cameraOption.target.lerp(target, 0.1);
  };

  const free = async ({ zoom }: { zoom?: number }) => {
    if (zoom) cameraOption.zoom = zoom;
    cameraOption.position.lerp(
      makeNormalCameraPosition(activeState, cameraOption),
      0.1
    );
    cameraOption.target.lerp(activeState.position.clone(), 0.1);
  };

  const move = async ({ newPosition }: { newPosition: THREE.Vector3 }) => {
    cameraOption.position.lerp(newPosition.clone(), 0.1);
  };

  const focusOn = async ({
    zoom,
    target,
    position,
  }: {
    zoom?: number;
    target: THREE.Vector3;
    position: THREE.Vector3;
  }) => {
    await close();
    await on();
    await move({ newPosition: position });

    await focus({ zoom, target, position });
    await dispatchAsync();
  };

  const focusOff = async ({ zoom }: { zoom?: number }) => {
    await open();
    await off();
    await move({
      newPosition: makeNormalCameraPosition(activeState, cameraOption),
    });
    await free({ zoom });
    await dispatchAsync();
  };

  return {
    open,
    close,
    on,
    off,
    focus,
    free,
    focusOn,
    focusOff,
  };
}
