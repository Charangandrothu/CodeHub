---
title: "Implementation Plan: Real Code Execution & Monaco Editor"
description: "Plan to integrate Monaco Editor and a real backend code execution engine."
status: "planned"
---

# 🚀 Next Steps: Real Code Execution & Monaco Editor

## 1. Frontend: Upgrade to Monaco Editor
We will replace the simple `<textarea>` with the professional **Monaco Editor** (VS Code's editor).

- **Install**: `npm install @monaco-editor/react`
- **Features to Enable**:
  - Syntax highlighting (JS, Python, C++, Java)
  - Line numbers & Minimap
  - Auto-completion & Intellisense
  - Dark Theme (`vs-dark`) to match our UI.

## 2. Backend: Execution API (The "Judge")
We need a way to actually run user code securely.

### Option A: Use a Third-Party API (Easiest & Safest)
- **Service**: Use **Judge0** (RapidAPI) or Piston API.
- **Why**: Running untrusted code on your own server is dangerous (infinite loops, hacking).
- **Flow**:
  1. Frontend sends `source_code`, `language_id`, and `stdin` (test case input) to Backend.
  2. Backend proxies this to Judge0.
  3. backend receives `{ stdout, stderr, status }`.
  4. Backend compares `stdout` with the problem's expected output.

### Option B: Dockerized Sandbox (Advanced)
- If you want to build it yourself, we create a Docker container that isolates execution.

## 3. Database: Storing Test Cases
We need to update the `Problem` model to store hidden test cases that users can't see but are used for "Submit".

- **Schema Update**:
  ```javascript
  // server/src/models/Problem.js
  testCases: [
      {
          input: String,
          output: String,
          isHidden: { type: Boolean, default: true } // Public vs Private
      }
  ]
  ```

## 4. Execution Logic (Run vs Submit)
- **Run**: Executes against the *public* example test cases. Returns generic stdout.
- **Submit**: Executes against *all* (including hidden) test cases. Returns "Accepted" or "Wrong Answer" stats.

## 5. UI Updates
- **Console Panel**: Show real stdout/stderr from the execution.
- **Status Indicators**: "Running...", "Accepted", "Time Limit Exceeded".

---
**Recommended First Step**: Install Monaco Editor and set up the basic component tomorrow.
