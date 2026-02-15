import { ReactNode } from "react";

export interface GaesupAdminProps {
    children?: ReactNode;
    /**
     * When true, shows the login page until authenticated.
     * Default is false (no login gate).
     */
    requireLogin?: boolean;
}
