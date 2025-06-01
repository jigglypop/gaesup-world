import { useContext } from "react";
import { useAtom } from "jotai";
import * as THREE from "three";
import { makeNormalCameraPosition } from "../../camera/control/normal";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { cameraOptionAtom, blockAtom } from "../../atoms";

export function useFocus() {
  const { activeState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const [cameraOption, setCameraOption] = useAtom(cameraOptionAtom);
  const [block, setBlock] = useAtom(blockAtom);

  const close = async () => {
    setBlock(prev => ({
      ...prev,
      control: true,
      animation: true,
    }));
  };

  const open = async () => {
    setBlock(prev => ({
      ...prev,
      control: false,
      animation: false,
    }));
  };

  const on = async () => {
    setCameraOption(prev => ({
      ...prev,
      focus: true,
    }));
  };

  const off = async () => {
    setCameraOption(prev => ({
      ...prev,
      focus: false,
    }));
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
    setCameraOption(prev => {
      const updated = { ...prev };
      if (zoom) updated.zoom = zoom;
      updated.position.lerp(position, 0.1);
      updated.target.lerp(target, 0.1);
      return updated;
    });
  };

  const free = async ({ zoom }: { zoom?: number }) => {
    setCameraOption(prev => {
      const updated = { ...prev };
      if (zoom) updated.zoom = zoom;
      updated.position.lerp(
        makeNormalCameraPosition(activeState, cameraOption),
        0.1
      );
      updated.target.lerp(activeState.position.clone(), 0.1);
      return updated;
    });
  };

  const move = async ({ newPosition }: { newPosition: THREE.Vector3 }) => {
    setCameraOption(prev => {
      const updated = { ...prev };
      updated.position.lerp(newPosition.clone(), 0.1);
      return updated;
    });
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
  };

  const focusOff = async ({ zoom }: { zoom?: number }) => {
    await open();
    await off();
    await move({
      newPosition: makeNormalCameraPosition(activeState, cameraOption),
    });
    await free({ zoom });
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
