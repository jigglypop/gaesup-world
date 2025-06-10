export const getRole = (
  roles: {
    role: "ROLE_ADMIN" | "ROLE_MANAGER" | "ROLE_USER";
  }[]
): 0 | 1 | 2 => {
  if (!roles) return 0;
  if (roles.map((role) => role.role).includes("ROLE_ADMIN")) {
    return 2;
  } else if (roles.map((role) => role.role).includes("ROLE_MANAGER")) {
    return 1;
  }
  return 0;
};
