export const getRole = (roles: string[]): number => {
  if (roles.includes('admin')) return 2;
  if (roles.includes('manager')) return 1;
  return 0;
};

export const hasRole = (userRoles: string[], requiredRole: string): boolean => {
  return userRoles.includes(requiredRole);
};

export const hasMinimumRole = (userRoles: string[], minimumLevel: number): boolean => {
  const userLevel = getRole(userRoles);
  return userLevel >= minimumLevel;
}; 