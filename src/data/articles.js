export const articles = [
    {
        slug: 'arrays-complete-guide',
        title: 'Arrays: The Complete Guide',
        excerpt: 'Master the fundamental building block of all data structures. Visual analogies, optimized approaches, and interview patterns.',
        date: '2023-11-01',
        readTime: '8 min',
        tags: ['Arrays', 'Fundamentals', 'Patterns'],
        content: `
# Arrays: The Complete Guide

1️⃣ Concept (What is an Array?)

Arrays are like a row of lockers in a school hallway. 
Each locker has a specific number (an **index**) so you can access it instantly. Instead of gym clothes, you store data inside them. Because they are placed right next to each other in memory, accessing any locker by its number takes virtually zero time—this is called **O(1) random access**.

2️⃣ Visual Explanation

Here is what an array looks like in memory:

\`\`\`text
Array Index Visualization

Index:   [0]    [1]    [2]    [3]    [4]
Value:   10     20     30     40     50
\`\`\`

If you want the 3rd item, you simply ask for \`array[2]\` (since we count starting from 0) and instantly get \`30\`.

3️⃣ Step-by-Step Example

Let's look at the most famous array problem: **Two Sum**.
You are given an array \`nums = [2, 7, 11, 15]\` and a \`target = 9\`. Find the indices of the two numbers that add up to the target.

**Naive Approach:** Check every pair. 
\`2+7=9? Yes.\` Time Complexity: O(N²).

**Optimized Approach:** Use a Hash Map to remember what we've seen.

- **Step 1:** Look at \`2\`. We need \`9-2 = 7\`. Is \`7\` in our map? No. Store \`2\` in the map.
- **Step 2:** Look at \`7\`. We need \`9-7 = 2\`. Is \`2\` in our map? YES!
- **Answer:** \`[0, 1]\`.

Time Complexity reduced to **O(N)**.

4️⃣ Code Implementation

Here is the optimal solution in Python:

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

5️⃣ Key Interview Takeaways

✔ **When to use HashMaps with Arrays:** Whenever you catch yourself writing nested loops just to "find" a compliment or duplicate.
✔ **Time Complexity:** O(N) using HashMap, O(N log N) using sorting + two pointers.
✔ **Common mistakes:** Forgetting that negative numbers might exist in the array (prevents some sliding window approaches from working).

6️⃣ Practice Problems

Ready to test your knowledge? Try these:

* **Easy:** Two Sum, Contains Duplicate
* **Medium:** Product of Array Except Self, Maximum Subarray
* **Hard:** First Missing Positive
`
    },
    {
        slug: 'two-pointer-technique',
        title: 'The Two Pointer Pattern',
        excerpt: 'Stop using nested loops. Learn how to search from both ends to solve complex array problems in optimal time.',
        date: '2023-11-02',
        readTime: '6 min',
        tags: ['Two Pointers', 'Optimization', 'Arrays'],
        content: `
# The Two Pointer Pattern

1️⃣ Concept (What are Two Pointers?)

Imagine looking for a specific word in a dictionary. You don't read every single page from start to finish. You open the middle, and depending on whether your word is alphabetically before or after, you move your left or right hand inward.

The **Two Pointer** technique works similarly linearly. Instead of comparing every item against every other item (nested loops), we place two "fingers" (pointers) on the array—usually at the start and end—and move them towards each other based on a condition.

2️⃣ Visual Explanation

Finding a target sum of \`10\` in a sorted array:

\`\`\`text
[2]   [3]   [5]   [8]   [9]
 ^ Left                ^ Right    -> 2 + 9 = 11 (Too big, move Right leftwards)

[2]   [3]   [5]   [8]   [9]
 ^ Left          ^ Right          -> 2 + 8 = 10 (Target found!)
\`\`\`

3️⃣ Step-by-Step Example

**Problem:** Given a *sorted* array, find two numbers that sum up to a target.

- **Step 1:** Place \`L\` at index 0 and \`R\` at the last index.
- **Step 2:** Calculate \`sum = arr[L] + arr[R]\`.
- **Step 3:** If \`sum > target\`, the sum is too big. Since the array is sorted, moving \`R\` to the left will decrease the sum.
- **Step 4:** If \`sum < target\`, the sum is too small. Move \`L\` to the right.
- **Step 5:** Stop when \`sum == target\` or \`L >= R\`.

4️⃣ Code Implementation

\`\`\`python
def pairSum(arr, target):
    L, R = 0, len(arr) - 1
    
    while L < R:
        current_sum = arr[L] + arr[R]
        
        if current_sum == target:
            return [L, R]
        elif current_sum < target:
            L += 1
        else:
            R -= 1
            
    return []
\`\`\`

5️⃣ Key Interview Takeaways

✔ **When to use this pattern:** Whenever the array is **sorted** and you need to find a pair, triplet, or subarray that meets a condition.
✔ **Time Complexity:** O(N) because each pointer only travels across the array once. Space complexity is O(1).
✔ **Common mistakes:** Using this on an unsorted array without sorting it first, or forgetting the \`L < R\` base condition which causes infinite loops or index out of bounds.

6️⃣ Practice Problems

* **Easy:** Valid Palindrome, Reverse String
* **Medium:** Container With Most Water, 3Sum
* **Hard:** Trapping Rain Water
`
    },
    {
        slug: 'sliding-window-pattern',
        title: 'Sliding Window Pattern',
        excerpt: 'Turn nested loops into single loops. The visual guide to contiguous subarray problems.',
        date: '2023-11-03',
        readTime: '9 min',
        tags: ['Sliding Window', 'Strings', 'Arrays'],
        content: `
# Sliding Window Pattern

1️⃣ Concept (What is a Sliding Window?)

Imagine looking through a small rectangular window cut out of a piece of cardboard, sliding it across a long strip of pictures. You can only see 3 pictures at a time. As you slide the window one step to the right, one picture leaves your view on the left, and a new one enters on the right.

This is exactly how the **Sliding Window** algorithm works. Instead of recounting an entire subarray from scratch, we just subtract the element that "slid out" and add the element that "slid in".

2️⃣ Visual Explanation

Find the maximum sum of any contiguous subarray of size \`k=3\`.

\`\`\`text
Array: [2, 1, 5, 1, 3, 2]

Window 1: [2, 1, 5] -> Sum = 8
Window 2:    [1, 5, 1] -> Sum = 7  (8 - 2 + 1)
Window 3:       [5, 1, 3] -> Sum = 9  (7 - 1 + 3) ⭐ MAX
Window 4:          [1, 3, 2] -> Sum = 6
\`\`\`

3️⃣ Step-by-Step Example

**Problem:** Find the maximum sum of a contiguous subarray of size \`k\`.

- **Step 1:** Compute the sum of the first \`k\` elements. This is our baseline \`window_sum\`.
- **Step 2:** Slide the window right by one element at a time from index \`k\` to the end of the array.
- **Step 3:** Current \`window_sum\` = previous \`window_sum\` - element going out (left) + element coming in (right).
- **Step 4:** Keep track of the maximum sum seen so far.

4️⃣ Code Implementation

\`\`\`python
def max_subarray_sum(arr, k):
    if len(arr) < k: return -1
    
    # Calculate the sum of the first window
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    # Slide the window
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
        
    return max_sum
\`\`\`

5️⃣ Key Interview Takeaways

✔ **When to use this pattern:** Whenever a problem asks for "contiguous subarray", "longest substring", or "maximum sub-array of size K".
✔ **Time Complexity:** O(N) because we iterate through the array roughly once.
✔ **Common mistakes:** Off-by-one errors when dealing with dynamic (variable size) sliding windows (using a \`while\` loop inside the \`for\` loop to shrink the window).

6️⃣ Practice Problems

* **Easy:** Maximum Average Subarray I
* **Medium:** Longest Substring Without Repeating Characters, Permutation in String
* **Hard:** Minimum Window Substring
`
    },
    {
        slug: 'binary-search-patterns',
        title: 'Binary Search Mastery',
        excerpt: 'Stop writing infinite loops. The definitive guide to finding anything in O(log N) time without off-by-one errors.',
        date: '2023-11-04',
        readTime: '11 min',
        tags: ['Binary Search', 'Optimization', 'Logarithmic'],
        content: `
# Binary Search Mastery

1️⃣ Concept (Halving the Search Space)

Think of a dictionary. If you're looking for the word "Monkey", you don't start at 'A' and read every page. You open to the middle. If you land on 'P', you know "Monkey" must be in the first half. You just threw away 50% of the book instantly.

Binary search does this programmatically. It continuously halves the search space until it finds the target.

2️⃣ Visual Explanation

Searching for \`7\` in a sorted array:

\`\`\`text
Target = 7

[1]  [3]  [5]  [7]  [9]
 ^ L       ^ Mid     ^ R     -> 5 < 7, so move L to Mid+1

[1]  [3]  [5]  [7]  [9]
                ^ L,Mid,R    -> 7 == 7. Found!
\`\`\`

3️⃣ Code Implementation

\`\`\`python
def binarySearch(arr, target):
    L, R = 0, len(arr) - 1
    
    while L <= R:
        # Prevents integer overflow in languages like C++/Java
        mid = L + (R - L) // 2
        
        if arr[mid] == target: 
            return mid
        elif arr[mid] < target: 
            L = mid + 1
        else: 
            R = mid - 1
            
    return -1
\`\`\`

4️⃣ Key Interview Takeaways

✔ **When to use:** Whenever the array is **sorted** and you must find an element in O(log N) time, or if you are searching for a monotonic "optimal" answer.
✔ **Time Complexity:** O(log N).
✔ **Common mistakes:** Writing \`mid = (L + R) / 2\` (Integer overflow bug), or writing \`L < R\` instead of \`L <= R\` resulting in missing the final element evaluation.

5️⃣ Practice Problems

* **Easy:** Binary Search, Search Insert Position
* **Medium:** Find Minimum in Rotated Sorted Array, Koko Eating Bananas
* **Hard:** Median of Two Sorted Arrays
`
    },
    {
        slug: 'graph-basics',
        title: 'Graph Traversals (BFS & DFS)',
        excerpt: 'Nodes, edges, finding the shortest path, and representing graphs correctly in your interviews.',
        date: '2023-11-08',
        readTime: '13 min',
        tags: ['Graphs', 'BFS', 'DFS'],
        content: `
# Graph Traversals (BFS & DFS)

1️⃣ Concept (What is a Graph?)

A graph is like a map of cities (nodes) connected by highways (edges). Unlike a tree which flows in one direction, graphs can loop back on themselves (cycles) and be completely disconnected.

To explore a graph, we use two main methods:
- **BFS (Breadth-First):** Like a ripple in a pond. Explores all immediate neighbors first. Perfect for finding the **shortest path**.
- **DFS (Depth-First):** Like a maze runner going as deep down one path as possible before hitting a dead end and turning around. Perfect for exploring **entire connected components**.

2️⃣ Visual Explanation

\`\`\`text
   (A)---(B)
    |     |
   (C)---(D)

Graph represented as Adjacency List:
{
  'A': ['B', 'C'],
  'B': ['A', 'D'],
  'C': ['A', 'D'],
  'D': ['B', 'C']
}
\`\`\`

3️⃣ Code Implementation (DFS)

Using a Stack (Iterative) or Recursion to go deep.

\`\`\`python
def dfs(graph, start):
    visited = set()
    stack = [start]
    
    while stack:
        node = stack.pop()
        
        if node not in visited:
            print("Visiting:", node)
            visited.add(node)
            
            # Add neighbors to stack
            for neighbor in graph[node]:
                if neighbor not in visited:
                    stack.append(neighbor)
                    
    return visited
\`\`\`

4️⃣ Key Interview Takeaways

✔ **When to use BFS:** Shortest path on an unweighted graph, level-order traversal.
✔ **When to use DFS:** Searching for cycles, topological sort, backtracking.
✔ **Common mistakes:** Forgetting the \`visited\` set! This will cause your code to trap itself in an infinite loop if the graph has cycles.

5️⃣ Practice Problems

* **Easy:** Flood Fill
* **Medium:** Number of Islands, Rotting Oranges
* **Hard:** Word Ladder
`
    }
];
