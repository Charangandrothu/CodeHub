const axios = require('axios');

// ─── Provider Configurations ───
const PROVIDER_CONFIG = {
    nvidia: {
        name: 'NVIDIA',
        rpm: 40,
        model: 'meta/llama-3.1-405b-instruct',
        endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
        getHeaders: () => ({
            Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
            'Content-Type': 'application/json'
        })
    },
    gemini: {
        name: 'Gemini',
        rpm: 100,
        model: 'gemini-2.0-flash',
        endpoint: null, // Built dynamically
        getHeaders: () => ({ 'Content-Type': 'application/json' })
    },
    claude: {
        name: 'Claude',
        rpm: 50,
        model: 'claude-3-5-haiku-20241022',
        endpoint: 'https://api.anthropic.com/v1/messages',
        getHeaders: () => ({
            'x-api-key': process.env.CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        })
    },
    deepseek: {
        name: 'DeepSeek',
        rpm: 60,
        model: 'deepseek-chat',
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        getHeaders: () => ({
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
        })
    }
};

// Environment variable mapping per provider
const PROVIDER_ENV_KEYS = {
    nvidia: 'NVIDIA_API_KEY',
    gemini: 'GEMINI_API_KEY',
    claude: 'CLAUDE_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY'
};

// Check if a provider has a valid (non-placeholder) API key
function isProviderAvailable(providerId) {
    const envKey = PROVIDER_ENV_KEYS[providerId];
    if (!envKey) return false;
    const val = process.env[envKey];
    if (!val || val.trim() === '') return false;
    // Reject obvious placeholders
    if (val.startsWith('your_') || val.includes('_here')) return false;
    return true;
}

// Get list of providers that have valid keys
function getAvailableProviders() {
    return Object.keys(PROVIDER_CONFIG).filter(id => isProviderAvailable(id));
}

// Fallback priority order
const FALLBACK_ORDER = ['nvidia', 'gemini', 'deepseek', 'claude'];

// ─── Provider Call Functions ───

async function callNvidia(systemPrompt, userPrompt) {
    const config = PROVIDER_CONFIG.nvidia;
    const response = await axios.post(
        config.endpoint,
        {
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 600,
            stream: false
        },
        { headers: config.getHeaders(), timeout: 30000 }
    );
    return response.data.choices[0].message.content;
}

async function callGemini(systemPrompt, userPrompt) {
    const config = PROVIDER_CONFIG.gemini;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await axios.post(
        url,
        {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 600
            }
        },
        { headers: config.getHeaders(), timeout: 30000 }
    );
    return response.data.candidates[0].content.parts[0].text;
}

async function callClaude(systemPrompt, userPrompt) {
    const config = PROVIDER_CONFIG.claude;
    const response = await axios.post(
        config.endpoint,
        {
            model: config.model,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            max_tokens: 600,
            temperature: 0.2
        },
        { headers: config.getHeaders(), timeout: 30000 }
    );
    return response.data.content[0].text;
}

async function callDeepSeek(systemPrompt, userPrompt) {
    const config = PROVIDER_CONFIG.deepseek;
    const response = await axios.post(
        config.endpoint,
        {
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 600,
            stream: false
        },
        { headers: config.getHeaders(), timeout: 30000 }
    );
    return response.data.choices[0].message.content;
}

// Unified caller map
const PROVIDER_CALLERS = {
    nvidia: callNvidia,
    gemini: callGemini,
    claude: callClaude,
    deepseek: callDeepSeek
};

module.exports = {
    PROVIDER_CONFIG,
    PROVIDER_CALLERS,
    FALLBACK_ORDER,
    isProviderAvailable,
    getAvailableProviders
};
