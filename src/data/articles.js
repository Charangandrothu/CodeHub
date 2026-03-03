export const articles = [
    {
        slug: 'arrays-complete-guide',
        title: 'Arrays Complete Guide',
        excerpt: 'A comprehensive guide to Arrays in DSA, covering basics, brute force approaches, optimizations, and real interview insights.',
        date: '2023-11-01',
        readTime: '10 min',
        content: `
# Arrays Complete Guide
Arrays are the fundamental building block of data structures. An array is a collection of items stored at contiguous memory locations.

## Concept Explanation
The main idea behind an array is to store multiple items of the same type together. This allows for fast random access, as you can calculate the memory address of any element simply by adding an offset to the base address.

## Brute Force Approach
Often, array problems involving pairs or sub-arrays have a brute force approach of using nested loops.
**Time Complexity:** \`O(N^2)\` or \`O(N^3)\`
**Space Complexity:** \`O(1)\` extra space.

## Optimized Approach
Optimizations for array problems commonly involve:
- **Two Pointers:** Moving from both ends to the center.
- **Sliding Window:** Maintaining a subset of items.
- **Hashing:** Using a Map or Set to remember seen elements.

## Edge Cases
- Empty arrays: \`[]\`
- Arrays with 1 element: \`[5]\`
- Arrays with all same elements: \`[2, 2, 2]\`
- Negative arrays: \`[-1, -2, -3]\`

## Dry Run Example
Given \`arr = [1, 2, 3, 4]\`, finding a pair that sums to 6 using Hashing.
1. Map: \`{}\`, target = 6.
2. i=0, val=1, diff=5. Map does not have 5. Map = \`{1: 0}\`
3. i=1, val=2, diff=4. Map does not have 4. Map = \`{1:0, 2:1}\`
4. i=2, val=3, diff=3. Map does not have 3. Map = \`{1:0, 2:1, 3:2}\`
5. i=3, val=4, diff=2. Map has 2 (index 1). Return \`[1, 3]\`

## Complexities
- **Time:** \`O(N)\` (using hashing) or \`O(N log N)\` (sorting + two pointer)
- **Space:** \`O(N)\` for HashMap, \`O(1)\` for Two Pointer.

## Code Implementation

### Python
\`\`\`python
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
\`\`\`

### C++
\`\`\`cpp
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for(int i = 0; i < nums.size(); i++){
        if(seen.count(target - nums[i])){
            return {seen[target - nums[i]], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}
\`\`\`

### Java
\`\`\`java
import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return new int[] { map.get(diff), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}
\`\`\`

## Real Interview Insights
Interviews rarely ask blank array syntax. They test if you can optimize \`O(N^2)\` brute-force into \`O(N)\` or \`O(N log N)\`. Always start by explaining the naive \`O(N^2)\` bounds, then introduce a Hash Map or Sort.
`
    },
    {
        slug: 'two-pointer-technique',
        title: 'Two Pointer Technique',
        excerpt: 'Master the Two Pointer technique to solve complex array and string problems in optimal time.',
        date: '2023-11-02',
        readTime: '8 min',
        content: `
# Two Pointer Technique
The Two Pointer technique is a foundational algorithmic pattern used to search for pairs in a sorted array, reverse arrays, or find palindromes.

## Concept Explanation
Instead of iterating with nested loops, we place a pointer at the beginning and/or end of an iterable structure and move them based on certain conditions until they meet.

## Brute Force Approach
Nested loops. Comparing every element \`i\` with every element \`j\`. \`O(N^2)\` time.

## Optimized Approach
Initialize \`left = 0\`, \`right = length - 1\`. Adjust based on the sum or conditions. By shrinking the search space from both sides, we find the answer in \`O(N)\` time. Requirements: The array usually needs to be sorted.

## Complexity Analysis
- **Time:** \`O(N)\`, we traverse the array at most once.
- **Space:** \`O(1)\`, only two integer variables are used.

## Edge Cases
- All negative elements.
- No valid pair exists.
- Even vs Odd length arrays.

## Example Walkthrough
Target sum = 10. Array = \`[2, 3, 5, 8, 9]\`
1. \`L=2 (idx 0)\`, \`R=9 (idx 4)\`. Sum = 11. Too big. Decrement \`R\`.
2. \`L=2 (idx 0)\`, \`R=8 (idx 3)\`. Sum = 10. Found! Return \`[0, 3]\`.

## Code

### Python
\`\`\`python
def pairSum(arr, target):
    L, R = 0, len(arr) - 1
    while L < R:
        s = arr[L] + arr[R]
        if s == target: return [L, R]
        elif s < target: L += 1
        else: R -= 1
    return []
\`\`\`

### C++
\`\`\`cpp
vector<int> pairSum(vector<int>& arr, int target) {
    int L = 0, R = arr.size() - 1;
    while(L < R) {
        int s = arr[L] + arr[R];
        if(s == target) return {L, R};
        else if (s < target) L++;
        else R--;
    }
    return {};
}
\`\`\`

### Java
\`\`\`java
public int[] pairSum(int[] arr, int target) {
    int L = 0, R = arr.length - 1;
    while(L < R) {
        int s = arr[L] + arr[R];
        if(s == target) return new int[]{L, R};
        else if(s < target) L++;
        else R--;
    }
    return new int[0];
}
\`\`\`

## Interview Insights
Two pointer is the ultimate space-saving technique. If an interviewer explicitly asks for \`O(1)\` extra space and your brute force uses \`O(N)\` space (like a HashMap), strongly consider Two Pointers (if sorting is allowed or pre-sorted).
`
    },
    {
        slug: 'sliding-window-pattern',
        title: 'Sliding Window Pattern',
        excerpt: 'Learn Sliding Window efficiently to solve contiguous subarray problems.',
        date: '2023-11-03',
        readTime: '9 min',
        content: `
# Sliding Window Pattern
The Sliding Window pattern is used to perform required operations on a specific window size of an array or linked list.

## Concept
A window takes a section of array data. It moves sequentially. This turns nested loops over sub-arrays into a single loop.

## Brute Force
To find max sum of \`K\` elements, brute force calculates sum of every \`K\`-length block via nested loops.
**Time:** \`O(N*K)\`.

## Optimized Approach
Calculate sum of first \`K\`. Then slide the window: subtract the element going out, and add the element coming in.
**Time:** \`O(N)\`.

## Edge Cases
- \`K == 0\`
- \`K > array length\`
- Empty array

## Dry Run Example
Array \`[2, 1, 5, 1, 3, 2]\`, \`K=3\`.
1. First 3 elements: \`2+1+5 = 8\`. Max = 8.
2. Slide to right: \`8 - 2 + 1 = 7\`. Max = 8.
3. Slide to right: \`7 - 1 + 3 = 9\`. Max = 9.
4. Slide to right: \`9 - 5 + 2 = 6\`. Max = 9.

## Code

### Python
\`\`\`python
def maxSum(arr, k):
    if len(arr) < k: return -1
    window_sum = sum(arr[:k])
    max_s = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i-k]
        max_s = max(max_s, window_sum)
    return max_s
\`\`\`

### C++
\`\`\`cpp
int maxSum(vector<int>& arr, int k) {
    if(arr.size() < k) return -1;
    int windowSum = 0;
    for(int i=0; i<k; i++) windowSum += arr[i];
    int maxS = windowSum;
    for(int i=k; i<arr.size(); i++) {
        windowSum += arr[i] - arr[i-k];
        maxS = max(maxS, windowSum);
    }
    return maxS;
}
\`\`\`

### Java
\`\`\`java
public int maxSum(int[] arr, int k) {
    if(arr.length < k) return -1;
    int windowSum = 0;
    for(int i=0; i<k; i++) windowSum += arr[i];
    int maxS = windowSum;
    for(int i=k; i<arr.length; i++) {
        windowSum += arr[i] - arr[i-k];
        maxS = Math.max(maxS, windowSum);
    }
    return maxS;
}
\`\`\`

## Interview Insights
Sliding Window keywords: "contiguous subarray", "longest substring", "maximum sub-array of size K". Always clarify if elements can be negative, as variable-size sliding windows can fail with negative numbers.
`
    },
    {
        slug: 'binary-search-patterns',
        title: 'Binary Search Patterns',
        excerpt: 'Detailed analysis of Binary Search patterns and avoiding common off-by-one errors.',
        date: '2023-11-04',
        readTime: '11 min',
        content: `
# Binary Search Patterns
Binary search is a fast search algorithm with run-time complexity of \`O(log N)\`.

## Concept
It repeatedly divides the search interval in half. It only works on sorted collections.

## Advanced Usage: Binary Search on Answer
Sometimes, the array isn't explicitly sorted, but the "answer space" is monotonic. (e.g. Koko Eating Bananas).

## Brute Force
Linear Search. \`O(N)\` time.

## Optimized (Binary Search)
\`O(log N)\` time. \`O(1)\` space.

## Edge Cases
- Target not found.
- Integer Overflow for \`mid\` calculation (use \`left + (right - left) / 2\`).
- Array size 0 or 1.
- Duplicate elements when finding first/last occurrence.

## Example Walkthrough
Target = 7 in \`[1, 3, 5, 7, 9]\`
1. \`L=0\`, \`R=4\`. \`Mid=2\` (val 5). \`5 < 7\`. so \`L=3\`.
2. \`L=3\`, \`R=4\`. \`Mid=3\` (val 7). \`7 == 7\`. Found! Return 3.

## Code

### Python
\`\`\`python
def binarySearch(arr, target):
    L, R = 0, len(arr) - 1
    while L <= R:
        mid = L + (R - L) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: L = mid + 1
        else: R = mid - 1
    return -1
\`\`\`

### C++
\`\`\`cpp
int binarySearch(vector<int>& arr, int target) {
    int L = 0, R = arr.size() - 1;
    while(L <= R) {
        int mid = L + (R - L) / 2;
        if(arr[mid] == target) return mid;
        else if (arr[mid] < target) L = mid + 1;
        else R = mid - 1;
    }
    return -1;
}
\`\`\`

### Java
\`\`\`java
public int binarySearch(int[] arr, int target) {
    int L = 0, R = arr.length - 1;
    while(L <= R) {
        int mid = L + (R - L) / 2;
        if(arr[mid] == target) return mid;
        else if(arr[mid] < target) L = mid + 1;
        else R = mid - 1;
    }
    return -1;
}
\`\`\`

## Interview Insights
Off-by-one errors are the most common reason candidates fail this in interviews. Memorize ONE robust pattern (either \`L < R\` or \`L <= R\`) and strictly adhere to it.
`
    },
    {
        slug: 'recursion-fundamentals',
        title: 'Recursion Fundamentals',
        excerpt: 'Mastering recursion trees, base cases, and avoiding Stack Overflow.',
        date: '2023-11-05',
        readTime: '12 min',
        content: `
# Recursion Fundamentals
Recursion involves a function calling itself while utilizing a "base case" to terminate.

## Concept Explanation
Every recursive problem is basically:
1. Base Case: When do we stop?
2. Recursive step: How do we break the problem into a smaller part?

## Brute Force (Iterative Equivalents)
Some problems are naturally iterative, some are naturally recursive (like Trees). Using loops instead of recursion can be clunky for Tree structures.

## Edge Cases
- Missing base case (leads to Stack Overflow).
- Heavy memory limits (call stack limit).

## Example: Factorial
\`5! = 5 * 4!\`

1. \`f(5)\` waits for \`f(4)\`
2. \`f(4)\` waits for \`f(3)\` ... base case \`f(1) = 1\`. Returns bubble up.

## Complexity
- **Time:** Depends on number of calls. Usually \`O(Branches ^ Depth)\` without memoization.
- **Space:** \`O(Depth)\` for call stack memory.

## Code

### Python
\`\`\`python
def factorial(n):
    if n <= 1: return 1
    return n * factorial(n - 1)
\`\`\`

### C++
\`\`\`cpp
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
\`\`\`

### Java
\`\`\`java
public int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
\`\`\`

## Interview Insights
Recursion is heavily tied to DFS (Depth First Search) and Backtracking. Be ready to discuss the hidden space complexity of the Call Stack in interviews!
`
    },
    {
        slug: 'stack-queue-deep-dive',
        title: 'Stack & Queue Deep Dive',
        excerpt: 'Understand LIFO and FIFO data structures with real-world use cases.',
        date: '2023-11-06',
        readTime: '10 min',
        content: `
# Stack and Queue Deep Dive

## Concepts
- **Stack (LIFO):** Last In, First Out. E.g., Browser history, Undo operation.
- **Queue (FIFO):** First In, First Out. E.g., Print spooler, Customer line.

## Core Operations
- **Push/Enqueue:** \`O(1)\`
- **Pop/Dequeue:** \`O(1)\`

## Edge Cases
- Popping from an Empty Stack (Underflow).
- Pushing to a Full Stack array (Overflow).

## Example: Valid Parentheses
We use a stack to push opening brackets and pop when we see a closing bracket.
1. String: \`()[]{}\`
2. \`(\` -> Push \`(\`
3. \`)\` -> Pop \`(\`, matches!
4. Repeated for all.

## Code (Valid Parentheses)

### Python
\`\`\`python
def isValid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in pairs:
            if not stack or stack.pop() != pairs[char]: return False
        else:
            stack.append(char)
    return not stack
\`\`\`

### C++
\`\`\`cpp
bool isValid(string s) {
    stack<char> st;
    for(char c : s) {
        if(c=='(' || c=='{' || c=='[') st.push(c);
        else {
            if(st.empty()) return false;
            char top = st.top(); st.pop();
            if(c==')' && top!='(') return false;
            if(c=='}' && top!='{') return false;
            if(c==']' && top!='[') return false;
        }
    }
    return st.empty();
}
\`\`\`

### Java
\`\`\`java
public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    for(char c : s.toCharArray()) {
        if(c == '(') stack.push(')');
        else if(c == '{') stack.push('}');
        else if(c == '[') stack.push(']');
        else if(stack.isEmpty() || stack.pop() != c) return false;
    }
    return stack.isEmpty();
}
\`\`\`

## Interview Insights
"Monotonic Stack" is an advanced topic that frequently appears in interviews (e.g. Next Greater Element, Trapping Rain Water). Learn the template for Monotonic Stacks to ace hard arrays/stack problems.
`
    },
    {
        slug: 'hashing-for-interviews',
        title: 'Hashing for Interviews',
        excerpt: 'The ultimate guide to HashMap and HashSet for time optimization.',
        date: '2023-11-07',
        readTime: '9 min',
        content: `
# Hashing for Interviews

## Concept Explanation
A Hash table provides \`O(1)\` constant time average lookups, insertions, and deletions. It transforms an input key into an array index using a hash function.

## Brute Force
Searching repeatedly in an array takes \`O(N)\`. Nested searching takes \`O(N^2)\`.

## Optimized Approach (Hashing)
Store keys in a Hash Map / Set. Takes \`O(N)\` extra space, but reduces search time drastically to \`O(1)\`.

## Edge Cases
- Hash Collisions.
- Complex objects as keys.
- Very large keys.

## Dry Run: First Unique Character
String "leetcode"
1. Count frequencies: \`{l:1, e:3, t:1, c:1, o:1, d:1}\`. Time: \`O(N)\`
2. First pass again: \`l\` has count 1. Return index 0.

## Code

### Python
\`\`\`python
from collections import Counter
def firstUniqChar(s):
    counts = Counter(s)
    for i, c in enumerate(s):
        if counts[c] == 1: return i
    return -1
\`\`\`

### C++
\`\`\`cpp
int firstUniqChar(string s) {
    unordered_map<char, int> m;
    for(char c : s) m[c]++;
    for(int i=0; i<s.length(); i++) {
        if(m[s[i]] == 1) return i;
    }
    return -1;
}
\`\`\`

### Java
\`\`\`java
public int firstUniqChar(String s) {
    int[] count = new int[26];
    for(char c : s.toCharArray()) count[c - 'a']++;
    for(int i = 0; i < s.length(); i++){
        if(count[s.charAt(i) - 'a'] == 1) return i;
    }
    return -1;
}
\`\`\`

## Interview Insights
If faced with a sub-optimal \`O(N^2)\` logic and you cannot sort because order matters, ALWAYS think of HashMap. Space-Time tradeoff is the bread-and-butter of algorithm interviews.
`
    },
    {
        slug: 'graph-basics',
        title: 'Graph Basics',
        excerpt: 'Nodes, edges, BFS, DFS and representing graphs correctly in code.',
        date: '2023-11-08',
        readTime: '13 min',
        content: `
# Graph Basics

## Concept Explanation
A graph is a non-linear data structure consisting of Nodes (vertices) and Edges. Used to represent networks.

## BFS vs DFS
- **BFS (Breadth-First Search):** Explores level by level using a Queue. Best for shortest path on unweighted graphs.
- **DFS (Depth-First Search):** Explores branch by branch using a Stack (or Recursion). Best for connected components and topological sort.

## Edge Cases
- Cycles (Infinite loops without a \`visited\` set).
- Disconnected components.
- Self-loops.

## Time & Space Complexity
Both BFS and DFS generally take \`O(V + E)\` where V = vertices and E = edges.

## Code (DFS Iterative Base)

### Python
\`\`\`python
def dfs(graph, start):
    visited = set()
    stack = [start]
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            for neighbor in graph[node]:
                stack.append(neighbor)
    return visited
\`\`\`

### C++
\`\`\`cpp
void dfs(vector<vector<int>>& graph, int start) {
    vector<bool> visited(graph.size(), false);
    stack<int> s;
    s.push(start);
    while(!s.empty()){
        int node = s.top(); s.pop();
        if(!visited[node]) {
            visited[node] = true;
            for(int neighbor : graph[node]) s.push(neighbor);
        }
    }
}
\`\`\`

### Java
\`\`\`java
public void dfs(List<List<Integer>> graph, int start) {
    boolean[] visited = new boolean[graph.size()];
    Stack<Integer> stack = new Stack<>();
    stack.push(start);
    while(!stack.isEmpty()){
        int node = stack.pop();
        if(!visited[node]){
            visited[node] = true;
            for(int neighbor : graph.get(node)) stack.push(neighbor);
        }
    }
}
\`\`\`

## Interview Insights
Graphs often appear disguised as a matrix (e.g. Number of Islands, Rotten Oranges). Practice matrix traversal using directions arrays: \`dirs = {{0,1}, {1,0}, {0,-1}, {-1,0}}\`. Be explicit about using a \`visited\` set.
`
    },
    {
        slug: 'dynamic-programming-intro',
        title: 'Dynamic Programming Intro',
        excerpt: 'Break down DP problems from recursion to memoization to tabulation.',
        date: '2023-11-09',
        readTime: '14 min',
        content: `
# Dynamic Programming Intro

## Concept Explanation
Dynamic Programming (DP) is solving a complex problem by breaking it down into overlapping subproblems and storing the results. (Recursion + Memoization / Tabulation).

## Brute Force (Pure Recursion)
Calculating Fibonacci using pure recursion recursively recalculates the same values.
**Time:** \`O(2^N)\`

## Optimized (Memoization / Tabulation)
By storing calculated results in an array/map, we read them in \`O(1)\` time on subsequent requests.
**Time:** \`O(N)\`
**Space:** \`O(N)\`, can be optimized to \`O(1)\` in tabulation.

## Edge Cases
- Base cases mapping directly (N=0, N=1).
- Very large outputs causing integer overflow (Modulo required).

## Code (Fibonacci Optimized)

### Python
\`\`\`python
def fib(n):
    if n <= 1: return n
    dp = [0]*(n+1)
    dp[1] = 1
    for i in range(2, n+1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
\`\`\`

### C++
\`\`\`cpp
int fib(int n) {
    if(n <= 1) return n;
    int a=0, b=1, c;
    for(int i=2; i<=n; i++){
        c = a + b;
        a = b;
        b = c;
    }
    return b;
}
\`\`\`

### Java
\`\`\`java
public int fib(int n) {
    if(n <= 1) return n;
    int a=0, b=1, c;
    for(int i=2; i<=n; i++){
        c = a+b;
        a = b;
        b = c;
    }
    return b;
}
\`\`\`

## Interview Insights
Interviews love grid DP (Unique Paths) and sequence DP (Longest Common Subsequence). ALWAYS start by writing the recursive logic first on the whiteboard, it proves you understand the sub-problem relationships.
`
    },
    {
        slug: 'time-space-complexity',
        title: 'Time and Space Complexity Explained',
        excerpt: 'Big O Notation simplified. Understand how to calculate Bounds.',
        date: '2023-11-10',
        readTime: '7 min',
        content: `
# Time and Space Complexity Explained

## Concept Explanation
Big O notation evaluates how algorithmic run-time or memory footprint grows as the input size \`N\` grows towards infinity. We drop constants; \`O(2N)\` is simply \`O(N)\`.

## Common Time Complexities
1. \`O(1)\`: Constant time. (Hash map lookup, Array index access)
2. \`O(log N)\`: Logarithmic time. (Binary Search)
3. \`O(N)\`: Linear time. (1-D array traversal)
4. \`O(N log N)\`: Linearithmic. (Merge Sort, Quick Sort standard library)
5. \`O(N^2)\`: Quadratic. (Nested loops)
6. \`O(2^N)\`: Exponential. (Recursive tree with 2 branches per node)

## Space Complexity
Often forgotten!
- Creating an array of size N inside a function yields \`O(N)\` space complexity.
- Recursive calls use memory! A recursive tree of depth N yields an \`O(N)\` space call-stack.

## Edge Cases
- Sometimes worst-case is \`O(N^2)\` but average is \`O(N log N)\` (e.g. QuickSort).
- Time limit exceeded (TLE) happens normally if \`10^8\` operations take 1 second. Therefore, if \`N = 10^5\`, \`O(N^2)\` is \`10^{10}\` operations -> WILL FAIL.

## Interview Insights
Before coding any solution, vocalize the Time and Space Complexity of your proposed approach. Changing an approach from \`O(N^2)\` to \`O(N)\` is exactly the signal interviewers are searching for to pass you!
`
    }
];
