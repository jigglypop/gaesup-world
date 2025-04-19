'use client';

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
} from './context';
import initGaesupWorld from './initalize';
import { gaesupWorldPropsType } from './type';

export function GaesupWorld(props: gaesupWorldPropsType) {
  const { gaesupProps } = initGaesupWorld(props);
  const { value } = gaesupProps;

  return (
    <GaesupWorldDispatchContext.Provider value={gaesupProps.dispatch}>
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
                                {props.children}
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
