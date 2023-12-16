export const airplaneDebugMap = {
  angleDelta: {
    value: {
      x: 0.01,
      y: 0.005,
      z: 0.005,
    },
    x: {
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
    y: {
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
    z: {
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
  },
  maxAngle: {
    value: {
      x: 0.1,
      y: 0.1,
      z: 0.1,
    },
    x: {
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
    y: {
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
    z: {
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
  },
  maxSpeed: {
    min: 50,
    max: 100,
    step: 0.01,
  },
  accelRatio: {
    min: 1,
    max: 10,
    step: 0.01,
  },
  brakeRatio: {
    min: 1,
    max: 20,
    step: 0.01,
  },
  buoyancy: {
    min: 0.1,
    max: 1,
    step: 0.01,
  },
  linearDamping: {
    min: 0,
    max: 1,
    step: 0.01,
  },
};
