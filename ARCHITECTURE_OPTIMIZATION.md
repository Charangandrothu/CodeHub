# System Architecture Optimization for Scalability

This document outlines the architectural changes and optimizations implemented to scale the CodeHub platform to 500+ concurrent users and beyond.

## 1. Summary of Implemented Changes

We have refactored the backend to follow a **Cache-First Strategy**, significantly reducing database load and improving response times.

### Key Components Added:
- **Redis Caching**: Implemented a caching layer using `ioredis`.
- **Cache Middleware**: Automatic caching for high-traffic GET endpoints (Problems, User Profiles).
- **Cache Invalidation**: Smart invalidation logic triggers when data is created, updated, or deleted.
- **Rate Limiting**: Added `express-rate-limit` to prevent abuse and ensure fair resource usage.

## 2. Architecture Diagram (Conceptual)

```mermaid
graph TD
    User[User / Client] -->|Request| LB[Load Balancer / Nginx]
    LB --> RateLimit[Rate Limiter]
    RateLimit --> Cache{Check Redis Cache}
    Cache -- Yes --> ReturnCache[Return via Redis (Fast)]
    Cache -- No --> App[Backend Server (Node.js/Express)]
    App --> DB[(MongoDB Database)]
    App -- Save Response --> UpdateCache[Update Redis]
    App --> Judge0[Judge0 API (Code Execution)]
```

## 3. Technology Stack Updates

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Node.js + Express | Stateless API server. |
| **Database** | MongoDB (Atlas) | Persistent data storage. |
| **Caching** | **Redis (New)** | In-memory key-value store for sub-millisecond access. |
| **Protection** | **express-rate-limit (New)** | DDOS protection and usage throttling. |
| **Execution** | Judge0 | Sandboxed code execution engine. |

## 4. Scalability Strategies Implemented

### A. Server-Side Caching (The 80/20 Rule)
We cache the 20% of data that accounts for 80% of traffic.
- **Problem List**: Cached for 60s. Invalided on any problem addition/deletion.
- **Problem Details**: Cached for 5 minutes (300s). Invalided on problem update.
- **User Profiles**: Cached for 60s. Invalided on profile edit or problem submission.
- **Leaderboards**: Cached for 5 minutes to reduce expensive aggregation queries.

### B. Scalable Invalidation
Instead of complex dependency graphs, we use **Tag-based / Pattern-based invalidation**:
- Modifying a problem clears `cache:/api/problems*`.
- Modifying a user clears `cache:/api/users/:uid`.

### C. Rate Limiting
To ensure stability under load (500+ users):
- **General Limit**: 100 requests per 15 minutes per IP.
- **Strict Limit**: (Optional) Stricter limits for auth/submission endpoints can be configured.

## 5. Further Infrastructure Recommendations

To fully support horizontal scalability (adding more servers), assume the following:

1.  **Load Balancer (Nginx / AWS ALB)**:
    - Place a load balancer in front of multiple Node.js instances.
    - Setup **Sticky Sessions** if using session-based auth (though JWT is preferred for statelessness).

2.  **Stateless Backend**:
    - The current architecture is stateless (Auth tokens are verified per request).
    - This allows you to run `npm start` on 10 different servers behind a load balancer without data syncing issues.

3.  **Database Indexing**:
    - Ensure MongoDB fields used in queries (like `uid`, `slug`, `username`, `topic`) are indexed.
    - *Action*: Run `db.users.createIndex({ uid: 1 })` and `db.problems.createIndex({ slug: 1 })`.

4.  **CDN (Content Delivery Network)**:
    - Offload frontend assets (React build files) and static images to Cloudflare or AWS CloudFront.
    - This reduces traffic to your main server by ~50%.

5.  **Cluster Mode**:
    - Use `pm2` to run the Node.js server in cluster mode to utilize all CPU cores.
    - Command: `pm2 start server/src/app.js -i max`

## 6. How to Run Locally

1.  **Install Redis**:
    - Windows: Use [Memurai](https://www.memurai.com/) (Developer-friendly Redis for Windows) or Docker (`docker run -p 6379:6379 redis`).
    - Linux/Mac: `sudo apt install redis-server` / `brew install redis`.

2.  **Environment Variables**:
    - Ensure `REDIS_URL` is set in your `.env` file (defaults to `redis://localhost:6379`).

3.  **Start Server**:
    - `npm run dev`

The system will now automatically attempt to connect to Redis and start caching. If Redis is unavailable, it *should* fallback gracefully (logs errors but proceeds), though performance will degrade to non-cached levels.
