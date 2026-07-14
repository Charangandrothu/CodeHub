import { API_URL } from '../config';

export interface STTResponse {
    transcript: string;
    language_code: string;
}

export class SarvamSTTService {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private isRecording: boolean = false;
    private retryCount: number = 2;

    constructor() {}

    /**
     * Start capturing microphone input
     */
    public async startRecording(): Promise<void> {
        if (this.isRecording) {
            throw new Error("Recording is already in progress");
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            console.log("[SarvamSTT] Microphone recording started");
        } catch (err) {
            console.error("[SarvamSTT] Failed to acquire microphone stream:", err);
            throw new Error("Failed to start voice capture. Please check microphone permissions.");
        }
    }

    /**
     * Stop capturing and request transcription from server
     */
    public stopRecording(languageCode: string = 'en-IN', mode: string = 'transcribe'): Promise<STTResponse> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || !this.isRecording) {
                return reject(new Error("No active recording session found"));
            }

            const mimeType = this.mediaRecorder.mimeType || 'audio/webm';

            this.mediaRecorder.onstop = async () => {
                this.isRecording = false;
                console.log(`[SarvamSTT] Microphone recording stopped, compiling chunks with MIME type: ${mimeType}...`);
                
                try {
                    const audioBlob = new Blob(this.audioChunks, { type: mimeType });
                    
                    // Cleanup media tracks to stop microphone hardware indicator
                    this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());

                    // Convert audio Blob to base64 string
                    const base64Audio = await this.blobToBase64(audioBlob);
                    
                    // Request transcription with retry support
                    const result = await this.transcribeWithRetry(base64Audio, mimeType, languageCode, mode);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Helper: Convert Blob to base64 string
     */
    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Strip metadata prefix (e.g., "data:audio/wav;base64,")
                const base64Data = result.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Helper: Request transcription from server with retry logic
     */
    private async transcribeWithRetry(
        base64Audio: string,
        mimeType: string,
        languageCode: string,
        mode: string,
        retriesLeft: number = this.retryCount
    ): Promise<STTResponse> {
        try {
            const res = await fetch(`${API_URL}/api/sarvam/stt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64Audio, mimeType, languageCode, mode })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to transcribe audio");
            }

            return await res.json();
        } catch (err: any) {
            if (retriesLeft > 0) {
                console.warn(`[SarvamSTT] Transcription failed, retrying... (${retriesLeft} retries remaining). Error: ${err.message}`);
                // Simple exponential backoff
                await new Promise(r => setTimeout(r, (this.retryCount - retriesLeft + 1) * 1000));
                return this.transcribeWithRetry(base64Audio, languageCode, mode, retriesLeft - 1);
            }
            throw err;
        }
    }

    public getActiveState(): boolean {
        return this.isRecording;
    }

    public toggleMute(shouldMute: boolean): void {
        if (this.mediaRecorder && this.mediaRecorder.stream) {
            this.mediaRecorder.stream.getAudioTracks().forEach(track => {
                track.enabled = !shouldMute;
            });
            console.log(`[SarvamSTT] Microphone ${shouldMute ? 'muted' : 'unmuted'}`);
        }
    }
}

// Export singleton instance
export const sarvamSTT = new SarvamSTTService();
