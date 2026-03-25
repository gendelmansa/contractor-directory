# Playwright Contractor Scraper

A headless browser-based scraper for collecting contractor data from sites that block basic HTTP scrapers like Cheerio.

## Features

- **Anti-Detection**: Hides automation markers, rotates user agents, random delays
- **Rate Limiting**: Built-in delays between requests to avoid hammering sites
- **Multiple Sources**: Targets Yelp, YellowPages, Angi, and HomeAdvisor
- **Full Browser Automation**: Uses Playwright with Chromium for JS-rendered content

## Installation

```bash
# Install dependencies
npm install playwright

# Install Chromium browser
npx playwright install chromium
```

## Usage

```bash
# Run the scraper
node playwright-scraper.js
```

## Output

Results are saved to `data/contractors-playwright.json` with this structure:

```json
{
  "timestamp": "2025-01-15T12:00:00.000Z",
  "summary": {
    "yelp": 10,
    "yellowpages": 5,
    "angi": 3,
    "homeadvisor": 2,
    "total": 20
  },
  "data": {
    "yelp": [...],
    "yellowpages": [...],
    "angi": [...],
    "homeadvisor": [...]
  }
}
```

## Anti-Detection Techniques

1. **User Agent Rotation**: 5 different user agents randomly selected per request
2. **Random Delays**: 2-5 second delays between requests
3. **Automation Detection Hiding**: Removes webdriver property, hides plugin arrays
4. **Realistic Viewport**: 1920x1080 with proper locale settings
5. **Network Idle Waiting**: Waits for all network requests to complete before scraping

## Site Compatibility

| Site | Status | Notes |
|------|--------|-------|
| Yelp | ⚠️ Variable | Frequent anti-bot checks, may need CAPTCHA solving |
| YellowPages | ⚠️ Variable | Blocks automation, results may be limited |
| Angi | ⚠️ Variable | Requires JavaScript rendering |
| HomeAdvisor | ⚠️ Variable | Similar to Angi |

**Note**: These sites actively block automated scrapers. Results depend on:
- IP reputation (residential IPs work better)
- Request patterns (slower = more success)
- Site changes to their HTML structure

## Customization

Edit `playwright-scraper.js` to adjust:

- `USER_AGENTS`: Add/remove user agent strings
- Delay ranges in `randomDelay()` function
- Search parameters for different cities/categories
- Output format in `saveResults()` method