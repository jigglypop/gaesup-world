import { ReactNode } from "react";

export interface GaesupAdminProps {
    children?: ReactNode;
    /**
     * When true, shows the login page until authenticated.
     * Default is true to keep admin routes protected by default.
     */
    requireLogin?: boolean;
}
