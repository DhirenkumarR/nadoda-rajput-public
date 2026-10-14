// Client-Side Cache for Nadoda Rajput Public Portal
// Two-tier caching: In-Memory Map (0ms instant access) + SessionStorage (persists across page reloads)

class ApiCache {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTtl = 10 * 60 * 1000; // 10 minutes default TTL
  }

  getCacheKey(key) {
    return `nadoda_pub_cache_${key}`;
  }

  get(key, maxAgeMs = this.defaultTtl) {
    const storageKey = this.getCacheKey(key);

    // 1. Check in-memory map first (0ms)
    if (this.memoryCache.has(storageKey)) {
      const entry = this.memoryCache.get(storageKey);
      if (Date.now() - entry.timestamp < maxAgeMs) {
        return entry.data;
      }
      this.memoryCache.delete(storageKey);
    }

    // 2. Check sessionStorage
    try {
      const item = sessionStorage.getItem(storageKey);
      if (item) {
        const entry = JSON.parse(item);
        if (Date.now() - entry.timestamp < maxAgeMs) {
          // Re-populate in-memory map
          this.memoryCache.set(storageKey, entry);
          return entry.data;
        }
        sessionStorage.removeItem(storageKey);
      }
    } catch (e) {
      // Ignore storage errors
    }

    return null;
  }

  set(key, data) {
    const storageKey = this.getCacheKey(key);
    const entry = {
      timestamp: Date.now(),
      data
    };

    // Save in memory
    this.memoryCache.set(storageKey, entry);

    // Save in sessionStorage
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (e) {
      // Storage quota or disabled, memory cache still works
    }
  }

  invalidate(pattern) {
    // Clear matching keys from memory
    for (const k of this.memoryCache.keys()) {
      if (!pattern || k.includes(pattern)) {
        this.memoryCache.delete(k);
      }
    }

    // Clear matching keys from sessionStorage
    try {
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('nadoda_pub_cache_') && (!pattern || k.includes(pattern))) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch (e) {}
  }

  clear() {
    this.memoryCache.clear();
    try {
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('nadoda_pub_cache_')) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch (e) {}
  }
}

export const apiCache = new ApiCache();
