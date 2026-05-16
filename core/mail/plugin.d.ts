import type { MailSerialized } from './types';
export interface MailPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeMailState(): MailSerialized;
export declare function hydrateMailState(data: MailSerialized | null | undefined): void;
export declare function createMailPlugin(options?: MailPluginOptions): import("..").GaesupPlugin;
export declare const mailPlugin: import("..").GaesupPlugin;
