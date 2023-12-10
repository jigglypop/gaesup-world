import { useControls } from "leva";
import { propType } from "../../controller/type";

export default function initDebug(prop: propType) {
  const debugProps = { ...prop };
  if (prop.debug) {
    debugProps.constant = useControls("constants", {
      jumpSpeed: {
        value: debugProps.constant.jumpSpeed,
        min: 1,
        max: 10,
        step: 0.01,
      },
      turnSpeed: {
        value: debugProps.constant.turnSpeed,
        min: 5,
        max: 30,
        step: 0.01,
      },
      walkSpeed: {
        value: debugProps.constant.walkSpeed,
        min: 1,
        max: 5,
        step: 0.01,
      },
      runSpeed: {
        value: debugProps.constant.runSpeed,
        min: 1,
        max: 5,
        step: 0.01,
      },
      accelRate: {
        value: debugProps.constant.accelRate,
        min: 1,
        max: 10,
        step: 0.01,
      },
      brakeRate: {
        value: debugProps.constant.brakeRate,
        min: 1,
        max: 10,
        step: 0.01,
      },
      wheelOffset: {
        value: debugProps.constant.wheelOffset,
        min: 0,
        max: 1,
        step: 0.01,
      },
      linearDamping: {
        value: debugProps.constant.linearDamping,
        min: 0,
        max: 1,
        step: 0.01,
      },
      cameraInitDistance: {
        value: debugProps.constant.cameraInitDistance,
        min: 1,
        max: 10,
        step: 0.01,
      },
      cameraMaxDistance: {
        value: debugProps.constant.cameraMaxDistance,
        min: 1,
        max: 10,
        step: 0.01,
      },
      cameraMinDistance: {
        value: debugProps.constant.cameraMinDistance,
        min: 1,
        max: 10,
        step: 0.01,
      },
      cameraInitDirection: {
        value: debugProps.constant.cameraInitDirection,
        min: 1,
        max: 10,
        step: 0.01,
      },
      cameraCollisionOff: {
        value: debugProps.constant.cameraCollisionOff,
        min: 1,
        max: 10,
        step: 0.01,
      },
      cameraDistance: {
        value: debugProps.constant.cameraDistance,
        min: 1,
        max: 10,
        step: 0.01,
      },
      cameraCamFollow: {
        value: debugProps.constant.cameraCamFollow,
        min: 1,
        max: 10,
        step: 0.01,
      },
    });
  }

  return { ...debugProps };
}
