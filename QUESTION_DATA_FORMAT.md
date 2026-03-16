# Company Questions — Data Format Guide for Claude

> **Give this entire file to Claude.** It has everything Claude needs to generate production-ready question batches that can be directly bulk-uploaded to CodeHubX.

---

## Your Instruction to Claude (copy-paste this)

```
You are generating interview preparation MCQ questions for a placement training platform called CodeHubX.
Generate questions in the exact JSON format specified in the attached guide.
Output ONLY a valid JSON array with no extra text, no markdown fences, no explanation outside the array.
The array must start with [ and end with ]. Every object must be on valid JSON.
```

---

## Output Format

Claude must produce a **single JSON array** — no wrappers, no markdown, just raw JSON:

```json
[
  { ...question1... },
  { ...question2... },
  ...
]
```

You paste this array directly into the **Bulk Upload** textarea in the admin panel and click Upload.

---

## Full Field Reference

### Required fields (question will be skipped if any are missing)

| Field | Type | Allowed values |
|---|---|---|
| `company` | string | `"tcs"` `"infosys"` `"wipro"` `"cognizant"` `"accenture"` |
| `section` | string | `"aptitude"` `"reasoning"` `"verbal"` `"coding"` |
| `topic` | string | See topic slugs table below |
| `difficulty` | string | `"Easy"` `"Medium"` `"Hard"` |
| `questionText` | string | Full question sentence |
| `options` | array | Exactly 4 objects: `[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}]` |
| `correctAnswer` | string | `"A"` `"B"` `"C"` or `"D"` |
| `explanation` | string | Full step-by-step solution (shown after user answers) |

### Optional fields (include where relevant)

| Field | Type | Default | Notes |
|---|---|---|---|
| `priority` | string | `"High"` | `"Very High"` `"High"` `"Medium"` `"Low"` — controls practice order |
| `formulaHint` | string | `""` | One-line formula tip shown as collapsible hint |
| `subtopic` | string | `""` | Finer label, e.g. `"successive-change"` |
| `tags` | string[] | `[]` | e.g. `["net-change", "successive"]` |
| `timeLimit` | number | `90` | Seconds allowed. Use 60 for easy, 90 for medium, 120 for hard |
| `order` | number | `0` | Ordering within topic (lower = shown first) |
| `isActive` | boolean | `true` | Set `false` to hide from users |

---

## Topic Slugs

Use these exact strings for the `topic` field.

### section: `"aptitude"`
| Slug | Label |
|---|---|
| `"percentages"` | Percentages |
| `"profit-loss"` | Profit & Loss |
| `"time-work"` | Time & Work |
| `"time-speed-distance"` | Time, Speed & Distance |
| `"interest"` | Simple & Compound Interest |
| `"averages"` | Averages |
| `"ratio-proportion"` | Ratio & Proportion |
| `"mixtures"` | Mixtures & Alligations |
| `"data-interpretation"` | Data Interpretation |
| `"lcm-hcf"` | LCM & HCF |
| `"number-series"` | Number Series |
| `"permutations-combinations"` | Permutations & Combinations |
| `"probability"` | Probability |
| `"number-systems"` | Number Systems |

### section: `"reasoning"`
| Slug | Label |
|---|---|
| `"seating-arrangements"` | Seating Arrangements |
| `"blood-relations"` | Blood Relations |
| `"coding-decoding"` | Coding-Decoding |
| `"syllogisms"` | Syllogisms |
| `"data-sufficiency"` | Data Sufficiency |
| `"letter-number-series"` | Number/Letter Series |
| `"logical-reasoning"` | Logical Reasoning |
| `"analogies"` | Analogies |
| `"puzzles"` | Puzzles |
| `"direction-sense"` | Direction Sense |

### section: `"verbal"`
| Slug | Label |
|---|---|
| `"sentence-completion"` | Sentence Completion |
| `"error-identification"` | Error Identification |
| `"reading-comprehension"` | Reading Comprehension |
| `"synonyms-antonyms"` | Synonyms & Antonyms |
| `"sentence-rearrangement"` | Sentence Rearrangement |
| `"para-jumbles"` | Para Jumbles |
| `"active-passive"` | Active & Passive Voice |
| `"prepositions"` | Prepositions & Conjunctions |

### section: `"coding"`
| Slug | Label |
|---|---|
| `"arrays"` | Arrays |
| `"strings"` | Strings |
| `"patterns"` | Pattern Problems |
| `"basic-algorithms"` | Basic Algorithms |

---

## Explanation Quality Rules (tell Claude these)

The `explanation` field is the most important part. Tell Claude:

