import { ReactNode } from "react";

export interface GaesupComponentProps {
  children?: ReactNode;
  [key: string]: unknown;
}
