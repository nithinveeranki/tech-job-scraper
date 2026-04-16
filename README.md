# 🔥 Automated Global Tech Jobs Scraper

A purely serverless Node.js automation that sweeps the entire internet for tech jobs without needing a dedicated server.

It scrapes Google Jobs using SerpApi across the web for entry-level tech jobs (specifically localized to India) every morning, deeply processes and ranks them, and natively dispatches a beautifully formatted HTML email direct to your inbox.

## 🛠️ Architecture
- **Language**: JavaScript (Node.js)
- **CI/CD Pipeline**: GitHub Actions (Cron Jobs) Serverless Engine
- **Email Delivery**: Nodemailer / Gmail SMTP
- **Search Engine Aggregator**: SerpApi (Google Jobs native engine)

## 🚀 How It Works
1. Runs at precisely 9:00 AM IST automatically in the cloud.
2. Queries the live Google Jobs API, filtering natively for jobs posted in the `< 24 hours` window.
3. Performs deep JavaScript filtering on titles, eliminating unrelated or generic listings.
4. Identifies and assigns a `relevanceScore` based on the targeted tech stack (React, Node, Backend) and seniority (Fresher, Entry Level).
5. Secures standard data shape, aggressively removes duplicate Apply Links, and grabs the Top 20 records.
6. Injects the data cleanly into a responsive HTML layout and uses Google's SMTP network to safely dispatch the payload.
