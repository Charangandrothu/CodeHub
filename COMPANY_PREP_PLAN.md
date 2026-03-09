# Company-Wise Interview Prep — Implementation Plan

> **Vision**: Be the #1 platform for mass-hiring company placement prep in India. While LeetCode targets FAANG, CodeHubX owns the TCS/Infosys/Wipro/Cognizant/Accenture space — which is where 80% of Indian engineering placements happen.

---

## 1. Navigation & UI Placement

### Where it lives in the App
The feature will be added as a **top-level section in the Navbar** alongside DSA, Roadmap, etc.

```
Navbar:  Dashboard | DSA | Roadmap | Companies  ← NEW | Pricing | Profile
```

The **Companies** page becomes a discovery hub leading to individual company prep pages.

### Key Pages to Create

| Page | Route | Description |
|---|---|---|
| Company Hub | `/companies` | Grid of all supported companies |
| Company Detail | `/companies/:slug` | Full prep page for one company |
| Mock Test | `/companies/:slug/mock/:testId` | Timed mock OA test |
| Experience Feed | `/companies/:slug/experiences` | Community interview experiences |

### UX Philosophy
- Dark, consistent design matching the existing CodeHubX aesthetic (`#0a0a0a`, blue/purple accents)
- Progress tracking: Users should see % of sections completed per company
- Tabs within each company page — not separate pages — to keep the user focused
- Company logo + brand color accent on their respective pages
- Sticky sidebar for section navigation within a company page

---

## 2. Company Hub Page (`/companies`)

### Layout
- Header: "Company-Wise Placement Prep" with a subtitle explaining the niche
- Filter Bar: Filter by `Mass Hiring` | `Service` | `Product` | `BFSI`
- Company Cards (grid of 5 initially):

```
┌─────────────────────────────────────┐
│  [TCS Logo]        ★ Most Popular   │
│  Tata Consultancy Services          │
│  ━━━━━━━━━━━━━━━━━━━━━ 68% done    │
│  Aptitude · Coding · Mock Tests     │
│  [Start Prep →]                     │
└─────────────────────────────────────┘
```

- Announcement banner: "Placements in X days — Start your 30-day sprint!" (dynamic countdown)

---

## 3. Per-Company Detail Page — Universal Structure

Every company page has the **same tab structure** for consistency:

```
[Overview] [Aptitude] [Reasoning] [Coding] [Mock Tests] [Experiences]
```

### Tab 1: Overview
- Hiring pattern: Rounds explained with visual timeline
  - e.g., TCS: `OA → TR Round → MR Round → HR`
- Eligibility: CGPA, branches, batch
- Package range (avg, highest)
- Dates: When they typically visit colleges
- Quick Stats: `3 Rounds · 120 mins OA · Avg 4.5 LPA`
- "Start 30-Day Sprint" CTA — generates a personalized study plan

### Tab 2: Aptitude
- Sections: `Quantitative · Number Series · Time & Work · Profit & Loss · Percentages · Averages`
- 300–500 curated Aptitude MCQs per company (matching their actual OA style)
- Difficulty filter: Easy / Medium / Hard
- Timed practice mode (simulate actual OA)
- Performance analytics: Accuracy, time/question, weak topics

### Tab 3: Reasoning
- Sections: `Verbal · Logical · Data Interpretation · Syllogisms · Puzzles`
- 200–400 questions per company
- Same timed practice mode

