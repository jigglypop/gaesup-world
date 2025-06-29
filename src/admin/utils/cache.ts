class Cache {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export default new Cache(); 