# CodeHubX Company Prep Implementation Guide

> **Complete guide for implementing the TCS preparation module**  
> **Includes: Database design, API routes, Frontend components, Progress tracking**

---

## Table of Contents

1. [Database Schema & Models](#1-database-schema--models)
2. [Question Generation Strategy](#2-question-generation-strategy)
3. [API Routes & Controllers](#3-api-routes--controllers)
4. [Frontend Components](#4-frontend-components)
5. [Progress Tracking System](#5-progress-tracking-system)
6. [Implementation Phases](#6-implementation-phases)

---

## 1. Database Schema & Models

### 1.1 Company Model

```javascript
// models/Company.js
const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    // e.g., 'tcs', 'infosys', 'wipro'
  },
  name: {
    type: String,
    required: true,
    // e.g., 'Tata Consultancy Services'
  },
  logo: {
    type: String,
    // URL to company logo
  },
  accentColor: {
    type: String,
    default: '#3b82f6',
    // Brand color for company page
  },
  
  // Overview Information
  overview: {
    description: String,
    hiringPattern: {
      rounds: [{
        name: String,      // e.g., 'Foundation Section'
        duration: Number,  // minutes
        description: String
      }]
    },
    eligibility: {
      cgpa: String,      // e.g., '≥ 60% or 6.0 CGPA'
      branches: [String],
      backlogs: String,
      other: [String]
    },
    packages: [{
      role: String,      // e.g., 'TCS Ninja'
      salary: String,    // e.g., '₹3.36 - 3.6 LPA'
      criteria: String
    }],
    hiringDates: String, // e.g., '3-4 times per year'
    importantNotes: [String]
  },
  
  // Statistics
  stats: {
    totalQuestions: { type: Number, default: 0 },
    aptitudeQuestions: { type: Number, default: 0 },
    reasoningQuestions: { type: Number, default: 0 },
    codingProblems: { type: Number, default: 0 },
    mockTests: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', CompanySchema);
```

---

### 1.2 AptitudeQuestion Model

```javascript
// models/AptitudeQuestion.js
const mongoose = require('mongoose');

const AptitudeQuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
    // Format: TCS_NUM_PERC_001
  },
  
  company: {
    type: String,
    required: true,
    ref: 'Company',
    // slug reference: 'tcs', 'infosys', etc.
  },
  
  section: {
    type: String,
    required: true,
    enum: ['Numerical Ability', 'Verbal Ability', 'Reasoning Ability'],
  },
  
  topic: {
    type: String,
    required: true,
    // e.g., 'Percentages', 'Profit & Loss', etc.
  },
  
  subTopic: {
    type: String,
    // e.g., 'Percentage Increase/Decrease'
  },
  
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  
  question: {
    type: String,
    required: true,
  },
  
  options: [{
    type: String,
    required: true
  }],
  // Length must be 4
  
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
    // Index of correct option (0-3)
  },
  
  solution: {
    type: String,
    required: true,
    // Step-by-step solution
  },
  
  hint: {
    type: String,
    // Hint for students
  },
  
  explanation: {
    type: String,
    // Detailed explanation of concept
  },
  
  timeToSolve: {
    type: Number,
    default: 60,
    // Expected time in seconds
  },
  
  tags: [{
    type: String
  }],
  // e.g., ['percentage', 'formula-based', 'calculation']
  
  // Analytics
  usageCount: {
    type: Number,
    default: 0
  },
  
  avgAccuracy: {
    type: Number,
    default: null,
    // Percentage (0-100)
  },
  
  avgTimeTaken: {
    type: Number,
    default: null,
    // Average time users take (seconds)
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  verifiedBy: {
    type: String,
    // Admin who verified this question
  }
});

// Indexes for faster queries
AptitudeQuestionSchema.index({ company: 1, section: 1, topic: 1 });
AptitudeQuestionSchema.index({ difficulty: 1 });
AptitudeQuestionSchema.index({ questionId: 1 });

module.exports = mongoose.model('AptitudeQuestion', AptitudeQuestionSchema);
```

---

### 1.3 MockTest Model

```javascript
// models/MockTest.js
const mongoose = require('mongoose');

const MockTestSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true,
    // Format: TCS_MOCK_FOUNDATION_01
  },
  
  company: {
    type: String,
    required: true,
    ref: 'Company'
  },
  
  name: {
    type: String,
    required: true,
    // e.g., 'TCS NQT Foundation Mock Test #1'
  },
  
  type: {
    type: String,
    required: true,
    enum: ['Foundation', 'Advanced', 'Full']
  },
  
  duration: {
    type: Number,
    required: true,
    // Total duration in minutes
  },
  
  sections: [{
    name: {
      type: String,
      required: true,
      // e.g., 'Numerical Ability'
    },
    timeLimit: {
      type: Number,
      // Section-specific time limit (minutes)
    },
    questions: [{
      questionType: {
        type: String,
        enum: ['aptitude', 'reasoning', 'verbal', 'coding']
      },
      questionId: {
        type: String,
        // Reference to AptitudeQuestion or Problem
      }
    }]
  }],
  
  totalQuestions: {
    type: Number,
    required: true
  },
  
  passingScore: {
    type: Number,
    // Percentage required to pass
  },
  
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard']
  },
  
  instructions: [String],
  
  // Analytics
  attemptCount: {
    type: Number,
    default: 0
  },
  
  avgScore: {
    type: Number,
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isPro: {
    type: Boolean,
    default: false,
    // True if only Pro users can access
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MockTest', MockTestSchema);
```

---

### 1.4 UserCompanyProgress Model

```javascript
// models/UserCompanyProgress.js
const mongoose = require('mongoose');

const UserCompanyProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
    // Firebase UID
  },
  
  company: {
    type: String,
    required: true,
    ref: 'Company'
  },
  
  // Section-wise progress
  aptitude: {
    attempted: [{
      questionId: String,
      isCorrect: Boolean,
      timeTaken: Number, // seconds
      attemptedAt: Date
    }],
    totalAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // percentage
    
    // Topic-wise breakdown
    topicProgress: [{
      topic: String,
      attempted: Number,
      correct: Number,
      accuracy: Number
    }]
  },
  
  reasoning: {
    attempted: [{
      questionId: String,
      isCorrect: Boolean,
      timeTaken: Number,
      attemptedAt: Date
    }],
    totalAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    
    topicProgress: [{
      topic: String,
      attempted: Number,
      correct: Number,
      accuracy: Number
    }]
  },
  
  verbal: {
    attempted: [{
      questionId: String,
      isCorrect: Boolean,
      timeTaken: Number,
      attemptedAt: Date
    }],
    totalAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    
    topicProgress: [{
      topic: String,
      attempted: Number,
      correct: Number,
      accuracy: Number
    }]
  },
  
  coding: {
    solvedProblems: [String], // Array of problem IDs
    totalSolved: { type: Number, default: 0 }
  },
  
  mockTests: {
    attempted: [{
      testId: String,
      score: Number,
      maxScore: Number,
      percentage: Number,
      timeTaken: Number, // minutes
      attemptedAt: Date,
      sectionScores: [{
        section: String,
        score: Number,
        maxScore: Number
      }]
    }],
    totalAttempted: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 }
  },
  
  // Overall progress
  overallProgress: {
    type: Number,
    default: 0,
    // Percentage (0-100)
  },
  
  // 30-Day Sprint
  sprint: {
    isActive: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    currentDay: { type: Number, default: 0 },
    
    dailyProgress: [{
      day: Number,
      date: Date,
      tasks: [{
        type: String, // 'aptitude', 'reasoning', 'verbal', 'coding', 'mock'
        topic: String,
        targetQuestions: Number,
        completedQuestions: Number,
        isCompleted: Boolean
      }],
      overallCompletion: Number // percentage
    }]
  },
  
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for faster queries
UserCompanyProgressSchema.index({ userId: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('UserCompanyProgress', UserCompanyProgressSchema);
```

---

### 1.5 InterviewExperience Model

```javascript
// models/InterviewExperience.js
const mongoose = require('mongoose');

const InterviewExperienceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  company: {
    type: String,
    required: true,
    ref: 'Company'
  },
  
  year: {
    type: Number,
    required: true,
    // e.g., 2025
  },
  
  college: {
    type: String,
    // User's college name
  },
  
  outcome: {
    type: String,
    required: true,
    enum: ['Selected', 'Rejected', 'On-hold', 'In-process']
  },
  
  package: {
    type: String,
    // e.g., 'TCS Ninja - 3.6 LPA'
  },
  
  roundDetails: [{
    roundName: String,    // e.g., 'Technical Round'
    duration: Number,     // minutes
    questions: [String],  // Array of questions asked
    topics: [String],     // Topics covered
    verdict: String,      // 'Cleared', 'Rejected'
    tips: String
  }],
  
  overallExperience: {
    type: String,
    required: true,
    // Long-form text
  },
  
  preparationTips: {
    type: String
  },
  
  upvotes: {
    type: Number,
    default: 0
  },
  
  upvotedBy: [{
    type: String
    // Array of user IDs who upvoted
  }],
  
  isVerified: {
    type: Boolean,
    default: false
    // Admin-verified experiences get a badge
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
InterviewExperienceSchema.index({ company: 1, year: -1, upvotes: -1 });

module.exports = mongoose.model('InterviewExperience', InterviewExperienceSchema);
```

---

## 2. Question Generation Strategy

### 2.1 AI-Powered Question Generation

Create a script to generate questions using AI:

```javascript
// scripts/generateQuestions.js
const axios = require('axios');
const AptitudeQuestion = require('../models/AptitudeQuestion');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateAptitudeQuestions(config) {
  const { company, section, topic, difficulty, count } = config;
  
  const prompt = `You are an expert ${company.toUpperCase()} placement preparation question creator.

Generate ${count} multiple-choice questions for the following:

**Company:** ${company}
**Section:** ${section}
**Topic:** ${topic}
**Difficulty:** ${difficulty}

**Requirements:**
- Each question must be unique and test understanding of ${topic}
- Provide 4 options (A, B, C, D) with only one correct answer
- Include detailed step-by-step solution
- Add a hint for students
- Ensure realistic numbers (calculation-friendly)
- Mark time to solve (in seconds)

**Output Format (JSON array):**
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "solution": "string (step-by-step with formulas)",
    "hint": "string",
    "timeToSolve": 60,
    "tags": ["array", "of", "tags"]
  }
]

Return ONLY the JSON array, no markdown formatting or backticks.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }
    );
    
    const text = response.data.candidates[0].content.parts[0].text;
    
    // Clean response (remove markdown if present)
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const questions = JSON.parse(cleaned);
    
    // Save to database
    const savedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      const questionId = `${company.toUpperCase()}_${section.substring(0, 3).toUpperCase()}_${topic.substring(0, 4).toUpperCase()}_${String(i + 1).padStart(3, '0')}`;
      
      const aptitudeQuestion = new AptitudeQuestion({
        questionId,
        company,
        section,
        topic,
        difficulty,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        solution: q.solution,
        hint: q.hint,
        timeToSolve: q.timeToSolve || 60,
        tags: q.tags || [topic.toLowerCase()],
        verifiedBy: 'AI-Generated'
      });
      
      await aptitudeQuestion.save();
      savedQuestions.push(aptitudeQuestion);
    }
    
    console.log(`✅ Generated ${savedQuestions.length} questions for ${topic}`);
    return savedQuestions;
    
  } catch (error) {
    console.error('Error generating questions:', error.message);
    throw error;
  }
}

