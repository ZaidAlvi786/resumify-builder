# 🚀 Resumify AI

> An AI-powered resume platform — build, score, and **tailor resumes to a specific job description**, track applications, and capture jobs straight from any job board with a Chrome extension. AI assistance, never fabrication.

<p>
<code>Next.js 16</code> · <code>React 19</code> · <code>TypeScript</code> · <code>Tailwind v4</code> ·
<code>FastAPI</code> · <code>Supabase</code> · <code>Stripe</code> · <code>OpenRouter</code> · <code>Chrome MV3</code>
</p>

---

## 📖 Overview

Resumify AI is a full-stack web app for job seekers. Beyond a templating tool,
it pairs a **conversational AI agent**, **ATS scoring**, and a suite of career
tools with a **JD-driven workflow**: keep one source-of-truth career profile,
then generate a resume tailored to any job description — reordered and
rephrased, with a hard guarantee that nothing is invented. A companion Chrome
extension captures job descriptions from LinkedIn, Indeed, Greenhouse, Lever,
Workday and Ashby and hands them straight into the app.

```
                          ┌──────────────────────────┐
                          │   User's Browser         │
                          │   Next.js 16 (Vercel)    │
                          └───┬──────────────────┬───┘
            HTTPS / NDJSON    │                  │   Auth (JWT)
          ┌───────────────────┘                  └────────────┐
          ▼                                                   ▼
┌──────────────────────┐                          ┌────────────────────┐
│  FastAPI  (Railway)  │                          │  Supabase           │
│  AI · tailoring ·    │◄────── service role ────►│  Postgres + RLS     │
│  applications · auth │                          │  Auth · pgvector    │
└─────┬─────────┬──────┘                          └────────────────────┘
      │         │                                            ▲
      ▼         ▼                                            │
┌───────────┐ ┌──────────┐   ┌──────────┐         ┌──────────┴─────────┐
│ OpenRouter│ │  Stripe  │   │  Google  │         │  Chrome Extension  │
│ multi-LLM │ │ billing  │   │  Sheets  │         │  JD capture (MV3)  │
└───────────┘ └──────────┘   └──────────┘         └────────────────────┘
```

---

## ✨ Features

### 🎯 JD-Driven Workflow

| Feature | What it does |
|---|---|
| **Base Profile** | One source-of-truth career history; every other feature reads from it |
| **JD-Driven Tailoring** | Rewrites your profile for one job description — reordered, rephrased, streamed section-by-section with a live diff |
| **Anti-Hallucination Validator** | Server-side guarantee: every entry either matches your profile exactly or is a clearly-marked `[placeholder]` — never invented |
| **JD-Aware Skeleton** | For users without a profile yet: a structured starting point with prompts and a live JD-coverage sidebar |
| **Match Score & Gaps** | Deterministic 0–100 JD-match score plus a gap list with learning resources |
| **Chrome Extension** | Capture a JD from any job board → tailor / skeleton / save, via a secure HMAC-signed handoff |

### 🤖 Build, Score & Optimize

| Feature | What it does |
|---|---|
| **Smart Resume Builder** | Step-by-step builder with AI optimization |
| **ATS Reviewer** | Detailed ATS score + strengths / weaknesses / fixes |
| **AI Resume Agent** | Conversational assistant with conversation memory |
| **Resume Heatmap** | Section-by-section strength visualization |
| **Analytics Dashboard** | Keyword density, readability, completeness metrics |
| **Templates & Versions** | Multiple templates; full version history |

### 💼 Career Tools

| Feature | What it does |
|---|---|
| **Cover Letter Generator** | Tailored cover letters from resume + JD |
| **Interview Prep** | Practice Q&A with code examples by difficulty |
| **Career Path Predictor** | Next-role forecast with skill gaps & timelines |
| **Salary Negotiation Simulator** | Scripted negotiation practice |
| **Skill Gap Analyzer** | Gaps + structured learning paths |
| **Career Trend Analyzer** | 12-month skill/role trend forecast |
| **Achievement Quantifier** · **Summary Variations** · **Keyword Expander** · **Multi-Resume Portfolio** | Targeted AI micro-tools |
| **Multi-Language Translation** · **Resignation Letter** | Supporting generators |

### 📊 Platform

