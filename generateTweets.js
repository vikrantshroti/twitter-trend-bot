// generateTweet.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// Use Groq instead of OpenAI
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Fetch a recent news article using Google News RSS
 */
export async function fetchNews(topic) {
  const sources = [
    `https://news.google.com/rss/search?q=${encodeURIComponent(
      topic,
    )}&hl=en-IN&gl=IN&ceid=IN:en`,
    `https://www.bing.com/news/search?q=${encodeURIComponent(
      topic,
    )}&format=rss`,
  ];

  for (const url of sources) {
    try {
      console.log("Fetching news from:", url);

      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          Accept: "application/rss+xml",
        },
      });

      const text = await res.text();
      const itemMatch = text.match(/<item>([\s\S]*?)<\/item>/);

      if (!itemMatch) continue;

      const item = itemMatch[1];

      const title =
        item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
        item.match(/<title>(.*?)<\/title>/)?.[1];

      const desc =
        item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
        item.match(/<description>(.*?)<\/description>/)?.[1];

      if (!title) continue;

      return {
        headline: title.trim(),
        summary: desc?.replace(/<[^>]+>/g, "").slice(0, 300),
      };
    } catch {}
  }

  return null;
}

/**
 * Generate tweet from real news
 */
export async function generateTweet(topic) {
  try {
    const news = await fetchNews(topic);
    console.log("Fetched news:", news);

    const userPrompt = news
      ? `Here is a real news headline and summary:

Headline: ${news.headline}
Summary: ${news.summary}

Task:
- Write ONE Twitter post (max 150 words)
- Make it rage-bait or controversy-driven
- Spark replies and debate
- No hashtags, no emojis
- If controversial framing fails, soften slightly but keep it engaging
- Output ONLY the final tweet`
      : `"${topic}" is trending.

Task:
- Write ONE opinionated Twitter post (max 150 words)
- Spark debate, fear, desire, or status anxiety
- No hashtags, no emojis
- Output ONLY the final tweet`;

    const response = await client.chat.completions.create({
      model: "allam-2-7b", // Groq free model
      messages: [
        {
          role: "system",
          content: "You are a viral Twitter commentator.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 120,
      temperature: 0.8,
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("Error generating tweet:", err.message);
    return `This news about ${topic} is being discussed, but something feels off about the way it's being reported.`;
  }
}

/*
export async function generateTweet(topic) {
  try {
    const response = await client.chat.completions.create({
      model: "allam-2-7b", // Groq free model
      messages: [
        {
          role: "user",
          content: `Write an engaging twitter post (less than 150 words) about ${topic}.
                  It should be a rage bait and should spark replies and engagement.
                  Avoid hashtags and emojis.  
                  Make readers stop scrolling and feel the urge to reply or share.
                  Give me final tweet only as output, if you fail to provide tweet provide less controversial tweet.`,
        },
      ],
      max_tokens: 80,
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("Error generating tweet:", err.message);
    return `Couldn't generate tweet for ${topic}`;
  }
}
*/

/**
 * `Write a Twitter post about ${topic}.  
                  - Make it highly engaging by naturally triggering at least one of these human drives:  
                  - Men's lust or women's desire for beauty  
                  - Elderly concern for health or children's need for education  
                  - Rich people's fear of dying or poor people's desire to get rich fast  
                  - Status and privilege  
                  - Entertainment and escapism  
                  - Fear of uncertainty  
                  - Love and companionship  
                  - Convenience and instant gratification  
                  - Fear of death and spirituality  

                  The tone should be conversational, thought-provoking, and emotional.  
                  Avoid hashtags and emojis.  
                  Make readers stop scrolling and feel the urge to reply or share.  

                  - Note: THe post should not be more than 150 characters.`
 */
