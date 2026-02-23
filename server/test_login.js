const http = require('http');

const request = (path, method, data) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        }, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

(async () => {
    try {
        console.log("Testing Step 1...");
        const res1 = await request('/api/admin/auth/login', 'POST', { email: process.env.INITIAL_ADMIN_EMAIL, password: process.env.INITIAL_ADMIN_PASSWORD });
        console.log("Step 1 Response:", res1);

        // We can't grab OTP easily since it's printed to stdout of the OTHER process.
        // Let's query the global store in the OTHER process... wait, we can't because it's a different process.
        // Instead, let's write a backdoor route quickly
    } catch (err) {
        console.error(err);
    }
})();
