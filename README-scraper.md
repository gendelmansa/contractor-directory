# Contractor Directory Web Scraper

A modular web scraper built with Cheerio + Axios to collect contractor/service business data for the directory.

## Features

- **Modular Design** - Easy to add new scrapers for different data sources
- **Rate Limiting** - Built-in rate limiter to respect target sites
- **Robots.txt Compliance** - Checks robots.txt before scraping
- **Data Validation** - Validates and cleans contractor data
- **Multiple Output Formats** - JSON output with full metadata

## Installation

```bash
npm install
```

## Usage

### Basic Usage (all scrapers)

```bash
node scraper.js
```

### Run Specific Scraper

```bash
node scraper.js --scraper=bbb
node scraper.js --scraper=homeadvisor
```

### Search by Category

```bash
node scraper.js --category=plumber --location=10001
node scraper.js --category=electrician --location=NYC
```

### Change Output File

```bash
node scraper.js --output=my_contractors.json
```

## Available Scrapers

1. **BBB (Better Business Bureau)** - bbb.org
   - Check business ratings and accreditation
   - robots.txt: Allowed with restrictions

2. **HomeAdvisor/Angi** - homeadvisor.com, angi.com
   - Home services contractor directory
   - Note: Sites have merged, heavy JS rendering

## Data Output

Results are saved to the `data/` directory:
- `contractors.json` - Combined results from all scrapers
- `bbb_contractors.json` - BBB-specific results
- `homeadvisor_contractors.json` - HomeAdvisor-specific results

## Output Data Format

```json
{
  "name": "Business Name",
  "phone": "(555) 123-4567",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "rating": "A+",
  "category": "plumber",
  "source": "BBB",
  "scrapedAt": "2025-03-25T17:30:00.000Z"
}
```

## Adding New Scrapers

1. Create a new file in `scrapers/` extending BaseScraper
2. Implement `search()` and `scrapeCategory()` methods
3. Add the scraper to `scraper.js`

Example:

```javascript
const BaseScraper = require('../BaseScraper');
const { cleanText, extractPhone } = require('../utils');

class MyScraper extends BaseScraper {
  constructor() {
    super('MyScraper', 'https://example.com');
  }

  async search(query, location) {
    // Your scraping logic here
    return this.getResults();
  }
}

module.exports = MyScraper;
```

## Data Sources Tested

| Source | Status | Notes |
|--------|--------|-------|
| BBB (bbb.org) | ⚠️ Partial | JS-rendered, extracts from preloaded state |
| HomeAdvisor | ❌ Blocked | 404/500 errors, heavy protection |
| Angi | ❌ Blocked | Server errors, anti-bot measures |
| YellowPages | ❌ Blocked | Cloudflare protection |
| Yelp | ❌ Blocked | Explicitly prohibits scraping |
| Google Business | ❌ Blocked | Strictly prohibited |

## Rate Limiting

The scraper uses a default rate of 1 request per second. You can adjust this in the BaseScraper:

```javascript
this.rateLimiter = new RateLimiter(2); // 2 requests per second
```

## Important Notes

- Always respect robots.txt and site terms of service
- Some sites require browser automation (Puppeteer/Playwright) for full data
- This tool is for educational/demonstration purposes
- Check local laws and regulations before scraping any site