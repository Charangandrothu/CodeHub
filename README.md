🚀 CodeHubX — Structured Placement Preparation Platform

CodeHubX is a unified, test-driven placement preparation ecosystem designed to streamline DSA, Aptitude, and Core CS learning into a single high-performance environment.

It combines structured learning paths, real-time code execution, analytics, and premium mock simulations to help aspirants prepare efficiently and consistently.

Built for serious placement preparation.

🌐 Vision

CodeHubX aims to become a complete placement operating system —
where learning, practicing, testing, analytics, and optimization exist in one seamless flow.

✨ Core Features
🔐 Authentication & Access Control

Secure authentication via Firebase Auth

Protected route architecture

Session persistence & token validation

Role-based feature access (Free vs Pro)

💻 DSA & Coding Practice

Integrated Monaco Editor

Real-time execution using Judge0 API

Multi-language support

Predefined test cases

Dynamic verdict system (Accepted / Wrong Answer / Runtime Error)

Structured problem repository:

Patterns

Arrays

Sorting

Recursion

Linked List

Bit manipulation

And expanding...

📊 Analytics & Progress Tracking

Daily streak tracking

Total solved problems

Difficulty-wise breakdown

Category analytics

Personalized dashboard overview

Goal tracking system

💎 CodeHubX Pro

Premium problem sets

Advanced mock tests

Performance comparison metrics

Razorpay integration for subscription

Tier-based content access

🎨 UI/UX System

Mobile-first architecture

Built with Tailwind CSS v4

Smooth animations using Framer Motion

Developer-focused Dark Mode

Clean, distraction-free coding interface

🛠️ Tech Stack
Frontend

React (Vite)

React Router DOM

Tailwind CSS v4

Framer Motion

Lucide React Icons

React Context API

Monaco Editor

Backend

Node.js

Express.js

MongoDB + Mongoose

Razorpay

Judge0 API

DevOps

Dockerized setup

Vercel / Render deployment ready

ESLint configuration

Environment-based configuration system

🏗️ Architecture Overview
Client (React)
     ↓
Express API Server
     ↓
MongoDB Database
     ↓
Judge0 API (Code Execution)
     ↓
Razorpay (Payments)

Modular backend structure:

/controllers
/routes
/models
/middleware
/config
🚀 Getting Started
Prerequisites

Node.js v18+

MongoDB (Local / Atlas)

VS Code

Docker (Optional)

1️⃣ Clone Repository
git clone https://github.com/Charangandrothu/CodeHub.git
cd CodeHub
2️⃣ Setup Backend
cd server
npm install

Create .env file:

PORT=5000
MONGO_URI=your_mongodb_url
RAZORPAY_KEY_ID=your_key
RAZORPAY_SECRET=your_secret
JUDGE0_API_KEY=your_key

Run backend:

npm run dev
3️⃣ Setup Frontend
cd client
npm install
npm run dev
4️⃣ Docker Setup (Optional)
docker-compose up --build
🔒 Environment Variables
Variable	Description
MONGO_URI	MongoDB connection string
JUDGE0_API_KEY	Code execution API key
RAZORPAY_KEY_ID	Payment public key
RAZORPAY_SECRET	Payment secret key
FIREBASE_CONFIG	Firebase credentials
📂 Project Structure
CodeHubX/
 ├── client/
 ├── server/
 ├── docker-compose.yml
 ├── README.md
📈 Upcoming Roadmap
Phase 1 — Placement Expansion

Aptitude section (Quant, Logical, Verbal)

Core CS subjects:

Operating Systems

DBMS

Computer Networks

OOPS

Topic-wise learning roadmap

Phase 2 — Advanced Evaluation

AI-powered solution analysis

Code complexity evaluation (Time & Space)

Optimization suggestions

Plagiarism detection

Phase 3 — Mock Test System

Full-length placement mock exams

Company-specific test patterns

Timed coding rounds

Performance percentile ranking

Phase 4 — Competitive Edge

Global leaderboard

Campus leaderboard

Resume strength score

Interview readiness index

Phase 5 — Scale & Monetization

Institutional dashboards for colleges

Admin analytics panel

API monetization

Enterprise subscription plans

🎯 Long-Term Vision

CodeHubX is not just a practice platform.

It aims to become:

A structured placement engine

A performance analytics system

A competitive benchmarking tool

A monetizable SaaS ecosystem

🤝 Contributing

Currently in active development.

If you're interested in contributing:

Fork the repository

Create a feature branch

Submit a pull request



👨‍💻 Author

Charan Gandrothu
Full Stack Developer | Placement-focused Product Builder
Building CodeHubX 🚀
