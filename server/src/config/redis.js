const Redis = require("ioredis");
const { EventEmitter } = require("events");

let redis;

// Mock Redis with sorted set support for dev without Redis
class MockRedis extends EventEmitter {
    constructor() {
        super();
        this.status = 'ready';
        this._store = new Map();
        this._ttls = new Map();
        setTimeout(() => this.emit("connect"), 50);
    }

    async get(key) {
        this._cleanup(key);
        return this._store.get(key) ?? null;
    }

    async set(key, value, mode, ttl) {
        this._store.set(key, value);
        if (mode === 'EX' && ttl) {
            this._ttls.set(key, Date.now() + ttl * 1000);
        }
        return "OK";
    }

    async del(key) {
        this._store.delete(key);
        this._ttls.delete(key);
        return 1;
    }

    async incr(key) {
        this._cleanup(key);
        const val = parseInt(this._store.get(key) || '0') + 1;
        this._store.set(key, String(val));
        return val;
    }

    async expire(key, seconds) {
        this._ttls.set(key, Date.now() + seconds * 1000);
        return 1;
    }

    async pttl(key) {
        const exp = this._ttls.get(key);
        if (!exp) return -1;
        return Math.max(0, exp - Date.now());
    }

    // Sorted Set operations
    async zadd(key, score, member) {
        if (!this._store.has(key)) this._store.set(key, []);
        const set = this._store.get(key);
        set.push({ score, member });
        return 1;
    }

    async zremrangebyscore(key, min, max) {
        if (!this._store.has(key)) return 0;
        const set = this._store.get(key);
        const filtered = set.filter(e => e.score < min || e.score > max);
        const removed = set.length - filtered.length;
        this._store.set(key, filtered);
        return removed;
    }

    async zcard(key) {
        if (!this._store.has(key)) return 0;
        return this._store.get(key).length;
    }

    async zrange(key, start, stop, withScores) {
        if (!this._store.has(key)) return [];
        const set = this._store.get(key).sort((a, b) => a.score - b.score);
        const sliced = set.slice(start, stop + 1);
        if (withScores === 'WITHSCORES') {
            return sliced.flatMap(e => [e.member, String(e.score)]);
        }
        return sliced.map(e => e.member);
    }

    async quit() { return "OK"; }

    scanStream({ match, count }) {
        const stream = new EventEmitter();
        setTimeout(() => stream.emit("end"), 50);
        return stream;
    }

    pipeline() {
        const pipe = {
            del: () => pipe,
            exec: async () => []
        };
        return pipe;
    }

    _cleanup(key) {
        const exp = this._ttls.get(key);
        if (exp && Date.now() > exp) {
            this._store.delete(key);
            this._ttls.delete(key);
        }
    }
}

if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
} else if (process.env.NODE_ENV === 'production') {
    console.warn("REDIS_URL not set in production. Using mock Redis (no caching).");
    redis = new MockRedis();
} else {
    // Dev: Try localhost, fallback to mock
    redis = new Redis("redis://localhost:6379", {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
            if (times > 3) {
                console.warn("Redis connection failed. Switched to mock mode.");
                return null;
            }
            return Math.min(times * 100, 2000);
        }
    });

    redis.on('error', () => { });
}

redis.on("connect", () => {
    if (process.env.REDIS_URL || (process.env.NODE_ENV !== 'production' && redis instanceof Redis)) {
        console.log("Redis connected successfully.");
    }
});

redis.on("error", (err) => {
    if (process.env.REDIS_URL) {
        console.error("Redis error:", err);
    }
});

module.exports = redis;
