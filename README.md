<div align="center">

  <h1>🔄 TutorialSync</h1>
  <p><b>Modern Developer Learning Companion — Stop Getting Stuck on Outdated Coding Tutorials</b></p>

  <p>
    <a href="#-key-features">Key Features</a> •
    <a href="#-visual-showcase">Visual Showcase</a> •
    <a href="#%EF%B8%8F-architecture--tech-stack">Architecture</a> •
    <a href="#%EF%B8%8F-local-installation--setup">Local Setup</a> •
    <a href="#-api-endpoint-reference">API Reference</a>
  </p>

  <div>
    <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Gemini_AI-Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
  </div>

  <br />
</div>

---

## 💡 The Problem & The Solution

> **Developers spend hours debugging code from YouTube tutorials that broke months or years ago.**

Libraries deprecate syntax, authentication methods shift from namespace imports to modular SDKs (e.g., Firebase v8 to v9+), and frameworks drop legacy routers (e.g., React Router v5 to v6 or Next.js Pages to App Router). Beginners get stuck on broken setup commands and error tracebacks.

**TutorialSync** solves this by analyzing tutorial URLs or technology topics in real time. Powered by the **Google Gemini SDK**, it extracts outdated dependencies, builds modern side-by-side split code diffs, generates step-by-step terminal guides, and provides an active **AI Coding Mentor** to guide implementation.

---

## 🎨 Key Features

| Feature | Description |
| :--- | :--- |
| 📹 **YouTube Tutorial Refresh** | Paste any programming video URL to extract its tech stack, discover deprecated APIs, and generate modernized replacement code. |
| 📚 **Interactive Tech Guides** | Enter topics like *"Google Antigravity 2.0"* or *"Next.js 15"* to receive structured installation blueprints and architectural guidance. |
| 🎭 **Side-by-Side Code Diffs** | View line-by-line colored diffs comparing legacy code syntax (**Old Red**) with modernized best practices (**Modern Green**). |
| 🤖 **Context-Aware AI Mentor** | Ask doubts or paste terminal errors into an active mentor panel that holds guardrails to keep you on the project roadmap. |
| 📊 **Real-Time Progress Tracker** | Check off steps in the interactive checklist to calculate real-time completion status (**% Done**) on your main dashboard. |
| 📄 **Markdown Document Exporter** | Export full modernization blueprints as clean, downloadable `.md` files for offline reference or team documentation. |
| 🔑 **Secure JWT & Google OAuth** | Authenticate securely using encrypted `httpOnly` cookie sessions alongside seamless Google One-Tap Sign-In. |

---

## 📸 Visual Showcase

### 1. 🚀 Workspace Creation & Video Analysis

#### Hero Dashboard Overview
> Clean, modern interface supporting both video URL analysis and custom technology topic guide generation.

<div align="center">
  <img src="client/public/ss/first.png" alt="TutorialSync Landing Page" width="100%" />
</div>

<br />

#### Adding YouTube Video Link & Extracting Metadata
> Paste any tutorial URL (e.g., `https://youtu.be/...`) to extract video transcripts, detect legacy frameworks, and analyze modern version shifts.

<div align="center">
  <img src="client/public/ss/third.png" alt="Pasting YouTube Video Link & Extracting Metadata" width="100%" />
</div>

<br />

#### Prompting Interactive Tech Guides
> Generate comprehensive modernization blueprints for any tech stack or library (e.g., *"React JS"*).

<div align="center">
  <img src="client/public/ss/tenth.png" alt="Prompting Interactive Tech Guide" width="100%" />
</div>

---

### 2. 📊 Tech Stack Version Shifts & Deprecation Blueprints

#### YouTube Video Modernization (Next.js 13 → Next.js 15)
> Automatically detects deprecated dependencies and recommends modern architectural equivalents.

<div align="center">
  <img src="client/public/ss/fourth.png" alt="Tech Stack Version Shifts for Next.js" width="100%" />
</div>

<br />

#### Technology Topic Blueprint (React 19 & Vite Migration)
> Replaces legacy patterns (CRA, `ReactDOM.render`) with modern standards (Vite, `createRoot`).

<div align="center">
  <img src="client/public/ss/eleventh.png" alt="React 19 & Vite Tech Stack Shifts" width="100%" />
</div>

---

### 3. 🎭 Side-by-Side "Then vs. Now" Code Diffs

#### React 18+ Concurrent Rendering Shift
> Highlights legacy syntax in **red** alongside modernized equivalents in **green**.

<div align="center">
  <img src="client/public/ss/twelfth.png" alt="ReactDOM.render vs createRoot Code Diff" width="100%" />
</div>

<br />

#### Next.js 15 Async Page Props Shift
> Demonstrates dynamic route handling with async `params` and `searchParams` Promises.

<div align="center">
  <img src="client/public/ss/fifth.png" alt="Next.js 15 Async Params Code Diff" width="100%" />
</div>

---

### 4. 📝 Interactive Step-by-Step Modernization Checklist

#### Unchecked Installation Step & Terminal Commands
> View step-by-step terminal installation scripts with one-click copy buttons.

<div align="center">
  <img src="client/public/ss/sixth.png" alt="Step Installation Checklist Before Completion" width="100%" />
</div>

<br />

#### Step Completion & Real-Time Progress Update
> Check off completed steps to apply green highlight styling and update your dashboard progress.

<div align="center">
  <img src="client/public/ss/seventh.png" alt="Step Installation Checklist After Completion" width="100%" />
</div>

<br />

#### Scaffolding & Setup Steps
> Step-by-step guidance for initializing modern project templates (e.g. `npm create vite@latest`).

