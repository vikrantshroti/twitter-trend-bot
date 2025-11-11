// generateTweet.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// Use Groq instead of OpenAI
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateTweet(topic) {
  try {
    const response = await client.chat.completions.create({
      model: "allam-2-7b", // Groq free model
      messages: [
        {
          role: "user",
          content: `Write a controversial twitter post (less than 150 words) about ${topic}.
                  It should be a rage bait and should spark replies and engagement.
                  Avoid hashtags and emojis.  
                  Make readers stop scrolling and feel the urge to reply or share.
                  Give me final tweet as output, if you fail to provide tweet provide non controversial tweet`,
        },
      ],
      max_tokens: 50,
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("Error generating tweet:", err.message);
    return `Couldn't generate tweet for ${topic}`;
  }
}

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