// Batch generation function
async function generateAllTCSQuestions() {
  const topics = [
    { section: 'Numerical Ability', topic: 'Percentages', difficulty: 'Easy', count: 20 },
    { section: 'Numerical Ability', topic: 'Percentages', difficulty: 'Medium', count: 10 },
    { section: 'Numerical Ability', topic: 'Profit & Loss', difficulty: 'Easy', count: 15 },
    { section: 'Numerical Ability', topic: 'Profit & Loss', difficulty: 'Medium', count: 15 },
    { section: 'Numerical Ability', topic: 'Time & Work', difficulty: 'Medium', count: 15 },
    // ... add all topics
  ];
  
  for (const topicConfig of topics) {
    await generateAptitudeQuestions({
      company: 'tcs',
      ...topicConfig
    });
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('🎉 All questions generated successfully!');
}

// Run
generateAllTCSQuestions().catch(console.error);
```

---

### 2.2 Bulk Import from CSV/JSON

For manual question entry or importing from existing sources:

```javascript
// scripts/importQuestions.js
const fs = require('fs');
const csv = require('csv-parser');
const AptitudeQuestion = require('../models/AptitudeQuestion');

async function importQuestionsFromCSV(filepath) {
  const questions = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', (row) => {
        questions.push({
          questionId: row.questionId,
          company: row.company,
          section: row.section,
          topic: row.topic,
          difficulty: row.difficulty,
          question: row.question,
          options: JSON.parse(row.options), // Assumes JSON array in CSV
          correctAnswer: parseInt(row.correctAnswer),
          solution: row.solution,
          hint: row.hint || '',
          tags: row.tags ? row.tags.split(',') : []
        });
      })
      .on('end', async () => {
        try {
          await AptitudeQuestion.insertMany(questions);
          console.log(`✅ Imported ${questions.length} questions`);
          resolve(questions);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Usage
importQuestionsFromCSV('./questions_tcs.csv').catch(console.error);
```

---

## 3. API Routes & Controllers

### 3.1 Company Routes

```javascript
// routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllCompanies,
  getCompanyBySlug,
  getCompanyStats
} = require('../controllers/companyController');

// GET /api/companies - List all companies
router.get('/', getAllCompanies);

// GET /api/companies/:slug - Company detail
router.get('/:slug', getCompanyBySlug);

// GET /api/companies/:slug/stats - Company statistics
router.get('/:slug/stats', getCompanyStats);

module.exports = router;
```

```javascript
// controllers/companyController.js
const Company = require('../models/Company');
const UserCompanyProgress = require('../models/UserCompanyProgress');

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ isActive: true })
      .select('slug name logo accentColor stats overview.packages')
      .sort({ 'stats.totalUsers': -1 }); // Most popular first
    
    res.json({
      success: true,
      companies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCompanyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { uid } = req.query; // Optional: logged-in user
    
    const company = await Company.findOne({ slug, isActive: true });
    
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    // If user is logged in, fetch their progress
    let userProgress = null;
    if (uid) {
      userProgress = await UserCompanyProgress.findOne({ userId: uid, company: slug });
    }
    
    res.json({
      success: true,
      company,
      userProgress
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCompanyStats = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const company = await Company.findOne({ slug }).select('stats');
    
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    res.json({
      success: true,
      stats: company.stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

### 3.2 Question Routes

```javascript
// routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getQuestions,
  submitAnswer,
  getQuestionsByTopic
} = require('../controllers/questionController');

// GET /api/companies/:slug/questions
// Query params: section, topic, difficulty, limit, skip
router.get('/:slug/questions', getQuestions);

// GET /api/companies/:slug/questions/topic/:topic
router.get('/:slug/questions/topic/:topic', getQuestionsByTopic);

// POST /api/companies/:slug/questions/:questionId/submit
router.post('/:slug/questions/:questionId/submit', submitAnswer);

module.exports = router;
```

```javascript
// controllers/questionController.js
const AptitudeQuestion = require('../models/AptitudeQuestion');
const UserCompanyProgress = require('../models/UserCompanyProgress');

exports.getQuestions = async (req, res) => {
  try {
    const { slug } = req.params;
    const { 
      section, 
      topic, 
      difficulty, 
      limit = 10, 
      skip = 0,
      uid // User ID to exclude already attempted
    } = req.query;
    
    // Build query
    const query = { 
      company: slug, 
      isActive: true 
    };
    
    if (section) query.section = section;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    
    // Get user's attempted questions to exclude them
    let attemptedQuestionIds = [];
    if (uid) {
      const progress = await UserCompanyProgress.findOne({ userId: uid, company: slug });
      
      if (progress) {
        const sectionKey = section === 'Numerical Ability' ? 'aptitude' : 
                          section === 'Verbal Ability' ? 'verbal' : 'reasoning';
        
        attemptedQuestionIds = progress[sectionKey]?.attempted.map(a => a.questionId) || [];
      }
    }
    
    if (attemptedQuestionIds.length > 0) {
      query.questionId = { $nin: attemptedQuestionIds };
    }
    
    const questions = await AptitudeQuestion
      .find(query)
      .select('-correctAnswer -solution -hint -explanation') // Don't send answers initially
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });
    
    const total = await AptitudeQuestion.countDocuments(query);
    
    res.json({
      success: true,
      questions,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: skip + questions.length < total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { slug, questionId } = req.params;
    const { uid, selectedAnswer, timeTaken } = req.body;
    
    if (!uid || selectedAnswer === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Get question
    const question = await AptitudeQuestion.findOne({ questionId, company: slug });
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    // Determine section key
    const sectionKey = question.section === 'Numerical Ability' ? 'aptitude' : 
                      question.section === 'Verbal Ability' ? 'verbal' : 'reasoning';
    
    // Update user progress
    let progress = await UserCompanyProgress.findOne({ userId: uid, company: slug });
    
    if (!progress) {
      progress = new UserCompanyProgress({ userId: uid, company: slug });
    }
    
    // Check if already attempted
    const alreadyAttempted = progress[sectionKey].attempted.some(a => a.questionId === questionId);
    
    if (alreadyAttempted) {
      return res.status(400).json({ success: false, message: 'Question already attempted' });
    }
    
    // Add to attempted
    progress[sectionKey].attempted.push({
      questionId,
      isCorrect,
      timeTaken: timeTaken || 0,
      attemptedAt: new Date()
    });
    
    // Update stats
    progress[sectionKey].totalAttempted += 1;
    if (isCorrect) progress[sectionKey].totalCorrect += 1;
    progress[sectionKey].accuracy = (progress[sectionKey].totalCorrect / progress[sectionKey].totalAttempted) * 100;
    
    // Update topic-wise progress
    const topicIndex = progress[sectionKey].topicProgress.findIndex(t => t.topic === question.topic);
    if (topicIndex === -1) {
      progress[sectionKey].topicProgress.push({
        topic: question.topic,
        attempted: 1,
        correct: isCorrect ? 1 : 0,
        accuracy: isCorrect ? 100 : 0
      });
    } else {
      progress[sectionKey].topicProgress[topicIndex].attempted += 1;
      if (isCorrect) progress[sectionKey].topicProgress[topicIndex].correct += 1;
      progress[sectionKey].topicProgress[topicIndex].accuracy = 
        (progress[sectionKey].topicProgress[topicIndex].correct / 
         progress[sectionKey].topicProgress[topicIndex].attempted) * 100;
    }
    
    // Calculate overall progress
    const totalAttempted = progress.aptitude.totalAttempted + 
                          progress.reasoning.totalAttempted + 
                          progress.verbal.totalAttempted;
    const totalQuestions = 500; // Assuming 500 total questions per company
    progress.overallProgress = Math.min((totalAttempted / totalQuestions) * 100, 100);
    
    progress.lastActivityAt = new Date();
    
    await progress.save();
    
    // Update question analytics
    question.usageCount += 1;
    
    // Update average accuracy
    if (question.avgAccuracy === null) {
      question.avgAccuracy = isCorrect ? 100 : 0;
    } else {
      question.avgAccuracy = ((question.avgAccuracy * (question.usageCount - 1)) + (isCorrect ? 100 : 0)) / question.usageCount;
    }
    
    // Update average time taken
    if (timeTaken) {
      if (question.avgTimeTaken === null) {
        question.avgTimeTaken = timeTaken;
      } else {
        question.avgTimeTaken = ((question.avgTimeTaken * (question.usageCount - 1)) + timeTaken) / question.usageCount;
      }
    }
    
    await question.save();
    
    res.json({
      success: true,
      isCorrect,
      correctAnswer: question.correctAnswer,
      solution: question.solution,
      hint: question.hint,
      explanation: question.explanation,
      progress: {
        totalAttempted: progress[sectionKey].totalAttempted,
        totalCorrect: progress[sectionKey].totalCorrect,
        accuracy: progress[sectionKey].accuracy,
        overallProgress: progress.overallProgress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 4. Frontend Components

### 4.1 Company Hub Page

```jsx
// pages/CompaniesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCompanies();
  }, []);
  
  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get('/api/companies');
      setCompanies(data.companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCompanies = companies.filter(company => {
    if (filter === 'all') return true;
    // Add filter logic based on company type
    return true;
  });
  
  if (loading) return <div className="loading">Loading companies...</div>;
  
  return (
    <div className="companies-page">
      <header className="companies-header">
        <h1>Company-Wise Placement Prep</h1>
        <p>Master TCS, Infosys, Wipro, Cognizant & Accenture placements</p>
      </header>
      
      <div className="filter-bar">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Companies
        </button>
        <button 
          className={filter === 'mass-hiring' ? 'active' : ''}
          onClick={() => setFilter('mass-hiring')}
        >
          Mass Hiring
        </button>
        <button 
          className={filter === 'service' ? 'active' : ''}
          onClick={() => setFilter('service')}
        >
          Service Companies
        </button>
      </div>
      
      <div className="companies-grid">
        {filteredCompanies.map(company => (
          <CompanyCard key={company.slug} company={company} />
        ))}
      </div>
    </div>
  );
};

const CompanyCard = ({ company }) => {
  return (
    <Link to={`/companies/${company.slug}`} className="company-card">
      <div className="company-card-header">
        <img src={company.logo} alt={company.name} className="company-logo" />
        {company.stats.totalUsers > 1000 && (
          <span className="badge popular">⭐ Most Popular</span>
        )}
      </div>
      
      <h3>{company.name}</h3>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ 
            width: `${company.userProgress?.overallProgress || 0}%`,
            backgroundColor: company.accentColor
          }}
        />
      </div>
      <p className="progress-text">
        {company.userProgress?.overallProgress || 0}% completed
      </p>
      
      <div className="company-stats">
        <span>📚 {company.stats.totalQuestions} Questions</span>
        <span>📝 {company.stats.mockTests} Mock Tests</span>
      </div>
      
      <button 
        className="start-prep-btn"
        style={{ backgroundColor: company.accentColor }}
      >
        Start Prep →
      </button>
    </Link>
  );
};

export default CompaniesPage;
```

---

### 4.2 Company Detail Page with Tabs

```jsx
// pages/CompanyDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Tab components
import OverviewTab from '../components/company/OverviewTab';
import AptitudeTab from '../components/company/AptitudeTab';
import ReasoningTab from '../components/company/ReasoningTab';
import CodingTab from '../components/company/CodingTab';
import MockTestsTab from '../components/company/MockTestsTab';
import ExperiencesTab from '../components/company/ExperiencesTab';

const CompanyDetailPage = () => {
  const { slug } = useParams();
  const { currentUser } = useAuth();
  const [company, setCompany] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCompanyData();
  }, [slug, currentUser]);
  
  const fetchCompanyData = async () => {
    try {
      const { data } = await axios.get(`/api/companies/${slug}`, {
        params: { uid: currentUser?.uid }
      });
      
      setCompany(data.company);
      setProgress(data.userProgress);
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="loading">Loading...</div>;
  if (!company) return <div className="error">Company not found</div>;
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'aptitude', label: 'Aptitude', icon: '🧮' },
    { id: 'reasoning', label: 'Reasoning', icon: '🧠' },
    { id: 'coding', label: 'Coding', icon: '💻' },
    { id: 'mocks', label: 'Mock Tests', icon: '📝' },
    { id: 'experiences', label: 'Experiences', icon: '💬' }
  ];
  
  return (
    <div className="company-detail-page">
      {/* Header */}
      <div 
        className="company-header"
        style={{ borderBottom: `4px solid ${company.accentColor}` }}
      >
        <div className="company-info">
          <img src={company.logo} alt={company.name} className="company-logo-large" />
          <div>
            <h1>{company.name}</h1>
            <p className="company-tagline">Complete placement preparation</p>
          </div>
        </div>
        
        <div className="company-progress">
          <div className="circular-progress">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8" />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke={company.accentColor} 
                strokeWidth="8"
                strokeDasharray={`${(progress?.overallProgress || 0) * 2.83} 283`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="progress-percentage">{progress?.overallProgress || 0}%</span>
          </div>
          <p>Overall Progress</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? { borderBottomColor: company.accentColor } : {}}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab company={company} />}
        {activeTab === 'aptitude' && <AptitudeTab company={company} progress={progress} />}
        {activeTab === 'reasoning' && <ReasoningTab company={company} progress={progress} />}
        {activeTab === 'coding' && <CodingTab company={company} progress={progress} />}
        {activeTab === 'mocks' && <MockTestsTab company={company} progress={progress} />}
        {activeTab === 'experiences' && <ExperiencesTab company={company} />}
      </div>
    </div>
  );
};

