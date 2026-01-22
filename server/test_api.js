const axios = require('axios');

async function testRun() {
    try {
        console.log("Testing /api/execute/run on PORT 5000...");
        const response = await axios.post('http://localhost:5000/api/execute/run', {
            code: "console.log('hello')",
            language: "javascript",
            stdin: ""
        });
        console.log("Response:", response.data);
    } catch (error) {
        if (error.response) {
            console.error("Server responded with error status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testRun();
