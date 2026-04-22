const axios = require('axios');
const nodemailer = require('nodemailer');

// ═══════════════════════════════════════════════════════════════
// CONFIG — Environment Variables (stored securely in GitHub Secrets)
// ═══════════════════════════════════════════════════════════════
const SERPAPI_KEY = process.env.SERPAPI_KEY;
const EMAIL_USER  = process.env.EMAIL_USER;
const EMAIL_PASS  = process.env.EMAIL_PASS;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(value = '') {
  try {
    const u = new URL(String(value));
    return (u.protocol === 'https:' || u.protocol === 'http:') ? u.toString() : '';
  } catch {
    return '';
  }
}

// ═══════════════════════════════════════════════════════════════
// PHASE 1 — Multi-Threaded Parallel Query Engine (12 searches)
// Covers React, Node, Python, Full Stack, AI/ML, RAG, LLM,
// GenAI, Data Science, Vibe Coding & General Fresher roles
// ═══════════════════════════════════════════════════════════════
const SEARCH_QUERIES = [
  'react developer fresher India',
  'node.js backend developer entry level India',
  'python developer fresher India',
  'full stack developer fresher India',
  'software engineer fresher 2026 India',
  'AI ML engineer entry level India',
  'machine learning engineer fresher India',
  'LLM RAG generative AI developer fresher India',
  'data scientist fresher India',
  'junior javascript typescript developer India',
  'AI engineer no experience India',
  'vibe coding developer AI tools fresher India'
];

async function fetchJobsForQuery(query) {
  try {
    const res = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine:   'google_jobs',
        q:        query,
        location: 'India',
        chips:    'date_posted:today',
        api_key:  SERPAPI_KEY
      },
      timeout: 15000
    });
    const count = (res.data.jobs_results || []).length;
    console.log(`  ✓ [${count} jobs] "${query}"`);
    return res.data.jobs_results || [];
  } catch (err) {
    console.warn(`  ✗ FAILED  "${query}" → ${err.message}`);
    return [];
  }
}

