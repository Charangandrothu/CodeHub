# Company Prep — Data Architecture & Dataset Format Guide

> **Version:** 1.0 | **Date:** March 2026  
> **Audience:** Dataset creator + Developer  
> **Stack:** MongoDB (Mongoose) · Node.js/Express · Firebase Auth · React 19

---

## Table of Contents

1. [Big Picture — How Everything Connects](#1-big-picture)
2. [Question Data Format (What You Need to Provide)](#2-question-data-format)
3. [MongoDB Schema Design](#3-mongodb-schema-design)
4. [Per-User Progress Architecture](#4-per-user-progress-architecture)
5. [How "No Repeat" Filtering Works](#5-how-no-repeat-filtering-works)
6. [API Contract (Frontend ↔ Backend)](#6-api-contract)
7. [Dataset Delivery Format (File You Give Me)](#7-dataset-delivery-format)
8. [Seeding Guide](#8-seeding-guide)
9. [Quick Reference Checklist](#9-quick-reference-checklist)

---

## 1. Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB                                │
│                                                             │
│   company_questions (shared pool — same for all users)      │
│   ┌─────────┬──────────┬─────────┬──────────────────────┐  │
│   │ company │  section │  topic  │ question data...     │  │
│   │  "tcs"  │"aptitude"│"percent"│ q, opts, ans, exp    │  │
│   └─────────┴──────────┴─────────┴──────────────────────┘  │
│                                                             │
│   company_progress (one doc per user·company pair)          │
│   ┌──────────────┬──────────┬──────────┬───────────────┐   │
│   │  userId(uid) │ company  │ section  │ answeredQ IDs  │   │
│   │  "abc123"    │  "tcs"   │"aptitude"│ ["q1","q2"...] │  │
│   └──────────────┴──────────┴──────────┴───────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                   Express REST API
                              │
               React (CompanyDetail.jsx)
```

**Key principle:**
- **Questions are global** — every user sees the same question pool for a company/section/topic
- **Progress is per-user** — each user has their own record of which questions they've answered
- When a user opens a topic, the API returns *only questions they haven't answered yet*
- Once they've answered a question, it's marked done and never shown again (unless they explicitly reset)

---

## 2. Question Data Format

### What a single MCQ question looks like (JSON):

```json
{
  "id": "tcs-apt-pct-001",
  "company": "tcs",
  "section": "aptitude",
  "topic": "percentages",
  "subtopic": "successive-change",
  "difficulty": "Medium",
  "priority": "Very High",
  "questionText": "A number is first increased by 20% and then decreased by 20%. What is the net percentage change?",
  "options": [
    { "key": "A", "text": "No change" },
    { "key": "B", "text": "4% decrease" },
    { "key": "C", "text": "4% increase" },
    { "key": "D", "text": "2% decrease" }
  ],
  "correctAnswer": "B",
  "explanation": "If original = 100, after 20% increase → 120. After 20% decrease on 120 → 120 × 0.8 = 96. Net change = −4%. Formula: successive change = a + b + (ab/100) = 20 + (−20) + (20×(−20)/100) = 0 − 4 = −4%.",
  "tags": ["successive-percentage", "net-change"],
  "formulaHint": "Net successive change = a + b + (ab/100)",
  "timeLimit": 90
}
```

### Field definitions:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | String | ✅ | Unique ID. Format: `{company}-{section-abbr}-{topic-abbr}-{number}`. E.g., `tcs-apt-pct-001` |
| `company` | String | ✅ | Lowercase slug: `"tcs"`, `"infosys"`, `"wipro"` |
| `section` | String | ✅ | `"aptitude"`, `"reasoning"`, `"verbal"`, `"coding"` |
| `topic` | String | ✅ | Topic slug. See **Topic Slug Reference** below |
| `subtopic` | String | ❌ | Optional sub-category within the topic |
| `difficulty` | String | ✅ | `"Easy"`, `"Medium"`, `"Hard"` |
| `priority` | String | ✅ | `"Very High"`, `"High"`, `"Medium"`, `"Low"` — matches TCS NQT exam weight |
| `questionText` | String | ✅ | The full question. Supports markdown for bold/formula text. |
| `options` | Array | ✅ | Always exactly 4 options, keys A/B/C/D |
| `correctAnswer` | String | ✅ | One of `"A"`, `"B"`, `"C"`, `"D"` |
| `explanation` | String | ✅ | Step-by-step solution. This is shown after submitting answer. Include formula derivation. |
| `tags` | String[] | ❌ | For search/filtering later. E.g., `["trains", "relative-speed"]` |
| `formulaHint` | String | ❌ | Key formula shown as a collapsible hint. Keep it concise. |
| `timeLimit` | Number | ❌ | Suggested time in seconds. Defaults to 90 sec. |

---

### Topic Slug Reference (TCS)

Use these exact slugs in the `topic` field:

#### Section: `"aptitude"`
| Topic Name | Slug to use |
|---|---|
| Percentages | `percentages` |
| Profit & Loss | `profit-loss` |
| Time & Work | `time-work` |
| Time, Speed & Distance | `time-speed-distance` |
| Simple & Compound Interest | `interest` |
| Averages | `averages` |
| Ratio & Proportion | `ratio-proportion` |
| Mixtures & Alligations | `mixtures` |
| Data Interpretation | `data-interpretation` |
| LCM & HCF | `lcm-hcf` |
| Number Series | `number-series` |
| Permutations & Combinations | `permutations-combinations` |
| Probability | `probability` |
| Number Systems | `number-systems` |

#### Section: `"reasoning"`
| Topic Name | Slug to use |
|---|---|
| Seating Arrangements | `seating-arrangements` |
| Blood Relations | `blood-relations` |
| Coding-Decoding | `coding-decoding` |
| Syllogisms | `syllogisms` |
| Data Sufficiency | `data-sufficiency` |
| Number/Letter Series | `letter-number-series` |
| Logical Reasoning | `logical-reasoning` |
| Analogies | `analogies` |
| Puzzles | `puzzles` |
| Direction Sense | `direction-sense` |

#### Section: `"verbal"`
| Topic Name | Slug to use |
|---|---|
| Sentence Completion | `sentence-completion` |
| Error Identification | `error-identification` |
| Reading Comprehension | `reading-comprehension` |
| Synonyms & Antonyms | `synonyms-antonyms` |
| Sentence Rearrangement | `sentence-rearrangement` |
| Para Jumbles | `para-jumbles` |
| Active & Passive Voice | `active-passive` |
| Prepositions & Conjunctions | `prepositions` |

---

### Special: Reading Comprehension format

RC questions are grouped — one passage, multiple questions:

```json
{
  "id": "tcs-vbl-rc-001",
  "company": "tcs",
  "section": "verbal",
  "topic": "reading-comprehension",
  "type": "passage-group",
  "passage": "Artificial intelligence is transforming the way businesses operate. From automating routine tasks to enabling real-time decision making, AI has become integral to competitive advantage. However, this rapid adoption raises concerns about data privacy, algorithmic bias, and the displacement of human workers. Organizations must balance efficiency gains with ethical considerations...",
  "questions": [
    {
      "subId": "tcs-vbl-rc-001-q1",
      "questionText": "What is the primary theme of the passage?",
      "options": [
        { "key": "A", "text": "The history of artificial intelligence" },
        { "key": "B", "text": "The impact and challenges of AI adoption in business" },
        { "key": "C", "text": "How to prevent algorithmic bias" },
        { "key": "D", "text": "Advantages of automating human workers" }
      ],
      "correctAnswer": "B",
      "explanation": "The passage discusses both the transformative benefits of AI (automation, decision making) and its challenges (privacy, bias, job displacement), making B the best answer."
    },
    {
      "subId": "tcs-vbl-rc-001-q2",
      "questionText": "According to the passage, what must organizations balance?",
      "options": [
        { "key": "A", "text": "Cost and profit" },
        { "key": "B", "text": "Speed and accuracy" },
        { "key": "C", "text": "Efficiency gains and ethical considerations" },
        { "key": "D", "text": "Human intelligence and artificial intelligence" }
      ],
      "correctAnswer": "C",
      "explanation": "The last sentence directly states: 'Organizations must balance efficiency gains with ethical considerations.'"
    }
  ]
}
```

---

## 3. MongoDB Schema Design

### 3.1 Collection: `company_questions`

This is the **global shared question pool**. All users draw from this.

```javascript
// server/src/models/CompanyQuestion.js

const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  key: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  text: { type: String, required: true }
}, { _id: false });

const subQuestionSchema = new mongoose.Schema({
  subId:         { type: String, required: true },
  questionText:  { type: String, required: true },
  options:       [optionSchema],
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  explanation:   { type: String, required: true }
}, { _id: false });

const companyQuestionSchema = new mongoose.Schema({
  // ── Identity
  id:          { type: String, required: true, unique: true },    // e.g. "tcs-apt-pct-001"
  company:     { type: String, required: true, index: true },     // "tcs"
  section:     { type: String, required: true, index: true },     // "aptitude"
  topic:       { type: String, required: true, index: true },     // "percentages"
  subtopic:    { type: String, default: '' },
  type:        { type: String, default: 'mcq', enum: ['mcq', 'passage-group'] },

  // ── Content (MCQ)
  questionText:  { type: String },
  options:       [optionSchema],
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'] },
  explanation:   { type: String },
  formulaHint:   { type: String, default: '' },

  // ── Content (RC Passage Group)
  passage:    { type: String, default: '' },
  questions:  [subQuestionSchema],

  // ── Metadata
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  priority:    { type: String, enum: ['Very High', 'High', 'Medium', 'Low'], default: 'Medium' },
  tags:        [String],
  timeLimit:   { type: Number, default: 90 },
  isActive:    { type: Boolean, default: true },

}, { timestamps: true });

// Compound index for fast topic-level queries
companyQuestionSchema.index({ company: 1, section: 1, topic: 1 });

module.exports = mongoose.model('CompanyQuestion', companyQuestionSchema);
```

---

### 3.2 Extension to `User` model — Company Progress

We will **add a field** to the existing `User` model (no separate collection needed):

```javascript
// Add this inside the existing userSchema in server/src/models/User.js

companyPrep: {
  tcs: {
    aptitude: {
      answeredIds:  { type: [String], default: [] },  // question IDs answered correctly or marked done
      correctIds:   { type: [String], default: [] },  // subset: answered correctly
      skippedIds:   { type: [String], default: [] },  // explicitly skipped
      lastPracticed: { type: Date, default: null },
      totalAttempted: { type: Number, default: 0 }
    },
    reasoning: {
      answeredIds:  { type: [String], default: [] },
      correctIds:   { type: [String], default: [] },
      skippedIds:   { type: [String], default: [] },
      lastPracticed: { type: Date, default: null },
      totalAttempted: { type: Number, default: 0 }
    },
    verbal: {
      answeredIds:  { type: [String], default: [] },
      correctIds:   { type: [String], default: [] },
      skippedIds:   { type: [String], default: [] },
      lastPracticed: { type: Date, default: null },
      totalAttempted: { type: Number, default: 0 }
    },
    coding: {
      answeredIds:  { type: [String], default: [] },
      correctIds:   { type: [String], default: [] },
      skippedIds:   { type: [String], default: [] },
      lastPracticed: { type: Date, default: null },
      totalAttempted: { type: Number, default: 0 }
    }
  }
  // Add infosys, wipro, etc. later in same structure
}
```

> **Why embed in User vs. separate collection?**
>
> Because we already do this for DSA — `solvedProblemIds` lives on the User model. It keeps reads cheap (one user doc = full profile + progress). At scale (say, 10,000 users × 5 companies × 4 sections × ~200 answered IDs), this is still small: ~10KB per user at max. Fine for MongoDB.

---

### 3.3 Alternatively — Separate `company_progress` collection (for scale)

If you later have 50+ companies and the user doc gets fat:

```javascript
// server/src/models/CompanyProgress.js
const schema = new mongoose.Schema({
  userId:   { type: String, required: true, index: true }, // Firebase UID
  company:  { type: String, required: true },              // "tcs"
  section:  { type: String, required: true },              // "aptitude"
  topic:    { type: String, required: true },              // "percentages" (granular)
  answeredIds: { type: [String], default: [] },
  correctIds:  { type: [String], default: [] },
  skippedIds:  { type: [String], default: [] },
  lastPracticed: { type: Date, default: null }
}, { timestamps: true });

schema.index({ userId: 1, company: 1, section: 1, topic: 1 }, { unique: true });
```

**Our plan: Start with embedding in User. Switch to separate collection when needed.**

---

## 4. Per-User Progress Architecture

### The core rule: Questions are GLOBAL, Progress is PER-USER

```
Question Pool (company_questions)          User A's Progress                User B's Progress
────────────────────────────────    ────────────────────────────    ────────────────────────────
tcs-apt-pct-001  ← "20% increase"   answeredIds: ["tcs-apt-pct-001"] answeredIds: []
tcs-apt-pct-002  ← "Population..."   correctIds:  ["tcs-apt-pct-001"] correctIds:  []
tcs-apt-pct-003  ← "SP of 10..."     skippedIds:  []                  skippedIds:  []
tcs-apt-pct-004  ← "Price inc..."
tcs-apt-pct-005  ← "80 marks..."
...200 questions...

When User A opens Percentages:
  → API fetches all IDs in "tcs/aptitude/percentages": [001, 002, 003, 004, 005...200]
  → Filters out User A's answeredIds: [001]
  → Returns remaining: [002, 003, 004, 005...200] ← User A sees 199 fresh questions

When User B opens Percentages:
  → Same question pool
  → Filters out User B's answeredIds: [] (none done)
  → Returns: [001, 002, 003...200] ← User B sees all 200 questions
```

### Progress states per question:

| State | Where stored | Meaning |
|---|---|---|
| **Unanswered** | (not in any list) | Never attempted. Will be shown in practice |
| **Answered** | `answeredIds` | User submitted an answer (right or wrong). Will NOT be shown again |
| **Correct** | `answeredIds` + `correctIds` | Answered and got it right. Counts for accuracy % |
| **Skipped** | `skippedIds` | User pressed "Skip". Will be shown again at end of session |
| **Reset** | (removed from all lists) | User can do "Reset Progress" to reattempt from scratch |

### Session flow:

```
User opens Percentages topic
         │
         ▼
GET /api/company/tcs/aptitude/percentages/questions?userId=abc123
         │
         ▼
Backend: fetch all active Qs for (tcs / aptitude / percentages)
         │
         ▼
Filter: remove IDs in user.companyPrep.tcs.aptitude.answeredIds
         │
         ▼
Return: paginated batch of 10 unseen questions
         │
         ▼
User sees question → [A] [B] [C] [D]
         │
    ┌────┴────┐
    │         │
 Submit     Skip
    │         │
    ▼         ▼
POST /api/company/progress
{ questionId: "...",       POST /api/company/progress
  answer: "B",              { questionId: "...",
  isCorrect: true }           skipped: true }
    │
    ▼
Backend adds to answeredIds (+ correctIds if right)
```

---

## 5. How "No Repeat" Filtering Works

### At the API level:

```javascript
// Route: GET /api/company/:company/:section/:topic/questions

async function getTopicQuestions(req, res) {
  const { company, section, topic } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.uid; // from Firebase auth middleware

  // 1. Get user's answered IDs for this section
  const user = await User.findOne({ uid: userId }, 'companyPrep');
  const answeredIds = user?.companyPrep?.[company]?.[section]?.answeredIds || [];

  // 2. Query questions excluding answered ones
  const total = await CompanyQuestion.countDocuments({
    company, section, topic, isActive: true,
    id: { $nin: answeredIds }
  });

  const questions = await CompanyQuestion
    .find({ company, section, topic, isActive: true, id: { $nin: answeredIds } })
    .sort({ priority: -1, difficulty: 1 }) // Very High priority first, Easy first
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-correctAnswer'); // ← NEVER send correct answer with question fetch

  res.json({
    questions,
    totalRemaining: total,
    totalAnswered: answeredIds.length,
    currentPage: page
  });
}
```

> **Security note:** `correctAnswer` is stripped from question fetch. It's only sent back in the `/submit` response AFTER the user submits their answer. This prevents cheating via DevTools.

---

## 6. API Contract

### GET `/api/company/:company/:section/:topic/questions`

**Returns:** Next batch of unanswered questions for this user

Request headers: `Authorization: Bearer <firebase-token>`
Query params: `page=1&limit=10`

```json
{
  "questions": [
    {
      "id": "tcs-apt-pct-002",
      "questionText": "...",
      "options": [...],
      "difficulty": "Medium",
      "priority": "Very High",
      "formulaHint": "...",
      "timeLimit": 90
    }
  ],
  "totalRemaining": 198,
  "totalAnswered": 2,
  "totalQuestions": 200,
  "progressPercent": 1
}
```

---

### POST `/api/company/progress/submit`

**Submits one answer and gets back result + explanation**

```json
// Request body
{
  "company": "tcs",
  "section": "aptitude",
  "topic": "percentages",
  "questionId": "tcs-apt-pct-002",
  "selectedAnswer": "B"
}

// Response
{
  "isCorrect": true,
  "correctAnswer": "B",
  "explanation": "If original = 100...",
  "formulaHint": "Net successive change = a + b + (ab/100)",
  "stats": {
    "totalAnswered": 3,
    "totalCorrect": 2,
    "accuracy": 66.7,
    "progressPercent": 1.5
  }
}
```

---

### GET `/api/company/:company/overview`

**Returns:** Overall progress for a company (all sections) for the current user

```json
{
  "company": "tcs",
  "sections": {
    "aptitude":  { "totalQs": 200, "answered": 45, "correct": 38, "accuracy": 84.4, "progressPercent": 22.5 },
    "reasoning": { "totalQs": 150, "answered": 0,  "correct": 0,  "accuracy": 0,    "progressPercent": 0 },
    "verbal":    { "totalQs": 150, "answered": 12, "correct": 10, "accuracy": 83.3, "progressPercent": 8 },
    "coding":    { "totalQs": 30,  "answered": 0,  "correct": 0,  "accuracy": 0,    "progressPercent": 0 }
  },
  "overallProgress": 13.4
}
```

---

### DELETE `/api/company/progress/reset`

**Resets progress for a specific section/topic** (user-triggered)

```json
// Request body
{
  "company": "tcs",
  "section": "aptitude",
  "topic": "percentages"   // optional: omit to reset entire section
}
```

---

## 7. Dataset Delivery Format

### What you need to give me

**One JSON file per section**, named like:
- `tcs_aptitude.json`
- `tcs_reasoning.json`
- `tcs_verbal.json`

### File structure:

```json
{
  "company": "tcs",
  "section": "aptitude",
  "version": "1.0",
  "generatedDate": "2026-03-07",
  "totalQuestions": 200,
  "topics": {
    "percentages": 25,
    "profit-loss": 22,
    "time-work": 20,
    "time-speed-distance": 18,
    "interest": 15,
    "averages": 12,
    "ratio-proportion": 15,
    "mixtures": 10,
    "data-interpretation": 20,
    "lcm-hcf": 10,
    "number-series": 15,
    "permutations-combinations": 10,
    "probability": 8
  },
  "questions": [
    {
      "id": "tcs-apt-pct-001",
      "company": "tcs",
      "section": "aptitude",
      "topic": "percentages",
      "subtopic": "basic-calculation",
      "difficulty": "Easy",
      "priority": "Very High",
      "questionText": "What is 35% of 480?",
      "options": [
        { "key": "A", "text": "158" },
        { "key": "B", "text": "168" },
        { "key": "C", "text": "178" },
        { "key": "D", "text": "188" }
      ],
      "correctAnswer": "B",
      "explanation": "35% of 480 = (35/100) × 480 = 35 × 4.8 = 168. Quick method: 10% of 480 = 48, so 30% = 144, 5% = 24. 30% + 5% = 168.",
      "formulaHint": "x% of N = (x/100) × N",
      "tags": ["basic-percentage", "direct-calculation"],
      "timeLimit": 60
    }
    // ... 199 more questions
  ]
}
```

### Target question counts per section:

| Section | Topics | Target Questions |
|---|---|---|
| Numerical Ability | 14 topics | **200 questions** (~14–25 per topic) |
| Reasoning Ability | 10 topics | **150 questions** (~12–20 per topic) |
| Verbal Ability | 8 topics | **150 questions** (~15–25 per topic) |
| Reading Comprehension | RC passages | **10 passages × 5 Qs = 50 questions** |

### Per-question requirements:

- ✅ Good distractors (wrong options that look plausible, not obviously wrong)
- ✅ Explanation must show the full working, not just the answer
- ✅ `formulaHint` should be short enough to fit on one line
- ✅ `difficulty` must be accurate — Easy: solvable in <60 sec, Medium: 60–120 sec, Hard: 120+ sec
- ✅ IDs must be unique — I'll validate this when seeding
- ❌ No duplicate questions
- ❌ No trick questions that hinge on ambiguous wording

---

## 8. Seeding Guide

Once you hand me the JSON files, I will:

1. Create `CompanyQuestion` model in `server/src/models/CompanyQuestion.js`
2. Create a seed script `server/seed_company_questions.js`
3. Run: `node server/seed_company_questions.js --file tcs_aptitude.json --dry-run` to validate
4. Run: `node server/seed_company_questions.js --file tcs_aptitude.json` to actually insert
5. Add Company Prep routes in `server/src/routes/companyRoutes.js`
6. Add the `companyPrep` field to the User model
7. Wire up the frontend (`CompanyDetail.jsx`) to fetch from API instead of hardcoded data

The seed script will:
- Validate every question's JSON schema
- Check for duplicate `id` fields
- Check that all `topic` slugs match the defined list
- Show counts per topic before inserting
- Use `upsert` so re-running won't create duplicates

---

## 9. Quick Reference Checklist

### For you (dataset creator):

```
[ ] tcs_aptitude.json   — 200 MCQs across 14 topics
[ ] tcs_reasoning.json  — 150 MCQs across 10 topics
[ ] tcs_verbal.json     — 100 MCQs + 10 RC passages × 5 Qs = 150 total
[ ] All IDs unique and follow format: tcs-{section-abbr}-{topic-abbr}-{number}
[ ] All topics use exact slugs from the slug reference table
[ ] Correct answers are NOT obviously guessable from explanation wording
[ ] Each explanation shows full step-by-step working
[ ] formulaHint is short (1 line max)
```

### Section abbreviations for IDs:
- Aptitude → `apt`
- Reasoning → `rsn`
- Verbal → `vbl`
- Coding → `cod`

### Topic abbreviations for IDs:
| Topic | Abbr |
|---|---|
| percentages | `pct` |
| profit-loss | `pl` |
| time-work | `tw` |
| time-speed-distance | `tsd` |
| interest | `si` |
| averages | `avg` |
| ratio-proportion | `rp` |
| mixtures | `mix` |
| data-interpretation | `di` |
| lcm-hcf | `lh` |
| number-series | `ns` |
| permutations-combinations | `pc` |
| probability | `prob` |
| number-systems | `num` |
| seating-arrangements | `sa` |
| blood-relations | `br` |
| coding-decoding | `cd` |
| syllogisms | `syl` |
| data-sufficiency | `ds` |
| letter-number-series | `ls` |
| logical-reasoning | `lr` |
| analogies | `ana` |
| puzzles | `puz` |
| direction-sense | `dir` |
| sentence-completion | `sc` |
| error-identification | `ei` |
| reading-comprehension | `rc` |
| synonyms-antonyms | `syn` |
| sentence-rearrangement | `sr` |
| para-jumbles | `pj` |
| active-passive | `ap` |
| prepositions | `prep` |

---

*Once you hand me the JSON files matching this spec, I can seed the DB, build the API routes, and wire up the live question view in CompanyDetail.jsx — all in one session.*
