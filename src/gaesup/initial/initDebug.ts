import { propType } from '@gaesup/type';
import { useControls } from 'leva';

export default function initDebug(prop: propType) {
  /**
   * Debug settings
   */
  const debugProps = { ...prop };
  // Character jumpConst
  if (prop.options.debug) {
    debugProps.constant = useControls('constants', {
      jumpSpeed: {
        value: debugProps.constant.jumpSpeed,
        min: 1,
        max: 10,
        step: 0.01
      },
      jumpAccelY: {
        value: debugProps.constant.jumpAccelY,
        min: 0,
        max: 80,
        step: 0.01
      },
      turnSpeed: {
        value: debugProps.constant.turnSpeed,
        min: 5,
        max: 30,
        step: 0.01
      },
      rejectSpeed: {
        value: debugProps.constant.rejectSpeed,
        min: 0,
        max: 10,
        step: 0.01
      },
      splintSpeed: {
        value: debugProps.constant.splintSpeed,
        min: 1,
        max: 5,
        step: 0.01
      },
      runRate: {
        value: debugProps.constant.runRate,
        min: 1,
        max: 10,
        step: 0.01
      },
      dT: {
        value: debugProps.constant.dT,
        min: 1,
        max: 100,
        step: 0.01
      },
      reconsil: {
        value: debugProps.constant.reconsil,
        min: 0,
        max: 1,
        step: 0.01
      },
      rotational: {
        value: debugProps.constant.rotational,
        min: 0,
        max: 1,
        step: 0.01
      },
      vertical: {
        value: debugProps.constant.vertical,
        min: 0,
        max: 1,
        step: 0.01
      },
      airDamping: {
        value: debugProps.constant.airDamping,
        min: 0,
        max: 1,
        step: 0.01
      },
      springConstant: {
        value: debugProps.constant.springConstant,
        min: 1,
        max: 10,
        step: 0.01
      },
      cameraInitDistance: {
        value: debugProps.constant.cameraInitDistance,
        min: 1,
        max: 10,
        step: 0.01
      },
      cameraMaxDistance: {
        value: debugProps.constant.cameraMaxDistance,
        min: 1,
        max: 10,
        step: 0.01
      },
      cameraMinDistance: {
        value: debugProps.constant.cameraMinDistance,
        min: 1,
        max: 10,
        step: 0.01
      },
      cameraInitDirection: {
        value: debugProps.constant.cameraInitDirection,
        min: 1,
        max: 10,
        step: 0.01
      },
      cameraCollisionOff: {
        value: debugProps.constant.cameraCollisionOff,
        min: 1,
        max: 10,
        step: 0.01
      },
      cameraDistance: {
        value: debugProps.constant.cameraDistance,
        min: 1,
        max: 10,
        step: 0.01
      },
      cameraCamFollow: {
        value: debugProps.constant.cameraCamFollow,
        min: 1,
        max: 10,
        step: 0.01
      }
    });
  }

  return { ...debugProps };
}
