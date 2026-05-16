import { userType } from "./types";
export declare const useCheck: () => {
    user: userType | null;
    isUserError: boolean;
    isUserLoading: boolean;
    isUserSuccess: boolean;
    onLogout: () => Promise<void>;
};
export declare function RequireLogin({ children }: {
    children: React.ReactNode;
}): import("react").JSX.Element | null;
export declare function RequireAdmin({ children }: {
    children: React.ReactNode;
}): import("react").JSX.Element | null;
export declare function RequireManager({ children }: {
    children: React.ReactNode;
}): import("react").JSX.Element | null;
export default function Check({ children }: {
    children: React.ReactNode;
}): import("react").JSX.Element;
