const cache = {
  get<T>(key: string): T | null {
    if (typeof window !== 'undefined') {
      const result = localStorage.getItem(key);
      if (result) {
        try {
          return JSON.parse(result) as T;
        } catch (e) {
          console.error('Error parsing cached data:', e);
          return null;
        }
      }
    }
    return null;
  },
  set<T>(key: string, data: T): void {
    if (typeof window !== 'undefined') {
      try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
      } catch (e) {
        console.error('Error serializing data for cache:', e);
      }
    }
  },
  remove(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

export default cache; 