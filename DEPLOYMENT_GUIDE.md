# 🚀 Deployment Guide for CodeHub

Since you want to test how the application behaves after deployment, follow this step-by-step guide to deploy your **Frontend to Vercel** and **Backend to Render**. This "Zero-Cost" strategy ensures distinct environments that mirror production.

## 1. 🛠️ Prerequisites
- **GitHub Account**: Push your code to a GitHub repository if you haven't already.
- **Render Account**: for Backend (https://render.com) - Sign up/Login.
- **Vercel Account**: for Frontend (https://vercel.com) - Sign up/Login.
- **MongoDB Atlas**: Ensure you have your connection string (`MONGO_URI`).

---

## 2. 🟢 Deploy Backend (Render)
We will deploy the `server` folder as a Node.js web service.

1.  **Push Code to GitHub**: Ensure your latest code (including the `render.yaml` file) is pushed.
2.  **Go to Render Dashboard**: Click **"New"** > **"Web Service"**.
3.  **Connect Repository**: Select your `CodeHub` repository.
4.  **Settings**:
    - **Root Directory**: `server` (Important!)
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
    - **Environment Variables**:
        - `MONGO_URI`: (Paste your MongoDB connection string here)
        - `PORT`: `10000` (Render usually sets this automatically, but good to check)
5.  **Deploy**: Click **"Create Web Service"**.
6.  **Wait & Copy URL**: Once deployed, you will get a URL like `https://codehub-backend.onrender.com`. **Copy this URL.**

> **Note**: The first deployment might take a few minutes. The free tier spins down after inactivity (cold starts are slow).

---

## 3. 🔵 Deploy Frontend (Vercel)
We will deploy the root React/Vite application.

1.  **Go to Vercel Dashboard**: Click **"Add New..."** > **"Project"**.
2.  **Import Git Repository**: Select your `CodeHub` repository.
3.  **Configure Project**:
    - **Framework Preset**: `Vite` (Should detect automatically).
    - **Root Directory**: `./` (Default, leave as is).
    - **Build Command**: `npm run build` (Default).
    - **Output Directory**: `dist` (Default).
4.  **Environment Variables** (Crucial Step):
    - Add a new variable:
        - **Name**: `VITE_API_URL`
        - **Value**: `https://codehub-backend.onrender.com` (The backend URL you copied from Render).
    - *Note: Do not add a trailing slash `/` to the URL.*
5.  **Deploy**: Click **"Deploy"**.

---

## 4. 🔍 Verification & Testing
1.  **Open the Vercel URL**: Navigate to your deployed frontend (e.g., `https://codehub.vercel.app`).
2.  **Check Console**: Open Developer Tools (F12) -> Console. Ensure there are no errors connecting to the API.
3.  **Login/Signup**: Test the authentication flow.
4.  **Submit Code**: Try running/submitting a problem.
    - *Note:* Since the Judge0 API is public, it should work fine. If you run into rate limits, you might need your own Judge0 instance later.

## 5. ⚡ Troubleshooting
- **CORS Errors**: I have already configured `cors()` in the backend to accept all origins. This should prevent CORS issues.
- **404 Errors on Refresh**: Vercel handles this for Vite apps automatically.
- **Backend Connection Failed**: Double-check the `VITE_API_URL` in Vercel settings. It must match the Render URL exactly. Redeploy the frontend if you change variables.

---

### ✅ Ready to Go!
You can now test the live application. Let me know if you encounter any specific errors during these steps!
