const config = require('./config');
const db = require('./db');
const instagramApi = require('./instagramApi');
const queue = require('./messageQueue');

/**
 * Check if text contains any of the target keywords.
 */
function matchesKeywords(text, keywordsArray) {
  if (!text || !keywordsArray || keywordsArray.length === 0) return false;
  const normalized = String(text).toLowerCase().trim();

  return keywordsArray.some(keyword => {
    const trimmed = String(keyword).trim().toLowerCase();
    if (!trimmed) return false;
    // 100% case-insensitive substring match OR word boundary match
    return normalized.includes(trimmed) || new RegExp(`(^|\\b|\\W)${trimmed}(\\b|\\W|$)`, 'i').test(normalized);
  });
}

/**
 * Handle an incoming Instagram comment event from Meta webhook.
 */
async function handleCommentEvent(changeValue) {
  const commentId = changeValue.id;
  const commentText = changeValue.text || '';
  const fromUser = changeValue.from || {};
  const userId = fromUser.id;
  const username = fromUser.username;
  const mediaId = changeValue.media?.id;

  // 1. Guard: Check if comment ID is missing
  if (!commentId) {
    console.warn('⚠️ Received comment change without an ID. Ignoring.');
    return;
  }

  // 2. Guard: Completely ignore comments from our own account to keep telemetry pristine
  const isOwnAccount = (
    (username && username.toLowerCase() === 'thenatrants') ||
    (config.INSTAGRAM_ACCOUNT_ID && userId === config.INSTAGRAM_ACCOUNT_ID) ||
    userId === '28737497522537701' ||
    userId === '17841441235679502'
  );

  if (isOwnAccount) {
    console.log(`⏩ [Ignored] Comment from own account @${username || userId}. Silently omitted from logs.`);
    return;
  }

  console.log(`\n💬 [Incoming Comment] ID: ${commentId} on Media: ${mediaId} from @${username || userId}: "${commentText}"`);

  // 3. Guard: Ignore if already processed
  if (db.isCommentProcessed(commentId)) {
    console.log(`⏩ Comment ${commentId} has already been processed. Skipping.`);
    return;
  }

  // 4. CRITICAL GUARD: Only respond if an active campaign exists for this specific video!
  const campaign = db.findCampaignForMedia(mediaId);
  if (!campaign) {
    console.log(`🔒 [Safety Guard] No active auto-reply campaign configured for Media ${mediaId}. Ignoring to prevent blind replies.`);
    db.recordComment({
      commentId,
      userId,
      username,
      commentText,
      mediaId,
      status: 'SKIPPED_NO_CAMPAIGN'
    });
    return;
  }

  // 5. Keyword Matching for this specific campaign
  const campaignKeywords = (campaign.trigger_keywords || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);

  const isMatch = matchesKeywords(commentText, campaignKeywords);
  if (!isMatch) {
    console.log(`⏩ Comment on campaign "${campaign.title}" did not match keywords (${campaignKeywords.join(', ')}). Skipping.`);
    db.recordComment({
      commentId,
      userId,
      username,
      commentText,
      mediaId,
      campaignId: campaign.id,
      status: 'SKIPPED_NO_KEYWORD'
    });
    return;
  }

  console.log(`🎯 Matched campaign "${campaign.title}"! Queuing auto-reply for @${username || userId}...`);

  // 6. Enqueue tasks with rate-limiting delay
  queue.enqueue(async () => {
    let publicReplySent = false;
    let dmSent = false;
    let errorMessage = null;

    try {
      // Step A: Send Direct Message with campaign-specific text
      console.log(`🚀 Sending custom DM to @${username || userId} for campaign "${campaign.title}"...`);
      const dmResult = await instagramApi.sendPrivateReply({
        commentId,
        userId,
        messageText: campaign.dm_text
      });

      if (dmResult.success) {
        dmSent = true;
        console.log(`✅ DM successfully sent to @${username || userId}!`);
      } else {
        errorMessage = dmResult.error;
      }

      // Step B: Post public reply (if configured in campaign)
      if (campaign.public_reply && dmSent) {
        console.log(`💬 Posting public reply to comment ${commentId}...`);
        const replyResult = await instagramApi.replyToComment(commentId, campaign.public_reply);
        if (replyResult.success) {
          publicReplySent = true;
          console.log(`✅ Public reply posted!`);
        }
      }

      // Step C: Record in DB
      db.recordComment({
        commentId,
        userId,
        username,
        commentText,
        mediaId,
        campaignId: campaign.id,
        publicReplySent: publicReplySent ? 1 : 0,
        dmSent: dmSent ? 1 : 0,
        status: dmSent ? 'SUCCESS' : 'FAILED',
        errorMessage
      });

    } catch (err) {
      console.error(`❌ Unexpected error processing comment ${commentId}:`, err);
      db.recordComment({
        commentId,
        userId,
        username,
        commentText,
        mediaId,
        campaignId: campaign.id,
        status: 'FAILED',
        errorMessage: err.message
      });
    }
  });
}

module.exports = {
  handleCommentEvent,
  matchesKeywords
};
