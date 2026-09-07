require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // ── Keep-alive self-ping (Render free tier prevention) ──────────────────
    // Render free tier sleeps after 15 min of inactivity. Ping ourselves every
    // 10 min in production to stay warm during active usage periods.
    if (process.env.NODE_ENV === 'production') {
        const https = require('https');
        const selfUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
        const pingUrl = `${selfUrl}/api/health`;

        setInterval(() => {
            const client = pingUrl.startsWith('https') ? https : require('http');
            client.get(pingUrl, (res) => {
                console.log(`[Keep-alive] Pinged ${pingUrl} → ${res.statusCode}`);
            }).on('error', () => {
                // Silent — don't crash if ping fails
            });
        }, 10 * 60 * 1000); // every 10 minutes

        console.log(`[Keep-alive] Self-ping enabled → ${pingUrl} every 10 min`);
    }
});