<div align="center">
  <img src="client/public/ss/thirtheenth.png" alt="Vite Scaffolding Step Guide" width="100%" />
</div>

---

### 5. 🤖 Context-Aware AI Coding Mentor

#### Directing Code & Routing Questions
> The AI Mentor provides real-time explanations tailored specifically to your active tutorial workspace.

<div align="center">
  <img src="client/public/ss/eighth.png" alt="AI Mentor Explaining Next.js Dynamic Routing" width="100%" />
</div>

<br />

#### Explaining Core React Concepts
> Ask questions like *"what are props"* to get concise explanations, analogies, and code snippets.

<div align="center">
  <img src="client/public/ss/fourteenth.png" alt="AI Mentor Explaining React Props" width="100%" />
</div>

---

### 6. 🗂️ Recent Workspaces & Real-Time Completion Tracking

#### Dashboard Workspace Management
> Tracks workspace progress percentages based on completed checklist items.

<div align="center">
  <img src="client/public/ss/fifteenth.png" alt="Recent Workspaces & Demo Studies Dashboard" width="100%" />
</div>

<br />

#### Quick Demo Studies
> Pre-configured migration guides for Firebase v8 → v9, React Router v5 → v6, and Google Antigravity 2.0.

<div align="center">
  <img src="client/public/ss/second.png" alt="Quick Demo Templates" width="100%" />
</div>

---

## 🏗️ Architecture & Tech Stack

```
┌──────────────────────────┐         ┌──────────────────────────┐
│     FRONTEND (Client)    │  HTTPS  │      BACKEND (Server)    │
│     React + Vite         │◄───────►│      Express.js          │
│     Deployed: Vercel     │  REST   │      Deployed: Render    │
│                          │  API    │                          │
│  • Modern Dark System    │         │  • Auth (JWT + Cookies)  │
│  • Code Diff Viewer      │         │  • Gemini SDK Proxy      │
│  • AI Mentor Sidebar     │         │  • Input Validation      │
│  • Markdown Exporter     │         │  • Rate Limiting         │
└──────────────────────────┘         └────────────┬─────────────┘
                                                  │ Mongoose ODM
                                                  ▼
                                     ┌──────────────────────────┐
                                     │     MongoDB Atlas        │
                                     │  • Users Collection      │
                                     │  • Projects Collection   │
                                     │  • ChatHistory Collection│
                                     └──────────────────────────┘
```

### Core Technologies
* **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS (custom properties, glassmorphism filters, keyframe animations).
* **Backend**: Node.js, Express.js, JWT, `cookie-parser`, Helmet security headers, `express-rate-limit`, `express-validator`.
* **Database**: MongoDB Atlas Cloud Cluster with Mongoose ODM (embedded schemas and virtual calculation hooks).
* **AI Engine**: Official Google Gemini SDK (`@google/generative-ai`) proxied entirely server-side to protect keys.
* **Authentication**: Google One-Tap & Sign-In via `google-auth-library` and standard bcrypt password hashing.

---

## 🛡️ Production Security Hardening

- [x] **Secure API Keys**: Gemini API Key is stored strictly server-side in environment variables and never exposed to client bundles.
- [x] **CSRF-Safe Sessions**: JWT tokens are issued inside `httpOnly` cookies configured with `sameSite: 'None'` and strict CORS origin checks.
- [x] **XSS Protection**: Dynamic Markdown and AI mentor responses are sanitized using DOMPurify before document insertion.
- [x] **NoSQL Injection Defense**: All request params and payloads are validated and cast through Mongoose ODM schemas.
- [x] **API Rate Limiting**: Abuse prevention limiters restrict global requests and AI generation endpoints per client IP.

---

## 🛠️ Local Installation & Setup

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB Atlas cluster or local MongoDB instance
- Gemini API Key ([Get a key from Google AI Studio](https://aistudio.google.com/))
- Google OAuth Client ID (optional for Google Sign-In)

### 1. Clone & Configure Server
```bash
# Clone the repository
git clone https://github.com/your-username/tutorial-sync.git
cd tutorial-sync/server

# Install backend dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

Set the following variables in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/tutorialsync
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-latest
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

### 2. Configure & Run Client
```bash
cd ../client

# Install frontend dependencies
npm install

# Start Vite dev server
npm run dev
```

Open your browser to `http://localhost:5173`.

---

## 📡 API Endpoint Reference

### Authentication
* `POST /api/auth/signup` — Create a new user account
* `POST /api/auth/login` — Log in and receive httpOnly JWT cookie
* `POST /api/auth/google` — Authenticate via Google OAuth ID token
* `GET /api/auth/me` — Get current authenticated user session
* `POST /api/auth/logout` — Clear session cookies
* `DELETE /api/auth/account` — Permanently delete user account & all workspaces

### Workspaces & Analysis
* `GET /api/projects` — List user's active workspaces (supports pagination)
* `POST /api/projects` — Create a new tutorial refresh or tech guide project
* `GET /api/projects/:id` — Get full project details, overview, diffs & steps
* `POST /api/projects/:id/analyze` — Trigger Gemini AI analysis & blueprint generation
* `PUT /api/projects/:id` — Toggle step completion status (updates % Done)
* `DELETE /api/projects/:id` — Delete workspace
* `GET /api/projects/:id/export` — Download Markdown representation

### AI Mentor Chat
* `GET /api/chat/:projectId` — Fetch conversation history for a workspace
* `POST /api/chat/:projectId` — Send question or code snippet to AI Coding Mentor
* `DELETE /api/chat/:projectId` — Clear conversation history

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
