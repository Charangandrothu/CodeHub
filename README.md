# CodeHub 🚀

**CodeHub** is a comprehensive, structured placement preparation platform designed to unify coding practice, aptitude training, and core computer science concepts into a single, cohesive ecosystem. It tracks consistency, measures progress, and provides a premium, test-driven environment for aspirants.

---

## ✨ Key Features

### 🔐 Authentication & User Management
- **Secure Authentication**: Robust Login and Sign-up flows integrated with Firebase.
- **Dynamic Routing**: Protected routes that redirect based on authentication status (Landing Page vs. User Dashboard).
- **Persistent Sessions**: Seamless user experience with state retention.

### 💻 DSA & Coding Practice
- **Interactive Code Editor**: Integrated Monaco Editor supporting multiple languages.
- **Judge0 Integration**: Real-time code compilation and execution against test cases.
- **Problem Repository**: Curated list of problems (Patterns, Sorting, etc.) with difficulty levels (Easy, Medium, Hard).
- **Dynamic Feedback**: Instant success/failure verdicts and output display.

### 📊 User Profile & Dashboard
- **Personalized Dashboard**: Overview of user progress and daily targets.
- **Profile Customization**: Choose from a set of trendy, auto-generated avatars.
- **Detailed Statistics**: Track total solved problems, streaks, and category-wise breakdowns.
- **Settings & Preferences**: Customize experience (Theme, Language, Daily Goals) with database persistence.

### 💎 CodeHub Pro
- **Premium Subscription**: Tiered access to advanced features.
- **Razorpay Integration**: Secure payment processing for Pro upgrades.
- **Exclusive Content**: Access to premium problems and mock tests.

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first architecture using **Tailwind CSS v4**.
- **Rich Animations**: Smooth transitions and interactive elements powered by **Framer Motion**.
- **Dark Mode**: Sleek, developer-friendly dark theme throughout the application.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) (via [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **State Management**: React Context API
- **Icons**: [Lucide React](https://lucide.dev/)
- **Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/))
- **Payments**: [Razorpay](https://razorpay.com/)
- **Code Execution**: [Judge0 API](https://judge0.com/)

### Dev Tools & Deployment
- **Docker**: Containerized deployment support.
- **Vercel/Render**: Production hosting ready.
- **ESLint**: Code quality and linting.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas URL)
- VS Code (Recommended)
- Docker (Optional, for containerized run)

### 1. Clone the Repository
```bash
git clone https://github.com/Charangandrothu/CodeHub.git
cd codehub