- **Show every arithmetic step** — not just the final answer
- **Use the → symbol** to show each step: `200 × 15/100 → 30`
- **Include a quick shortcut method** after the full working where applicable
- **Start from the question's numbers** — no abstract variables at first
- **End with**: `∴ Answer: B` (or whichever option)

---

## formulaHint rules

- One line maximum
- Start with the formula name if it has one: `Profit% = (Profit / CP) × 100`
- For time-speed-distance: `Time = Distance / Speed`
- Omit if it's a logical/verbal question with no formula

---

## Priority Guide

| Difficulty | priority |
|---|---|
| Easy, foundational concept | `"Very High"` — most students need this |
| Medium, commonly asked | `"High"` |
| Medium, less frequent | `"Medium"` |
| Hard or niche | `"Low"` |

---

## Complete Example — MCQ

```json
{
  "company": "tcs",
  "section": "aptitude",
  "topic": "percentages",
  "subtopic": "successive-change",
  "difficulty": "Medium",
  "priority": "Very High",
  "questionText": "A salary is first increased by 20% and then decreased by 15%. What is the net percentage change in the salary?",
  "options": [
    { "key": "A", "text": "5% increase" },
    { "key": "B", "text": "2% increase" },
    { "key": "C": "2% decrease" },
    { "key": "D", "text": "5% decrease" }
  ],
  "correctAnswer": "B",
  "explanation": "Let original salary = 100.\nAfter 20% increase → 100 × 1.20 = 120\nAfter 15% decrease → 120 × 0.85 = 102\nNet change = 102 - 100 = 2\nSince new > original, it is a 2% increase.\n∴ Answer: B",
  "formulaHint": "Net successive change = a + b + (a×b)/100",
  "tags": ["successive-percentage", "net-change"],
  "timeLimit": 90
}
```

> **Note:** The `"C"` key in the example above has a typo (missing `"text":`) — in real output all 4 options must follow the same `{"key":"X","text":"..."}` pattern.

---

## Prompt Templates for Claude

### Template 1 — Single topic batch

```
Generate 20 MCQ questions for TCS aptitude section, topic: Percentages.
Difficulty mix: 8 Easy, 8 Medium, 4 Hard.
All Easy and medium Qs get priority "Very High" or "High".
Use company: "tcs", section: "aptitude", topic: "percentages".
Follow the CodeHubX question format guide exactly.
Output ONLY a JSON array, nothing else.
```

### Template 2 — Full section batch

```
Generate 50 aptitude MCQ questions for TCS covering these topics in roughly equal proportion:
percentages, profit-loss, time-work, time-speed-distance, interest, averages.
Use company: "tcs", section: "aptitude".
Pick the correct topic slug from the guide for each question.
Difficulty mix per topic: 40% Easy, 40% Medium, 20% Hard.
Output ONLY a JSON array.
```

### Template 3 — Reasoning / Verbal

```
Generate 30 reasoning MCQ questions for TCS covering:
seating-arrangements (10 Qs), blood-relations (10 Qs), coding-decoding (10 Qs).
Use company: "tcs", section: "reasoning".
For seating-arrangements, the questionText should describe a mini scenario then ask the specific question.
Output ONLY a JSON array.
```

### Template 4 — Multi-company

```
Generate 100 aptitude MCQs split equally across TCS, Infosys, Wipro.
Topics: percentages, profit-loss, averages, ratio-proportion.
Each company gets ~33 questions, each topic gets roughly equal representation.
Set the company field to "tcs", "infosys", or "wipro" accordingly.
Output ONLY a JSON array.
```

---

## Upload Workflow

1. Copy a prompt template above, fill in the company/section/topic/count
2. Give it to Claude along with this document
3. Claude returns a raw JSON array
4. Go to `/admin/company-questions` → click **Bulk Upload**
5. Paste the JSON into the textarea (it auto-validates instantly)
6. Review the green "X questions ready" confirmation and company breakdown
7. Click **Upload Questions** — watch the inserted/skipped counts
8. Done — questions are live immediately

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---|---|
| Claude wraps output in ```json ... ``` | Tell Claude: "no markdown, raw JSON only" |
| `"correctAnswer": "B)"` with trailing `)` | Tell Claude: only `"A"`, `"B"`, `"C"`, or `"D"` |
| `options` as object `{"A":"...", "B":"..."}` | The server handles this automatically (normalised on upload) |
| Explanation says "See solution" or "Option B" only | Tell Claude to show full working steps |
| `topic` slug is wrong (e.g. `"percentage"` not `"percentages"`) | Copy slugs exactly from the topic table above |
| Missing `explanation` field | Required — question is skipped on upload. Remind Claude it's mandatory |
