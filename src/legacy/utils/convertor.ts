import { n3 } from "@store/update/type";
import { Elr, V3 } from "gaesup-world";
import * as THREE from "three";

export const convertN3 = (v3: THREE.Vector3 | THREE.Euler | n3): n3 => {
  if (v3 instanceof THREE.Vector3) return [v3.x, v3.y, v3.z];
  else if (v3 instanceof THREE.Euler) return [v3.x, v3.y, v3.z];
  else return v3;
};

export const convertV3 = (_n3: THREE.Vector3 | n3): THREE.Vector3 => {
  if (_n3 instanceof THREE.Vector3) return _n3;
  else return V3(_n3[0], _n3[1], _n3[2]);
};

export const convertElr = (_n3: THREE.Euler | n3): THREE.Euler => {
  if (_n3 instanceof THREE.Euler) return _n3;
  else return Elr(_n3[0], _n3[1], _n3[2]);
};