async function fetchAllJobs() {
  console.log(`\n🌐 Dispatching ${SEARCH_QUERIES.length} parallel queries...\n`);
  const t = Date.now();
  const batches  = await Promise.all(SEARCH_QUERIES.map(fetchJobsForQuery));
  const allJobs  = batches.flat();
  const elapsed  = ((Date.now() - t) / 1000).toFixed(2);
  console.log(`\n📦 Fetched ${allJobs.length} raw jobs in ${elapsed}s`);
  return { allJobs, fetchTime: elapsed };
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2a — Smart Skill Badge Tagging Engine
// Dynamically tags each job with coloured emoji badges
// ═══════════════════════════════════════════════════════════════
function generateBadges(title = '', description = '') {
  const t = `${title} ${description}`.toLowerCase();
  const badges = [];
  if (/genai|generative ai/.test(t))                     badges.push('✨ GenAI');
  if (/\bllm\b|large language model|langchain|\brag\b/.test(t)) badges.push('⚡ LLM/RAG');
  if (/\bai\b|artificial intelligence/.test(t))          badges.push('🤖 AI');
  if (/\bml\b|machine learning/.test(t))                 badges.push('🧠 ML');
  if (/data science|data scientist/.test(t))             badges.push('📊 Data');
  if (/\breact\b/.test(t))                               badges.push('🔵 React');
  if (/next\.js|nextjs/.test(t))                         badges.push('🔺 Next.js');
  if (/node\.js|nodejs/.test(t))                         badges.push('🟢 Node.js');
  if (/\bpython\b/.test(t))                              badges.push('🐍 Python');
  if (/full.?stack/.test(t))                             badges.push('🔧 Full Stack');
  if (/typescript/.test(t))                              badges.push('🔷 TypeScript');
  if (/\bjava\b(?!script)/.test(t))                      badges.push('☕ Java');
  if (/vibe.?cod|cursor\b|copilot/.test(t))              badges.push('🎵 Vibe Coding');
  if (/remote/.test(t))                                  badges.push('🏠 Remote');
  return badges;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2b — Filter, Deduplicate & Relevance Ranking Engine
// ═══════════════════════════════════════════════════════════════
const EXCLUDE_KW = [
  'intern', 'internship', 'training', 'unpaid',
  'senior', 'sr.', 'lead', 'manager', 'principal',
  'director', 'head of', 'staff engineer', 'architect'
];

function processJobs(rawJobs) {
  const seenLinks      = new Set();
  const seenTitleCombo = new Set();
  const valid          = [];

  for (const job of rawJobs) {
    const title       = job.title          || 'Unknown Title';
    const company     = job.company_name   || 'Unknown Company';
    const location    = job.location       || 'India';
    const pubDate     = job.detected_extensions?.posted_at || 'Today';
    const description = job.description    || '';

    // Extract the best apply link
    let link = '';
    if (job.apply_options?.length > 0) link = job.apply_options[0].link;
    else if (job.share_link)           link = job.share_link;
    link = sanitizeUrl(link);
    if (!link) continue;

    // Deduplicate by canonical URL + Title×Company combo
    const linkKey  = link.split('?')[0];
    const comboKey = `${title.trim().toLowerCase()}|${company.trim().toLowerCase()}`;
    if (seenLinks.has(linkKey) || seenTitleCombo.has(comboKey)) continue;
    seenLinks.add(linkKey);
    seenTitleCombo.add(comboKey);

    const lower = title.toLowerCase();

    // Hard-exclude senior / non-fresher roles
    if (EXCLUDE_KW.some(kw => lower.includes(kw))) continue;

    // ── Relevance Scoring ──────────────────────────────────
    let score = 0;
    if (/fresher|entry.?level|junior|no experience|0[\-–]1 year/.test(lower)) score += 10;
    if (/2026 batch|2025 batch|2026 graduate/.test(lower))                     score += 8;
    if (/genai|generative ai|llm|rag|langchain/.test(lower))                   score += 8;
    if (/\bai\b|machine learning|artificial intelligence/.test(lower))         score += 6;
    if (/data science|data scientist/.test(lower))                             score += 5;
    if (/react|node\.js|python|full.?stack/.test(lower))                       score += 5;
    if (/typescript|next\.js/.test(lower))                                     score += 3;
    if (/remote/.test(lower + location.toLowerCase()))                         score += 3;

    const badges = generateBadges(title, description);
    const isAI   = badges.some(b => /AI|ML|LLM|RAG|GenAI|Data/.test(b));

    valid.push({ title, company, location, link, pubDate, relevanceScore: score, badges, isAI });
  }

  valid.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return valid;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2c — Premium HTML Email Builder
// Sections: Top Picks | AI & Emerging Tech | General Tech Roles
// ═══════════════════════════════════════════════════════════════
function buildEmailHTML(jobs) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });

  if (jobs.length === 0) {
    return `<div style="font-family:Arial,sans-serif;text-align:center;padding:60px 20px;background:#f4f6f9;">
      <div style="font-size:60px;">😴</div>
      <h2 style="color:#1a1a2e;">No Fresh Matches Today</h2>
      <p style="color:#666;">No entry-level tech jobs matched the criteria in the last 24 hours. See you tomorrow at 9 AM IST!</p>
    </div>`;
  }

  const topPicks    = jobs.filter(j => j.relevanceScore >= 10);
  const aiJobs      = jobs.filter(j => j.relevanceScore <  10 && j.isAI);
  const generalJobs = jobs.filter(j => j.relevanceScore <  10 && !j.isAI);

  const renderCard = (job) => {
    const safeTitle = escapeHtml(job.title);
    const safeCompany = escapeHtml(job.company);
    const safeLocation = escapeHtml(job.location);
    const safePubDate = escapeHtml(job.pubDate);
    const safeLink = sanitizeUrl(job.link);
    const badgeHTML = job.badges.length
      ? job.badges.map(b => `<span style="display:inline-block;padding:3px 10px;margin:2px 2px 2px 0;background:#e8f0fe;color:#1a73e8;border-radius:12px;font-size:11px;font-weight:700;">${escapeHtml(b)}</span>`).join('')
      : `<span style="font-size:12px;color:#aaa;">General Tech</span>`;

    return `<div style="margin-bottom:16px;padding:18px;background:#fff;border-radius:10px;border:1px solid #e0e0e0;border-left:5px solid #1a73e8;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
      <h3 style="margin:0 0 6px 0;font-size:16px;color:#1a1a2e;">${safeTitle}</h3>
      <p style="margin:4px 0;font-size:13px;color:#555;">
        🏢 <strong>${safeCompany}</strong> &nbsp;·&nbsp;
        📍 ${safeLocation} &nbsp;·&nbsp;
        ⏳ ${safePubDate}
      </p>
      <div style="margin:10px 0 12px 0;">${badgeHTML}</div>
      <a href="${safeLink || '#'}" style="display:inline-block;padding:9px 20px;background:linear-gradient(135deg,#1a73e8,#0d47a1);color:#fff;text-decoration:none;border-radius:20px;font-size:13px;font-weight:700;letter-spacing:0.3px;">Apply Now →</a>
    </div>`;
  };

  const renderSection = (emoji, heading, list) => {
    if (!list.length) return '';
    return `<div style="margin-bottom:32px;">
      <h2 style="font-size:18px;color:#1a1a2e;padding-bottom:10px;border-bottom:2px solid #e8eaf6;margin-bottom:18px;">
        ${emoji} ${heading}
        <span style="font-size:13px;color:#888;font-weight:normal;"> (${list.length} role${list.length > 1 ? 's' : ''})</span>
      </h2>
      ${list.map(renderCard).join('')}
    </div>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#eef0f4;">
  <div style="max-width:660px;margin:30px auto;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);padding:36px 30px;border-radius:14px 14px 0 0;text-align:center;">
      <div style="font-size:44px;">🌐</div>
      <h1 style="color:#fff;margin:10px 0 4px 0;font-size:24px;font-weight:800;letter-spacing:0.5px;">Tech Jobs Intelligence</h1>
      <p style="color:#b0bec5;margin:0;font-size:14px;">${today}</p>
      <div style="margin-top:18px;display:inline-block;background:rgba(104,211,145,0.15);border:1px solid #68d391;border-radius:20px;padding:7px 20px;">
        <span style="color:#68d391;font-weight:700;font-size:14px;">✅ ${jobs.length} Fresh Roles Scraped Today</span>
      </div>
      <div style="margin-top:10px;font-size:12px;color:#607d8b;">
        🏆 Top Picks: ${topPicks.length} &nbsp;|&nbsp; 🤖 AI/ML: ${aiJobs.length} &nbsp;|&nbsp; 💻 General: ${generalJobs.length}
      </div>
    </div>

    <!-- BODY -->
    <div style="padding:28px 24px;background:#f4f6f9;">
      ${renderSection('🏆', 'Top Picks', topPicks)}
      ${renderSection('🤖', 'AI & Emerging Tech', aiJobs)}
      ${renderSection('💻', 'General Tech Roles', generalJobs)}
    </div>

    <!-- FOOTER -->
    <div style="padding:22px 24px;background:#1a1a2e;border-radius:0 0 14px 14px;text-align:center;">
      <p style="color:#90a4ae;font-size:12px;margin:0;">Powered by Node.js &nbsp;·&nbsp; Hosted on GitHub Actions &nbsp;·&nbsp; Data from Google Jobs via SerpApi</p>
      <p style="color:#68d391;font-size:11px;margin:8px 0 0 0;">⚡ Serverless Architecture — 100% Free, Runs Daily at 9:00 AM IST</p>
    </div>

  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 3 — Email Dispatch
// ═══════════════════════════════════════════════════════════════
async function sendEmail(jobs) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });

  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
  const subject = jobs.length > 0
    ? `🎯 ${jobs.length} Fresh Tech Jobs · India · ${dateStr}`
    : `😴 No New Tech Jobs Today · ${dateStr}`;

  await transporter.sendMail({
    from:    `"Tech Jobs Intelligence 🤖" <${EMAIL_USER}>`,
    to:      EMAIL_USER,
    subject,
    html:    buildEmailHTML(jobs)
  });
}

// ═══════════════════════════════════════════════════════════════
// MAIN PIPELINE — Entry Point
// ═══════════════════════════════════════════════════════════════
(async () => {
  const pipelineStart = Date.now();

  console.log('════════════════════════════════════════════════');
  console.log('   🚀  Tech Jobs Intelligence Bot  v2.0         ');
  console.log('════════════════════════════════════════════════');

  if (!SERPAPI_KEY || !EMAIL_USER || !EMAIL_PASS) {
    console.error('\n❌ CRITICAL: Missing one or more GitHub Secrets!');
    console.error('   Required: SERPAPI_KEY, EMAIL_USER, EMAIL_PASS\n');
    process.exit(1);
  }

  // Step 1: Fetch
  const { allJobs, fetchTime } = await fetchAllJobs();

  // Step 2: Process
  const processStart  = Date.now();
  const validJobs     = processJobs(allJobs);
  const processTime   = ((Date.now() - processStart) / 1000).toFixed(2);

  // Step 3: Log the Pipeline Summary
  const aiCount  = validJobs.filter(j => j.isAI).length;
  const topCount = validJobs.filter(j => j.relevanceScore >= 10).length;

  console.log('\n────────────────────────────────────────────────');
  console.log(`📦 Fetched    : ${allJobs.length} raw jobs (${SEARCH_QUERIES.length} queries · ${fetchTime}s)`);
  console.log(`🔍 Valid      : ${validJobs.length} jobs (after dedup + filter + rank)`);
  console.log(`🤖 AI/ML Jobs : ${aiCount} jobs`);
  console.log(`🏆 Top Picks  : ${topCount} jobs (relevance ≥ 10)`);
  console.log(`⚙️  Processed  : ${processTime}s`);

  // Step 4: Send Email
  console.log(`\n📧 Sending email to ${EMAIL_USER}...`);
  const emailStart = Date.now();
  await sendEmail(validJobs);
  const emailTime  = ((Date.now() - emailStart) / 1000).toFixed(2);

  const totalTime = ((Date.now() - pipelineStart) / 1000).toFixed(2);
  console.log(`✅  Email sent in ${emailTime}s`);
  console.log('────────────────────────────────────────────────');
  console.log(`🏁  Pipeline complete in ${totalTime}s`);
  console.log('════════════════════════════════════════════════\n');
})();
