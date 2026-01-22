const axios = require('axios');

async function testJudge0() {
    try {
        console.log("Testing Judge0 connectivity (direct)...");
        const response = await axios.post('https://ce.judge0.com/submissions?base64_encoded=false&wait=false', {
            source_code: "console.log('hello')",
            language_id: 63 // JS
        }, {
            timeout: 5000
        });
        console.log("Judge0 Response:", response.data);
    } catch (error) {
        if (error.response) {
            console.error("Judge0 Error Status:", error.response.status);
            console.error("Judge0 Error Data:", error.response.data);
        } else {
            console.error("Judge0 Error:", error.message);
        }
    }
}

testJudge0();
