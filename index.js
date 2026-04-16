const axios = require('axios');
const nodemailer = require('nodemailer');

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

async function fetchJobs() {
  console.log("Fetching jobs from SerpApi...");
  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_jobs',
        q: 'software engineer fresher India OR entry level developer India',
        location: 'India',
        chips: 'date_posted:today',
        api_key: SERPAPI_KEY
      }
    });
    return response.data.jobs_results || [];
  } catch (error) {
    console.error("Error fetching jobs:", error.response?.data || error.message);
    return [];
  }
}

function processJobs(jobs) {
  console.log(`Processing ${jobs.length} jobs...`);
  const newItems = [];
  const seenLinks = new Set();

  for (const job of jobs) {
    let title = job.title || 'Unknown Title';
    let company = job.company_name || 'Unknown Company';
    let location = job.location || 'India';
    let pubDate = job.detected_extensions?.posted_at || 'Today';

    let link = '';
    if (job.apply_options && job.apply_options.length > 0) {
      link = job.apply_options[0].link;
    } else if (job.share_link) {
      link = job.share_link;
    }

    if (!link || seenLinks.has(link)) continue;
    seenLinks.add(link);

    const titleLower = title.toLowerCase();
    const hasExcluded = ["intern", "internship", "training", "unpaid", "senior", "lead"].some(kw => titleLower.includes(kw));
    if (hasExcluded) continue;

    let score = 0;
    if (titleLower.includes("fresher") || titleLower.includes("entry level") || titleLower.includes("junior")) score += 10;
    if (titleLower.includes("react") || titleLower.includes("backend") || titleLower.includes("node")) score += 5;

    newItems.push({ title, company, location, link, pubDate, relevanceScore: score });
  }

  newItems.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return newItems.slice(0, 20);
}

async function sendEmail(jobs) {
  console.log("Generating email...");
  
  let html = '';
  if (jobs.length === 0) {
    html = `<p>No new entry-level jobs found today based on the criteria.</p>`;
  } else {
    html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0056b3, #003d82); padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px;">🌐 Global Tech Jobs Scan</h2>
        <p style="color: #e0e0e0; margin: 5px 0 0 0; font-size: 14px;">Fresh Entry-Level Roles in India</p>
      </div>
      
      <div style="padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Here are the top ${jobs.length} jobs scraped from Google Jobs in the last 24 hours:</p>
    `;

    for (const job of jobs) {
      html += `
        <div style="margin-bottom: 15px; padding: 15px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #0056b3; transition: transform 0.2s;">
          <h3 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 18px;">${job.title}</h3>
          <div style="color: #555; font-size: 14px; margin-bottom: 12px;">
            <p style="margin: 4px 0;"><span style="font-weight: 600; color: #333;">🏢 Company:</span> ${job.company}</p>
            <p style="margin: 4px 0;"><span style="font-weight: 600; color: #333;">📍 Location:</span> ${job.location}</p>
            <p style="margin: 4px 0;"><span style="font-weight: 600; color: #333;">⏳ Posted:</span> ${job.pubDate}</p>
            <p style="margin: 4px 0;"><span style="font-weight: 600; color: #333;">⭐ Relevance:</span> ${job.relevanceScore}</p>
          </div>
          <a href="${job.link}" style="display: inline-block; padding: 8px 16px; background-color: #0056b3; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">Apply Now</a>
        </div>
      `;
    }

    html += `
        <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">Automated via Node.js CI/CD Architecture</p>
      </div>
    </div>
    `;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Tech Scraper Bot" <${EMAIL_USER}>`,
    to: EMAIL_USER,
    subject: `🎯 Daily Entry-Level Tech Jobs (${jobs.length})`,
    html: html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// MAIN 
(async () => {
  console.log("🚀 Starting Daily Tech Scraper Bot...");
  if (!SERPAPI_KEY || !EMAIL_USER || !EMAIL_PASS) {
    console.error("❌ CRITICAL ERROR: Missing environment variables!");
    process.exit(1);
  }
  
  const rawJobs = await fetchJobs();
  const processedJobs = processJobs(rawJobs);
  await sendEmail(processedJobs);
  console.log("✅ Script finished executing!");
})();
