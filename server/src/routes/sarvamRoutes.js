const express = require('express');
const router = express.Router();
const axios = require('axios');
const { routeAIRequest } = require('../services/aiRouter');

// ─── POST /api/sarvam/stt ───
// Proxies Speech-to-Text requests to Sarvam AI using base64 payload
router.post('/stt', async (req, res) => {
    try {
        const { audio, mode, languageCode, mimeType } = req.body;

        if (!audio) {
            return res.status(400).json({ message: "Missing audio base64 data" });
        }

        if (!process.env.SARVAM_API_KEY) {
            return res.status(500).json({ message: "Sarvam API Key is not configured on the server" });
        }

        // Convert base64 audio to a buffer
        const audioBuffer = Buffer.from(audio, 'base64');
        
        // Map mimeType to correct file extension
        const currentMime = mimeType || 'audio/webm';
        let filename = 'audio.webm';
        if (currentMime.includes('wav')) {
            filename = 'audio.wav';
        } else if (currentMime.includes('mp4')) {
            filename = 'audio.mp4';
        } else if (currentMime.includes('ogg')) {
            filename = 'audio.ogg';
        } else if (currentMime.includes('mpeg') || currentMime.includes('mp3')) {
            filename = 'audio.mp3';
        }

        // Construct native FormData
        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: currentMime });
        
        formData.append('file', blob, filename);
        formData.append('model', 'saaras:v3');
        if (mode) formData.append('mode', mode);
        if (languageCode) formData.append('language_code', languageCode);

        console.log(`[Sarvam Proxy] Calling Speech-to-Text REST API with filename: ${filename}, mode: ${mode || 'transcribe'}`);
        
        const response = await axios.post('https://api.sarvam.ai/speech-to-text', formData, {
            headers: {
                'api-subscription-key': process.env.SARVAM_API_KEY
            }
        });

        res.json({
            transcript: response.data.transcript,
            language_code: response.data.language_code
        });

    } catch (err) {
        console.error("[Sarvam STT Proxy Error]:", err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: "Failed to transcribe audio via Sarvam AI",
            error: err.response?.data || err.message
        });
    }
});

// ─── POST /api/sarvam/tts ───
// Proxies Text-to-Speech synthesis to Sarvam AI
router.post('/tts', async (req, res) => {
    try {
        const { text, languageCode, speaker } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Missing text payload for speech synthesis" });
        }

        if (!process.env.SARVAM_API_KEY) {
            return res.status(500).json({ message: "Sarvam API Key is not configured on the server" });
        }

        console.log(`[Sarvam Proxy] Calling Text-to-Speech synthesis for language: ${languageCode || 'en-IN'}`);

        const response = await axios.post('https://api.sarvam.ai/text-to-speech', {
            text,
            target_language_code: languageCode || 'en-IN',
            speaker: speaker || 'aditya',
            model: 'bulbul:v3'
        }, {
            headers: {
                'api-subscription-key': process.env.SARVAM_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.data.audios || response.data.audios.length === 0) {
            throw new Error("No audio returned from speech synthesis");
        }

        res.json({
            audio: response.data.audios[0]
        });

    } catch (err) {
        console.error("[Sarvam TTS Proxy Error]:", err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: "Failed to synthesize speech via Sarvam AI",
            error: err.response?.data || err.message
        });
    }
});

// ─── POST /api/sarvam/evaluate ───
// Evaluates a candidate's transcript using Llama AI
router.post('/evaluate', async (req, res) => {
    try {
        const { question, transcript } = req.body;

        if (!question || !transcript) {
            return res.status(400).json({ message: "Missing question or transcript for evaluation" });
        }

        const systemPrompt = `You are an AI interviewer panel evaluating candidate mock interview answers.
Assess the user's answer to the given question.
Provide a detailed evaluation JSON response with the following keys:
{
   "score": 85, // integer between 0 and 100
   "strengths": ["Clear definition of concepts", "Good structure"],
   "weaknesses": ["Needs to elaborate on time complexity"],
   "feedback": "Overall good answer, but you should mention why index access is O(1)..."
}
Respond ONLY with the raw JSON object. Do not include markdown code block formatting (like \`\`\`json).`;

        const userPrompt = `Question: ${question}\nCandidate Answer: ${transcript}`;

        const result = await routeAIRequest('nvidia', systemPrompt, userPrompt);
        
        // Clean up response text if wrapped in markdown formatting
        let cleanText = result.response.trim();
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }

        let parsedResult;
        try {
            parsedResult = JSON.parse(cleanText);
        } catch (parseErr) {
            console.warn("[Sarvam Evaluate] AI response was not valid JSON, creating fallback object:", cleanText);
            parsedResult = {
                score: 70,
                strengths: ["Provided an answer"],
                weaknesses: ["Format parsed with error"],
                feedback: cleanText
            };
        }

        res.json(parsedResult);

    } catch (err) {
        console.error("[Sarvam Evaluate Error]:", err.message);
        res.status(500).json({ message: "Failed to evaluate answer" });
    }
});

// ─── POST /api/sarvam/generate-question ───
// Generates the next question based on the conversation history
router.post('/generate-question', async (req, res) => {
    try {
        const { topic, history } = req.body;

        if (!topic || !Array.isArray(history)) {
            return res.status(400).json({ message: "Missing topic or conversation history array" });
        }

        const systemPrompt = `You are a professional technical interviewer conducting a mock interview on the topic: ${topic}.
Based on the conversation history, generate the NEXT relevant interview question.
Ask followup questions if the candidate's last answer was brief, or move to a new aspect of the topic.
Respond ONLY with the question text. Do not include any intro, conversational filler, or Markdown code blocks.`;

        const historyText = history.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`).join('\n');
        const userPrompt = `Conversation History:\n${historyText}\n\nGenerate the next question:`;

        const result = await routeAIRequest('nvidia', systemPrompt, userPrompt);
        res.json({ question: result.response.trim() });

    } catch (err) {
        console.error("[Sarvam Question Generation Error]:", err.message);
        res.status(500).json({ message: "Failed to generate interview question" });
    }
});

// ─── POST /api/sarvam/chat ───
// General chat endpoint for the global AI assistant
router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Missing message for chat" });
        }

        if (!process.env.SARVAM_API_KEY) {
            return res.status(500).json({ message: "Sarvam API Key is not configured on the server" });
        }

        const systemPrompt = `You are a premium, highly knowledgeable AI Assistant for CodeHub, a placement preparation and coding platform.
Your role is to help users understand coding concepts, DSA problems, and general platform queries.
Provide clear, concise, and accurate explanations. Use markdown for code blocks.
Maintain a professional yet encouraging tone.`;

        // Format messages for the OpenAI-compatible Sarvam API
        const messages = [{ role: 'system', content: systemPrompt }];
        
        if (history && Array.isArray(history)) {
            history.forEach(h => {
                messages.push({
                    role: h.role === 'user' ? 'user' : 'assistant',
                    content: h.text
                });
            });
        }
        
        messages.push({ role: 'user', content: message });

        const response = await axios.post('https://api.sarvam.ai/v1/chat/completions', {
            model: 'sarvam-105b',
            messages: messages
        }, {
            headers: {
                'api-subscription-key': process.env.SARVAM_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        res.json({ reply: response.data.choices[0].message.content });

    } catch (err) {
        console.error("[Sarvam Chat Error]:", err.response?.data || err.message);
        res.status(500).json({ message: "Failed to process chat request" });
    }
});

module.exports = router;
