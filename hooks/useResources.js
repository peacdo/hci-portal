// hooks/useResources.js
import { useState, useCallback } from 'react';
import { getGithubRateLimit } from '../lib/githubUtils';

export const useResources = () => {
    const [rateLimit, setRateLimit] = useState(null);
    const [rateLimitError, setRateLimitError] = useState(null);

    const checkRateLimit = useCallback(async () => {
        try {
            const limit = await getGithubRateLimit();
            setRateLimit(limit);

            if (limit.remaining < 10) {
                setRateLimitError(`API rate limit low: ${limit.remaining} requests remaining. Resets at ${new Date(limit.reset * 1000).toLocaleTimeString()}`);
            } else {
                setRateLimitError(null);
            }

            return limit.remaining > 0;
        } catch (error) {
            console.error('Failed to check rate limit:', error);
            return true; // Continue operation on rate limit check failure
        }
    }, []);

    const loadResources = useCallback(async (force = false) => {
        const hasRemaining = await checkRateLimit();
        if (!hasRemaining && !force) {
            throw new Error('API rate limit exceeded');
        }

        // Rest of your existing loadResources logic
    }, [checkRateLimit]);

    return {
        loadResources,
        rateLimit,
        rateLimitError,
        checkRateLimit
    };
};