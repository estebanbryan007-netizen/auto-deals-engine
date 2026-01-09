const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const xml2js = require("xml2js");

const OUTPUT = "deals.json";

const FEEDS = [
  { store: "amazon", rss: "https://slickdeals.net/newsearch.php?rss=1&q=amazon" },
  { store: "walmart", rss: "https://slickdeals.net/newsearch.php?rss=1&q=walmart" }
];

async function getProductData(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000
    });

    const $ = cheerio.load(data);
    const image = $('meta[property="og:image"]').attr("content");
    return image || null;
  } catch {
    return null;
  }
}

async function run() {
  const parser = new xml2js.Parser();
  let deals = [];

  for (const feed of FEEDS) {
    const rss = await axios.get(feed.rss);
    const parsed = await parser.parseStringPromise(rss.data);

    const items = parsed.rss.channel[0].item || [];

    for (const item of items) {
      const title = item.title[0];
      const link = item.link[0];

      const prices = title.match(/\$[0-9]+(\.[0-9]{2})?/g);
      if (!prices || prices.length < 2) continue;

      const oldPrice = parseFloat(prices[0].replace("$", ""));
      const price = parseFloat(prices[1].replace("$", ""));
      const discount = Math.round(((oldPrice - price) / oldPrice) * 100);

      if (discount < 20) continue;

      const image = await getProductData(link);

      deals.push({
        title,
        price,
        oldPrice,
        discount,
        store: feed.store,
        image,
        url: link
      });
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(deals.slice(0, 30), null, 2));
}

run();
