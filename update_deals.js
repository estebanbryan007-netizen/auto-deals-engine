const fs = require("fs");

// THIS IS WHERE HOSTINGER DEALS.JSON WILL LIVE
const OUTPUT = "deals.json";

// 🔥 SAMPLE AUTO DATA (later replaced with real feeds)
function getProducts() {
  return [
    {
      title: "PlayStation 5 Console",
      current: 449,
      old: 499,
      category: "gaming",
      image: "https://i.imgur.com/6XQJq8b.png",
      url: "https://www.walmart.com"
    },
    {
      title: "Apple AirPods Pro 2",
      current: 189,
      old: 249,
      category: "electronics",
      image: "https://i.imgur.com/y6Z8ZJH.png",
      url: "https://www.amazon.com"
    }
  ];
}

function detectDeals(products, minDiscount = 20) {
  return products
    .map(p => {
      const discount = Math.round(((p.old - p.current) / p.old) * 100);
      return { ...p, discount };
    })
    .filter(p => p.discount >= minDiscount)
    .map(p => ({
      title: p.title,
      price: p.current,
      oldPrice: p.old,
      discount: p.discount,
      category: p.category,
      image: p.image,
      url: p.url
    }));
}

const products = getProducts();
const deals = detectDeals(products);

fs.writeFileSync(OUTPUT, JSON.stringify(deals, null, 2));
console.log("Updated deals.json");
