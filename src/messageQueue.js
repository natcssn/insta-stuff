const config = require('./config');

/**
 * A simple asynchronous queue to process DM sends one by one with a delay.
 * Prevents triggering Meta rate-limits or spam detection during spikes.
 */
class MessageQueue {
  constructor(delayMs = 1500) {
    this.delayMs = delayMs;
    this.queue = [];
    this.isProcessing = false;
  }

  enqueue(taskFn) {
    this.queue.push(taskFn);
    this.processNext();
  }

  async processNext() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const task = this.queue.shift();

    try {
      await task();
    } catch (err) {
      console.error('[Queue Error] Error executing queue task:', err);
    } finally {
      // Wait for the configured delay before executing the next message
      setTimeout(() => {
        this.isProcessing = false;
        this.processNext();
      }, this.delayMs);
    }
  }

  get length() {
    return this.queue.length;
  }
}

const queue = new MessageQueue(config.MESSAGE_DELAY_MS);

module.exports = queue;
