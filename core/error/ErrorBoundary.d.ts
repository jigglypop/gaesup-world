import { Component, ReactNode, ErrorInfo } from 'react';
type ErrorContext = object | string | number | boolean | null | undefined;
declare global {
    interface Window {
        Sentry?: {
            captureException: (err: Error, context?: ErrorContext) => void;
        };
    }
}
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
    context?: ErrorContext;
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
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react").JSX.Element | null | undefined;
}
export declare function createGaesupError(type: ErrorType, code: string, message: string, context?: ErrorContext, recoverable?: boolean): GaesupError;
export {};
