import { API_URL } from '../config';
import { sarvamSTT } from './sarvamSTT';
import { sarvamTTS } from './sarvamTTS';
import { scoringEngine, EvaluationResult } from './scoringEngine';
import { analyticsEngine, QuestionMetrics, SessionReport } from './analyticsEngine';

export interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
}

export interface AnswerLog {
    question: string;
    answer: string;
    score: number;
    metrics: QuestionMetrics;
}

export type InterviewEngineState = 'idle' | 'initializing' | 'speaking' | 'listening' | 'transcribing' | 'scoring' | 'generating_next' | 'completed';

export class InterviewEngine {
    public topic: string = '';
    public activeQuestion: string = '';
    public activeQuestionIndex: number = 0;
    public isSessionActive: boolean = false;
    public languageCode: string = 'en-IN';
    public speaker: string = 'aditya';
    
    // Subscriber sync callback
    public onSync?: () => void;
    
    private _state: InterviewEngineState = 'idle';

    public get state(): InterviewEngineState {
        return this._state;
    }

    public set state(s: InterviewEngineState) {
        this._state = s;
        this.triggerSync();
    }
    
    // Conversation history for context
    public history: ChatMessage[] = [];
    
    // Evaluation records for final grading
    public evaluationHistory: AnswerLog[] = [];

    // Timing tracking
    private questionEndTimestamp: number = 0;
    private recordingStartTimestamp: number = 0;

    private retryCount: number = 2;

    constructor() {}

    public triggerSync(): void {
        if (this.onSync) {
            this.onSync();
        }
    }

    /**
     * Start a new mock interview session
     */
    public async startSession(topic: string, startQuestionText?: string): Promise<void> {
        this.topic = topic;
        this.activeQuestionIndex = 1;
        this.isSessionActive = true;
        this.history = [];
        this.evaluationHistory = [];
        this.state = 'initializing';
        
        console.log(`[InterviewEngine] Initializing session on topic: ${topic}`);

        try {
            let initialQuestion = startQuestionText;
            if (!initialQuestion) {
                // Generate initial prompt dynamically from backend
                initialQuestion = await this.generateQuestionFromAPI(topic, []);
            }

            this.activeQuestion = initialQuestion;
            this.history.push({ role: 'assistant', text: initialQuestion });
            this.triggerSync();
            
            // Speak the initial question
            await this.speakQuestion(initialQuestion);
        } catch (err) {
            this.state = 'idle';
            console.error("[InterviewEngine] Failed to start session:", err);
            throw err;
        }
    }

    /**
     * Start recording candidate voice answer
     */
    public async startListening(): Promise<void> {
        if (!this.isSessionActive) throw new Error("Session is not active");
        
        // Narration safety: Stop TTS if user starts speaking early
        sarvamTTS.stop();

        this.state = 'listening';
        this.recordingStartTimestamp = Date.now();
        
        // Calculate latency from question play end to recording start
        const latencyMs = this.questionEndTimestamp > 0 
            ? Math.max(0, this.recordingStartTimestamp - this.questionEndTimestamp)
            : 0;

        await sarvamSTT.startRecording();
        console.log(`[InterviewEngine] Listening to user answer. Latency: ${latencyMs}ms`);
    }

    /**
     * Stop voice recording, transcribe, grade, and request next question
     */
    public async stopAndSubmitAnswer(
        languageCode: string = this.languageCode,
        mode: string = 'transcribe'
    ): Promise<AnswerLog> {
        if (this.state !== 'listening') {
            throw new Error("Interview is not in listening state");
        }

        this.state = 'transcribing';
        const recordingEndTimestamp = Date.now();
        const durationSeconds = (recordingEndTimestamp - this.recordingStartTimestamp) / 1000;
        const latencyMs = this.questionEndTimestamp > 0 
            ? Math.max(0, this.recordingStartTimestamp - this.questionEndTimestamp)
            : 0;

        try {
            // 1. Transcribe audio to text
            const sttResult = await sarvamSTT.stopRecording(languageCode, mode);
            const transcript = sttResult.transcript.trim();

            if (!transcript) {
                throw new Error("No speech detected. Please speak into your microphone and try again.");
            }

            // Record user message
            this.history.push({ role: 'user', text: transcript });
            this.state = 'scoring';

            // 2. Score and evaluate candidate answer
            const evaluation: EvaluationResult = await scoringEngine.evaluateAnswer(
                this.activeQuestion,
                transcript
            );

            // 3. Compute analytics (WPM, latency, filler words)
            const metrics = analyticsEngine.calculateMetrics(
                transcript,
                durationSeconds,
                latencyMs
            );

            const log: AnswerLog = {
                question: this.activeQuestion,
                answer: transcript,
                score: evaluation.score,
                metrics
            };

            this.evaluationHistory.push(log);
            console.log(`[InterviewEngine] Solved question ${this.activeQuestionIndex}. Score: ${evaluation.score}%`);
            this.triggerSync();
            
            return log;
        } catch (err) {
            // Restore state to listen if failed
            this.state = 'listening';
            console.error("[InterviewEngine] Error submitting answer:", err);
            throw err;
        }
    }

