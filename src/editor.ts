import 'reflect-metadata';
import { initializeBridges } from './core/initializeBridges';

initializeBridges();

export * from './core/editor';
export * from './core/building';
export * from './core/content';
