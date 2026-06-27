const { buildBatchDriver, executeWithPolling, languageIds } = require("./src/utils/judgeHelpers");

const code = `function solve(nums, k) {
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

  return count;
}`;

const batchDriver = buildBatchDriver(code, "javascript");
console.log(batchDriver);

async function run() {
    const result = await executeWithPolling(
        batchDriver,
        languageIds.javascript,
        "1\nnums = [1,1,1]\nk = 2\n"
    );
    console.log("Result:", result);
}
run();
