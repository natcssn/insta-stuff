# 📸 Instagram Comment-to-DM Auto-Reply: Step-by-Step Setup Guide

This guide walks you through setting up Meta credentials and configuring your phone so your inbox stays clean and protected.

---

## 🛡️ Step 1: Protect Your Phone & Personal Inbox (5 mins)

Before setting up anything on the computer, do this in your **Instagram mobile app**:

### 1. Switch to a Creator Account
1. Open Instagram -> Tap your profile icon -> Tap **Menu (☰)** (top right) -> **Settings and privacy**.
2. Scroll down to **For professionals** -> Tap **Account type and tools**.
3. Tap **Switch to professional account** -> Select **Creator**.
4. Choose a category (e.g. *Digital Creator*, *Entrepreneur*, etc.).

### 2. Mute Notifications for the "General" DM Tab
1. Open your Instagram DM screen. Notice you now have two tabs: **Primary** and **General**.
2. Tap the filter/options icon or open any message in **General**.
3. Go to **Settings and privacy** -> **Notifications** -> **Messages**.
4. Set **Message Requests** and **General Messages** to **OFF**.
   > *Result: Your friends in the "Primary" tab will still notify you, but the 1,000 automated bot replies will arrive silently in "General"!*

### 3. Allow Connected Tools Access to Messages
1. In Instagram **Settings and privacy** -> **Messages and story replies** -> **Message controls**.
2. Scroll to the bottom and look for **Connected tools**.
3. Toggle ON **"Allow access to messages"**.
   > *If this toggle is off, Meta will block your bot from sending DMs to commenters!*

---

## 🔗 Step 2: Link a Facebook Page (2 mins)

Meta requires an Instagram Professional account to be connected to a Facebook Page to manage API tokens:
1. Open Facebook on desktop or mobile.
2. Create a new Facebook Page (name it whatever you like, e.g. "My Creator Hub" — it doesn't need any posts or followers).
3. In Instagram: **Settings and privacy** -> **Creator tools and controls** -> **Connect or create a Facebook Page**.
4. Select the Facebook Page you just created.

---

## 💻 Step 3: Meta for Developers App Setup (10 mins)

1. Go to [developers.facebook.com](https://developers.facebook.com) and log in with your Facebook account.
2. Click **My Apps** (top right) -> **Create App**.
3. Choose **Other** -> Click **Next**.
4. Select **Business** as the app type -> Click **Next**.
5. Give your app a name (e.g. `My-Auto-Reply-Bot`) and enter your email -> Click **Create app**.

### Add Instagram Graph API
1. In your new App Dashboard, find **Instagram Graph API** in the list of products and click **Set up**.
2. In the left sidebar under *Instagram Graph API*, click **API Setup with Instagram Login** or **Settings**.

### Generate Your Access Token
1. Go to **Tools** (top menu bar) -> **Graph API Explorer** ([developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)).
2. In the right-hand panel:
   - **Meta App**: Select your newly created app.
   - **User or Page**: Select your **Facebook Page**.
   - Under **Permissions**, click **Add a Permission** and select:
     - `instagram_basic`
     - `instagram_manage_comments`
     - `instagram_manage_messages`
     - `pages_show_list`
     - `pages_read_engagement`
3. Click **Generate Access Token**.
4. Log into Facebook when prompted and select your Facebook Page and linked Instagram account.
5. Copy the generated token!

### Get Your Instagram Account ID
In the Graph API Explorer query bar:
1. Replace `me?fields=id,name` with:
   ```
   me/accounts?fields=instagram_business_account{id,username}
   ```
2. Click **Submit**.
3. Look for the `instagram_business_account.id` in the response JSON. That number is your `INSTAGRAM_ACCOUNT_ID`.

---

## 🌐 Step 4: Expose Your Local Server to the Web (ngrok)

Meta needs a secure `https://` webhook URL to notify your bot when a comment occurs.

1. Download [ngrok](https://ngrok.com) or run via npx:
   ```powershell
   npx ngrok http 3000
   ```
2. Copy the **Forwarding** URL provided by ngrok (looks like `https://abcdef123.ngrok-free.app`).

---

## ⚡ Step 5: Configure Webhook in Meta Dashboard

1. In your Meta App Dashboard, in the left sidebar, click **Webhooks**.
2. In the dropdown, select **Instagram**.
3. Click **Subscribe to this object**.
4. Enter your details:
   - **Callback URL**: `https://your-ngrok-url.ngrok-free.app/webhook`
   - **Verify Token**: `my_super_secret_verify_token_123` (matching the `VERIFY_TOKEN` in your `.env`)
5. Click **Verify and save**.
   > *Your running bot will log: `✅ [Webhook Verification] Meta Webhook verified successfully!`*
6. In the list of Instagram webhook subscription fields, locate **`comments`** and click **Subscribe**.

---

## 🚀 Step 6: Go Live!

1. Open `.env` in `insta_auto_reply_shii`:
   ```env
   PORT=3000
   VERIFY_TOKEN=my_super_secret_verify_token_123
   PAGE_ACCESS_TOKEN=PASTE_YOUR_META_TOKEN_HERE
   INSTAGRAM_ACCOUNT_ID=PASTE_YOUR_INSTAGRAM_ID_HERE
   TRIGGER_KEYWORDS=link,guide,pdf,send,book
   DM_REPLY_TEXT=Hey there! 🎉 Thanks for your comment. Here is the link you requested:\n\n👉 https://example.com/your-free-resource\n\nEnjoy!
   PUBLIC_COMMENT_REPLY=Sent to your DMs! Check your inbox 📥✨
   MESSAGE_DELAY_MS=1500
   DRY_RUN=false
   ```
2. Start the bot:
   ```powershell
   npm start
   ```
3. Test it! Leave a comment like *"link please"* on one of your reels from a second account or ask a friend to test.
4. Watch the bot instantly deliver the DM and post the reply!
