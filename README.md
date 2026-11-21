# Twitter Bot 🤖

This project is a Node.js Twitter bot that scrapes trending topics (India), fetches real news headlines for a selected topic, generates an opinionated tweet using Groq's LLM (Allam-2-7B), and posts it to Twitter via the Twitter API v2.

It runs once immediately and can be scheduled with `node-cron`.

## Features

- Scrapes trending topics from [trends24.in](https://trends24.in/india/) (direct fetch, with Puppeteer fallback), falling back to Google Trends RSS
- Fetches a real news headline for the selected topic from Google News RSS or Bing News RSS
- Generates a short, opinionated tweet using Groq's `allam-2-7b` model
- Posts the generated tweet to your Twitter account via `twitter-api-v2`
- Optional scheduled execution via `node-cron`

## Requirements

- Node.js (v16+ recommended)
- Twitter API credentials (App key/secret, Access token/secret)
- Groq API key

## Setup

1. **Clone the repository**
2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Create a `.env` file** in the project root with the following variables:

   ```env
   TWITTER_APP_KEY=your-twitter-app-key
   TWITTER_APP_SECRET=your-twitter-app-secret
   TWITTER_ACCESS_TOKEN=your-twitter-access-token
   TWITTER_ACCESS_SECRET=your-twitter-access-secret
   GROQ_API_KEY=your-groq-api-key
   ```

4. **Run the bot:**

   ```sh
   npm start
   ```

   The bot runs once immediately. Scheduling via `node-cron` is wired into `bot.js` — uncomment/configure the cron job there to run on a recurring interval.

## How it works

1. `scrapeTrends.js` fetches trending topics for India from trends24.in (direct HTTP fetch, with Puppeteer fallback), falling back to Google Trends RSS if needed.
2. `bot.js` picks one random trending topic.
3. `generateTweets.js` fetches a real news headline for the topic (Google News RSS / Bing News RSS) and sends it to Groq's `allam-2-7b` model to generate an opinionated, engagement-driven tweet (max 150 words, no hashtags or emojis).
4. `postTweet.js` posts the generated tweet to Twitter using `twitter-api-v2`.

## Project structure

```
bot.js            # Entry point: fetches trends, generates + posts a tweet
generateTweets.js # News fetching + tweet generation via Groq
postTweet.js      # Posts a tweet via Twitter API v2
scrapeTrends.js   # Trending topics scraping (trends24.in, Puppeteer, Google Trends)
test.js           # Node test tests for trend scraping
.env              # API credentials (not committed)
```

## Dependencies

- [twitter-api-v2](https://www.npmjs.com/package/twitter-api-v2)
- [groq-sdk](https://www.npmjs.com/package/groq-sdk)
- [openai](https://www.npmjs.com/package/openai) (OpenAI-compatible client pointed at Groq)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [node-cron](https://www.npmjs.com/package/node-cron)
- [puppeteer](https://www.npmjs.com/package/puppeteer)

## Testing

```sh
npm test
```

## License

ISC