| Feature | What it does |
|---|---|
| **Application Tracker** | CRUD tracker with status pills, filters, bulk actions, **Excel export** |
| **Google Sheets Sync** | Mirror applications to a Google Sheet (OAuth + PKCE) |
| **Stripe Subscriptions** | Free / Pro / Ultra plans with metered AI credits |
| **Auth & RLS** | Supabase Auth; row-level security isolates every user's data |
| **Rate Limiting & Logging** | Plan-aware token-bucket limits; structured JSON request logs |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Framer Motion · TanStack Table |
| **Backend** | FastAPI · Python 3 · Pydantic v2 · Uvicorn |
| **Database** | Supabase — PostgreSQL · Row-Level Security · Auth · pgvector |
| **AI** | OpenRouter (multi-model + fallback) · Google Gemini (agent chat + embeddings) |
| **Payments** | Stripe (Checkout · Customer Portal · Webhooks) |
| **Extension** | Chrome Manifest V3 · Vite · `@crxjs/vite-plugin` · React |
| **Hosting** | Vercel (frontend) · Railway (backend) |

---

## 📁 Repository Structure

```
ai-resume-builder/
├── frontend/            Next.js app — pages, components, API client
├── backend/             FastAPI service — routes, services, schemas, tests
├── extension/           Chrome MV3 extension — JD capture & handoff
├── supabase/migrations/ Database migrations
├── supabase_schema.sql  Full schema (tables, RLS, triggers, functions)
└── *.md                 Feature & deployment docs
```

---

## ⚡ Getting Started

**Prerequisites:** Node.js 18+ · Python 3.10+ · a Supabase project · OpenRouter API key

### 1. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
# create backend/.env  (see Environment Variables below)
python main.py                                     # → http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
# create frontend/.env.local  (see Environment Variables below)
npm run dev                                        # → http://localhost:3000
```

### 3. Chrome Extension (optional)

```bash
cd extension
npm install
npm run build           # → load extension/dist via chrome://extensions
```

### 4. Database

Run [`supabase_schema.sql`](supabase_schema.sql) once in the Supabase SQL
editor, then apply the files in [`supabase/migrations/`](supabase/migrations/).

---

## 🔑 Environment Variables

**`backend/.env`**

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | LLM access (resume AI, tailoring) |
| `SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` | Database (server-side) |
| `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` | Billing |
| `EXTENSION_SIGNING_KEY` | HMAC key for the Chrome extension channel |
| `GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET` · `GOOGLE_REDIRECT_URI` · `GOOGLE_TOKEN_ENC_KEY` | Google Sheets sync |
| `FRONTEND_URL` | CORS + OAuth redirects |

**`frontend/.env.local`**

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (browser) |
| `NEXT_PUBLIC_API_URL` | Backend base URL |
| `NEXT_PUBLIC_STRIPE_PRICE_*` | Stripe price IDs |
| `GEMINI_API_KEY` | AI agent chat + embeddings (server-side) |

---

## 📚 Documentation

| Doc | Covers |
|---|---|
| [PROJECT_GUIDE.md](PROJECT_GUIDE.md) | Full architecture walkthrough — every page, endpoint, service |
| [TAILORING.md](TAILORING.md) | Base profile + JD-driven tailoring + anti-hallucination |
| [SKELETON.md](SKELETON.md) | JD-aware resume skeleton generator |
| [APPLICATIONS.md](APPLICATIONS.md) | Application tracker + Excel export |
| [GOOGLE_INTEGRATION.md](GOOGLE_INTEGRATION.md) | Google Sheets OAuth + sync |
| [EXTENSION.md](EXTENSION.md) | Chrome extension — capture, auth, handoff |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Notes on the AI feature set |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) · [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) · [RAILWAY_GUIDE.md](RAILWAY_GUIDE.md) | Setup & deployment |

---

## 🧪 Testing

```bash
cd backend  && source venv/bin/activate && pip install -r requirements-dev.txt && pytest
cd frontend && npx tsc --noEmit && npm run build
cd extension && npm run typecheck && npm run test
```

The backend suite covers schemas, routes, the anti-hallucination validator,
rate limiting, HMAC auth, and (with a test Supabase project) RLS isolation.
The extension suite tests each site extractor against HTML fixtures.

---

## 🚢 Deployment

- **Frontend → Vercel** — see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- **Backend → Railway** — see [RAILWAY_GUIDE.md](RAILWAY_GUIDE.md) & [DEPLOYMENT_STRIPE_GUIDE.md](DEPLOYMENT_STRIPE_GUIDE.md)
- **Database → Supabase** — apply `supabase_schema.sql` + `supabase/migrations/`

---

## 📄 License

MIT License
