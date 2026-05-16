import { loginFormType, registerFormType, userType } from "../store/types";
declare global {
    var __GAESUP_SERVER_URL__: string | undefined;
}
export declare const tokenAsync: () => Promise<string | null>;
export declare const checkApi: () => Promise<userType>;
export declare const loginApi: (loginForm: loginFormType) => Promise<userType>;
export declare const registerApi: (registerForm: registerFormType) => Promise<userType>;
