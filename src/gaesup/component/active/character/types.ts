import { RigidBodyTypeString } from '@react-three/rapier';
import * as THREE from 'three';
import { controllerInnerType, refsType } from '../../../../controller/type';
import { controllerOptionsType } from '../../../controller/type';
import { ResourceUrlsType } from '../../../atoms';
import { ReactNode } from 'react';

export type activeCharacterPropsType = {
  characterUrl: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  controllerOptions?: controllerOptionsType;
  currentAnimation?: string;
  children?: React.ReactNode;
  rigidbodyType?: RigidBodyTypeString;
};

export type CharacterRefProps = {
  children: ReactNode;
  props: controllerInnerType;
  refs: refsType;
  urls: ResourceUrlsType;
};
