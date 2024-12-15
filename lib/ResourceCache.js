// lib/ResourceCache.js
class ResourceCache {
    constructor(maxAge = 5 * 60 * 1000) { // 5 minutes default
        this.cache = new Map();
        this.maxAge = maxAge;
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        const age = Date.now() - item.timestamp;
        if (age > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clear() {
        this.cache.clear();
    }

    invalidate(key) {
        this.cache.delete(key);
    }

    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > this.maxAge) {
                this.cache.delete(key);
            }
        }
    }

    // Resource-specific methods
    async getResource(path) {
        const cached = this.get(`resource:${path}`);
        if (cached) return cached;

        // Fetch from GitHub and cache
        try {
            const response = await fetch(path);
            const data = await response.json();
            this.set(`resource:${path}`, data);
            return data;
        } catch (error) {
            console.error('Failed to fetch resource:', error);
            throw error;
        }
    }

    invalidateResources() {
        for (const key of this.cache.keys()) {
            if (key.startsWith('resource:')) {
                this.cache.delete(key);
            }
        }
    }

    getCacheStats() {
        let totalSize = 0;
        let itemCount = 0;
        let expiredCount = 0;
        const now = Date.now();

        for (const [key, item] of this.cache.entries()) {
            itemCount++;
            if (now - item.timestamp > this.maxAge) {
                expiredCount++;
            }
            totalSize += JSON.stringify(item.value).length;
        }

        return {
            totalItems: itemCount,
            expiredItems: expiredCount,
            sizeInBytes: totalSize,
            ageInSeconds: Math.floor(this.maxAge / 1000)
        };
    }
}

// Create singleton instance
const resourceCache = new ResourceCache();

// Cleanup old entries periodically
setInterval(() => {
    resourceCache.cleanup();
}, 60000); // Every minute

export default resourceCache;