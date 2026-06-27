export interface QuestionMetrics {
    wordCount: number;
    wpm: number;
    fillerCount: number;
    fillerWords: Record<string, number>;
    latencyMs: number;
}

export interface SessionReport {
    totalAnswers: number;
    averageScore: number;
    averageWpm: number;
    totalFillers: number;
    averageLatencyMs: number;
    questionBreakdown: Array<{
        question: string;
        answer: string;
        score: number;
        metrics: QuestionMetrics;
    }>;
}

export class AnalyticsEngineService {
    private commonFillers = ['um', 'uh', 'like', 'basically', 'actually', 'ah', 'so', 'right'];

    constructor() {}

    /**
     * Analyze answer transcript characteristics and compile performance metrics
     * @param transcript The user's transcribed speech
     * @param durationSeconds The length of the audio in seconds
     * @param latencyMs Elapsed time before the user started speaking
     */
    public calculateMetrics(
        transcript: string,
        durationSeconds: number,
        latencyMs: number
    ): QuestionMetrics {
        const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        // Calculate WPM
        const minutes = durationSeconds > 0 ? durationSeconds / 60 : 0.01;
        const wpm = Math.round(wordCount / minutes);

        // Count filler words
        let fillerCount = 0;
        const fillerWords: Record<string, number> = {};

        words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
            if (this.commonFillers.includes(cleanWord)) {
                fillerCount++;
                fillerWords[cleanWord] = (fillerWords[cleanWord] || 0) + 1;
            }
        });

        return {
            wordCount,
            wpm,
            fillerCount,
            fillerWords,
            latencyMs
        };
    }

    /**
     * Compile complete session diagnostics report
     */
    public generateReport(
        sessionHistory: Array<{
            question: string;
            answer: string;
            score: number;
            metrics: QuestionMetrics;
        }>
    ): SessionReport {
        const totalAnswers = sessionHistory.length;
        if (totalAnswers === 0) {
            return {
                totalAnswers: 0,
                averageScore: 0,
                averageWpm: 0,
                totalFillers: 0,
                averageLatencyMs: 0,
                questionBreakdown: []
            };
        }

        let totalScore = 0;
        let totalWpm = 0;
        let totalFillers = 0;
        let totalLatency = 0;

        sessionHistory.forEach(item => {
            totalScore += item.score;
            totalWpm += item.metrics.wpm;
            totalFillers += item.metrics.fillerCount;
            totalLatency += item.metrics.latencyMs;
        });

        return {
            totalAnswers,
            averageScore: Math.round(totalScore / totalAnswers),
            averageWpm: Math.round(totalWpm / totalAnswers),
            totalFillers,
            averageLatencyMs: Math.round(totalLatency / totalAnswers),
            questionBreakdown: sessionHistory
        };
    }
}

// Export singleton instance
export const analyticsEngine = new AnalyticsEngineService();
