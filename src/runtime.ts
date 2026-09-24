import 'reflect-metadata';
import { initializeBridges } from './core/initializeBridges';

initializeBridges();

export * from './core/runtime';
export * from './core/world';
export * from './core/save';
