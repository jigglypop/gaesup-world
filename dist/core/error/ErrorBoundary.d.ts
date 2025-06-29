import { Component, ReactNode, ErrorInfo } from 'react';
export declare enum ErrorType {
    PHYSICS = "PHYSICS",
    RENDER = "RENDER",
    INPUT = "INPUT",
    NETWORK = "NETWORK",
    RESOURCE = "RESOURCE",
    STATE = "STATE"
}
export interface GaesupError extends Error {
    type: ErrorType;
    code: string;
    context?: unknown;
    recoverable: boolean;
}
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}
interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
export declare class GaesupErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState;
    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState>;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    private reportError;
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react/jsx-runtime").JSX.Element | null | undefined;
}
export declare function createGaesupError(type: ErrorType, code: string, message: string, context?: unknown, recoverable?: boolean): GaesupError;
export {};
