# AuditChain

AuditChain is a modern, premium web application that combines a robust Express.js backend with a sleek, animated Next.js frontend. It features secure user authentication, profile management, and a real-time system configuration portal—all backed by an immutable Audit Ledger that tracks system events automatically.

## Project Structure

This repository is split into two main directories:
- `/BACKEND/express_auth_app`: The Express.js backend, SQLite database, and custom Audit SDK.
- `/frontend`: The Next.js 15+ frontend application featuring a dark mode, glassmorphic UI.

---

## 🚀 Getting Started

To run the full AuditChain application locally, you will need to start both the backend server and the frontend development server.

### 1. Start the Backend (Express API)

The backend handles all authentication, database interactions, and the Audit logging SDK.

1. Open a new terminal.
2. Navigate to the backend directory:
   ```bash
   cd "BACKEND/express_auth_app"
   ```
3. Install the required Node.js dependencies:
   ```bash
   npm install
   ```
4. Start the Express server:
   ```bash
   node app.js
   ```
   *(The backend server will start on `http://localhost:3000` and automatically initialize the local SQLite database).*

---

### 2. Start the Frontend (Next.js)

The frontend contains the premium UI and proxies API requests to the backend securely.

1. Open a **second** terminal window.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install the required Node.js dependencies:
   ```bash
   npm install
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *(The frontend will typically start on `http://localhost:3001` or `http://localhost:3000` depending on port availability. Check the terminal output for the exact local URL).*

---

## 🌟 Features

Once both servers are running, open the frontend URL in your browser to experience the app:

1. **Authentication Flow**: Create an account via `/signup`, and then sign in at `/login`.
2. **Profile Management**: View and edit your secure profile details at `/profile` and `/update`.
3. **Environment Controls**: Toggle global security settings (like MFA or Maintenance Mode) at `/settings`.
4. **Audit Intelligence**: Navigate to `/audit` to view the comprehensive, immutable ledger. Every action you take (logging in, updating a profile, changing a setting) is automatically intercepted by the backend SDK and logged here in real-time.

## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS, GSAP (Animations), UA-Parser
- **Backend:** Express.js, Sequelize ORM, SQLite3, JSON Web Tokens (JWT)
