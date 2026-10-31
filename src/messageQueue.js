const config = require('./config');

/**
 * Advanced Safety & Rate-Limiting Message Queue
 * 
 * Safeguards:
 * 1. Humanized Jitter: Delays are randomized (2500ms - 6500ms) to avoid robotic timing patterns.
 * 2. Hourly Quota: Caps DMs at 60/hr to protect account health during viral spikes.
 * 3. Daily Quota: Caps DMs at 300/day to prevent Meta spam detection.
 * 4. Circuit Breaker: Automatically pauses queue if Meta signals rate limiting.
 */
class MessageQueue {
  constructor(baseDelayMs = 2500) {
    this.minDelayMs = Math.max(1500, baseDelayMs || 2500);
    this.maxDelayMs = Math.max(this.minDelayMs + 2000, 6500);
    this.queue = [];
    this.isProcessing = false;

    // Rate limiting quotas
    this.hourlyLimit = 60;
    this.dailyLimit = 300;
    this.sentTimestamps = [];

    // Circuit breaker state
    this.pausedUntil = null;
  }

  getRandomDelay() {
    return Math.floor(Math.random() * (this.maxDelayMs - this.minDelayMs + 1)) + this.minDelayMs;
  }

  isQuotaAvailable() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Clean up timestamps older than 24 hours
    this.sentTimestamps = this.sentTimestamps.filter(ts => ts > oneDayAgo);

    const pastHourCount = this.sentTimestamps.filter(ts => ts > oneHourAgo).length;
    const pastDayCount = this.sentTimestamps.length;

    if (pastHourCount >= this.hourlyLimit) {
      console.warn(`🛡️ [Safety Guard] Hourly limit reached (${pastHourCount}/${this.hourlyLimit} DMs). Pausing for 5 minutes.`);
      return false;
    }

    if (pastDayCount >= this.dailyLimit) {
      console.warn(`🛡️ [Safety Guard] Daily limit reached (${pastDayCount}/${this.dailyLimit} DMs). Pausing to protect account.`);
      return false;
    }

    return true;
  }

  recordSent() {
    this.sentTimestamps.push(Date.now());
  }

  tripCircuitBreaker(minutes = 15, reason = 'Rate limit detected') {
    const pauseMs = minutes * 60 * 1000;
    this.pausedUntil = Date.now() + pauseMs;
    console.error(`🚨 [CIRCUIT BREAKER] Tripped: ${reason}. All auto-replies paused for ${minutes} minutes until ${new Date(this.pausedUntil).toLocaleTimeString()}`);
  }

  enqueue(taskFn) {
    this.queue.push(taskFn);
    this.processNext();
  }

  async processNext() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    // Check circuit breaker
    if (this.pausedUntil) {
      const remaining = this.pausedUntil - Date.now();
      if (remaining > 0) {
        setTimeout(() => this.processNext(), Math.min(remaining, 30000));
        return;
      }
      this.pausedUntil = null;
      console.log('✅ [CIRCUIT BREAKER] Cool-down period elapsed. Resuming queue processing.');
    }

    // Check quota limits
    if (!this.isQuotaAvailable()) {
      setTimeout(() => this.processNext(), 5 * 60 * 1000); // Wait 5 mins and recheck
      return;
    }

    this.isProcessing = true;
    const task = this.queue.shift();

    try {
      await task();
      this.recordSent();
    } catch (err) {
      console.error('[Queue Error] Error executing queue task:', err);
      // Check if error is rate-limit related
      const errMsg = String(err?.message || err);
      if (errMsg.includes('(#4)') || errMsg.includes('(#17)') || errMsg.includes('(#32)') || errMsg.toLowerCase().includes('rate limit')) {
        this.tripCircuitBreaker(30, errMsg);
      }
    } finally {
      const dynamicDelay = this.getRandomDelay();
      setTimeout(() => {
        this.isProcessing = false;
        this.processNext();
      }, dynamicDelay);
    }
  }

  get length() {
    return this.queue.length;
  }

  getStatus() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    return {
      inQueue: this.queue.length,
      hourlySent: this.sentTimestamps.filter(ts => ts > oneHourAgo).length,
      hourlyLimit: this.hourlyLimit,
      dailySent: this.sentTimestamps.length,
      dailyLimit: this.dailyLimit,
      isPaused: Boolean(this.pausedUntil && this.pausedUntil > now),
      pausedUntil: this.pausedUntil
    };
  }
}

const queue = new MessageQueue(config.MESSAGE_DELAY_MS);

module.exports = queue;
