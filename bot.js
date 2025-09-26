// bot.js
import { getTrendingTopics } from "./scrapeTrends.js";
import { generateTweet } from "./generateTweets.js";
import { postTweet } from "./postTweet.js";
import cron from "node-cron";

async function runBot() {
  console.log("🤖 Fetching trending topics...");
  const topics = await getTrendingTopics();
  console.log("topics", topics);

  if (!topics.length) {
    console.log("❌ No trends found.");
    return;
  }

  // Pick one random topic
  const topic = topics[Math.floor(Math.random() * topics.length)];
  console.log("🔥 Selected Topic:", topic);

  try {
    // Generate one tweet
    const tweet = await generateTweet(topic);
    console.log("📝 Generated Tweet:", tweet);

    // Post tweet
    await postTweet(tweet);
  } catch (err) {
    console.error("❌ Error:", err.message || err);
  }
}

// Run once immediately
await runBot();
