const Database = require('better-sqlite3');
const path = require('path');

const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'bot_data.sqlite');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS processed_comments (
    comment_id TEXT PRIMARY KEY,
    user_id TEXT,
    username TEXT,
    comment_text TEXT,
    media_id TEXT,
    campaign_id INTEGER,
    public_reply_sent INTEGER DEFAULT 0,
    dm_sent INTEGER DEFAULT 0,
    status TEXT,
    error_message TEXT,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    media_id TEXT,
    post_url TEXT,
    trigger_keywords TEXT NOT NULL,
    dm_text TEXT NOT NULL,
    public_reply TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_processed_user ON processed_comments(user_id);
  CREATE INDEX IF NOT EXISTS idx_processed_media ON processed_comments(media_id);
  CREATE INDEX IF NOT EXISTS idx_campaigns_media ON campaigns(media_id);
`);

// Safe column migrations
try {
  db.exec('ALTER TABLE processed_comments ADD COLUMN campaign_id INTEGER;');
} catch (_) {}
try {
  db.exec("ALTER TABLE campaigns ADD COLUMN dm_type TEXT DEFAULT 'text';");
} catch (_) {}
try {
  db.exec('ALTER TABLE campaigns ADD COLUMN card_title TEXT;');
} catch (_) {}
try {
  db.exec('ALTER TABLE campaigns ADD COLUMN card_subtitle TEXT;');
} catch (_) {}
try {
  db.exec('ALTER TABLE campaigns ADD COLUMN card_button_text TEXT;');
} catch (_) {}
try {
  db.exec('ALTER TABLE campaigns ADD COLUMN card_button_url TEXT;');
} catch (_) {}
try {
  db.exec('ALTER TABLE campaigns ADD COLUMN card_image_url TEXT;');
} catch (_) {}

/**
 * Check if a comment has already been processed.
 */
function isCommentProcessed(commentId) {
  const row = db.prepare('SELECT comment_id, status FROM processed_comments WHERE comment_id = ?').get(commentId);
  return Boolean(row);
}

/**
 * Record a processed comment.
 */
function recordComment({
  commentId,
  userId,
  username,
  commentText,
  mediaId,
  campaignId = null,
  publicReplySent = 0,
  dmSent = 0,
  status = 'SUCCESS',
  errorMessage = null
}) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO processed_comments (
      comment_id, user_id, username, comment_text, media_id, campaign_id,
      public_reply_sent, dm_sent, status, error_message, processed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  stmt.run(
    commentId,
    userId,
    username || null,
    commentText,
    mediaId || null,
    campaignId,
    publicReplySent ? 1 : 0,
    dmSent ? 1 : 0,
    status,
    errorMessage
  );
}

// ---------------- CAMPAIGN MANAGEMENT & PERSISTENCE ----------------
const backupPath = path.join(__dirname, '..', 'campaigns_backup.json');

function saveCampaignsBackup() {
  try {
    const all = db.prepare('SELECT * FROM campaigns').all();
    fs.writeFileSync(backupPath, JSON.stringify(all, null, 2));
  } catch (err) {
    console.warn('Could not save campaigns backup:', err.message);
  }
}

function restoreCampaignsFromBackup() {
  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM campaigns').get().count;
    if (count === 0) {
      if (fs.existsSync(backupPath)) {
        const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        if (Array.isArray(data) && data.length > 0) {
          const insertStmt = db.prepare(`
            INSERT INTO campaigns (
              id, title, media_id, post_url, trigger_keywords, dm_text, public_reply, is_active,
              dm_type, card_title, card_subtitle, card_button_text, card_button_url, card_image_url, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const c of data) {
            insertStmt.run(
              c.id,
              c.title,
              c.media_id,
              c.post_url,
              c.trigger_keywords,
              c.dm_text,
              c.public_reply,
              c.is_active,
              c.dm_type || 'text',
              c.card_title || null,
              c.card_subtitle || null,
              c.card_button_text || null,
              c.card_button_url || null,
              c.card_image_url || null,
              c.created_at || new Date().toISOString()
            );
          }
          console.log(`✅ [Database] Restored ${data.length} campaign(s) from persistent backup.`);
          return;
        }
      }
    }
  } catch (err) {
    console.warn('Could not restore campaigns:', err.message);
  }
}

// Restore on boot
restoreCampaignsFromBackup();

function createCampaign({
  title,
  mediaId,
  postUrl,
  triggerKeywords,
  dmText,
  publicReply,
  dmType = 'text',
  cardTitle = null,
  cardSubtitle = null,
  cardButtonText = null,
  cardButtonUrl = null,
  cardImageUrl = null
}) {
  const stmt = db.prepare(`
    INSERT INTO campaigns (
      title, media_id, post_url, trigger_keywords, dm_text, public_reply, is_active,
      dm_type, card_title, card_subtitle, card_button_text, card_button_url, card_image_url
    )
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    title,
    mediaId || null,
    postUrl || null,
    triggerKeywords,
    dmText,
    publicReply || null,
    dmType || 'text',
    cardTitle || null,
    cardSubtitle || null,
    cardButtonText || null,
    cardButtonUrl || null,
    cardImageUrl || null
  );
  saveCampaignsBackup();
  return getCampaignById(info.lastInsertRowid);
}

function getCampaigns() {
  return db.prepare('SELECT * FROM campaigns ORDER BY id DESC').all();
}

function getCampaignById(id) {
  return db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
}

/**
 * Find active campaign for an Instagram media ID, post URL, or global fallback.
 */
function findCampaignForMedia(mediaId, postUrl = null) {
  if (mediaId) {
    const directMatch = db.prepare('SELECT * FROM campaigns WHERE media_id = ? AND is_active = 1').get(mediaId);
    if (directMatch) return directMatch;
  }
  if (postUrl) {
    const urlMatch = db.prepare('SELECT * FROM campaigns WHERE post_url = ? AND is_active = 1').get(postUrl);
    if (urlMatch) return urlMatch;
  }
  return null;
}

function toggleCampaign(id, isActive) {
  db.prepare('UPDATE campaigns SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, id);
  saveCampaignsBackup();
  return getCampaignById(id);
}

function deleteCampaign(id) {
  db.prepare('DELETE FROM campaigns WHERE id = ?').run(id);
  saveCampaignsBackup();
  return { success: true };
}

function getRecentComments(limit = 25) {
  return db.prepare(`
    SELECT c.*, camp.title as campaign_title 
    FROM processed_comments c
    LEFT JOIN campaigns camp ON c.campaign_id = camp.id
    ORDER BY c.processed_at DESC 
    LIMIT ?
  `).all(limit);
}

/**
 * Get statistics of processed comments.
 */
function getStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM processed_comments').get().count;
  const successfulDms = db.prepare('SELECT COUNT(*) as count FROM processed_comments WHERE dm_sent = 1').get().count;
  const skipped = db.prepare("SELECT COUNT(*) as count FROM processed_comments WHERE status LIKE 'SKIPPED%'").get().count;
  const failed = db.prepare("SELECT COUNT(*) as count FROM processed_comments WHERE status = 'FAILED'").get().count;
  const activeCampaigns = db.prepare("SELECT COUNT(*) as count FROM campaigns WHERE is_active = 1").get().count;

  return { total, successfulDms, skipped, failed, activeCampaigns };
}

module.exports = {
  isCommentProcessed,
  recordComment,
  createCampaign,
  getCampaigns,
  getCampaignById,
  findCampaignForMedia,
  toggleCampaign,
  deleteCampaign,
  getRecentComments,
  getStats
};
