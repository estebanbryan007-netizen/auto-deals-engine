import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";

const TARGET_URL = "https://www.amazon.com/gp/goldbox"; // example deals page

const BASE_URL = "https://www.amazon.com";

async function scrapeDeals() {
  try {
    const { data } = await axios.get(TARGET_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);

    const deals = [];

    $("a[href*='/dp/']").each((i, el) => {
      if (deals.length >= 20) return; // limit results

      let href = $(el).attr("href");
      if (!href) return;

      // Clean Amazon links
      href = href.split("?")[0];

      // Ensure full URL
      if (!href.startsWith("http")) {
        href = BASE_URL + href;
      }

      const title =
        $(el).find("img").attr("alt") ||
        $(el).text().trim() ||
        "Amazon Deal";

      deals.push({
        title,
        url: href,
      });
    });

    if (deals.length === 0) {
      console.log("No deals found.");
      process.exit(0);
    }

    // Save output (or use however your site consumes it)
    fs.writeFileSync("deals.json", JSON.stringify(deals, null, 2));

    console.log(`✅ Found ${deals.length} deals`);
    deals.forEach((d, i) => {
      console.log(`${i + 1}. ${d.title}`);
      console.log(d.url);
    });
  } catch (err) {
    console.error("❌ Scrape failed:", err.message);
    process.exit(1);
  }
}

scrapeDeals();
