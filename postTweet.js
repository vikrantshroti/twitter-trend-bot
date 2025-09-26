// postTweet.js
import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
dotenv.config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

export async function postTweet(text) {
  try {
    const tweet = await client.v2.tweet(text);
    console.log("✅ Tweeted:", tweet.data.text);
  } catch (error) {
    console.error("❌ Error posting tweet:", error);
  }
}
