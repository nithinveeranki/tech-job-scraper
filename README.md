# 🌐 Tech Jobs Intelligence Bot v2.0

> A fully serverless, enterprise-grade automated job aggregation pipeline that surfs the entire internet to deliver fresh entry-level tech jobs (India) to your inbox daily at 9:00 AM IST — 100% free, forever.

---

## ⚙️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│            GitHub Actions (Cron: 03:30 UTC)             │
└────────────────────────┬────────────────────────────────┘
                         │ triggers
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     index.js                            │
│                                                         │
│  Phase 1: Parallel Fetcher (Promise.all)                │
│  ├── 12 async queries fired simultaneously              │
│  └── Merges 60-100+ raw jobs from Google Jobs API       │
│                                                         │
│  Phase 2: Data Processing Pipeline                      │
│  ├── Smart Deduplication (URL + Title×Company)          │
│  ├── Hard Filter (no seniors, interns, unpaid)          │
│  ├── Relevance Scoring (Freshers, AI/ML prioritized)    │
│  └── Skill Badge Tagging (🤖 AI, 🔵 React, 🐍 Python)  │
│                                                         │
│  Phase 3: Premium HTML Email Dispatch                   │
│  ├── 3 Sections: Top Picks | AI Roles | General         │
│  └── Sends via Gmail SMTP (Nodemailer)                  │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| HTTP Client | Axios |
| Email Delivery | Nodemailer / Gmail SMTP |
| Search Engine | SerpApi (Google Jobs Engine) |
| CI/CD / Hosting | GitHub Actions (free tier) |
| Scheduler | GitHub Actions Cron (0 cost) |

## 🎯 What It Targets

12 simultaneous search queries, including:
- React, Node.js, Full Stack, Python fresher roles
- AI/ML Engineers (entry level)
- LLM / RAG Application Developers
- Generative AI / Vibe Coding roles
- Data Scientists (fresher)
- General Software Engineer 2026 batch

## 🚀 Setup

1. **Clone / upload** this repository to GitHub.
2. **Add 3 GitHub Secrets** (`Settings > Secrets > Actions`):
   - `SERPAPI_KEY` — Your SerpApi API key
   - `EMAIL_USER` — Your Gmail address
   - `EMAIL_PASS` — Your Gmail App Password (16-char)
3. **Done!** It runs automatically every day at **9:00 AM IST**.
4. **Manual test:** Go to `Actions` tab → `Daily Tech Job Scraper` → `Run workflow`.

## 📧 Email Format

The daily email is split into 3 smart sections:
- 🏆 **Top Picks** — Highest relevance score jobs (explicitly fresher/junior roles)
- 🤖 **AI & Emerging Tech** — GenAI, LLM, RAG, ML roles
- 💻 **General Tech Roles** — Everything else that passed the filter

Each job card shows: Title, Company, Location, Time Posted, Skill Badges, and Apply Button.

## 📊 GitHub Actions Logs (Sample Output)

```
════════════════════════════════════════════════
   🚀  Tech Jobs Intelligence Bot  v2.0
════════════════════════════════════════════════

🌐 Dispatching 12 parallel queries...

  ✓ [10 jobs] "react developer fresher India"
  ✓ [9 jobs]  "AI ML engineer entry level India"
  ✓ [7 jobs]  "LLM RAG generative AI developer fresher India"
  ...

📦 Fetched    : 87 raw jobs (12 queries · 1.8s)
🔍 Valid      : 22 jobs (after dedup + filter + rank)
🤖 AI/ML Jobs : 8 jobs
🏆 Top Picks  : 9 jobs (relevance ≥ 10)
⚙️  Processed  : 0.03s

📧 Sending email to nithinveeranki@gmail.com...
✅  Email sent in 0.6s
────────────────────────────────────────────────
🏁  Pipeline complete in 2.4s
════════════════════════════════════════════════
```
