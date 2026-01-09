const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeDeals() {
  try {
    // Fetch the main deals page from Amazon (or your specific deal site)
    const response = await axios.get('https://www.amazon.com/gp/goldbox');
    const $ = cheerio.load(response.data);

    // Select all product links (adjust the selector based on the actual page structure)
    const productLinks = [];
    $('a[href*="/dp/"]').each((i, element) => {
      const link = $(element).attr('href');
      // Make sure the link is absolute
      const fullUrl = new URL(link, 'https://www.amazon.com').href;
      productLinks.push(fullUrl);
    });

    // Log the product links or do whatever you need with them
    console.log('Found product links:', productLinks);
  } catch (error) {
    console.error('Error scraping deals:', error.message);
  }
}

scrapeDeals();
