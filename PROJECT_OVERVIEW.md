# CodeHubX — Complete Project Documentation

> **CodeHubX** is a premium competitive programming and placement preparation platform designed specifically for Indian engineering students. Unlike platforms like LeetCode that focus on FAANG companies, CodeHubX focuses on the real-world placement journey — covering DSA, Aptitude, AI assistance, and interview preparation for mass-hiring companies like TCS, Infosys, Wipro, Cognizant, and Accenture.

---

## Table of Contents

1. [What is CodeHubX?](#1-what-is-codehubx)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Features](#4-features)
5. [Monetization](#5-monetization)
6. [Scalability & Concurrent Users](#6-scalability--concurrent-users)
7. [Admin Panel](#7-admin-panel)
8. [Security](#8-security)
9. [API Reference Summary](#9-api-reference-summary)
10. [Data Models](#10-data-models)
11. [Planned Features (Roadmap)](#11-planned-features-roadmap)

---

## 1. What is CodeHubX?

CodeHubX is a **full-stack SaaS platform** for Indian engineering students preparing for campus placements. The platform bridges a critical gap: most coding platforms target high-level software engineering roles, but the majority of Indian students are placing at service companies (TCS, Infosys, Wipro, Cognizant, Accenture) and need targeted preparation.

### Core User Journey
1. Student signs up via Google/Email (Firebase Auth)
2. Completes a profile (college, skills, goals)
3. Follows a structured DSA Roadmap
4. Solves company-tagged problems with an AI assistant
5. Takes mock tests to simulate OA (Online Assessment)
6. Earns a certificate upon completing the DSA track
7. Upgrades to Pro for unlimited access

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (Vite), React Router, Framer Motion, Firebase SDK |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Atlas) via Mongoose |
| **Auth** | Firebase Authentication (Google + Email/Password) |
| **Queue** | Bull (Redis-backed job queue) |
| **Cache** | Redis (response caching, rate limiting, cooldowns) |
| **Code Execution** | Judge0 API (external, hosted) |
| **Payments** | Razorpay (orders, subscriptions, webhooks) |
| **Email** | Nodemailer via Gmail SMTP |
| **AI** | NVIDIA (Meta LLaMA 3.1 405B), Gemini 2.0 Flash, Claude 3.5 Haiku, DeepSeek |
| **PDF Generation** | Puppeteer (certificate PDFs) |
| **Styling** | CSS Variables + Tailwind (dark theme, `#0a0a0a` background) |
| **Deployment** | Frontend: Vercel | Backend: Render |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (React / Vite)              │
│  Firebase Auth → AuthContext → React Router → Pages  │
└────────────────────┬────────────────────────────────┘
                     │ REST API calls
┌────────────────────▼────────────────────────────────┐
│              BACKEND (Node.js / Express)             │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ User API │  │ AI API   │  │ Code Execute API │  │
│  └──────────┘  └──────────┘  └────────┬─────────┘  │
│                                       │             │
│  ┌─────────────┐              ┌────────▼─────────┐  │
│  │ Payment API │              │   Bull Queue      │  │
│  │ (Razorpay)  │              │   (Redis-backed) │  │
│  └─────────────┘              └────────┬─────────┘  │
│                                       │             │
│                               ┌────────▼─────────┐  │
│                               │  Judge0 API       │  │
│                               │  (Code Execution) │  │
│                               └──────────────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │
       ┌───────────┴────────────┐
       │                        │
┌──────▼──────┐          ┌──────▼──────┐
│  MongoDB     │          │   Redis     │
│  (Atlas)     │          │  (Cache +  │
│  Persistent  │          │   Queue)   │
│  Data        │          └────────────┘
└─────────────┘
```

---

## 4. Features

### 4.1 Authentication & User Onboarding
- **Firebase Auth** handles all authentication (Google OAuth + Email/Password)
- On first login, a MongoDB user document is created via `/api/users/sync`
- New users are prompted to complete their profile: college, role, skills, goals, social links
- **Platform Registration Toggle**: Admin can disable new registrations instantly
- **Username system**: Each user gets a unique handle (e.g., `@yanthraa`)

### 4.2 DSA Problem Set
- Curated set of 150+ DSA problems across topics: Arrays, Strings, Trees, Graphs, DP, etc.
- Each problem has:
  - Problem statement with examples and constraints
  - Visible and hidden test cases
  - Solution editorial with video explanation, time/space complexity
  - Starter code in JavaScript and Python
  - Tags (topic, difficulty, company)
- **Difficulty levels**: Easy, Medium, Hard
- **Visibility control**: Admin can mark problems as hidden or public

### 4.3 Code Editor & Execution (`/api/execute`)
- Multi-language support: **C++, Java, Python, JavaScript**
- **Run mode**: Executes against visible test cases instantly (uses Judge0 API directly)
- **Submit mode**: Evaluates against hidden test cases via a job queue
- Local driver code auto-generation — parses function signatures and injects test data
- Verdicts: `Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Runtime Error`, `Compilation Error`

### 4.4 Submission Queue (Bull + Redis)
The submission pipeline uses a **Bull job queue** backed by Redis for reliability:

1. User submits code → job added to Redis queue
2. Worker picks up job, fetches problem test cases from MongoDB
3. Runs code against all hidden test cases sequentially via Judge0
4. Records max execution time, max memory used
5. Saves `Submission` document to MongoDB
6. Updates user stats: solved count, streak, submission credits
7. Frontend polls `/api/execute/status/:jobId` for result

**Credit system**:
- Free users: 3 runs/day + 3 submissions/day (resets daily)
- Pro users: Unlimited runs and submissions

### 4.5 DSA Roadmap
- **Interactive, visual, multi-week roadmap** for DSA preparation
- Days organized into structured sections (Arrays → LinkedList → Trees → Graphs → DP, etc.)
- Each day has a set of assigned problems
- Progress is tracked per-user and stored in `user.dsaRoadmap`
- Users can lock/unlock sections as they complete them
- Roadmap state persisted in MongoDB on the user document

### 4.6 AI Coding Assistant (Multi-Provider)
The AI assistant is available directly within the problem-solving interface.

**How it works:**
- User types a question while solving a problem (e.g., "Give me a hint" or "Debug my code")
- The backend builds a context-aware prompt including the problem title, description, user's code, and question
- Routes the request to an AI provider with automatic failover

**AI Providers (priority order):**
| Provider | Model | Rate Limit |
|---|---|---|
| NVIDIA | Meta LLaMA 3.1 405B Instruct | 40 RPM |
| Gemini | Gemini 2.0 Flash | 100 RPM |
| DeepSeek | DeepSeek Chat | 60 RPM |
| Claude | Claude 3.5 Haiku | 50 RPM |

**Rate Limiting:**
- Free users: **3 AI queries per day** (resets at midnight, atomic counter to prevent race conditions)
- Pro users: **5 queries per 5-minute sliding window** (Redis-tracked)
- Cooldown: **3 seconds between requests** (prevents spamming)
- Credits refunded automatically if the AI provider fails

**Fallback behavior**: If the selected provider fails, the system tries the next healthy provider automatically.

### 4.7 Pricing & Subscription (Razorpay)
- Payments processed via **Razorpay** (Indian payment gateway)
- Plans: `FREE`, `Pro Monthly`, `Pro Yearly`
- **Geo-based pricing**: Detects user's country from IP and adjusts price (INR for India, USD for international)
- Subscription lifecycle managed: start date, end date, billing cycle, billing history
- **Razorpay Webhooks** handle payment confirmation and subscription updates
- Admin can configure pricing, offers, and plans via the Admin Panel

### 4.8 Certificates
- Users who complete the DSA track earn a **digitally issued certificate**
- Certificates are generated as **PDFs using Puppeteer** (rendered from HTML templates)
- Certificate data stored on the user document: `certificateId`, `name`, `course`, `progress`, `issuedAt`
- Unique certificate ID for verification
- Served at `/api/certificates/:id`

### 4.9 User Profile & Settings
Each user has a full profile with:
- Avatar (DiceBear auto-generated or custom)
- Display name, username/handle, college, role
- Social links: Portfolio, GitHub, LinkedIn, LeetCode, Codeforces
- Skills list
- Coding stats: streak, solved count, global rank, time spent
- Submission history (per-problem history with verdict)
- Subscription status
- Preferences: goal, daily target, notification settings, theme, language

### 4.10 Announcements
- Admins can publish **platform-wide announcements** (e.g., "New problem set added!", "Maintenance at midnight")
- Announcements shown to all users on dashboard or as banners
- CRUD operations via Admin Panel

### 4.11 Platform Settings (Admin-Controlled)
- **Maintenance Mode**: Puts platform in read-only mode; all mutations blocked
- **Allow Registrations Toggle**: Admin can stop new sign-ups instantly
- Settings fetched on every app load via `/api/platform`

---

## 5. Monetization

### Free vs Pro Comparison

| Feature | Free | Pro |
|---|---|---|
| DSA Problems | ✅ Full access | ✅ Full access |
| Code Runs | 3/day | Unlimited |
| Code Submissions | 3/day | Unlimited |
| AI Queries | 3/day | 5/5 min (sliding window) |
| AI Response Quality | Concise | Deep analysis |
| Roadmap | ✅ View | ✅ Full tracking |
| Certificates | ✅ Earn | ✅ Earn |
| Mock Tests (upcoming) | 1 per company | Unlimited |
| Company Prep (upcoming) | Limited | Unlimited |

### Pricing
- **Pro Monthly**: Dynamic (INR / USD based on geo-IP)
- **Pro Yearly**: Discounted annual plan
- **Placement Season Pass** *(planned)*: One-time ₹99–199 for 3-month access to company prep
- **College Bundle** *(planned)*: B2B deal for placement departments — bulk license per campus

### Revenue Channels
1. Pro subscriptions (Razorpay recurring)
2. One-time Placement Season Passes
3. College/Institutional licensing
4. Referral conversions ("Refer 3 friends → 1 month free")

---

## 6. Scalability & Concurrent Users

### Redis — Caching Layer
- API responses cached in Redis with TTL (e.g., user profile: `cache:/api/users/:uid`)
- Cache invalidated on user data changes (login sync, profile update, submission)
- Reduces MongoDB reads significantly for frequently accessed data

### Redis — Rate Limiting
- Global express rate limiter using `express-rate-limit` (configurable via `middleware/rateLimiter.js`)
- Per-user AI cooldown stored as Redis keys with TTL
- Pro user AI sliding window tracked as a sorted set in Redis

### Bull Queue — Job Processing
- Code submissions processed asynchronously via a **Bull queue** (Redis-backed)
- Jobs are processed by a **separate worker process** (`server/src/worker.js`)
- This decouples submission spikes from the main API server
- If the worker crashes, jobs remain in Redis and are retried automatically

### Worker Isolation
- The `worker.js` process runs independently from `server.js`
- In Docker: separate container (`codehubx-worker`) for the worker
- This allows horizontal scaling: spin up more worker containers for peak load

### Deployment Architecture
```
Internet → Vercel (Frontend CDN) → Render (Backend API) → MongoDB Atlas (DB)
                                 ↘ Redis (Upstash/Railway)
```

### Concurrent User Handling
| Component | How it scales |
|---|---|
| Frontend | Static CDN (Vercel), unlimited scale |
| API Server | Node.js async event loop handles 1000s of concurrent connections |
| Code Execution | Offloaded to Bull queue + Judge0 (external API) |
| Database | MongoDB Atlas with connection pooling |
| Cache | Redis reduces DB reads, absorbs traffic spikes |
| AI Providers | Multi-provider fallback — if one is busy, routes to next |

---

## 7. Admin Panel

Located at `/admin`, protected by a separate admin JWT system.

### Admin Capabilities

| Section | Actions |
|---|---|
| **User Management** | View all users, search, filter by plan, promote/demote Pro status, view user details |
| **Problem Management** | Add, edit, delete problems; set visibility (public/hidden); add test cases, theory, editorial |
| **Pricing** | Configure Pro plans, monthly/yearly pricing, active offers/discounts |
| **Announcements** | Create, edit, delete platform announcements |
| **Platform Settings** | Toggle maintenance mode, toggle registrations, view audit logs |
| **Analytics** | User counts, submission stats, AI usage stats |

### Admin Auth
- Separate `AdminUser` model — not tied to Firebase
- Cookie-based JWT sessions (`AdminSession` model)
- `adminAuthRoutes.js` handles login/logout for admin
- Separate session management from regular users

### Audit Logs
- Every admin action (user promotion, setting change, etc.) is logged via `auditService.js`
- Stored in `AuditLog` MongoDB collection
- Admin can view the full history of changes

---

## 8. Security

| Security Layer | Implementation |
|---|---|
| **HTTP Security Headers** | `helmet` middleware (XSS, CSRF, clickjacking protection) |
| **CORS** | Configured to allow only trusted origins with credentials |
| **Global Rate Limiting** | `express-rate-limit` on all API routes |
| **AI Cooldown** | Per-user Redis-based 3s cooldown between AI requests |
| **Atomic Credit Check** | MongoDB `findOneAndUpdate` with conditional to prevent race conditions in credit decrement |
| **Admin Auth** | Separate JWT system, not shared with user auth |
| **Maintenance Mode** | `X-Maintenance-Mode` header + frontend gating |
| **Server Identity** | `x-powered-by` header disabled |
| **Input Validation** | Required field checks on all mutation endpoints |
| **OTP Service** | Email-based OTP for password resets (`otpService.js`) |

---

## 9. API Reference Summary

### User APIs (`/api/users`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/sync` | Create or update user on login |
| GET | `/:uid` | Get user profile |
| GET | `/check-username/:username` | Check username availability |
| PATCH | `/:uid/profile` | Update profile details |
| PATCH | `/:uid/preferences` | Update notification/theme preferences |
| GET | `/:uid/submissions` | Get submission history |

### Code Execution (`/api/execute`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/run` | Run code against visible test cases |
| POST | `/submit` | Submit code (queued, against hidden tests) |
| GET | `/status/:jobId` | Poll job status |

### AI Assistant (`/api/ai`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Main AI chat endpoint |
| GET | `/usage/:uid` | Get user's AI usage stats |
| GET | `/providers` | List available AI providers with health status |

### Payments (`/api/payment`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/create-order` | Create Razorpay order |
| GET | `/pricing` | Get dynamic pricing (geo-detected) |

### Certificates (`/api/certificates`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/generate` | Generate and issue a certificate |
| GET | `/:id` | Fetch and download certificate PDF |

### Platform (`/api/platform`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get platform settings (maintenance mode, registrations) |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users |
| POST | `/users/:uid/promote` | Make user Pro |
| GET | `/problems` | List all problems |
| POST | `/problems` | Create new problem |
| PUT | `/problems/:id` | Update problem |
| DELETE | `/problems/:id` | Delete problem |
| GET | `/audit-logs` | View audit log |
| PATCH | `/platform` | Update maintenance/registrations settings |

---

## 10. Data Models

### User
```
uid (Firebase), email, username, photoURL, displayName
isPro, plan, paymentStatus, subscriptionId, subscriptionStart/EndDate, billingHistory
stats: { streak, solvedProblems, solvedProblemIds, globalRank, timeSpent, runCredits, submissionCredits }
submissionHistory: [{ problemId, title, verdict, submittedAt }]
profile: { role, college, portfolio, github, linkedin, leetcode, codeforces, skills }
preferences: { goal, difficulty, topics, dailyTarget, notifications, theme }
dsaRoadmap: { sections, days, progress state }
aiUsage, lastAiResetDate
certificate: { certificateId, name, course, progress, issuedAt }
```

### Problem
```
title, slug, order, difficulty (Easy/Medium/Hard), topic, category, visibility, tags
description, examples, constraints
starterCode: { javascript, python }
testCases: { visible: [], hidden: [] }
theory: { videoTitle, videoUrl, explanation, timeComplexity, spaceComplexity, solutionCode }
```

### Submission
```
userId, problemId, problemTitle, language, code
verdict, passedCount, totalCount, executionTime, memoryUsed
error, failedTestCase, submittedAt
```

### Payment / Order
```
userId, razorpayOrderId, amount, currency, status, plan, billingCycle, createdAt
```

### Subscription
```
userId, razorpaySubscriptionId, plan, status, startDate, endDate, billingCycle
```

### Certificate
```
certificateId (unique, for verification), userId, name, course, progress, issuedAt
```

### Announcement
```
title, message, type (info/warning/success), isActive, createdAt, expiresAt
```

### PlatformSettings
```
_id: "PLATFORM_SETTINGS" (singleton), maintenanceMode, allowRegistrations, updatedAt
```

### AdminUser / AdminSession
```
AdminUser: { username, passwordHash, role }
AdminSession: { adminId, token, createdAt, expiresAt }
```

### AuditLog
```
adminId, action, target, details, timestamp
```

---

## 11. Planned Features (Roadmap)

### Phase 1 — Company Prep (In Progress)
See [`COMPANY_PREP_PLAN.md`](./COMPANY_PREP_PLAN.md) for the full implementation plan.

**Target companies**: TCS, Infosys, Wipro, Cognizant, Accenture

New features:
- Company Hub page (`/companies`)
- Per-company prep page with tabs: Overview, Aptitude, Reasoning, Coding, Mock Tests, Experiences
- 30-Day Sprint: Auto-generated daily study plan per company
- Interview Experience community feed
- Mock OA Tests with real company patterns (TCS NQT, InfyTQ, Wipro NLTH, etc.)

**New Models**: `Company`, `AptitudeQuestion`, `MockTest`, `InterviewExperience`, `UserSprint`

### Phase 2 — Engagement
- College leaderboards (public ranking per campus)
- Daily problems & streaks gamification
- Referral system ("Refer 3 → 1 month free")
- Push notifications & daily reminders

### Phase 3 — Scale & B2B
- TPO/Placement Coordinator dashboard for colleges
- College-wide bulk licenses
- More companies: Capgemini, HCL, Tech Mahindra, Hexaware
- Full mobile-optimized experience

---

*Last updated: February 2026*
*Maintained by the CodeHubX development team*
