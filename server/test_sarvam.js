const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.SARVAM_API_KEY;
console.log('Using API key:', apiKey ? apiKey.substring(0, 10) + '...' : 'undefined');

async function testTTS() {
    try {
        console.log('Testing Text-to-Speech API...');
        const response = await axios.post('https://api.sarvam.ai/text-to-speech', {
            text: 'Hello, this is a test of the text to speech service. Welcome to Code Hub.',
            target_language_code: 'en-IN',
            speaker: 'aditya',
            model: 'bulbul:v3'
        }, {
            headers: {
                'api-subscription-key': apiKey,
                'Content-Type': 'application/json'
            }
        });
        console.log('TTS success!');
        console.log('Response has audios:', response.data.audios ? response.data.audios.length : 'none');
        if (response.data.audios && response.data.audios[0]) {
            console.log('Base64 sample (first 100 chars):', response.data.audios[0].substring(0, 100));
        }
    } catch (error) {
        console.error('TTS Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

testTTS();
