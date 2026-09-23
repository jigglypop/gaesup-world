import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { defaultClickNavigationRoute } from '../ClickNavigationRoute';
import { defaultNavigationObstacleRegistry } from '../NavigationObstacleRegistry';
import { NavigationSystem } from '../NavigationSystem';

export function useNavigationSystem() {
  return useGaesupRuntime()?.navigation ?? NavigationSystem.getInstance();
}
export function useClickNavigationRoute() {
  return useGaesupRuntime()?.clickNavigation ?? defaultClickNavigationRoute;
}

export function useNavigationObstacleRegistry() {
  return useGaesupRuntime()?.navigationObstacles ?? defaultNavigationObstacleRegistry;
}
