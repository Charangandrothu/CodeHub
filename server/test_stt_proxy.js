const axios = require('axios');
require('dotenv').config();

const silentWavBase64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

async function testSTTProxy() {
    try {
        console.log('Testing Sarvam STT Proxy at http://localhost:5000/api/sarvam/stt...');
        const response = await axios.post('http://localhost:5000/api/sarvam/stt', {
            audio: silentWavBase64,
            mode: 'transcribe',
            languageCode: 'en-IN'
        });
        console.log('Proxy STT success:', response.data);
    } catch (error) {
        console.error('Proxy STT Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

testSTTProxy();
