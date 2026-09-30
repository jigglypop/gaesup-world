export declare const ROOT: string;
export declare function resolveSpecifier(from: string, specifier: string): string | null;
export declare function collectRuntimeImports(file: string): string[];
export declare function walkRuntimeImports(entry: string, visit?: (specifier: string, file: string, parents: Map<string, string | null>) => boolean | void): Map<string, string | null>;
export declare function importChain(parents: Map<string, string | null>, file: string): string[];
