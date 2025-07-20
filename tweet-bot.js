// 📁 tweet-bot.js
const { TwitterApi } = require("twitter-api-v2");
const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_KEY,
  })
);

const REGIONAL_WOEIDS = {
  US: 23424977,
  UK: 23424975,
  India: 23424848,
  Europe: 24865675, // Europe (may vary, fallback to trending worldwide)
};

const TOPICS = [
  "israel",
  "palestine",
  "modi",
  "bible",
  "quran",
  "christian",
  "muslim",
  "ukraine",
  "russia",
  "geopolitics",
];

async function getTrendingTopics() {
  const allTrends = [];
  for (const [region, woeid] of Object.entries(REGIONAL_WOEIDS)) {
    try {
      const trends = await twitterClient.v1.trendsByPlace(woeid);
      const filtered = trends[0].trends
        .filter((t) =>
          TOPICS.some((topic) => t.name.toLowerCase().includes(topic))
        )
        .map((t) => t.name);
      allTrends.push(...filtered);
    } catch (err) {
      console.error(`Failed to fetch for ${region}`, err);
    }
  }
  return [...new Set(allTrends)].slice(0, 5); // unique and max 5
}

async function getPopularTweet(query) {
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
}

async function generateTweet(summaryBase) {
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `Summarize or rephrase the following in an engaging, neutral tone:
\n"${summaryBase}"\n\nMake it tweetable.`,
      },
    ],
  });
  return response.data.choices[0].message.content.trim();
}

async function runBot() {
  const trends = await getTrendingTopics();
  console.log("Detected Trends:", trends);

  for (const trend of trends) {
    const tweetText = await getPopularTweet(trend);
    if (!tweetText) continue;

    const tweet = await generateTweet(tweetText);
    if (!tweet) continue;

    try {
      await twitterClient.v2.tweet(tweet);
      console.log("Tweeted:", tweet);
      break; // only one tweet per run
    } catch (e) {
      console.error("Tweet failed", e);
    }
  }
}

runBot();
