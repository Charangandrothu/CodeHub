const redis = require("../config/redis");

/**
 * Caches the response of an endpoint for a given time to live (TTL).
 * @param {number} ttl - Time in seconds to cache the response (default: 60s)
 */
const cacheMiddleware = (ttl = 60) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const cacheKey = `cache:${req.originalUrl}`;

        try {
            const cachedData = await redis.get(cacheKey);

            if (cachedData) {
                // Return cached response directly
                // console.log(`Serving from cache: ${cacheKey}`);
                return res.json(JSON.parse(cachedData));
            }

            // If not cached, continue but hook into res.send to cache the response
            const originalSend = res.json;

            res.json = (body) => {
                // Only cache successful responses (2xx)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    redis.set(cacheKey, JSON.stringify(body), "EX", ttl);
                }
                originalSend.call(res, body);
            };

            next();
        } catch (error) {
            console.error("Cache Middleware Error:", error);
            next(); // Proceed even if cache fails
        }
    };
};

module.exports = cacheMiddleware;
