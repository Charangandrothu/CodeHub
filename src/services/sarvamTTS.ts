import { API_URL } from '../config';

export class SarvamTTSService {
    private activeAudio: HTMLAudioElement | null = null;
    private retryCount: number = 2;

    constructor() {}

    /**
     * Synthesize text to speech and play it back
     * @param text The prompt to narrate
     * @param languageCode Target language (e.g. en-IN, hi-IN)
     * @param speaker Target speaker (e.g. aditya, shubh)
     */
    public async speak(
        text: string,
        languageCode: string = 'en-IN',
        speaker: string = 'aditya'
    ): Promise<void> {
        this.stop(); // Stop any currently playing audio

        try {
            console.log(`[SarvamTTS] Synthesizing text: "${text.substring(0, 40)}..."`);
            const base64Audio = await this.synthesizeWithRetry(text, languageCode, speaker);
            
            // Construct base64 source URL
            const audioUrl = `data:audio/wav;base64,${base64Audio}`;
            this.activeAudio = new Audio(audioUrl);
            
            await new Promise<void>((resolve, reject) => {
                if (!this.activeAudio) return reject(new Error("Audio initialization failed"));

                this.activeAudio.onended = () => {
                    this.activeAudio = null;
                    resolve();
                };

                this.activeAudio.onerror = (e) => {
                    this.activeAudio = null;
                    reject(new Error("Audio playback failed: " + e.toString()));
                };

                this.activeAudio.play().catch(reject);
            });
        } catch (err) {
            console.error("[SarvamTTS] Error playing synthesized audio:", err);
            throw err;
        }
    }

    /**
     * Stop currently playing audio narration
     */
    public stop(): void {
        if (this.activeAudio) {
            console.log("[SarvamTTS] Stopping active speech playback");
            this.activeAudio.pause();
            this.activeAudio.currentTime = 0;
            this.activeAudio = null;
        }
    }

    /**
     * Helper: Fetch synthesized base64 string from backend proxy with retry logic
     */
    private async synthesizeWithRetry(
        text: string,
        languageCode: string,
        speaker: string,
        retriesLeft: number = this.retryCount
    ): Promise<string> {
        try {
            const res = await fetch(`${API_URL}/api/sarvam/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, languageCode, speaker })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to synthesize speech");
            }

            const data = await res.json();
            return data.audio;
        } catch (err: any) {
            if (retriesLeft > 0) {
                console.warn(`[SarvamTTS] Synthesis failed, retrying... (${retriesLeft} retries remaining). Error: ${err.message}`);
                await new Promise(r => setTimeout(r, (this.retryCount - retriesLeft + 1) * 1000));
                return this.synthesizeWithRetry(text, languageCode, speaker, retriesLeft - 1);
            }
            throw err;
        }
    }

    public isSpeaking(): boolean {
        return this.activeAudio !== null;
    }
}

// Export singleton instance
export const sarvamTTS = new SarvamTTSService();
