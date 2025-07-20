# Twitter Bot 🤖

This project is a simple Twitter bot that fetches popular tweets on trending topics, summarizes or rephrases them using OpenAI's GPT-3.5, and posts the result back to Twitter. It is built with Node.js and uses the `twitter-api-v2` and `openai` libraries.

## Features

- Selects a random topic from a predefined list
- Fetches a popular tweet on that topic
- Uses OpenAI to generate a tweetable summary or rephrasing
- Posts the generated tweet to your Twitter account

## Requirements

- Node.js (v16+ recommended)
- Twitter API credentials
- OpenAI API key

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
   OPENAI_KEY=your-openai-api-key
   ```

4. **Run the bot:**

   ```sh
   npm start
   ```

## How it works

- The bot randomly selects a topic from a hardcoded list.
- It fetches up to 10 recent English tweets (excluding retweets) about that topic.
- The most popular tweet (by likes and retweets) is chosen.
- The tweet is sent to OpenAI's GPT-3.5 to be summarized or rephrased in a neutral, engaging tone.
- The result is posted as a new tweet from your account.

## Dependencies

- [twitter-api-v2](https://www.npmjs.com/package/twitter-api-v2)
- [openai](https://www.npmjs.com/package/openai)
- [dotenv](https://www.npmjs.com/package/dotenv)

## License

ISC
