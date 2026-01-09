const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeWalmartDeals() {
  try {
    // Use Walmart's deals page or a product listing page
    const response = await axios.get('https://www.walmart.com/deals');
    const $ = cheerio.load(response.data);

    // Example: Select product links from Walmart’s deals
    const productLinks = [];
    $('a.product-title-link').each((i, element) => {
      const link = $(element).attr('href');
      const fullUrl = new URL(link, 'https://www.walmart.com').href;
      productLinks.push(fullUrl);
    });

    console.log('Walmart product links:', productLinks);
  } catch (error) {
    console.error('Error scraping Walmart:', error.message);
  }
}

scrapeWalmartDeals();
