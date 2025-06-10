export type loginFormType = {
  email: string;
  password: string;
};

export type registerFormType = loginFormType;
export type userType = {
  id: number;
  name: string;
  email: string;
  roles: {
    role: "ROLE_ADMIN" | "ROLE_MANAGER" | "ROLE_USER";
  }[];
};
