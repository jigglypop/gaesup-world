/// <reference types="react" />
import "./style.css";
export type zoomButtonPropsType = {
    children?: React.ReactNode;
    position: THREE.Vector3;
    target?: THREE.Vector3;
    keepBlocking?: boolean;
    zoomButtonStyle?: React.CSSProperties;
};
export declare function useZoom(): {
    setZoom: (position: THREE.Vector3, isZoom: boolean) => Promise<void>;
    openCamera: () => Promise<void>;
    closeCamera: (position: THREE.Vector3) => Promise<void>;
    isZoom: boolean;
    setIsZoom: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    moveToCamera: () => Promise<void>;
};
export declare function ZoomButton(props: zoomButtonPropsType): import("react/jsx-runtime").JSX.Element;
