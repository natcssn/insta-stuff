const axios = require('axios');
const config = require('./config');

const BASE_URL = config.PAGE_ACCESS_TOKEN.startsWith('IG')
  ? `https://graph.instagram.com/${config.GRAPH_API_VERSION}`
  : `https://graph.facebook.com/${config.GRAPH_API_VERSION}`;

/**
 * Publicly reply to a user's comment.
 */
async function replyToComment(commentId, replyText) {
  if (config.DRY_RUN) {
    console.log(`[DRY RUN] Would post public comment reply to ${commentId}: "${replyText}"`);
    return { success: true, dry_run: true };
  }

  try {
    const url = `${BASE_URL}/${commentId}/replies`;
    const response = await axios.post(url, null, {
      params: {
        message: replyText,
        access_token: config.PAGE_ACCESS_TOKEN
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[Meta API Error] Failed to reply to comment ${commentId}:`, errorDetails);
    return { success: false, error: errorDetails };
  }
}

/**
 * Send a private DM to the commenter.
 */
async function sendPrivateReply({ commentId, userId, messageText }) {
  if (config.DRY_RUN) {
    console.log(`[DRY RUN] Would send DM to user ${userId} for comment ${commentId}:`);
    console.log(`----------------------------------------`);
    console.log(messageText);
    console.log(`----------------------------------------`);
    return { success: true, dry_run: true };
  }

  try {
    const url = `${BASE_URL}/me/messages`;
    const payload = {
      recipient: commentId ? { comment_id: commentId } : { id: userId },
      message: {
        text: messageText
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: config.PAGE_ACCESS_TOKEN
      }
    });

    return { success: true, data: response.data };
  } catch (error) {
    const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[Meta API Error] Failed to send private DM for comment ${commentId}:`, errorDetails);
    return { success: false, error: errorDetails };
  }
}

/**
 * Fetch the creator's recent media (Reels, Videos, Posts)
 */
async function getMyRecentMedia() {
  if (!config.PAGE_ACCESS_TOKEN) {
    return [];
  }

  try {
    const url = `${BASE_URL}/me`;
    const response = await axios.get(url, {
      params: {
        fields: 'media{id,caption,media_type,media_product_type,permalink,thumbnail_url,media_url,timestamp}',
        access_token: config.PAGE_ACCESS_TOKEN
      }
    });

    return response.data?.media?.data || [];
  } catch (error) {
    console.error('[Meta API Error] Failed to fetch recent media:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Automatically subscribe the Instagram Business Account to this app's webhooks.
 */
async function subscribeApp() {
  if (!config.PAGE_ACCESS_TOKEN || !config.INSTAGRAM_ACCOUNT_ID) return;
  try {
    const url = `${BASE_URL}/${config.INSTAGRAM_ACCOUNT_ID}/subscribed_apps`;
    const res = await axios.post(url, null, {
      params: {
        subscribed_fields: 'comments,mentions,messages',
        access_token: config.PAGE_ACCESS_TOKEN
      }
    });
    console.log('✅ [Meta Handshake] Instagram Account subscribed to Webhooks:', res.data);
    return res.data;
  } catch (err) {
    console.warn('⚠️ [Meta Handshake] Auto-subscribe notice:', err.response?.data?.error?.message || err.message);
  }
}

module.exports = {
  replyToComment,
  sendPrivateReply,
  getMyRecentMedia,
  subscribeApp
};

