import { ReactNode } from "react";

export interface GaesupAdminProps {
    children?: ReactNode;
    /**
     * When true, shows the login page until the server confirms the session.
     * Default is true to keep admin routes protected by default.
     */
    requireLogin?: boolean;
    /** Any one of these server-issued roles is required to see the children. */
    requiredRoles?: readonly string[];
}
