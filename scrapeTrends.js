// scrapeTrends.js
import puppeteer from "puppeteer";

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Fetch trends directly via HTTP request (fast, lightweight, avoids Cloudflare headless bot detection).
 */
async function fetchTrends24() {
  try {
    const res = await fetch("https://trends24.in/india/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      console.warn(`trends24.in direct fetch returned HTTP ${res.status}`);
      return [];
    }

    const html = await res.text();
    const matches = [
      ...html.matchAll(
        /<span class=[\x27"]?trend-name[\x27"]?>\s*<a[^>]*>([^<]+)<\/a>/g
      ),
    ]
      .map((m) => decodeHtmlEntities(m[1]))
      .filter((text) => text && text.length < 50);

    return [...new Set(matches)].slice(0, 10);
  } catch (err) {
    console.warn("Direct fetch from trends24.in failed:", err.message);
    return [];
  }
}

/**
 * Scrape trends using Puppeteer with realistic headers and stealth flags.
 */
async function scrapeTrends24WithPuppeteer() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    await page.goto("https://trends24.in/india/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const trends = await page.evaluate(() =>
      Array.from(document.querySelectorAll("span.trend-name"))
        .map((el) => el.innerText?.trim())
        .filter((text) => text && text.length < 50)
        .slice(0, 10)
    );

    return [...new Set(trends)];
  } catch (err) {
    console.warn("Puppeteer scraping failed:", err.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Fallback to Google Trends RSS for India if trends24 is blocked or unavailable.
 */
async function fetchGoogleTrends() {
  try {
    const res = await fetch("https://trends.google.com/trending/rss?geo=IN", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      console.warn(`Google Trends RSS returned HTTP ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const matches = [...xml.matchAll(/<item>\s*<title>([^<]+)<\/title>/g)]
      .map((m) => decodeHtmlEntities(m[1]))
      .filter((text) => text && text.length < 50);

    return [...new Set(matches)].slice(0, 10);
  } catch (err) {
    console.warn("Google Trends RSS failed:", err.message);
    return [];
  }
}

export async function getTrendingTopics() {
  // 1. Try fast direct fetch from trends24.in
  const directTrends = await fetchTrends24();
  if (directTrends.length > 0) {
    console.log(`✅ Fetched ${directTrends.length} trends from trends24.in (direct fetch)`);
    return directTrends;
  }

  // 2. Try Puppeteer with stealth flags as fallback
  console.log("Attempting Puppeteer fallback for trends24.in...");
  const puppeteerTrends = await scrapeTrends24WithPuppeteer();
  if (puppeteerTrends.length > 0) {
    console.log(`✅ Fetched ${puppeteerTrends.length} trends from trends24.in (Puppeteer)`);
    return puppeteerTrends;
  }

  // 3. Fallback to Google Trends RSS (reliable across datacenter IPs)
  console.log("Attempting Google Trends fallback...");
  const googleTrends = await fetchGoogleTrends();
  if (googleTrends.length > 0) {
    console.log(`✅ Fetched ${googleTrends.length} trends from Google Trends`);
    return googleTrends;
  }

  return [];
}
