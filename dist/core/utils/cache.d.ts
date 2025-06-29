declare const cache: {
    get<T>(key: string): T | null;
    set<T>(key: string, data: T): void;
    remove(key: string): void;
};
export default cache;
