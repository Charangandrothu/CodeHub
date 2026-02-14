const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.NVIDIA_API_KEY || "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";
const MODEL = "meta/llama-3.1-405b-instruct";
const URL = "https://integrate.api.nvidia.com/v1/chat/completions";

console.log(`Using API Key: ${API_KEY.substring(0, 10)}...`);
console.log(`Testing model: ${MODEL}`);

async function testApi() {
    try {
        const response = await axios.post(
            URL,
            {
                model: MODEL,
                messages: [{ role: "user", content: "Hello" }],
                max_tokens: 10
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                }
            }
        );
        console.log("Success:", response.data);
    } catch (error) {
        if (error.response) {
            console.error("Error Status:", error.response.status);
            console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
    }
}

testApi();
