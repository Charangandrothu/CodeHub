const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const apiKey = process.env.SARVAM_API_KEY;

// Create a dummy WAV header + empty audio bytes or read an audio file if one exists
// A valid minimal 1-second silent WAV file:
// Ref: https://github.com/mathiasbynens/small/blob/master/silent.wav (44 bytes long)
const silentWavBase64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
const audioBuffer = Buffer.from(silentWavBase64, 'base64');

async function testSTTDirect() {
    try {
        console.log('Testing Sarvam STT Direct API with silent WAV...');
        
        // Native FormData
        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: 'audio/wav' });
        formData.append('file', blob, 'audio.wav');
        formData.append('model', 'saaras:v3');

        // Let's use axios
        const response = await axios.post('https://api.sarvam.ai/speech-to-text', formData, {
            headers: {
                'api-subscription-key': apiKey,
                // Do not set content-type manually, let axios/formData set it with boundary
            }
        });
        
        console.log('Direct STT success:', response.data);
    } catch (error) {
        console.error('Direct STT Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

testSTTDirect();
