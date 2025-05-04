// server.js - Backend to scrape prices from Amazon, Flipkart, and Myntra
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = 3000;

// Flipkart Scraper
async function scrapeFlipkart(query) {
  const searchURL = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
  const { data } = await axios.get(searchURL, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });
  const $ = cheerio.load(data);
  const firstProduct = $("._1AtVbE").find("._4rR01T, .IRpwTa").first().parents("._1AtVbE");
  const title = firstProduct.find("._4rR01T, .IRpwTa").text();
  const price = firstProduct.find("._30jeq3").first().text();
  return { site: "Flipkart", title, price };
}

// Amazon Scraper
async function scrapeAmazon(query) {
  const searchURL = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
  const { data } = await axios.get(searchURL, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });
  const $ = cheerio.load(data);
  const product = $(".s-main-slot .s-result-item").first();
  const title = product.find("h2 span").text();
  const price = product.find(".a-price-whole").first().text();
  return { site: "Amazon", title, price };
}

// Myntra Scraper
async function scrapeMyntra(query) {
  const searchURL = `https://www.myntra.com/${encodeURIComponent(query)}`;
  const { data } = await axios.get(searchURL, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });
  const $ = cheerio.load(data);
  const product = $(".product-base").first();
  const title = product.find(".product-product").text();
  const price = product.find(".product-discountedPrice, .product-price").text();
  return { site: "Myntra", title, price };
}

// API Endpoint
app.get("/price", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).send({ error: "Query missing" });

  try {
    const [flipkart, amazon, myntra] = await Promise.all([
      scrapeFlipkart(query),
      scrapeAmazon(query),
      scrapeMyntra(query)
    ]);

    res.send({ flipkart, amazon, myntra });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Scraping failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Price Demon Scraper running at http://localhost:${PORT}`);
});
