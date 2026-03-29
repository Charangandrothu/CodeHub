import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FocusContext = createContext();

export const useFocus = () => useContext(FocusContext);

export const FocusProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
    const [questionsAttempted, setQuestionsAttempted] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [skippedCount, setSkippedCount] = useState(0);
    
    // Modal visibility for post-sprint analytics
    const [showSummary, setShowSummary] = useState(false);

    // Timer logic
    useEffect(() => {
        let interval;
        if (isActive) {
            interval = setInterval(() => {
                setTimeElapsed((prev) => prev + 1);
            }, 1000);
        } else if (!isActive && timeElapsed !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeElapsed]);

    // Start a fresh session
    const startSprint = useCallback(() => {
        setIsActive(true);
        setTimeElapsed(0);
        setQuestionsAttempted(0);
        setCorrectCount(0);
        setWrongCount(0);
        setSkippedCount(0);
        setShowSummary(false);
    }, []);

    // Stop tracking and show report
    const endSprint = useCallback(() => {
        setIsActive(false);
        if (timeElapsed > 10 || questionsAttempted > 0) {
             setShowSummary(true);
        } else {
             // If they barely started, just close it silently
             closeSummary();
        }
    }, [timeElapsed, questionsAttempted]);

    // Reset everything after closing report
    const closeSummary = useCallback(() => {
        setShowSummary(false);
        setTimeElapsed(0);
        setQuestionsAttempted(0);
        setCorrectCount(0);
        setWrongCount(0);
        setSkippedCount(0);
    }, []);

    // Called from CompanyPractice.jsx
    const logAnswer = useCallback((type) => {
        if (!isActive) return;
        setQuestionsAttempted((prev) => prev + 1);
        if (type === 'correct') setCorrectCount((prev) => prev + 1);
        else if (type === 'wrong') setWrongCount((prev) => prev + 1);
        else if (type === 'skipped') setSkippedCount((prev) => prev + 1);
    }, [isActive]);

    // Derived metrics
    const averageTime = questionsAttempted > 0 ? Math.round(timeElapsed / questionsAttempted) : 0;
    const accuracy = questionsAttempted > 0 ? Math.round((correctCount / questionsAttempted) * 100) : 0;

    return (
        <FocusContext.Provider value={{
            isActive,
            showSummary,
            timeElapsed,
            questionsAttempted,
            correctCount,
            wrongCount,
            skippedCount,
            averageTime,
            accuracy,
            startSprint,
            endSprint,
            closeSummary,
            logAnswer
        }}>
            {children}
        </FocusContext.Provider>
    );
};
