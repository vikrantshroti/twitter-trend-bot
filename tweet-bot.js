// 📁 tweet-bot.js
const { TwitterApi } = require("twitter-api-v2");
const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// Hardcoded fallback topics
const TOPICS = [
  "israel",
  "modi",
  "bible",
  "putin",
  "quran",
  "ukraine",
  "trump",
  "nato",
  "iran",
  "religion",
  "geopolitics",
  "india",
  "russia",
  "china",
];

async function getPopularTweet(query) {
  try {
    const res = await twitterClient.v2.search(`${query} lang:en -is:retweet`, {
      max_results: 10,
      "tweet.fields": "public_metrics",
    });

    const tweets = res.data?.data || [];
    const sorted = tweets.sort((a, b) => {
      return (
        b.public_metrics.like_count +
        b.public_metrics.retweet_count -
        (a.public_metrics.like_count + a.public_metrics.retweet_count)
      );
    });
    return sorted[0]?.text || null;
  } catch (e) {
    console.error("Error fetching tweets for topic:", query, e);
    return null;
  }
}

async function generateTweet(summaryBase) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Summarize or rephrase the following in an engaging, neutral tone:\n\n"${summaryBase}"\n\nMake it tweetable.`,
      },
    ],
  });
  return response.data.choices[0].message.content.trim();
}

async function runBot() {
  const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  console.log("Selected Topic:", randomTopic);

  const tweetText = await getPopularTweet(randomTopic);
  if (!tweetText) {
    console.warn("No tweet found for topic:", randomTopic);
    return;
  }

  const tweet = await generateTweet(tweetText);
  if (!tweet) {
    console.warn("Failed to generate tweet content.");
    return;
  }

  try {
    await twitterClient.v2.tweet(tweet);
    console.log("Tweeted:", tweet);
  } catch (e) {
    console.error("Tweet failed", e);
  }
}

runBot();