    /**
     * Advance to the next question
     */
    public async proceedToNextQuestion(): Promise<void> {
        if (!this.isSessionActive) return;

        this.state = 'generating_next';
        this.activeQuestionIndex++;

        try {
            // 1. Generate next question based on history
            const nextQuestion = await this.generateQuestionFromAPI(this.topic, this.history);
            this.activeQuestion = nextQuestion;
            this.history.push({ role: 'assistant', text: nextQuestion });
            this.triggerSync();

            // 2. Play question speech
            await this.speakQuestion(nextQuestion);
        } catch (err) {
            console.error("[InterviewEngine] Failed to proceed to next question:", err);
            this.state = 'completed'; // Gracefully close session on error
        }
    }

    /**
     * Terminate active interview and compile analytics diagnostics
     */
    public finishSession(): SessionReport {
        console.log("[InterviewEngine] Finalizing mock interview session");
        
        sarvamTTS.stop();
        this.isSessionActive = false;
        this.state = 'completed';

        return analyticsEngine.generateReport(this.evaluationHistory);
    }

    /**
     * Helper: Narrate question and track start indicators
     */
    private async speakQuestion(questionText: string): Promise<void> {
        this.state = 'speaking';
        try {
            await sarvamTTS.speak(questionText, this.languageCode, this.speaker);
        } catch (err) {
            console.warn("[InterviewEngine] Speech output encountered an error, user can read prompt directly:", err);
        } finally {
            this.questionEndTimestamp = Date.now();
            try {
                await this.startListening();
            } catch (listenErr) {
                console.error("[InterviewEngine] Failed to auto-start microphone listening:", listenErr);
                this.state = 'listening';
            }
        }
    }

    /**
     * Replay the active question using the TTS engine
     */
    public async replayActiveQuestion(): Promise<void> {
        if (!this.activeQuestion) return;
        const previousState = this.state;
        this.state = 'speaking';
        try {
            await sarvamTTS.speak(this.activeQuestion, this.languageCode, this.speaker);
        } catch (err) {
            console.warn("[InterviewEngine] Replaying question failed:", err);
        } finally {
            if (previousState === 'listening') {
                try {
                    await this.startListening();
                } catch (listenErr) {
                    console.error("[InterviewEngine] Failed to restart listening after replay:", listenErr);
                    this.state = 'listening';
                }
            } else {
                this.state = previousState;
            }
        }
    }

    /**
     * Helper: Call backend to generate questions with retry
     */
    private async generateQuestionFromAPI(
        topic: string,
        history: ChatMessage[],
        retriesLeft: number = this.retryCount
    ): Promise<string> {
        try {
            const res = await fetch(`${API_URL}/api/sarvam/generate-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, history })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to generate next question");
            }

            const data = await res.json();
            return data.question;
        } catch (err: any) {
            if (retriesLeft > 0) {
                console.warn(`[InterviewEngine] Question generation failed, retrying... (${retriesLeft} retries remaining). Error: ${err.message}`);
                await new Promise(r => setTimeout(r, (this.retryCount - retriesLeft + 1) * 1000));
                return this.generateQuestionFromAPI(topic, history, retriesLeft - 1);
            }
            // Fallback questions pool to guarantee session progression
            const fallbackPool = [
                "Can you tell me about dynamic programming and when you would choose to apply it?",
                "What is the difference between an Array and a Linked List in memory?",
                "How do you resolve hash collisions in a hash table?",
                "Could you explain the difference between Depth First Search and Breadth First Search?"
            ];
            return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
        }
    }
}
