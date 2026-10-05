const axios = require('axios');
const config = require('./config');
const db = require('./db');
const bot = require('./bot');
const instagramApi = require('./instagramApi');

const BASE_URL = config.PAGE_ACCESS_TOKEN.startsWith('IG')
  ? `https://graph.instagram.com/${config.GRAPH_API_VERSION}`
  : `https://graph.facebook.com/${config.GRAPH_API_VERSION}`;

let isPolling = false;

/**
 * Scan comments on a specific media object and process any unhandled ones.
 */
async function checkCommentsForMedia(mediaId) {
  if (!config.PAGE_ACCESS_TOKEN || !mediaId) return;

  try {
    const url = `${BASE_URL}/${mediaId}/comments`;
    const res = await axios.get(url, {
      params: {
        fields: 'id,text,from,timestamp',
        limit: 15,
        access_token: config.PAGE_ACCESS_TOKEN
      }
    });

    const comments = res.data?.data || [];
    for (const comment of comments) {
      if (!comment.id) continue;
      // Skip if already processed
      if (db.isCommentProcessed(comment.id)) continue;

      console.log(`⚡ [Real-Time Poller] Detected new comment ${comment.id} from @${comment.from?.username || 'user'}: "${comment.text}"`);
      await bot.handleCommentEvent({
        id: comment.id,
        text: comment.text,
        from: comment.from,
        media: { id: mediaId }
      });
    }
  } catch (err) {
    // Silently continue to next cycle
  }
}

/**
 * Poll all media targets associated with active campaigns.
 */
async function pollActiveCampaigns() {
  if (isPolling || !config.PAGE_ACCESS_TOKEN) return;
  isPolling = true;

  try {
    const campaigns = db.getCampaigns().filter(c => c.is_active);
    if (campaigns.length === 0) return;

    const mediaIdsToCheck = new Set();

    for (const c of campaigns) {
      if (c.media_id) {
        mediaIdsToCheck.add(c.media_id);
      }
    }

    // If any global campaign exists, also check recent media
    const hasGlobal = campaigns.some(c => !c.media_id);
    if (hasGlobal) {
      const recentMedia = await instagramApi.getMyRecentMedia();
      for (const m of recentMedia.slice(0, 3)) {
        if (m.id) mediaIdsToCheck.add(m.id);
      }
    }

    for (const mediaId of mediaIdsToCheck) {
      await checkCommentsForMedia(mediaId);
    }
  } catch (err) {
    console.warn('Poller cycle warning:', err.message);
  } finally {
    isPolling = false;
  }
}

/**
 * Start the autonomous polling engine.
 */
function startPoller(intervalMs = 7000) {
  console.log(`🔄 [Autonomous Engine] Dual-Engine Active: Webhooks + ${intervalMs / 1000}s Real-Time Polling Fallback enabled.`);
  setInterval(pollActiveCampaigns, intervalMs);
  setTimeout(pollActiveCampaigns, 2500);
}

module.exports = {
  startPoller,
  pollActiveCampaigns
};
