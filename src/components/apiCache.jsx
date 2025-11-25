const cache = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000;

const apiCache = {
  get(key) {
    if (!cache.has(key)) {
      return null;
    }
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp > CACHE_DURATION_MS) {
      cache.delete(key);
      return null;
    }
    return data;
  },

  set(key, data) {
    if (!key || !data) return;
    cache.set(key, { data, timestamp: Date.now() });
  },
  
  has(key) {
    return cache.has(key) && this.get(key) !== null;
  },
  
  invalidate(key) {
    if (typeof key === 'string') {
      cache.delete(key);
    } else if (key instanceof RegExp) {
      for (const k of cache.keys()) {
        if (key.test(k)) {
          cache.delete(k);
        }
      }
    }
  },

  clear() {
    cache.clear();
  },

  pendingRequests: new Map(),
  lastRequestTime: 0,
  
  async throttledRequest(key, requestFn, delay = 3000) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }
    
    const cached = this.get(key);
    if (cached) {
      return cached;
    }
    
    const requestPromise = new Promise(async (resolve, reject) => {
      try {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minDelay = 2000;
        
        if (timeSinceLastRequest < minDelay) {
          await new Promise(r => setTimeout(r, minDelay - timeSinceLastRequest));
        }
        
        this.lastRequestTime = Date.now();
        const result = await requestFn();
        this.set(key, result);
        resolve(result);
      } catch (error) {
        if (error.response?.status === 401 || error.status === 401) {
          reject(error);
          return;
        }
        
        console.error(`Error in ${key}:`, error.message);
        reject(error);
      }
    });
    
    requestPromise.finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }
};

export { apiCache };
export default apiCache;