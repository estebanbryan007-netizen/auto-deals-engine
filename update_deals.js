const fs = require("fs");
const https = require("https");
const xml2js = require("xml2js");

const OUTPUT = "deals.json";

// Live deal feeds that track Walmart + Amazon price drops
const FEEDS = [
  {
    source: "Walmart",
    url: "https://slickdeals.net/newsearch.php?searcharea=deals&searchin=first&rss=1&q=walmart"
  },
  {
    source: "Amazon",
    url: "https://slickdeals.net/newsearch.php?searcharea=deals&searchin=first&rss=1&q=amazon"
  }
];

function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function parseDeals() {
  const parser = new xml2js.Parser();
  let deals = [];

  for (const feed of FEEDS) {
    const xml = await fetchRSS(feed.url);
    const parsed = await parser.parseStringPromise(xml);

    const items = parsed.rss.channel[0].item || [];

    items.forEach(item => {
      const title = item.title[0];
      const link = item.link[0];

      const priceMatch = title.match(/\$([0-9]+(\.[0-9]{2})?)/g);
      if (!priceMatch || priceMatch.length < 2) return;

      const oldPrice = parseFloat(priceMatch[0].replace("$", ""));
      const price = parseFloat(priceMatch[1].replace("$", ""));

      const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
      if (discount < 20) return;

      deals.push({
        title,
        price,
        oldPrice,
        discount,
        category: feed.source.toLowerCase(),
        image: "https://i.imgur.com/6XQJq8b.png",
        url: link
      });
    });
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(deals.slice(0, 25), null, 2));
  console.log(`Saved ${deals.length} live deals`);
}

parseDeals();
