const redis = require('../config/redis');
const { PROVIDER_CONFIG, PROVIDER_CALLERS, FALLBACK_ORDER, isProviderAvailable } = require('./providers');

// ─── Redis Keys ───
const userRateLimitKey = (uid) => `ai:ratelimit:${uid}`;
const userCooldownKey = (uid) => `ai:cooldown:${uid}`;
const providerRpmKey = (provider) => `ai:rpm:${provider}`;
const providerErrorKey = (provider) => `ai:error:${provider}`;

// ─── Cooldown Check (3s between requests) ───
async function checkCooldown(uid) {
    const key = userCooldownKey(uid);
    const exists = await redis.get(key);
    if (exists) {
        const ttl = await redis.pttl(key); // ms remaining
        return { allowed: false, retryAfter: Math.ceil(ttl / 1000) };
    }
    // Set 3-second cooldown
    await redis.set(key, '1', 'EX', 3);
    return { allowed: true };
}

// ─── Free User: Lifetime limit check (3 total) ───
// Handled in MongoDB, not Redis. Passed through from route.

// ─── Pro User: Sliding Window (5 requests / 5 minutes) ───
async function checkProRateLimit(uid) {
    const key = userRateLimitKey(uid);
    const now = Date.now();
    const windowMs = 5 * 60 * 1000; // 5 minutes

    // Remove entries outside the window
    await redis.zremrangebyscore(key, 0, now - windowMs);

    // Count requests in window
    const count = await redis.zcard(key);

    if (count >= 5) {
        // Find oldest entry to calculate wait time
        const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const retryAfter = oldest.length >= 2
            ? Math.ceil((parseInt(oldest[1]) + windowMs - now) / 1000)
            : 60;
        return { allowed: false, remaining: 0, retryAfter };
    }

    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, 300); // TTL = 5 min safety net

    return { allowed: true, remaining: 4 - count };
}

// ─── Provider RPM Check ───
async function checkProviderRpm(provider) {
    const config = PROVIDER_CONFIG[provider];
    if (!config) return false;

    const key = providerRpmKey(provider);
    const current = await redis.incr(key);

    // Set expiry on first increment
    if (current === 1) {
        await redis.expire(key, 60);
    }

    return current <= config.rpm;
}

// ─── Check if provider has a recent billing/auth error (cache for 5 min) ───
async function isProviderHealthy(provider) {
    const key = providerErrorKey(provider);
    const err = await redis.get(key);
    return !err;
}

async function markProviderUnhealthy(provider, reason, ttlSeconds = 300) {
    const key = providerErrorKey(provider);
    await redis.set(key, reason, 'EX', ttlSeconds);
    console.log(`[AI Router] Marked ${provider} unhealthy for ${ttlSeconds}s (${reason})`);
}

// ─── Core: Route AI Request with Fallback ───
async function routeAIRequest(preferredProvider, systemPrompt, userPrompt) {
    // Build ordered provider list: preferred first, then fallback order
    const rawOrder = [preferredProvider, ...FALLBACK_ORDER.filter(p => p !== preferredProvider)];

    // ONLY keep providers that have valid API keys configured
    const providerOrder = rawOrder.filter(p => isProviderAvailable(p));

    if (providerOrder.length === 0) {
        throw new Error('ALL_PROVIDERS_BUSY');
    }

    console.log(`[AI Router] Trying providers: ${providerOrder.join(' → ')}`);

    const errors = [];

    for (const provider of providerOrder) {
        try {
            // Check if provider is healthy (no recent billing/auth errors)
            const healthy = await isProviderHealthy(provider);
            if (!healthy) {
                console.log(`[AI Router] ${provider} marked unhealthy, skipping...`);
                errors.push(`${provider}: temporarily unavailable`);
                continue;
            }

            // Check RPM
            const rpmOk = await checkProviderRpm(provider);
            if (!rpmOk) {
                console.log(`[AI Router] ${provider} RPM exceeded, trying next...`);
                errors.push(`${provider}: RPM limit`);
                continue;
            }

            // Call provider
            const caller = PROVIDER_CALLERS[provider];
            if (!caller) continue;

            console.log(`[AI Router] Calling ${provider}...`);
            const response = await caller(systemPrompt, userPrompt);
            console.log(`[AI Router] ✅ ${provider} responded successfully`);
            return { response, provider };

        } catch (err) {
            const status = err.response?.status;
            const errMsg = err.response?.data?.error?.message || err.message;
            console.error(`[AI Router] ❌ ${provider} failed (${status || 'network'}: ${errMsg})`);
            errors.push(`${provider}: ${status || 'error'}`);

            // Mark provider unhealthy for billing/auth errors
            // These won't self-resolve soon, so cache for 5 minutes
            if (status === 402 || status === 401 || status === 403) {
                await markProviderUnhealthy(provider, `${status}: ${errMsg}`, 300);
            }

            // 429 = rate limited → cache for 60 seconds
            if (status === 429) {
                await markProviderUnhealthy(provider, 'rate_limited', 60);
            }

            continue;
        }
    }

    // All providers exhausted
    console.error(`[AI Router] All providers failed:`, errors);
    throw new Error('ALL_PROVIDERS_BUSY');
}

// ─── Get healthy providers (for /providers endpoint) ───
async function getHealthyProviders() {
    const available = FALLBACK_ORDER.filter(p => isProviderAvailable(p));
    const results = [];
    for (const id of available) {
        const healthy = await isProviderHealthy(id);
        results.push({ id, healthy });
    }
    return results;
}

module.exports = {
    checkCooldown,
    checkProRateLimit,
    routeAIRequest,
    getHealthyProviders
};
