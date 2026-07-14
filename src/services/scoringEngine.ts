import { API_URL } from '../config';

export interface EvaluationResult {
    score: number;
    strengths: string[];
    weaknesses: string[];
    feedback: string;
}

export class ScoringEngineService {
    private retryCount: number = 2;

    constructor() {}

    /**
     * Evaluate a candidate's answer to a specific question
     */
    public async evaluateAnswer(question: string, transcript: string): Promise<EvaluationResult> {
        try {
            console.log(`[ScoringEngine] Requesting AI score for question: "${question.substring(0, 30)}..."`);
            return await this.evaluateWithRetry(question, transcript);
        } catch (err) {
            console.error("[ScoringEngine] Evaluation request failed:", err);
            // Return placeholder score in case of absolute failure so the interview can continue gracefully
            return {
                score: 70,
                strengths: ["Completed answer submission"],
                weaknesses: ["AI evaluation model temporarily unreachable"],
                feedback: "We saved your answer, but the evaluation scoring engine encountered a connection error. You scored a baseline 70."
            };
        }
    }

    /**
     * Helper: Request evaluation from backend proxy with retry logic
     */
    private async evaluateWithRetry(
        question: string,
        transcript: string,
        retriesLeft: number = this.retryCount
    ): Promise<EvaluationResult> {
        try {
            const res = await fetch(`${API_URL}/api/sarvam/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, transcript })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to process evaluation");
            }

            return await res.json();
        } catch (err: any) {
            if (retriesLeft > 0) {
                console.warn(`[ScoringEngine] Evaluation failed, retrying... (${retriesLeft} retries remaining). Error: ${err.message}`);
                await new Promise(r => setTimeout(r, (this.retryCount - retriesLeft + 1) * 1000));
                return this.evaluateWithRetry(question, transcript, retriesLeft - 1);
            }
            throw err;
        }
    }
}

// Export singleton instance
export const scoringEngine = new ScoringEngineService();
