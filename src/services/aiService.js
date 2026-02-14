import { API_URL } from '../config';

// ─── Provider color map (for UI) ───
const PROVIDER_COLORS = {
    nvidia: '#76B900',
    gemini: '#4285F4',
    claude: '#D97706',
    deepseek: '#6366F1'
};

// ─── Static fallback list (used before backend responds) ───
export let AI_PROVIDERS = [
    { id: 'nvidia', name: 'NVIDIA', model: 'Llama 3.1 405B', color: '#76B900' }
];

// ─── Fetch Available Providers from Backend ───
export async function fetchAvailableProviders() {
    try {
        const res = await fetch(`${API_URL}/api/ai/providers`);
        if (!res.ok) return AI_PROVIDERS;
        const data = await res.json();

        // Enrich with colors
        const enriched = data.providers.map(p => ({
            ...p,
            color: PROVIDER_COLORS[p.id] || '#6366F1'
        }));

        // Update the exported list
        AI_PROVIDERS = enriched;
        return enriched;
    } catch {
        return AI_PROVIDERS;
    }
}

// ─── Send Chat Message ───
export async function sendAIMessage({
    userId,
    problemTitle,
    problemDescription,
    userCode,
    language,
    userQuestion,
    selectedProvider = 'nvidia'
}) {
    const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            problemTitle,
            problemDescription,
            userCode,
            language,
            userQuestion,
            selectedProvider
        })
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.message || 'AI request failed');
        error.status = res.status;
        error.type = data.type;
        error.retryAfter = data.retryAfter;
        error.remaining = data.remaining;
        throw error;
    }

    return data;
}

// ─── Fetch AI Usage ───
export async function fetchAIUsage(uid) {
    try {
        const res = await fetch(`${API_URL}/api/ai/usage/${uid}`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}
