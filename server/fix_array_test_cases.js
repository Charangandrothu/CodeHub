const mongoose = require("mongoose");
require("dotenv").config();
const Problem = require("./src/models/Problem");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        console.error("DB Connection Error:", err.message);
        process.exit(1);
    }
};

// --- Correct JS Solvers for problematic questions ---

const solvers = {
    "minimum-swaps-to-group-all-1s-together": (inputStr) => {
        // Circular version
        const line = inputStr.split('\n').find(l => l.includes('nums'));
        const nums = JSON.parse(line.split('=')[1].trim());
        let totalOnes = 0;
        for (let num of nums) {
            if (num === 1) totalOnes++;
        }
        if (totalOnes <= 1) return "0";
        let n = nums.length;
        let currentOnes = 0;
        for (let i = 0; i < totalOnes; i++) {
            if (nums[i] === 1) currentOnes++;
        }
        let maxOnes = currentOnes;
        for (let i = 1; i < n; i++) {
            if (nums[i - 1] === 1) currentOnes--;
            if (nums[(i + totalOnes - 1) % n] === 1) currentOnes++;
            maxOnes = Math.max(maxOnes, currentOnes);
        }
        return String(totalOnes - maxOnes);
    },

    "degree-of-an-array": (inputStr) => {
        const line = inputStr.split('\n').find(l => l.includes('nums'));
        const nums = JSON.parse(line.split('=')[1].trim());
        let count = new Map();
        let first = new Map();
        let last = new Map();
        for (let i = 0; i < nums.length; i++) {
            let num = nums[i];
            if (!first.has(num)) first.set(num, i);
            last.set(num, i);
            count.set(num, (count.get(num) || 0) + 1);
        }
        let degree = 0;
        for (let freq of count.values()) {
            degree = Math.max(degree, freq);
        }
        let minLength = nums.length;
        for (let [num, freq] of count.entries()) {
            if (freq === degree) {
                minLength = Math.min(minLength, last.get(num) - first.get(num) + 1);
            }
        }
        return String(minLength);
    },

    "container-with-most-water": (inputStr) => {
        const line = inputStr.split('\n').find(l => l.includes('height'));
        const height = JSON.parse(line.split('=')[1].trim());
        let left = 0;
        let right = height.length - 1;
        let maxArea = 0;
        while (left < right) {
            let width = right - left;
            let area = width * Math.min(height[left], height[right]);
            maxArea = Math.max(maxArea, area);
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        return String(maxArea);
    },

    "3sum": (inputStr) => {
        const line = inputStr.split('\n').find(l => l.includes('nums'));
        const nums = JSON.parse(line.split('=')[1].trim());
        nums.sort((a, b) => a - b);
        let result = [];
        for (let i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] === nums[i - 1]) continue;
            let left = i + 1;
            let right = nums.length - 1;
            while (left < right) {
                let sum = nums[i] + nums[left] + nums[right];
                if (sum === 0) {
                    result.push([nums[i], nums[left], nums[right]]);
                    while (left < right && nums[left] === nums[left + 1]) left++;
                    while (left < right && nums[right] === nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return JSON.stringify(result);
    },

    "maximum-product-subarray": (inputStr) => {
        const line = inputStr.split('\n').find(l => l.includes('nums'));
        const nums = JSON.parse(line.split('=')[1].trim());
        let currentMax = nums[0];
        let currentMin = nums[0];
        let answer = nums[0];
        for (let i = 1; i < nums.length; i++) {
            let num = nums[i];
            if (num < 0) {
                let temp = currentMax;
                currentMax = currentMin;
                currentMin = temp;
            }
            currentMax = Math.max(num, currentMax * num);
            currentMin = Math.min(num, currentMin * num);
            answer = Math.max(answer, currentMax);
        }
        return String(answer);
    },

    "subarray-sum-equals-k": (inputStr) => {
        const lines = inputStr.split('\n');
        const nums = JSON.parse(lines.find(l => l.includes('nums')).split('=')[1].trim());
        const k = parseInt(lines.find(l => l.trim().startsWith('k =')).split('=')[1].trim());
        let prefixSum = 0;
        let count = 0;
        let map = new Map();
        map.set(0, 1);
        for (let num of nums) {
            prefixSum += num;
            if (map.has(prefixSum - k)) {
                count += map.get(prefixSum - k);
            }
            map.set(prefixSum, (map.get(prefixSum) || 0) + 1);
        }
        return String(count);
    },

    "3sum-closest": (inputStr) => {
        const lines = inputStr.split('\n');
        const nums = JSON.parse(lines.find(l => l.includes('nums')).split('=')[1].trim());
        const target = parseInt(lines.find(l => l.trim().startsWith('target =')).split('=')[1].trim());
        nums.sort((a, b) => a - b);
        let closest = nums[0] + nums[1] + nums[2];
        for (let i = 0; i < nums.length - 2; i++) {
            let left = i + 1;
            let right = nums.length - 1;
            while (left < right) {
                let sum = nums[i] + nums[left] + nums[right];
                if (Math.abs(target - sum) < Math.abs(target - closest)) {
                    closest = sum;
                }
                if (sum < target) {
                    left++;
                } else if (sum > target) {
                    right--;
                } else {
                    return String(sum);
                }
            }
        }
        return String(closest);
    },

    "subarray-with-exactly-k-distinct-integers": (inputStr) => {
        const lines = inputStr.split('\n');
        const nums = JSON.parse(lines.find(l => l.includes('nums')).split('=')[1].trim());
        const k = parseInt(lines.find(l => l.trim().startsWith('k =')).split('=')[1].trim());
        const atMost = (nums, k) => {
            let map = new Map();
            let left = 0;
            let count = 0;
            for (let right = 0; right < nums.length; right++) {
                map.set(nums[right], (map.get(nums[right]) || 0) + 1);
                while (map.size > k) {
                    map.set(nums[left], map.get(nums[left]) - 1);
                    if (map.get(nums[left]) === 0) {
                        map.delete(nums[left]);
                    }
                    left++;
                }
                count += right - left + 1;
            }
            return count;
        };
        return String(atMost(nums, k) - atMost(nums, k - 1));
    },

    "smallest-subarray-with-sum-greater-than-or-equal-k": (inputStr) => {
        const lines = inputStr.split('\n');
        const nums = JSON.parse(lines.find(l => l.includes('nums')).split('=')[1].trim());
        const k = parseInt(lines.find(l => l.trim().startsWith('k =')).split('=')[1].trim());
        let left = 0;
        let sum = 0;
        let minLen = Infinity;
        for (let right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= k) {
                minLen = Math.min(minLen, right - left + 1);
                sum -= nums[left];
                left++;
            }
        }
        return String(minLen === Infinity ? 0 : minLen);
    },

    "maximum-chunks-to-make-sorted": (inputStr) => {
        const line = inputStr.split('\n').find(l => l.includes('arr'));
        const arr = JSON.parse(line.split('=')[1].trim());
        let maxSeen = 0;
        let chunks = 0;
        for (let i = 0; i < arr.length; i++) {
            maxSeen = Math.max(maxSeen, arr[i]);
            if (maxSeen === i) {
                chunks++;
            }
        }
        return String(chunks);
    },

    "minimum-operations-to-make-array-continuous": (inputStr) => {
        const line = inputStr.split('\n').find(l => l.includes('nums'));
        const nums = JSON.parse(line.split('=')[1].trim());
        let n = nums.length;
        const uniqueSorted = [...new Set(nums)].sort((a, b) => a - b);
        let maxWindow = 0;
        let left = 0;
        for (let right = 0; right < uniqueSorted.length; right++) {
            while (uniqueSorted[right] - uniqueSorted[left] >= n) {
                left++;
            }
            maxWindow = Math.max(maxWindow, right - left + 1);
        }
        return String(n - maxWindow);
    },

    "find-all-duplicates-in-an-array": (inputStr) => {
        const line = inputStr.split('\n').find(l => l.includes('nums'));
        const nums = JSON.parse(line.split('=')[1].trim());
        let result = [];
        let counts = new Map();
        for (let x of nums) {
            counts.set(x, (counts.get(x) || 0) + 1);
        }
        for (let [x, count] of counts.entries()) {
            if (count === 2) result.push(x);
        }
        result.sort((a, b) => a - b);
        return JSON.stringify(result);
    },

    "maximum-points-you-can-obtain-from-cards": (inputStr) => {
        const lines = inputStr.split('\n');
        const cardPoints = JSON.parse(lines.find(l => l.includes('cardPoints')).split('=')[1].trim());
        const k = parseInt(lines.find(l => l.trim().startsWith('k =')).split('=')[1].trim());
        let n = cardPoints.length;
        let totalSum = cardPoints.reduce((a, b) => a + b, 0);
        if (k === n) return String(totalSum);
        let windowSize = n - k;
        let windowSum = 0;
        for (let i = 0; i < windowSize; i++) {
            windowSum += cardPoints[i];
        }
        let minWindow = windowSum;
        for (let i = windowSize; i < n; i++) {
            windowSum += cardPoints[i] - cardPoints[i - windowSize];
            minWindow = Math.min(minWindow, windowSum);
        }
        return String(totalSum - minWindow);
    },

    "trapping-rain-water": (inputStr) => {
        const line = inputStr.split('\n').find(l => l.includes('height'));
        const height = JSON.parse(line.split('=')[1].trim());
        let left = 0;
        let right = height.length - 1;
        let leftMax = 0;
        let rightMax = 0;
        let water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) {
                    leftMax = height[left];
                } else {
                    water += leftMax - height[left];
                }
                left++;
            } else {
                if (height[right] >= rightMax) {
                    rightMax = height[right];
                } else {
                    water += rightMax - height[right];
                }
                right--;
            }
        }
        return String(water);
    },

    "reverse-pairs": (inputStr) => {
        const line = inputStr.split('\n').find(l => l.includes('nums'));
        const nums = JSON.parse(line.split('=')[1].trim());
        const mergeSort = (copy, low, high) => {
            if (low >= high) return 0;
            let mid = Math.floor((low + high) / 2);
            let count = 0;
            count += mergeSort(copy, low, mid);
            count += mergeSort(copy, mid + 1, high);
            let right = mid + 1;
            for (let i = low; i <= mid; i++) {
                while (right <= high && copy[i] > 2 * copy[right]) {
                    right++;
                }
                count += right - (mid + 1);
            }
            let temp = [];
            let left = low;
            right = mid + 1;
            while (left <= mid && right <= high) {
                if (copy[left] <= copy[right]) {
                    temp.push(copy[left++]);
                } else {
                    temp.push(copy[right++]);
                }
            }
            while (left <= mid) temp.push(copy[left++]);
            while (right <= high) temp.push(copy[right++]);
            for (let i = low; i <= high; i++) {
                copy[i] = temp[i - low];
            }
            return count;
        };
        let copy = [...nums];
        return String(mergeSort(copy, 0, copy.length - 1));
    },

    "largest-rectangle-in-histogram": (inputStr) => {
        const line = inputStr.split('\n').find(l => l.includes('heights'));
        const heights = JSON.parse(line.split('=')[1].trim());
        let stack = [];
        let maxArea = 0;
        let hCopy = [...heights];
        hCopy.push(0);
        for (let i = 0; i < hCopy.length; i++) {
            while (stack.length && hCopy[stack[stack.length - 1]] > hCopy[i]) {
                let height = hCopy[stack.pop()];
                let width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
                maxArea = Math.max(maxArea, height * width);
            }
            stack.push(i);
        }
        return String(maxArea);
    },

    "maximum-sum-of-3-non-overlapping-subarrays": (inputStr) => {
        const lines = inputStr.split('\n');
        const nums = JSON.parse(lines.find(l => l.includes('nums')).split('=')[1].trim());
        const k = parseInt(lines.find(l => l.trim().startsWith('k =')).split('=')[1].trim());
        const n = nums.length;
        let windowSums = [];
        let sum = 0;
        for (let i = 0; i < n; i++) {
            sum += nums[i];
            if (i >= k) {
                sum -= nums[i - k];
            }
            if (i >= k - 1) {
                windowSums.push(sum);
            }
        }
        let left = Array(windowSums.length).fill(0);
        let best = 0;
        for (let i = 0; i < windowSums.length; i++) {
            if (windowSums[i] > windowSums[best]) {
                best = i;
            }
            left[i] = best;
        }
        let right = Array(windowSums.length).fill(0);
        best = windowSums.length - 1;
        for (let i = windowSums.length - 1; i >= 0; i--) {
            if (windowSums[i] >= windowSums[best]) {
                best = i;
            }
            right[i] = best;
        }
        let answer = [];
        let maxTotal = 0;
        for (let middle = k; middle < windowSums.length - k; middle++) {
            let leftIndex = left[middle - k];
            let rightIndex = right[middle + k];
            let total = windowSums[leftIndex] + windowSums[middle] + windowSums[rightIndex];
            if (total > maxTotal) {
                maxTotal = total;
                answer = [leftIndex, middle, rightIndex];
            }
        }
        return JSON.stringify(answer);
    },

    "spiral-matrix": (inputStr) => {
        const line = inputStr.split('\n').find(l => l.includes('matrix'));
        const matrix = JSON.parse(line.split('=')[1].trim());
        if (matrix.length === 0) return "[]";
        let result = [];
        let rowStart = 0;
        let rowEnd = matrix.length - 1;
        let colStart = 0;
        let colEnd = matrix[0].length - 1;
        while (rowStart <= rowEnd && colStart <= colEnd) {
            for (let i = colStart; i <= colEnd; i++) {
                result.push(matrix[rowStart][i]);
            }
            rowStart++;
            for (let i = rowStart; i <= rowEnd; i++) {
                result.push(matrix[i][colEnd]);
            }
            colEnd--;
            if (rowStart <= rowEnd) {
                for (let i = colEnd; i >= colStart; i--) {
                    result.push(matrix[rowEnd][i]);
                }
            }
            rowEnd--;
            if (colStart <= colEnd) {
                for (let i = rowEnd; i >= rowStart; i--) {
                    result.push(matrix[i][colStart]);
                }
            }
            colStart++;
        }
        return JSON.stringify(result);
    }
};

