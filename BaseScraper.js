/**
 * Base Scraper Class
 * All scrapers should extend this class
 */

const cheerio = require('cheerio');
const axios = require('axios');
const { RateLimiter, checkRobotsTxt, cleanText, validateContractor } = require('./utils');
const fs = require('fs');
const path = require('path');

class BaseScraper {
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.rateLimiter = new RateLimiter(1); // 1 request per second by default
    this.results = [];
  }

  async init() {
    console.log(`\n=== Initializing ${this.name} ===`);
    const robotsCheck = await checkRobotsTxt(this.baseUrl);
    if (!robotsCheck.allowed) {
      console.log(`  ⚠️  ${robotsCheck.reason} - skipping`);
      return false;
    }
    console.log(`  ✓ Robots.txt check passed`);
    return true;
  }

  async fetch(url, options = {}) {
    await this.rateLimiter.wait();
    
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'ContractorDirectoryBot/1.0 (contact@example.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          ...options.headers
        },
        ...options
      });
      return response.data;
    } catch (error) {
      console.error(`  Error fetching ${url}: ${error.message}`);
      throw error;
    }
  }

  parse(html) {
    return cheerio.load(html);
  }

  addContractor(contractor) {
    const validation = validateContractor(contractor);
    if (validation.valid) {
      this.results.push({
        ...contractor,
        source: this.name,
        scrapedAt: new Date().toISOString()
      });
    }
  }

  saveResults(filename) {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filepath = path.join(dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    console.log(`  ✓ Saved ${this.results.length} results to ${filepath}`);
    return filepath;
  }

  getResults() {
    return this.results;
  }

  clearResults() {
    this.results = [];
  }

  // Abstract methods to be implemented by subclasses
  async search(query, location) {
    throw new Error('search() must be implemented by subclass');
  }

  async scrapeCategory(category) {
    throw new Error('scrapeCategory() must be implemented by subclass');
  }
}

module.exports = BaseScraper;