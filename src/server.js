const express = require('express');
const path = require('path');
const config = require('./config');
const db = require('./db');
const bot = require('./bot');
const instagramApi = require('./instagramApi');

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Serve static frontend UI from src/public
app.use(express.static(path.join(__dirname, 'public')));

// ---------------- REST API FOR DASHBOARD UI ----------------

// Get stats
app.get('/api/stats', (req, res) => {
  const stats = db.getStats();
  res.json({
    status: 'ok',
    dryRun: config.DRY_RUN,
    stats
  });
});

// Get all video campaigns
app.get('/api/campaigns', (req, res) => {
  const campaigns = db.getCampaigns();
  res.json(campaigns);
});

// Create new video campaign
app.post('/api/campaigns', (req, res) => {
  const { title, mediaId, postUrl, triggerKeywords, dmText, publicReply } = req.body;
  if (!title || !triggerKeywords || !dmText) {
    return res.status(400).json({ error: 'Title, keywords, and DM text are required' });
  }

  const campaign = db.createCampaign({
    title,
    mediaId,
    postUrl,
    triggerKeywords,
    dmText,
    publicReply
  });

  console.log(`[Dashboard] Created new automation for video: "${title}" (Media ID: ${mediaId || 'All'})`);
  res.status(201).json(campaign);
});

// Toggle campaign active state
app.patch('/api/campaigns/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const updated = db.toggleCampaign(id, isActive);
  res.json(updated);
});

// Delete campaign
app.delete('/api/campaigns/:id', (req, res) => {
  const { id } = req.params;
  db.deleteCampaign(id);
  res.json({ success: true });
});

// Get recent comment activity log
app.get('/api/comments', (req, res) => {
  const recent = db.getRecentComments(30);
  res.json(recent);
});

// Get creator's recent Instagram posts/reels
app.get('/api/media', async (req, res) => {
  const media = await instagramApi.getMyRecentMedia();
  res.json(media);
});

// ---------------- META WEBHOOK ENDPOINTS ----------------

/**
 * GET /webhook
 * Meta Webhook verification handshake.
 */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === config.VERIFY_TOKEN) {
      console.log('✅ [Webhook Verification] Meta Webhook verified successfully!');
      return res.status(200).send(challenge);
    } else {
      console.warn('❌ [Webhook Verification] Token mismatch. Expected:', config.VERIFY_TOKEN, 'Received:', token);
      return res.sendStatus(403);
    }
  }

  res.sendStatus(400);
});

/**
 * POST /webhook
 * Meta Webhook event receiver.
 */
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'instagram') {
    // Respond immediately to Meta
    res.status(200).send('EVENT_RECEIVED');

    if (Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.field === 'comments') {
              bot.handleCommentEvent(change.value);
            }
          }
        }
      }
    }
  } else {
    res.sendStatus(404);
  }
});

// ---------------- META COMPLIANCE PAGES ----------------
app.get('/privacy', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head><title>Privacy Policy - NatC Industries</title><style>body{font-family:sans-serif;line-height:1.6;max-width:700px;margin:40px auto;padding:0 20px;color:#333;}</style></head>
<body>
<h1>Privacy Policy</h1>
<p>Last updated: October 2026</p>
<p><strong>NatC Industries</strong> ("we", "us", "our") operates the <strong>autoreply</strong> Instagram application.</p>
<h2>1. Information We Collect</h2>
<p>We only receive public Instagram comment events and sender identifiers passed through the official Meta Graph API when a user leaves a comment on our published content.</p>
<h2>2. How We Use Information</h2>
<p>We use this data solely to process automated replies and deliver requested resources or links via Instagram direct messages in direct response to user triggers.</p>
<h2>3. Data Sharing & Security</h2>
<p>We do not sell, rent, or distribute personal information to any third parties. All communication occurs over secure encrypted protocols directly with Meta APIs.</p>
<h2>4. Contact Us</h2>
<p>For questions or privacy concerns, contact: <a href="mailto:nathanielc2007@gmail.com">nathanielc2007@gmail.com</a></p>
</body>
</html>`);
});

app.get('/data-deletion', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head><title>User Data Deletion Instructions - NatC Industries</title><style>body{font-family:sans-serif;line-height:1.6;max-width:700px;margin:40px auto;padding:0 20px;color:#333;}</style></head>
<body>
<h1>User Data Deletion Instructions</h1>
<p>If you wish to have your data or comment logs removed from our records, follow these steps:</p>
<ol>
<li>Send an email to <strong>nathanielc2007@gmail.com</strong> with the subject "Data Deletion Request".</li>
<li>Provide your Instagram username.</li>
<li>Upon receipt, all records associated with your account will be permanently deleted from our local database within 48 hours.</li>
</ol>
</body>
</html>`);
});

// Start listening
app.listen(config.PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🤖 Instagram Auto-Reply Studio is RUNNING!`);
  console.log(`🖥️  Local Dashboard UI: http://localhost:${config.PORT}`);
  console.log(`🔑 Verification Token: "${config.VERIFY_TOKEN}"`);
  console.log(`==================================================\n`);
});