solvers["subarrays-with-k-different-integers"] = solvers["subarray-with-exactly-k-distinct-integers"];

// Helper to generate a valid test case for "Find All Duplicates in an Array"
const generateValidDuplicatesTestCase = (targetLen) => {
    const n = targetLen || Math.floor(Math.random() * 15) + 5;
    // d is number of duplicates, between 0 and n/2
    const d = Math.floor(Math.random() * (n / 2));
    let available = [];
    for (let i = 1; i <= n; i++) available.push(i);
    // Shuffle available
    available.sort(() => Math.random() - 0.5);
    const duplicates = available.slice(0, d);
    const singles = available.slice(d, n - d);
    let nums = [...duplicates, ...duplicates, ...singles];
    // Shuffle nums
    nums.sort(() => Math.random() - 0.5);
    // Duplicates list sorted
    const expected = [...new Set(duplicates)].sort((a,b)=>a-b);
    return {
        input: `nums = [${nums.join(',')}]`,
        output: `[${expected.join(',')}]`
    };
};

// Helper to generate a valid test case for "Find All Numbers Disappeared in an Array"
const generateValidDisappearedTestCase = (targetLen) => {
    const n = targetLen || Math.floor(Math.random() * 15) + 5;
    const nums = [];
    for (let i = 0; i < n; i++) {
        nums.push(Math.floor(Math.random() * n) + 1);
    }
    const set = new Set(nums);
    const expected = [];
    for (let i = 1; i <= n; i++) {
        if (!set.has(i)) expected.push(i);
    }
    return {
        input: `nums = [${nums.join(',')}]`,
        output: `[${expected.join(',')}]`
    };
};

