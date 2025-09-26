// scrapeTrends.js
import puppeteer from "puppeteer";

export async function getTrendingTopics() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto("https://trends24.in/united-states/", {
    waitUntil: "networkidle2",
  });

  const trends = await page.evaluate(() =>
    Array.from(document.querySelectorAll("span.trend-name"))
      .map((el) => el.innerText)
      .filter((text) => text && text.length < 50)
      .slice(0, 5)
  );

  await browser.close();
  return trends;
}
