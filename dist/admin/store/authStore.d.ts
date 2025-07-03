interface ModalState {
    on: boolean;
    type: string;
    file: number;
    username: string;
    gltf_url: string;
}
interface AuthState {
    isLoggedIn: boolean;
    user: {
        username: string;
    } | null;
    loading: boolean;
    modal: ModalState;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setModal: (modal: ModalState) => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AuthState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AuthState, {
            isLoggedIn: boolean;
            user: {
                username: string;
            } | null;
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AuthState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthState, {
            isLoggedIn: boolean;
            user: {
                username: string;
            } | null;
        }>>;
    };
}>;
export {};