const fixProblems = async () => {
    await connectDB();
    try {
        const problems = await Problem.find({ topic: "arrays" });
        console.log(`Analyzing ${problems.length} array problems...`);

        for (const problem of problems) {
            let changed = false;

            // 1. Normalize all inputs in the database (replace `, param =` with `\nparam =`)
            const normalizeInputStr = (str) => {
                if (!str) return str;
                return str.replace(/,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g, '\n$1 =');
            };

            const visibleCases = problem.testCases?.visible || [];
            const hiddenCases = problem.testCases?.hidden || [];

            for (const tc of visibleCases) {
                const normalized = normalizeInputStr(tc.input);
                if (tc.input !== normalized) {
                    tc.input = normalized;
                    changed = true;
                }
            }

            for (const tc of hiddenCases) {
                const normalized = normalizeInputStr(tc.input);
                if (tc.input !== normalized) {
                    tc.input = normalized;
                    changed = true;
                }
            }

            // 2. Specific logic for "find-all-duplicates-in-an-array" to replace invalid inputs and sort outputs
            if (problem.slug === "find-all-duplicates-in-an-array") {
                const checkAndFixDuplicates = (cases) => {
                    for (let i = 0; i < cases.length; i++) {
                        const tc = cases[i];
                        const match = tc.input.match(/nums\s*=\s*(\[[^\]]*\])/);
                        if (!match) continue;
                        const nums = JSON.parse(match[1]);
                        const n = nums.length;
                        let invalid = false;
                        let counts = new Map();
                        for (let x of nums) {
                            if (x < 1 || x > n) invalid = true;
                            counts.set(x, (counts.get(x) || 0) + 1);
                            if (counts.get(x) > 2) invalid = true;
                        }
                        if (invalid) {
                            const newCase = generateValidDuplicatesTestCase(n);
                            console.log(`  Replacing invalid duplicates testcase input "${tc.input}" -> "${newCase.input}"`);
                            tc.input = newCase.input;
                            tc.output = newCase.output;
                            changed = true;
                        }
                    }
                };
                checkAndFixDuplicates(visibleCases);
                checkAndFixDuplicates(hiddenCases);

                console.log(`Updating optimal solutions for Find All Duplicates to sort output...`);
                problem.theory.optimal.solutionCode.javascript = `function solve(nums) {\n  const result = [];\n  for (let i = 0; i < nums.length; i++) {\n    const index = Math.abs(nums[i]) - 1;\n    if (nums[index] < 0) {\n      result.push(index + 1);\n    } else {\n      nums[index] = -nums[index];\n    }\n  }\n  return result.sort((a, b) => a - b);\n}`;
                problem.theory.optimal.solutionCode.python = `from typing import List\n\ndef solve(nums: List[int]) -> List[int]:\n    result = []\n    for i in range(len(nums)):\n        index = abs(nums[i]) - 1\n        if nums[index] < 0:\n            result.append(index + 1)\n        else:\n            nums[index] = -nums[index]\n    return sorted(result)`;
                problem.theory.optimal.solutionCode.java = `import java.util.*;\n\nclass Solution {\n    public List<Integer> solve(int[] nums) {\n        List<Integer> result = new ArrayList<>();\n        for (int i = 0; i < nums.length; i++) {\n            int index = Math.abs(nums[i]) - 1;\n            if (nums[index] < 0) {\n                result.add(index + 1);\n            } else {\n                nums[index] = -nums[index];\n            }\n        }\n        Collections.sort(result);\n        return result;\n    }\n}`;
                problem.theory.optimal.solutionCode.cpp = `#include <vector>\n#include <algorithm>\n#include <cmath>\nusing namespace std;\n\nvector<int> solve(vector<int>& nums) {\n    vector<int> result;\n    for (int i = 0; i < nums.size(); i++) {\n        int index = abs(nums[i]) - 1;\n        if (nums[index] < 0) {\n            result.push_back(index + 1);\n        }\n        else {\n            nums[index] = -nums[index];\n        }\n    }\n    sort(result.begin(), result.end());\n    return result;\n}`;
                changed = true;
            }

            // 2a. Specific logic for "find-all-numbers-disappeared-in-an-array" to replace invalid inputs
            if (problem.slug === "find-all-numbers-disappeared-in-an-array") {
                const checkAndFixDisappeared = (cases) => {
                    for (let i = 0; i < cases.length; i++) {
                        const tc = cases[i];
                        const match = tc.input.match(/nums\s*=\s*(\[[^\]]*\])/);
                        if (!match) continue;
                        const nums = JSON.parse(match[1]);
                        const n = nums.length;
                        const invalid = nums.some(x => x < 1 || x > n);
                        if (invalid) {
                            const newCase = generateValidDisappearedTestCase(n);
                            console.log(`  Replacing invalid disappeared testcase input "${tc.input}" -> "${newCase.input}"`);
                            tc.input = newCase.input;
                            tc.output = newCase.output;
                            changed = true;
                        }
                    }
                };
                checkAndFixDisappeared(visibleCases);
                checkAndFixDisappeared(hiddenCases);
            }

            // 2b. Specific logic to correct Shortest Unsorted Continuous Subarray test case output
            if (problem.slug === "shortest-unsorted-continuous-subarray") {
                console.log(`Fixing test case for Shortest Unsorted Continuous Subarray...`);
                const checkAndFixUnsorted = (cases) => {
                    for (const tc of cases) {
                        if (tc.input.includes("[1,2,4,3,3]")) {
                            if (tc.output !== "3") {
                                console.log(`  Updating testcase input "${tc.input}" output "${tc.output}" -> "3"`);
                                tc.output = "3";
                                changed = true;
                            }
                        }
                    }
                };
                checkAndFixUnsorted(visibleCases);
                checkAndFixUnsorted(hiddenCases);
            }

            // 3. Regenerate outputs for problematic array problems using correct solvers
            const solver = solvers[problem.slug];
            if (solver) {
                console.log(`Regenerating test case outputs for "${problem.title}"...`);
                for (const tc of visibleCases) {
                    const expectedOutput = solver(tc.input);
                    if (tc.output !== expectedOutput) {
                        console.log(`  Visible TC update output: "${tc.output}" -> "${expectedOutput}"`);
                        tc.output = expectedOutput;
                        changed = true;
                    }
                }
                for (const tc of hiddenCases) {
                    const expectedOutput = solver(tc.input);
                    if (tc.output !== expectedOutput) {
                        console.log(`  Hidden TC update output: "${tc.output}" -> "${expectedOutput}"`);
                        tc.output = expectedOutput;
                        changed = true;
                    }
                }
            }

            // 4. Specifically update optimal solution code for "minimum-swaps-to-group-all-1s-together"
            if (problem.slug === "minimum-swaps-to-group-all-1s-together") {
                console.log(`Updating optimal solution code for Minimum Swaps to Group All 1s Together to circular version...`);
                problem.theory.optimal.solutionCode.javascript = `function solve(nums) {\n  let totalOnes = 0;\n  for (let num of nums) {\n    if (num === 1) {\n      totalOnes++;\n    }\n  }\n  if (totalOnes <= 1) {\n    return 0;\n  }\n  let n = nums.length;\n  let currentOnes = 0;\n  for (let i = 0; i < totalOnes; i++) {\n    if (nums[i] === 1) {\n      currentOnes++;\n    }\n  }\n  let maxOnes = currentOnes;\n  for (let i = 1; i < n; i++) {\n    if (nums[i - 1] === 1) {\n      currentOnes--;\n    }\n    if (nums[(i + totalOnes - 1) % n] === 1) {\n      currentOnes++;\n    }\n    maxOnes = Math.max(maxOnes, currentOnes);\n  }\n  return totalOnes - maxOnes;\n}`;
                problem.theory.optimal.solutionCode.python = `from typing import List\n\ndef solve(nums: List[int]) -> int:\n    total_ones = sum(nums)\n    if total_ones <= 1:\n        return 0\n    n = len(nums)\n    current_ones = sum(nums[:total_ones])\n    max_ones = current_ones\n    for i in range(1, n):\n        if nums[i - 1] == 1:\n            current_ones -= 1\n        if nums[(i + total_ones - 1) % n] == 1:\n            current_ones += 1\n        max_ones = max(max_ones, current_ones)\n    return total_ones - max_ones`;
                problem.theory.optimal.solutionCode.java = `class Solution {\n    public int solve(int[] nums) {\n        int totalOnes = 0;\n        for (int num : nums) {\n            if (num == 1) totalOnes++;\n        }\n        if (totalOnes <= 1) return 0;\n        int n = nums.length;\n        int currentOnes = 0;\n        for (int i = 0; i < totalOnes; i++) {\n            if (nums[i] == 1) currentOnes++;\n        }\n        int maxOnes = currentOnes;\n        for (int i = 1; i < n; i++) {\n            if (nums[i - 1] == 1) currentOnes--;\n            if (nums[(i + totalOnes - 1) % n] == 1) currentOnes++;\n            maxOnes = Math.max(maxOnes, currentOnes);\n        }\n        return totalOnes - maxOnes;\n    }\n}`;
                problem.theory.optimal.solutionCode.cpp = `int solve(vector<int>& nums) {\n    int totalOnes = 0;\n    for (int num : nums) {\n        if (num == 1) totalOnes++;\n    }\n    if (totalOnes <= 1) return 0;\n    int n = nums.size();\n    int currentOnes = 0;\n    for (int i = 0; i < totalOnes; i++) {\n        if (nums[i] == 1) currentOnes++;\n    }\n    int maxOnes = currentOnes;\n    for (int i = 1; i < n; i++) {\n        if (nums[i - 1] == 1) currentOnes--;\n        if (nums[(i + totalOnes - 1) % n] == 1) currentOnes++;\n        maxOnes = max(maxOnes, currentOnes);\n    }\n    return totalOnes - maxOnes;\n}`;
                changed = true;
            }

            if (changed) {
                problem.markModified("testCases");
                problem.markModified("theory");
                await problem.save();
                console.log(`Saved updates for problem: "${problem.title}"`);
            }
        }
        console.log("Successfully fixed array test cases and solution mismatches!");
    } catch (err) {
        console.error("Error during fixProblems:", err);
    } finally {
        mongoose.connection.close();
    }
};

fixProblems();
