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
 * Format title and subtitle cleanly from user input, guaranteeing
 * sentence boundaries, word-boundary protection, and Meta's 80-char limit.
 */
function formatCardCopy(cleanMsg, configuredTitle, configuredSubtitle) {
  let title = (configuredTitle || '').trim();
  let subtitle = (configuredSubtitle || '').trim();

  if (title) {
    if (!subtitle) {
      subtitle = cleanMsg || 'Tap the button below to open 👇';
    }
  } else if (cleanMsg) {
    const lines = cleanMsg.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      title = lines[0];
      subtitle = lines.slice(1).join(' ');
    } else {
      if (cleanMsg.length <= 75) {
        title = cleanMsg;
        subtitle = subtitle || 'Tap the button below to open 👇';
      } else {
        const sentenceMatch = cleanMsg.match(/^(.{20,75}?[.!?])\s+(.+)$/);
        if (sentenceMatch) {
          title = sentenceMatch[1];
          subtitle = sentenceMatch[2];
        } else {
          const cutIdx = cleanMsg.lastIndexOf(' ', 75);
          if (cutIdx > 20) {
            title = cleanMsg.slice(0, cutIdx).trim();
            subtitle = cleanMsg.slice(cutIdx).trim();
          } else {
            title = cleanMsg.slice(0, 75).trim();
            subtitle = cleanMsg.slice(75).trim();
          }
        }
      }
    }
  } else {
    title = 'Here is your link! 🚀';
    subtitle = 'Tap the button below to open 👇';
  }

  // Ensure neither exceeds 80 characters without cutting words awkwardly
  if (title.length > 80) {
    const cut = title.lastIndexOf(' ', 76);
    title = (cut > 20 ? title.slice(0, cut) : title.slice(0, 77)) + '...';
  }
  if (subtitle.length > 80) {
    const cut = subtitle.lastIndexOf(' ', 76);
    subtitle = (cut > 20 ? subtitle.slice(0, cut) : subtitle.slice(0, 77)) + '...';
  }

  return { title, subtitle };
}

/**
 * Send a private DM to the commenter using Meta's Generic Template.
 * Fully cross-platform: Renders interactive button cards identically on
 * Mobile (iOS/Android) and Desktop Web Browser (Instagram Web).
 */
async function sendPrivateReply({ commentId, userId, messageText, cardConfig }) {
  // Option A: Send Interactive Link Card / Button
  if (cardConfig && cardConfig.buttonUrl) {
    const btnTitle = String(cardConfig.buttonText || 'Click ✅').trim().slice(0, 20) || 'Click ✅';
    let targetUrl = String(cardConfig.buttonUrl).trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // Helper: Clean raw URLs or "Click ✅: http..." out of message text to prevent ugly line breaks and duplicates
    const cleanMsg = (messageText || '')
      .replace(/(?:click\s*✅?|link|here):\s*https?:\/\/\S+/gi, '')
      .replace(/https?:\/\/\S+/gi, '')
      .trim();

    const { title, subtitle } = formatCardCopy(cleanMsg, cardConfig.title, cardConfig.subtitle);

    if (config.DRY_RUN) {
      console.log(`[DRY RUN] Would send Generic Template DM to user ${userId} for comment ${commentId}:`);
      console.log(`Title: "${title}" | Subtitle: "${subtitle}" | Button: [${btnTitle}] -> ${targetUrl}`);
      return { success: true, dry_run: true, format: 'card' };
    }

    const recipient = commentId ? { comment_id: commentId } : { id: userId };
    const url = `${BASE_URL}/me/messages`;

    // Construct Generic Template Element (Works on both Mobile AND Desktop Web)
    const element = {
      title,
      subtitle,
      default_action: {
        type: 'web_url',
        url: targetUrl
      },
      buttons: [
        {
          type: 'web_url',
          url: targetUrl,
          title: btnTitle
        }
      ]
    };

    if (cardConfig.imageUrl) {
      let imgUrl = String(cardConfig.imageUrl).trim();
      if (!imgUrl.startsWith('http://') && !imgUrl.startsWith('https://')) {
        imgUrl = 'https://' + imgUrl;
      }
      element.image_url = imgUrl;
    }

    const genericPayload = {
      recipient,
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [element]
          }
        }
      }
    };

    try {
      const res = await axios.post(url, genericPayload, {
        headers: { 'Content-Type': 'application/json' },
        params: { access_token: config.PAGE_ACCESS_TOKEN }
      });

      console.log(`✅ [Meta API] Interactive Generic Card DM delivered to ${commentId || userId} (Title: "${title}", Button: "${btnTitle}")`);
      return { success: true, data: res.data, format: 'card' };
    } catch (genericErr) {
      const errorMsg = genericErr.response?.data?.error?.message || genericErr.message;
      console.warn(`⚠️ [Meta API] Generic template notice (${errorMsg}). Falling back to clean text DM...`);

      // Fallback: Send clean text with link pointer
      const fallbackText = `${title}\n\n${subtitle}\n\n👉 ${targetUrl}`;
      return await sendPrivateReply({
        commentId,
        userId,
        messageText: fallbackText
      });
    }
  }

  // Option B: Standard Plain Text DM Delivery
  if (config.DRY_RUN) {
    console.log(`[DRY RUN] Would send DM to user ${userId} for comment ${commentId}:`);
    console.log(`----------------------------------------`);
    console.log(messageText);
    console.log(`----------------------------------------`);
    return { success: true, dry_run: true, format: 'text' };
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

    return { success: true, data: response.data, format: 'text' };
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
 * Fetch a single media item (Reel or Post) by ID
 */
async function getMediaDetails(mediaId) {
  if (!config.PAGE_ACCESS_TOKEN || !mediaId) return null;
  try {
    const url = `${BASE_URL}/${mediaId}`;
    const res = await axios.get(url, {
      params: {
        fields: 'id,caption,media_type,media_product_type,permalink,thumbnail_url,media_url,timestamp',
        access_token: config.PAGE_ACCESS_TOKEN
      }
    });
    return res.data;
  } catch (err) {
    console.warn(`[Meta API] Could not fetch single media ${mediaId}:`, err.response?.data?.error?.message || err.message);
    return null;
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
  getMediaDetails,
  subscribeApp
};

