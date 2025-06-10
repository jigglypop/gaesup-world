const cache = {
  get(key: string) {
    if (typeof window !== "undefined") {
      const result = localStorage.getItem(key);
      if (result) {
        const data = JSON.parse(result);
        return data;
      } else {
        return null;
      }
    }
  },
  set(key: string, data: Record<string, unknown> | string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  },
  remove(key: string) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },
};

export default cache;
