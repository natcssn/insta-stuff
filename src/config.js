const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  // Server Port
  PORT: process.env.PORT || 3000,

  // Webhook Verification Token (set whatever random string you want here and in Meta dashboard)
  VERIFY_TOKEN: process.env.VERIFY_TOKEN || 'my_super_secret_verify_token_123',

  // Meta Graph API Page Access Token (has instagram_manage_comments, instagram_manage_messages)
  PAGE_ACCESS_TOKEN: process.env.PAGE_ACCESS_TOKEN || '',

  // Your Instagram Account ID / Page ID (to avoid replying to yourself)
  INSTAGRAM_ACCOUNT_ID: process.env.INSTAGRAM_ACCOUNT_ID || '',

  // Meta Graph API Version
  GRAPH_API_VERSION: process.env.GRAPH_API_VERSION || 'v21.0',

  // Keywords to listen for in comments (comma-separated or array)
  // Example: ["link", "guide", "pdf", "send", "book"]
  KEYWORDS: (process.env.TRIGGER_KEYWORDS || 'link,guide,pdf,send,book')
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(Boolean),

  // What to send in the private DM
  DM_REPLY_TEXT: process.env.DM_REPLY_TEXT || 'Hey there! 🎉 Thanks for your comment. Here is the link you requested:\n\n👉 https://example.com/your-free-resource\n\nEnjoy!',

  // Public reply to the comment (leave empty string to disable public reply)
  PUBLIC_COMMENT_REPLY: process.env.PUBLIC_COMMENT_REPLY || 'Sent to your DMs! Check your inbox 📥✨',

  // Delay between messages in milliseconds to avoid spamming/rate-limits (default 1.5 seconds)
  MESSAGE_DELAY_MS: parseInt(process.env.MESSAGE_DELAY_MS || '1500', 10),

  // Dry run mode (logs actions without actually calling Meta API - great for testing!)
  DRY_RUN: process.env.DRY_RUN === 'true' || !process.env.PAGE_ACCESS_TOKEN,

  // Admin Dashboard Security Credentials
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'natc',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'RED200006X',
  AUTH_SECRET: process.env.AUTH_SECRET || 'natc_industries_shelly_auth_secret_2026'
};
