interface AuthState {
    isLoggedIn: boolean;
    user: {
        username: string;
    } | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthState>>;
export {};
