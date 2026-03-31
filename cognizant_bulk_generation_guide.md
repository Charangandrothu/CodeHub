# Cognizant Bulk Question Generation Guide

This guide is designed to be provided to an AI (like Claude or ChatGPT) to generate batches of Cognizant mock questions in the exact JSON format required by the CodeHubX Admin Panel Bulk Uploader.

Because Cognizant (`CTS`) has a very unique exam pattern consisting of Communication Assessments and Game-Based Aptitudes, you must instruct the AI on how to adapt these into the platform's standard MCQ or Passage-Group formats.

## The Valid JSON Structure

The bulk uploader expects a massive **JSON Array** `[ { ... }, { ... } ]`. Each object must follow this schema:

```json
[
  {
    "company": "cognizant",
    "section": "cognizantTechnical", 
    "topic": "sql",
    "type": "mcq",
    "questionText": "Which of the following describes a CROSS JOIN?",
    "options": [
      { "key": "A", "text": "Produces the Cartesian product of the two tables" },
      { "key": "B", "text": "Returns only matching rows" },
      { "key": "C", "text": "Returns all rows from both tables" },
      { "key": "D", "text": "Checks for NULL values" }
    ],
    "correctAnswer": "A",
    "explanation": "A CROSS JOIN produces a Cartesian product, multiplying every row in the first table by every row in the second table.",
    "difficulty": "Medium",
    "priority": "High"
  }
]
```

## Valid Sections and Topics for Cognizant

When generating questions, the AI **must** use these exact `section` and `topic` keys. 

### 1. Technical Assessment (Cluster-Based)
`"section": "cognizantTechnical"`

**Valid Topics:**
- `"java"` (Java Programming)
- `"python"` (Python Programming)
- `"csharp"` (C# Programming)
- `"sql"` (ANSI SQL)
- `"web"` (HTML, CSS, JavaScript)
- `"cloud"` (Cloud Fundamentals)

*Instruction for AI:* Generate standard technical MCQs including code snippets, output predictions, and conceptual questions.

### 2. Communication Assessment
`"section": "cognizantCommunication"`

**Valid Topics:**
- `"reading"` (Reading Comprehension)
- `"listening"` (Listening Comprehension)
- `"speaking"` (Speaking Assessment)
- `"writing"` (Writing Assessment)
- `"typing"` (Typing Speed Test)

*Instruction for AI:* Adapt these to MCQ format. For example, for "Listening", provide a transcript of a conversation and ask an MCQ about it. For "Writing", ask the user to identify the best way to rewrite a business email. 

### 3. Game-Based Aptitude
`"section": "cognizantGames"`

**Valid Topics:**
- `"numerical-games"` 
- `"logical-games"`
- `"verbal-games"`
- `"spatial-games"`

*Instruction for AI:* Adapt Cognizant's proprietary game formats (like Grid Memory, Digit Challenge, Deductive Logic) into text-based MCQs. Describe a scenario or a grid state, and ask the user to select the correct logical outcome from the 4 options.

### 4. Coding Problems
`"section": "coding"`

**Valid Topics:**
- `"arrays"`
- `"strings"`
- `"patterns"`
- `"basic-algorithms"`

## Passing this to an LLM
Whenever you need to ingest a batch of Cognizant questions, copy and paste the prompt below into your preferred LLM:

***

**Prompt for LLM:**
> "I need you to act as an expert content creator for Cognizant GenC placement exams. I need a batch of 50 high-quality mock questions formatted as a single JSON array. 
> 
> The 'company' field MUST be 'cognizant'.
> 
> Please generate 20 Technical questions (`section: "cognizantTechnical"`, topic: `"sql"` or `"java"`), 15 Communication questions (`section: "cognizantCommunication"`, topic: `"reading"` or `"writing"`), and 15 Game-Based Aptitude questions (`section: "cognizantGames"`, topic: `"logical-games"`).
> 
> For Game-Based aptitude, adapt the standard Cognizant cognitive games into text-based logical reasoning MCQs.
> 
> The JSON objects must follow this structure exactly:
> `{ "company": "cognizant", "section": "...", "topic": "...", "type": "mcq", "questionText": "...", "options": [ {"key": "A", "text": "..."}, {"key": "B", "text": "..."}, {"key": "C", "text": "..."}, {"key":"D", "text": "..."} ], "correctAnswer": "A", "explanation": "Detailed step-by-step logic", "difficulty": "Medium", "priority": "High" }`
> 
> Output ONLY valid, parsable JSON. No codeblocks, markdown padding, or introductory text."
