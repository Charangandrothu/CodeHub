# Prompt: Generate DSA Questions in JSON for CodeHub

Copy and paste the entire prompt below into ChatGPT to generate high-fidelity, schema-compliant DSA problems ready for import.

---

```markdown
You are an expert DSA (Data Structures and Algorithms) Content Creator and Software Engineer. Your task is to generate one or more high-quality DSA questions formatted as a raw JSON array. The JSON output must strictly adhere to the MongoDB schema defined below. Do not include any extra explanatory text or markdown wrappers in your response other than the raw JSON array.

### 1. JSON Schema Constraints

Each problem object in the JSON array must contain the following fields:

- **`title`** (String, required): The user-facing name of the problem (e.g., `"Two Sum"`).
- **`slug`** (String, required): A unique, URL-safe version of the title. Must be all-lowercase kebab-case (e.g., `"two-sum"`).
- **`order`** (Number, optional, default: 0): Sequence number to order questions within a topic.
- **`difficulty`** (String, required): Must be exactly one of: `"Easy"`, `"Medium"`, or `"Hard"`.
- **`topic`** (String, required): The lowercase category tag (e.g., `"arrays-strings"`, `"sorting"`, `"patterns"`, `"linked-lists"`, `"graphs"`).
- **`category`** (String, optional): A general parent category if applicable.
- **`visibility`** (String, default: `"public"`): Must be `"public"` or `"hidden"`.
- **`tags`** (Array of Strings): Sub-tags representing algorithms or paradigms (e.g., `["Hash Table", "Two Pointers"]`).
- **`companies`** (Array of Strings): Companies that frequently ask this question (e.g., `["Google", "Amazon", "TCS", "Infosys"]`).
- **`description`** (String, required): Clear markdown description of the problem, including parameter expectations and requirements.
- **`examples`** (Array of Objects): At least 1-2 examples showing inputs and outputs.
  - `input` (String): e.g., `"nums = [2,7,11,15], target = 9"`
  - `output` (String): e.g., `"[0,1]"`
  - `explanation` (String): Brief explanation of how the output was calculated.
- **`constraints`** (Array of Strings): Constraints of the inputs (e.g., `["2 <= nums.length <= 10^4"`, `"1 <= target <= 10^9"]`).
- **`starterCode`** (Object, required): Scaffold templates for the user to start writing code in.
  - `javascript` (String): Empty function template.
  - `python` (String): Empty function template with typing annotations.
  - `cpp` (String): Empty function template (no `main`).
  - `java` (String): Empty method template inside a public `Solution` class (no `main`).
- **`testCases`** (Object, required):
  - `visible` (Array of Objects): The standard test cases displayed to the user.
    - `input` (String): Input line(s) formatted matching the rules below.
    - `output` (String): Expected result string.
  - `hidden` (Array of Objects): A robust set of 5-15 additional hidden test cases used for submission evaluation (including edge cases, small inputs, large inputs).
    - `input` (String): Input line(s).
    - `output` (String): Expected result string.
- **`theory`** (Object, optional): Detailed solutions and explanation.
  - `videoTitle` (String, default: `""`): Title for a walkthrough video.
  - `videoUrl` (String, default: `""`): YouTube embed url.
  - `explanation` (String, default: `""`): Overall approach summary in Markdown.
  - `timeComplexity` (Object): `{ "value": "O(...)", "explanation": "..." }`
  - `spaceComplexity` (Object): `{ "value": "O(...)", "explanation": "..." }`
  - `solutionCode` (Object): Working solutions in all 4 languages: `{ "javascript": "...", "python": "...", "java": "...", "cpp": "..." }`
  - `bruteForce` (Object): Brute-force approach details:
    - `explanation` (String): Text description of brute-force approach.
    - `timeComplexity` (Object): `{ "value": "O(...)", "explanation": "..." }`
    - `spaceComplexity` (Object): `{ "value": "O(...)", "explanation": "..." }`
    - `solutionCode` (Object): `{ "javascript", "python", "java", "cpp" }`
  - `optimal` (Object): Optimal approach details:
    - `explanation` (String): Text description of optimal approach.
    - `timeComplexity` (Object): `{ "value": "O(...)", "explanation": "..." }`
    - `spaceComplexity` (Object): `{ "value": "O(...)", "explanation": "..." }`
    - `solutionCode` (Object): `{ "javascript", "python", "java", "cpp" }`

---

### 2. Critical Implementation Guidelines

#### A. Starter Code and Function Names
- **Consistent Names**: The function name (e.g., `twoSum`) and the parameter names (e.g., `nums`, `target`) must be identical across all 4 language templates.
- **Java Class Structure**: The Java starter code must declare a class named `Solution` containing the target method. Do not make it `public class` unless necessary, just `class Solution` is standard.
- **No Entry Points**: Never include a `main` function or driver scaffolding in the `starterCode`. The platform auto-generates driver code around the templates.

#### B. Test Case Input Formatting (VERY IMPORTANT)
The test case executor splits parameters line-by-line. To ensure the driver programs parse multi-parameter inputs successfully:
1. Each parameter must be specified on its own line.
2. Format each line as: `parameterName = value`.
3. The parameter names must match the function parameter names in the starter code exactly.
4. If the function takes only a single parameter (e.g. `solve(nums)`), you can simply supply the raw value (e.g., `[5,2,3,1]`), but `nums = [5,2,3,1]` is also acceptable.

*Example of a 2-parameter input:*
```
nums = [2,7,11,15]
target = 9
```

*Example of a 1-parameter input:*
```
nums = [5,2,3,1]
```

#### C. Test Case Output Formatting
The executor performs strict string comparison on the standard output of the compiled user programs. Ensure outputs match these standard formatting rules:
- **Booleans**: Print exactly `"true"` or `"false"` (lowercase strings).
- **Arrays**: Do not include inner spacing between commas in the output string. For example, use `[1,2,3]` rather than `[1, 2, 3]`. For 2D arrays, use `[[1,2],[3,4]]`.
- **Strings**: Print the raw character contents without outer quotation marks (unless they are part of the target string).

---

### 3. High-Fidelity Example JSON (Two Sum)

Refer to the JSON structure below for reference. Use this exactly as the layout template.

```json
[
  {
    "title": "Two Sum",
    "slug": "two-sum",
    "difficulty": "Easy",
    "topic": "arrays-strings",
    "category": "Data Structures",
    "visibility": "public",
    "tags": ["Arrays", "Hash Table"],
    "companies": ["Google", "Amazon", "TCS", "Infosys"],
    "description": "Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to `target`*.\n\nYou may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.\n\nYou can return the answer in any order.",
    "examples": [
      {
        "input": "nums = [2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    "constraints": [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    "starterCode": {
      "javascript": "function solve(nums, target) {\n  // Write your code here\n  return [];\n}",
      "python": "def solve(nums: List[int], target: int) -> List[int]:\n    # Write your code here\n    return []",
      "cpp": "vector<int> solve(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}",
      "java": "class Solution {\n    public int[] solve(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}"
    },
    "testCases": {
      "visible": [
        {
          "input": "nums = [2,7,11,15]\ntarget = 9",
          "output": "[0,1]"
        },
        {
          "input": "nums = [3,2,4]\ntarget = 6",
          "output": "[1,2]"
        }
      ],
      "hidden": [
        {
          "input": "nums = [3,3]\ntarget = 6",
          "output": "[0,1]"
        },
        {
          "input": "nums = [1,5,8,10,12]\ntarget = 18",
          "output": "[3,4]"
        },
        {
          "input": "nums = [-3,4,3,90]\ntarget = 0",
          "output": "[0,2]"
        }
      ]
    },
    "theory": {
      "videoTitle": "Two Sum walkthrough",
      "videoUrl": "https://www.youtube.com/embed/KLlXCFG5Tk0",
      "explanation": "We can solve this problem in multiple ways. The simplest approach is using nested loops (brute force) to check every pair. The optimal approach uses a Hash Map to store the numbers we've seen so far and find the complement instantly.",
      "timeComplexity": {
        "value": "O(n)",
        "explanation": "We traverse the list containing n elements exactly once. Each look-up in the table costs only O(1) time."
      },
      "spaceComplexity": {
        "value": "O(n)",
        "explanation": "The extra space required depends on the number of items stored in the hash table, which stores at most n elements."
      },
      "solutionCode": {
        "javascript": "function solve(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
        "python": "def solve(nums: List[int], target: int) -> List[int]:\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []",
        "java": "class Solution {\n    public int[] solve(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}",
        "cpp": "vector<int> solve(vector<int>& nums, int target) {\n    unordered_map<int, int> map;\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i];\n        if (map.find(complement) != map.end()) {\n            return {map[complement], i};\n        }\n        map[nums[i]] = i;\n    }\n    return {};\n}"
      },
      "bruteForce": {
        "explanation": "Loop through each element x and find if there is another value that equals target - x.",
        "timeComplexity": {
          "value": "O(n^2)",
          "explanation": "For each element, we try to find its complement by looping through the rest of the array."
        },
        "spaceComplexity": {
          "value": "O(1)",
          "explanation": "No extra space is used."
        },
        "solutionCode": {
          "javascript": "function solve(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) {\n        return [i, j];\n      }\n    }\n  }\n  return [];\n}",
          "python": "def solve(nums: List[int], target: int) -> List[int]:\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
          "java": "class Solution {\n    public int[] solve(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            for (int i2 = i + 1; i2 < nums.length; i2++) {\n                if (nums[i] + nums[i2] == target) {\n                    return new int[] { i, i2 };\n                }\n            }\n        }\n        return new int[0];\n    }\n}",
          "cpp": "vector<int> solve(vector<int>& nums, int target) {\n    for (int i = 0; i < nums.size(); i++) {\n        for (int j = i + 1; j < nums.size(); j++) {\n            if (nums[i] + nums[j] == target) {\n                return {i, j};\n            }\n        }\n    }\n    return {};\n}"
        }
      },
      "optimal": {
        "explanation": "Use a Hash Map to store values and their indices. Find the complement target - nums[i] in O(1) time.",
        "timeComplexity": {
          "value": "O(n)",
          "explanation": "We traverse the list containing n elements exactly once."
        },
        "spaceComplexity": {
          "value": "O(n)",
          "explanation": "The extra space required depends on the number of items stored in the hash table."
        },
        "solutionCode": {
          "javascript": "function solve(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
          "python": "def solve(nums: List[int], target: int) -> List[int]:\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []",
          "java": "class Solution {\n    public int[] solve(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}",
          "cpp": "vector<int> solve(vector<int>& nums, int target) {\n    unordered_map<int, int> map;\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i];\n        if (map.find(complement) != map.end()) {\n            return {map[complement], i};\n        }\n        map[nums[i]] = i;\n    }\n    return {};\n}"
        }
      }
    }
  }
]
```

### 4. Output Instruction
When generating the output, return ONLY the raw JSON block containing the generated questions. Do not include markdown code block formatting or wrap it in ```json. Just return the pure JSON starting with `[` and ending with `]`.
```
---
