/**
 * Test script to simulate Meta Instagram webhook calls locally.
 * Usage:
 *   1. Start the bot server in one terminal: npm start
 *   2. Run this test in another terminal: node scripts/test-webhook.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const VERIFY_TOKEN = 'my_super_secret_verify_token_123';

async function runTests() {
  console.log('🧪 Starting Instagram Auto-Reply Webhook Tests...\n');

  try {
    // 1. Test Webhook Verification Handshake (GET /webhook)
    console.log('1️⃣ Testing Webhook Verification Handshake...');
    const verifyRes = await axios.get(`${BASE_URL}/webhook`, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': VERIFY_TOKEN,
        'hub.challenge': '1158201444'
      }
    });

    if (verifyRes.data.toString() === '1158201444') {
      console.log('✅ Webhook verification passed!\n');
    } else {
      console.error('❌ Webhook verification failed unexpected response:', verifyRes.data);
    }

    // 2. Test Comment with Trigger Keyword "link"
    console.log('2️⃣ Simulating incoming comment with keyword: "Hey bro can you send me the LINK please?"');
    const commentPayload1 = {
      object: 'instagram',
      entry: [
        {
          id: '17841400000000000',
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'comments',
              value: {
                id: 'comment_test_001_' + Date.now(),
                text: 'Hey bro can you send me the LINK please?',
                from: {
                  id: 'user_12345',
                  username: 'fitness_fanatic'
                },
                media: {
                  id: 'media_98765',
                  media_product_type: 'REELS'
                }
              }
            }
          ]
        }
      ]
    };

    const res1 = await axios.post(`${BASE_URL}/webhook`, commentPayload1);
    console.log(`✅ Webhook event accepted (HTTP ${res1.status}: ${res1.data})`);

    // 3. Test Comment without Trigger Keyword
    console.log('\n3️⃣ Simulating comment WITHOUT keywords: "Awesome video bro fire 🔥"');
    const commentPayload2 = {
      object: 'instagram',
      entry: [
        {
          id: '17841400000000000',
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'comments',
              value: {
                id: 'comment_test_002_' + Date.now(),
                text: 'Awesome video bro fire 🔥',
                from: {
                  id: 'user_67890',
                  username: 'casual_viewer'
                },
                media: {
                  id: 'media_98765',
                  media_product_type: 'REELS'
                }
              }
            }
          ]
        }
      ]
    };

    const res2 = await axios.post(`${BASE_URL}/webhook`, commentPayload2);
    console.log(`✅ Non-keyword comment processed (HTTP ${res2.status}: ${res2.data})`);

    // Wait a brief moment for the queue to process
    console.log('\n⏳ Waiting 2.5s for message queue to finish processing...');
    await new Promise(r => setTimeout(r, 2500));

    // 4. Check Stats Endpoint
    console.log('\n4️⃣ Checking /stats endpoint...');
    const statsRes = await axios.get(`${BASE_URL}/stats`);
    console.log('📊 Bot Stats:', JSON.stringify(statsRes.data.stats, null, 2));

    console.log('\n🎉 ALL LOCAL SIMULATION TESTS COMPLETED SUCCESSFULLY!\n');

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('\n❌ Could not connect to the server at http://localhost:3000.');
      console.error('👉 Make sure the bot server is running: "npm start"\n');
    } else {
      console.error('\n❌ Test error:', err.response?.data || err.message);
    }
  }
}

runTests();
