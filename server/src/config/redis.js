const Redis = require("ioredis");
const { EventEmitter } = require("events");

let redis;

// Helper: Create a Mock Redis Client for production without REDIS_URL
class MockRedis extends EventEmitter {
    constructor() {
        super();
        this.status = 'ready';
        // Simulate immediate connection
        setTimeout(() => this.emit("connect"), 50);
    }
    async get(key) { return null; }
    async set(key, value, mode, ttl) { return "OK"; }
    async del(key) { return 1; }
    async quit() { return "OK"; }

    scanStream({ match, count }) {
        const stream = new EventEmitter();
        setTimeout(() => {
            stream.emit("end");
        }, 50);
        return stream;
    }

    pipeline() {
        const pipe = {
            del: () => pipe,
            exec: async () => []
        };
        return pipe;
    }
}

if (process.env.REDIS_URL) {
    // Standard connection if URL provided
    redis = new Redis(process.env.REDIS_URL);
} else if (process.env.NODE_ENV === 'production') {
    // Production but no REDIS_URL -> Use Mock
    console.warn("REDIS_URL not set in production. Using mock Redis (no caching).");
    redis = new MockRedis();
} else {
    // Development/Local -> Try localhost with short timeout/retries
    redis = new Redis("redis://localhost:6379", {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
            if (times > 3) {
                console.warn("Redis connection failed. Switched to mock mode.");
                return null; // Stop retrying
            }
            return Math.min(times * 100, 2000);
        }
    });

    // Handle connection error gracefully for local dev
    redis.on('error', (err) => {
        // Prevent crashing stack traces if we stop retrying
        // console.error("Redis (Dev) Error:", err.message);
    });
}

redis.on("connect", () => {
    // Only log if real connection
    if (process.env.REDIS_URL || (process.env.NODE_ENV !== 'production' && redis instanceof Redis)) {
        console.log("Redis connected successfully.");
    }
});

redis.on("error", (err) => {
    // Only log real errors that matter
    if (process.env.REDIS_URL) {
        console.error("Redis error:", err);
    }
});

module.exports = redis;
