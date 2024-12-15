// lib/services/ResourcePrefetchService.js
class ResourcePrefetchService {
    constructor() {
        this.prefetchCache = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        this.PREFETCH_THRESHOLD = 0.8; // Start prefetching when 80% likely to be needed
    }

    async prefetchResource(url, priority = 'low') {
        if (this.prefetchCache.has(url)) {
            const cached = this.prefetchCache.get(url);
            if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
                return cached.data;
            }
        }

        try {
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = url;
            prefetchLink.as = this.getResourceType(url);
            prefetchLink.importance = priority;
            document.head.appendChild(prefetchLink);

            // Also fetch and cache the resource
            const response = await fetch(url);
            const data = await response.json();

            this.prefetchCache.set(url, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('Failed to prefetch resource:', error);
            throw error;
        }
    }

    getResourceType(url) {
        const extension = url.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'document';
            case 'docx':
                return 'document';
            case 'js':
                return 'script';
            case 'css':
                return 'style';
            default:
                return 'fetch';
        }
    }

    async prefetchNextWeek(currentWeek, resources) {
        const nextWeek = resources.find(w => w.week === currentWeek + 1);
        if (nextWeek) {
            // Prefetch first few materials from next week
            const prefetchPromises = nextWeek.materials
                .slice(0, 3)
                .map(material => this.prefetchResource(material.viewLink));

            await Promise.all(prefetchPromises);
        }
    }

    clearCache() {
        this.prefetchCache.clear();
    }

    getPrefetchStats() {
        return {
            cacheSize: this.prefetchCache.size,
            totalCacheSize: JSON.stringify([...this.prefetchCache]).length,
            oldestEntry: Math.min(...[...this.prefetchCache.values()].map(v => v.timestamp)),
            newestEntry: Math.max(...[...this.prefetchCache.values()].map(v => v.timestamp))
        };
    }
}

export default new ResourcePrefetchService();