### Tab 4: Coding (DSA)
- Company-tagged problems from the existing DSA problem set
- Round-wise grouping: "TR Round Problems" vs "Advanced Problems"
- Languages supported: C++, Java, Python (matching company's OA)
- Difficulty: Easy, Medium, Hard with company's actual difficulty distribution shown

### Tab 5: Mock Tests
- Full OA simulation (company-specific format & duration)
- Sections mirror actual OA: Aptitude + Reasoning + Coding
- Auto-scored with percentile comparison
- Detailed review: Time spent, correct/incorrect, explanations

### Tab 6: Interview Experiences
- Community-submitted experiences
- Fields: Round Type, Year, Location, Questions asked, Outcome
- Upvote useful experiences
- Submit your own experience (reward: unlock content or add to profile)

---

## 4. Company-Specific Content Plan

### TCS
| Section | Details |
|---|---|
| OA Pattern | 65 min Aptitude + Reasoning + Verbal + Coding (1-2 problems) |
| Key Topics | Number Theory, Logical Reasoning, English Comprehension, Basic DSA |
| Mock Test | TCS NQT format — 4 sections, 65 min |
| Coding Difficulty | Easy (Array, String, Basic Math) |
| Notes | Multiple drives per year, CGPA ≥ 6 usually |

### Infosys
| Section | Details |
|---|---|
| OA Pattern | Quant + Puzzles + Verbal + Pseudo Code (90 min) |
| Key Topics | Pseudo-code analysis, Puzzles, Verbal Ability |
| Mock Test | InfyTQ-style test |
| Coding Difficulty | Easy–Medium |
| Notes | InfyTQ certification gives priority; focus on pseudo-code |

### Wipro
| Section | Details |
|---|---|
| OA Pattern | Aptitude + Verbal + Coding + Essay (60–90 min) |
| Key Topics | NLTH (National Level Talent Hunt) pattern |
| Mock Test | NLTH simulation |
| Coding Difficulty | Easy–Medium |
| Notes | Essay writing section is unique to Wipro |

### Cognizant
| Section | Details |
|---|---|
| OA Pattern | Aptitude + Coding + GenC Pro coding (if applicable) |
| Key Topics | Sorting, Searching, Time Complexity, Aptitude |
| Mock Test | GenC vs GenC Pro differentiation |
| Coding Difficulty | Easy (GenC) / Medium (GenC Pro) |
| Notes | Two tiers — GenC (3 LPA) and GenC Pro (4.5 LPA) |

### Accenture
| Section | Details |
|---|---|
| OA Pattern | Cognitive Assessment + Technical Assessment + Communication Assessment |
| Key Topics | Critical Thinking, Abstract Reasoning, Coding (MS Test) |
| Mock Test | 3-part simulation |
| Coding Difficulty | Easy |
| Notes | Communication round is often voice-based; prepare accordingly |

---

## 5. The 30-Day Sprint Feature

A personalized, day-by-day study plan per company.

### How it works
1. User clicks "Start 30-Day Sprint" on a company page
2. System generates a daily schedule:
   - Day 1–10: Aptitude + Reasoning (foundations)
   - Day 11–20: Coding Problems (company-tagged)
   - Day 21–25: Full Mock Tests (+ review)
   - Day 26–30: Weak Area Revision + Final Mock
3. User gets a daily checklist (like a to-do list within CodeHubX)
4. Progress bar shows % completion of the sprint
5. Daily reminder notification (email/push)

---

## 6. Monetization Strategy

### Free vs Pro Tier for Company Prep

| Feature | Free | Pro |
|---|---|---|
| Company Overview | ✅ All | ✅ All |
| Aptitude Questions | 50/company | Unlimited |
| Reasoning Questions | 30/company | Unlimited |
| Coding Problems | Tagged problems | ✅ All |
| Mock Tests | 1 per company | Unlimited |
| 30-Day Sprint | ✅ Access | Full tracking + reminders |
| Interview Experiences | ✅ Read | ✅ Submit + Read |
| Performance Analytics | Basic | Deep analytics + weak area reports |

### Pricing Hooks
- **"Placement Season Pass"**: One-time ₹99–₹199 for 3-month unlimited access to all company prep. This one-time payment is psychologically easier than a subscription during placements.
- **Referral**: "Refer 3 friends → Get 1 month free Pro"
- **College Bundle**: Offer TPO/placement coordinators a college-wide deal — 200 students × ₹99 = ₹19,800 per college

> [!IMPORTANT]
> Placement season urgency creates the best conversion window. Push the **"only 30 days left to placements"** messaging heavily.

---

## 7. Resource Acquisition Strategy

### Where to get content

| Source | What to get | How |
|---|---|---|
| GeeksforGeeks | Company-tagged problems & article references | Manual curation (cite sources) |
| PrepInsta / IndiaBix | Aptitude question patterns | Reference patterns, write original questions |
| Glassdoor / AmbitionBox | Interview experiences | Encourage community submission |
| YouTube (InfyTQ, TCS NQT channels) | OA pattern specifics | Analyze & document patterns |
| Campus Placements subreddit | Real student experiences | Engage & invite to submit on platform |
| Your own college students | First-hand placement data | Run a Google Form, convert to experiences |

### Content Generation Plan
1. **Phase 1** (Week 1–2): Manually curate 100 Aptitude + 50 Reasoning questions per company (500 questions total)
2. **Phase 2** (Week 3–4): Write 2–3 Mock Tests per company
3. **Phase 3** (Month 2+): Open community submissions — students add their experiences, upvoted content surfaces to top
4. **AI assist**: Use your existing Gemini/Claude/DeepSeek API keys to generate high-quality aptitude questions in the style of each company's OA

> [!TIP]
> Use AI to generate 1000 aptitude questions quickly, then have 2–3 people review for accuracy. This is the fastest path to content completeness.

---

## 8. Database Schema

New MongoDB collections needed:

```js
// CompanyPrep
{
  slug: "tcs",
  name: "Tata Consultancy Services",
  logo: "/logos/tcs.png",
  accentColor: "#0066B3",
  overview: { rounds, package, eligibility, hiringDates },
  aptitudeQuestions: [{ question, options, answer, topic, difficulty }],
  reasoningQuestions: [...],
  codingProblems: [ref to Problem collection],
  mockTests: [ref to MockTest collection],
}

// MockTest
{
  companySlug: "tcs",
  name: "TCS NQT Full Mock #1",
  duration: 65, // minutes
  sections: [{ name, questions, timeLimit }],
  attempts: [...],
}

// InterviewExperience
{
  companySlug: "tcs",
  userId: ref,
  year: 2025,
  college: "XYZ Engineering College",
  outcome: "Selected",
  roundDetails: [{ round, questions, verdict }],
  upvotes: 0,
}

// UserSprint
{
  userId: ref,
  companySlug: "tcs",
  startDate, endDate,
  dailyProgress: [{ day, completed, tasks }],
}
```

---

## 9. API Routes to Add

```
GET    /api/companies                    — List all companies
GET    /api/companies/:slug              — Company detail + overview
GET    /api/companies/:slug/aptitude     — Aptitude questions (paginated, filtered)
GET    /api/companies/:slug/reasoning    — Reasoning questions
GET    /api/companies/:slug/coding       — Company-tagged coding problems
GET    /api/companies/:slug/mocks        — List of mock tests
POST   /api/companies/:slug/mocks/:id/attempt  — Submit mock test attempt
GET    /api/companies/:slug/experiences  — Interview experiences
POST   /api/companies/:slug/experiences  — Submit experience
POST   /api/companies/:slug/sprint/start — Generate 30-day plan for user
GET    /api/companies/:slug/sprint       — Get user's sprint progress
```

---

## 10. Phased Implementation Roadmap

### Phase 1 — MVP (2 weeks): Launch for placement season
- [ ] Company Hub page + 5 company cards
- [ ] Overview tab for each company (static content)
- [ ] Aptitude questions (100/company, MCQ format)
- [ ] 1 Mock Test per company
- [ ] Simple progress tracking

**Goal**: Get platform in students' hands before placements start.

### Phase 2 — Engagement (Month 2)
- [ ] Reasoning questions
- [ ] 30-Day Sprint feature
- [ ] Interview Experience feed + submission
- [ ] Pro tier gating

**Goal**: Daily active users, word-of-mouth growth.

### Phase 3 — Scale (Month 3+)
- [ ] College leaderboards
- [ ] TPO/placement coordinator dashboard
- [ ] AI-generated practice sets
- [ ] More companies (Capgemini, HCL, Tech Mahindra)
- [ ] Mobile-optimized experience

**Goal**: College-level adoption, B2B revenue.

---

## 11. Marketing Plan (for the 1-month placement sprint)

| Channel | Action |
|---|---|
| **Your college** | Post in placement WhatsApp groups, pin to notice boards |
| **LinkedIn** | Post "Free TCS NQT Mock Test available on CodeHubX" — students share these |
| **Reddit** | Post in r/developersIndia, r/IndiaJobs, campus subreddits |
| **Telegram** | Share in TCS/Infosys placement prep groups |
| **College TPOs** | Email TPOs offering free access for their students |
| **Student Influencers** | Partner with college seniors who share prep tips on Instagram/LinkedIn |

> [!NOTE]
> The single most viral mechanic: When a student passes their TCS NQT after using your Sprint, they'll post about it. One "I cracked TCS with CodeHubX" post can bring hundreds of signups.

---

## Summary

| Aspect | Decision |
|---|---|
| Target Companies | TCS, Infosys, Wipro, Cognizant, Accenture |
| Unique Value | Mass-hiring company focus (not FAANG), structured sprint plans, Indian college context |
| Content Approach | Manual curation + AI generation + community experiences |
| Monetization | Freemium (1 mock free) + ₹99–199 Placement Pass + College Bundle deals |
| Differentiation | 30-Day Sprint, company-specific OA patterns, community experiences |
| Phase 1 Timeline | 2 weeks to MVP |
