import { RigidBodyTypeString } from '@react-three/rapier';
import * as THREE from 'three';
import { controllerInnerType, refsType } from '../../../../controller/type';
import { controllerOptionsType } from '../../../controller/type';
import { ResourceUrlsType } from '../../../types';
import { ReactNode } from 'react';
import { GroupProps } from '@react-three/fiber';
import { characterType } from '../../../types/core';
import { ControllerOtherPropType } from '../../../types';

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