export default CompanyDetailPage;
```

---

### 4.3 Question Practice Component

```jsx
// components/company/AptitudeTab.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AptitudeTab = ({ company, progress }) => {
  const { currentUser } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const topics = [
    { name: 'Percentages', count: 30, priority: 'Very High' },
    { name: 'Profit & Loss', count: 30, priority: 'Very High' },
    { name: 'Time & Work', count: 20, priority: 'High' },
    { name: 'Time, Speed & Distance', count: 20, priority: 'High' },
    { name: 'Data Interpretation', count: 25, priority: 'High' },
    // ... more topics
  ];
  
  // Timer effect
  useEffect(() => {
    if (selectedTopic && !showResult) {
      const interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedTopic, showResult]);
  
  const loadQuestions = async (topic) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/companies/${company.slug}/questions`, {
        params: {
          section: 'Numerical Ability',
          topic: topic.name,
          limit: 10,
          uid: currentUser?.uid
        }
      });
      
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setSelectedTopic(topic);
      setTimer(0);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const submitAnswer = async () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    
    try {
      const { data } = await axios.post(
        `/api/companies/${company.slug}/questions/${currentQuestion.questionId}/submit`,
        {
          uid: currentUser.uid,
          selectedAnswer,
          timeTaken: timer
        }
      );
      
      setResult(data);
      setShowResult(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
      setTimer(0);
    } else {
      // All questions completed
      setSelectedTopic(null);
      setQuestions([]);
      // Show summary
    }
  };
  
  if (!selectedTopic) {
    return (
      <div className="aptitude-topics">
        <h2>Numerical Ability Topics</h2>
        <p className="description">
          Practice topic-wise questions matching TCS NQT pattern. 
          Complete all topics to master the Aptitude section.
        </p>
        
        <div className="topics-grid">
          {topics.map(topic => {
            const topicProgress = progress?.aptitude.topicProgress.find(t => t.topic === topic.name);
            
            return (
              <div key={topic.name} className="topic-card">
                <div className="topic-header">
                  <h3>{topic.name}</h3>
                  <span className={`priority-badge ${topic.priority.toLowerCase().replace(' ', '-')}`}>
                    {topic.priority}
                  </span>
                </div>
                
                <div className="topic-stats">
                  <span>📝 {topic.count} questions</span>
                  {topicProgress && (
                    <span>✅ {topicProgress.attempted} attempted</span>
                  )}
                </div>
                
                {topicProgress && (
                  <div className="accuracy-badge">
                    <span className="accuracy-label">Accuracy:</span>
                    <span className={`accuracy-value ${topicProgress.accuracy >= 70 ? 'good' : 'needs-improvement'}`}>
                      {topicProgress.accuracy.toFixed(1)}%
                    </span>
                  </div>
                )}
                
                <button 
                  className="practice-btn"
                  onClick={() => loadQuestions(topic)}
                >
                  {topicProgress ? 'Continue Practice' : 'Start Practice'} →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  if (loading) return <div className="loading">Loading questions...</div>;
  
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="question-practice">
      {/* Header */}
      <div className="practice-header">
        <button className="back-btn" onClick={() => setSelectedTopic(null)}>
          ← Back to Topics
        </button>
        
        <div className="practice-info">
          <span className="topic-name">{selectedTopic.name}</span>
          <span className="question-counter">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="timer">⏱️ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
        </div>
      </div>
      
      {/* Question */}
      <div className="question-container">
        <h3 className="question-text">{currentQuestion.question}</h3>
        
        <div className="options">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`option ${selectedAnswer === index ? 'selected' : ''} ${
                showResult ? (index === result.correctAnswer ? 'correct' : (selectedAnswer === index ? 'incorrect' : '')) : ''
              }`}
              onClick={() => !showResult && setSelectedAnswer(index)}
              disabled={showResult}
            >
              <span className="option-label">{String.fromCharCode(65 + index)}.</span>
              {option}
              {showResult && index === result.correctAnswer && <span className="checkmark">✓</span>}
              {showResult && selectedAnswer === index && index !== result.correctAnswer && <span className="cross">✗</span>}
            </button>
          ))}
        </div>
        
        {/* Result Section */}
        {showResult && (
          <div className={`result-section ${result.isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="result-header">
              <span className="result-icon">{result.isCorrect ? '🎉' : '❌'}</span>
              <h4>{result.isCorrect ? 'Correct!' : 'Incorrect'}</h4>
            </div>
            
            <div className="solution">
              <h5>Solution:</h5>
              <p>{result.solution}</p>
            </div>
            
            {result.explanation && (
              <div className="explanation">
                <h5>Explanation:</h5>
                <p>{result.explanation}</p>
              </div>
            )}
            
            <button className="next-btn" onClick={nextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'} →
            </button>
          </div>
        )}
        
        {/* Submit Button */}
        {!showResult && (
          <button 
            className="submit-btn" 
            onClick={submitAnswer}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  );
};

export default AptitudeTab;
```

---

## 5. Progress Tracking System

### 5.1 Progress Dashboard Component

```jsx
// components/company/ProgressDashboard.jsx
import React from 'react';

const ProgressDashboard = ({ progress, company }) => {
  const sections = [
    { 
      key: 'aptitude', 
      name: 'Numerical Ability', 
      icon: '🧮',
      color: '#3b82f6' 
    },
    { 
      key: 'reasoning', 
      name: 'Reasoning Ability', 
      icon: '🧠',
      color: '#8b5cf6' 
    },
    { 
      key: 'verbal', 
      name: 'Verbal Ability', 
      icon: '📚',
      color: '#10b981' 
    }
  ];
  
  return (
    <div className="progress-dashboard">
      <h3>Your Progress</h3>
      
      <div className="sections-progress">
        {sections.map(section => (
          <div key={section.key} className="section-progress-card">
            <div className="section-header">
              <span className="section-icon">{section.icon}</span>
              <h4>{section.name}</h4>
            </div>
            
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-label">Attempted</span>
                <span className="stat-value">
                  {progress[section.key]?.totalAttempted || 0}
                </span>
              </div>
              
              <div className="stat">
                <span className="stat-label">Correct</span>
                <span className="stat-value">
                  {progress[section.key]?.totalCorrect || 0}
                </span>
              </div>
              
              <div className="stat">
                <span className="stat-label">Accuracy</span>
                <span 
                  className={`stat-value ${
                    (progress[section.key]?.accuracy || 0) >= 70 ? 'good' : 'needs-improvement'
                  }`}
                >
                  {(progress[section.key]?.accuracy || 0).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${(progress[section.key]?.accuracy || 0)}%`,
                  backgroundColor: section.color
                }}
              />
            </div>
            
            {/* Topic-wise breakdown */}
            {progress[section.key]?.topicProgress?.length > 0 && (
              <details className="topic-breakdown">
                <summary>Topic-wise breakdown</summary>
                <div className="topics-list">
                  {progress[section.key].topicProgress
                    .sort((a, b) => a.accuracy - b.accuracy) // Weakest first
                    .map(topic => (
                      <div key={topic.topic} className="topic-item">
                        <span className="topic-name">{topic.topic}</span>
                        <span className="topic-stats">
                          {topic.attempted} questions · {topic.accuracy.toFixed(0)}% accuracy
                        </span>
                      </div>
                    ))}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressDashboard;
```

---

### 5.2 Avoiding Duplicate Questions

The system automatically excludes already-attempted questions:

**Backend Logic (in questionController.js):**
```javascript
// Get user's attempted questions
const progress = await UserCompanyProgress.findOne({ userId: uid, company: slug });

if (progress) {
  const sectionKey = section === 'Numerical Ability' ? 'aptitude' : 
                    section === 'Verbal Ability' ? 'verbal' : 'reasoning';
  
  attemptedQuestionIds = progress[sectionKey]?.attempted.map(a => a.questionId) || [];
}

// Exclude from query
if (attemptedQuestionIds.length > 0) {
  query.questionId = { $nin: attemptedQuestionIds };
}
```

This ensures users only see fresh questions they haven't attempted yet.

---

## 6. Implementation Phases

### Phase 1: MVP (Week 1-2)

**Goal:** Launch basic TCS prep module

**Tasks:**
- [ ] Set up database models (Company, AptitudeQuestion, UserCompanyProgress)
- [ ] Generate 500 questions using AI (Numerical: 200, Verbal: 150, Reasoning: 150)
- [ ] Create API routes (companies, questions, submit answer)
- [ ] Build Company Hub page
- [ ] Build Company Detail page with Overview + Aptitude tabs
- [ ] Implement question practice flow
- [ ] Basic progress tracking (attempted, correct, accuracy)
- [ ] Deploy to production

**Deliverables:**
- Users can browse TCS company page
- Users can practice 500 aptitude questions topic-wise
- Progress is tracked and displayed
- No duplicates shown

---

### Phase 2: Expansion (Week 3-4)

**Goal:** Complete all sections + add mock tests

**Tasks:**
- [ ] Add Reasoning and Verbal tabs
- [ ] Generate remaining questions (total 1000+)
- [ ] Create MockTest model
- [ ] Build mock test engine (timed, full-length)
- [ ] Add mock test results page
- [ ] Implement 30-Day Sprint feature (basic version)
- [ ] Add Interview Experiences tab (read-only)

**Deliverables:**
- Full TCS prep module (Aptitude + Reasoning + Verbal + Coding + Mocks)
- 2-3 mock tests available
- Sprint plan generated for users

---

### Phase 3: Engagement (Month 2)

**Goal:** Add gamification and community features

**Tasks:**
- [ ] Interview experience submission (user-generated)
- [ ] Upvote system for experiences
- [ ] Leaderboards (college-wise, global)
- [ ] Streak tracking
- [ ] Daily reminders for sprint
- [ ] Pro tier gating (1 mock free, rest Pro)

**Deliverables:**
- Community-driven content
- Engagement features live
- Freemium model enforced

---

### Phase 4: Scale (Month 3+)

**Goal:** Add more companies + B2B features

**Tasks:**
- [ ] Replicate for Infosys (generate questions, mock tests)
- [ ] Replicate for Wipro, Cognizant, Accenture
- [ ] TPO dashboard for colleges
- [ ] College-wide licensing
- [ ] Mobile optimization
- [ ] Performance analytics for admins

**Deliverables:**
- 5 companies live
- B2B revenue stream active
- Scalable to 10,000+ concurrent users

---

## Next Steps

1. **Start with data collection:** Use the TCS_COMPANY_DATA.md file as reference
2. **Generate first 100 questions:** Run the AI generation script with Gemini API
3. **Set up database:** Create MongoDB collections using the schemas above
4. **Build MVP frontend:** Focus on Company Hub + Aptitude practice first
5. **Test with real users:** Get 10-20 students to try and give feedback
6. **Iterate and expand:** Based on feedback, refine and add more features

---

**Remember:** 
- Start narrow (TCS only, Aptitude only)
- Launch fast (2 weeks to MVP)
- Iterate based on user feedback
- Scale systematically (one company at a time)

Good luck! 🚀
