'use client';

import React, {
  useRef,
  isValidElement,
  cloneElement,
  Children,
  ReactElement,
  JSXElementConstructor,
} from 'react';
import {
  ActiveStateContext,
  AnimationStateContext,
  BlockContext,
  CameraOptionContext,
  ClickerContext,
  ControlContext,
  GaesupWorldContext,
  GaesupWorldDispatchContext,
  MinimapContext,
  ModeContext,
  RideableContext,
  SizesContext,
  StatesContext,
  UrlsContext,
  gaesupWorldDefault,
} from './context';
import initGaesupWorld from './initalize';
import { gaesupWorldPropsType } from './type';
import { RootState } from '@react-three/fiber';
import Camera, { CameraUpdater } from './camera';

export function GaesupWorld(props: gaesupWorldPropsType) {
  const { gaesupProps } = initGaesupWorld(props);
  const { value } = gaesupProps;
  const stateRef = useRef<RootState>(null);

  const controllerContext = {
    airplane: { ...gaesupWorldDefault.mode },
    vehicle: { ...gaesupWorldDefault.mode },
    character: { ...gaesupWorldDefault.mode },
    controllerOptions: {
      lerp: {
        cameraTurn: 0.1,
        cameraPosition: 0.1,
      },
    },
  };

  const isCanvasComponent = (
    component: React.ReactNode,
  ): component is ReactElement<any, string | JSXElementConstructor<any>> => {
    if (!isValidElement(component)) return false;
    const type = component.type;
    if (typeof type === 'function') {
      return type.name === 'Canvas' || (type as any).displayName === 'Canvas';
    }

    return false;
  };

  return (
    <GaesupWorldDispatchContext.Provider value={gaesupProps.dispatch as any}>
      <GaesupWorldContext.Provider value={value}>
        <ActiveStateContext.Provider value={value.activeState}>
          <ModeContext.Provider value={value.mode}>
            <UrlsContext.Provider value={value.urls}>
              <StatesContext.Provider value={value.states}>
                <MinimapContext.Provider value={value.minimap}>
                  <ControlContext.Provider value={value.control}>
                    <AnimationStateContext.Provider value={value.animationState}>
                      <CameraOptionContext.Provider value={value.cameraOption}>
                        <ClickerContext.Provider value={value.clicker}>
                          <RideableContext.Provider value={value.rideable}>
                            <SizesContext.Provider value={value.sizes}>
                              <BlockContext.Provider value={value.block}>
                                <Camera
                                  state={stateRef.current}
                                  worldContext={value}
                                  controllerContext={controllerContext}
                                  controllerOptions={controllerContext.controllerOptions}
                                >
                                  {Children.map(props.children, (child) => {
                                    if (isCanvasComponent(child)) {
                                      return cloneElement(child, {}, [
                                        <CameraUpdater
                                          key="camera-updater"
                                          controllerOptions={controllerContext.controllerOptions}
                                        />,
                                        ...(child.props.children
                                          ? Children.toArray(child.props.children)
                                          : []),
                                      ]);
                                    }
                                    return child;
                                  })}
                                </Camera>
                              </BlockContext.Provider>
                            </SizesContext.Provider>
                          </RideableContext.Provider>
                        </ClickerContext.Provider>
                      </CameraOptionContext.Provider>
                    </AnimationStateContext.Provider>
                  </ControlContext.Provider>
                </MinimapContext.Provider>
              </StatesContext.Provider>
            </UrlsContext.Provider>
          </ModeContext.Provider>
        </ActiveStateContext.Provider>
      </GaesupWorldContext.Provider>
    </GaesupWorldDispatchContext.Provider>
  );
}
