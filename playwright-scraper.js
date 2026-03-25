/**
 * Playwright-based Advanced Contractor Scraper
 * Targets: Yelp, YellowPages, Angi, HomeAdvisor
 * Features: Anti-detection, rate limiting, user agent rotation
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// User agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Random delay helper (respect rate limits)
const randomDelay = (minMs = 2000, maxMs = 5000) => {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
};

// Random user agent selector
const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// Output directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Main scraper class
class PlaywrightScraper {
  constructor() {
    this.browser = null;
    this.context = null;
    this.results = [];
    this.siteResults = {};
  }

  async init() {
    console.log('[+] Initializing Playwright with stealth config...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox'
      ]
    });

    // Create context with stealth settings
    this.context = await this.browser.newContext({
      userAgent: getRandomUserAgent(),
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    // Add stealth script to hide automation
    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });

    console.log('[+] Browser initialized\n');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n[+] Browser closed');
    }
  }

  async scrapeYelp(city, category, limit = 10) {
    console.log(`\n[>] Scraping Yelp: ${category} in ${city}`);
    const results = [];
    
    try {
      const page = await this.context.newPage();
      
      // Rotate user agent for this request
      await page.setExtraHTTPHeaders({ 'User-Agent': getRandomUserAgent() });
      
      // Build search URL
      const searchUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(category)}&find_loc=${encodeURIComponent(city)}`;
      
      console.log(`    URL: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Random delay
      await page.waitForTimeout(randomDelay(1500, 3000));
      
      // Extract results - Yelp structure varies, try multiple selectors
      const contractors = await page.evaluate(() => {
        const items = [];
        
        // Try different selectors Yelp might use
        const selectors = [
          '.container__09f24__yU7Ye', // Newer Yelp
          '.search-results-list .result--primary', // Older Yelp
          '[class*="BusinessEntity"]',
          '.business-entity'
        ];
        
        for (const sel of selectors) {
          const elements = document.querySelectorAll(sel);
          if (elements.length > 0) {
            elements.forEach(el => {
              try {
                const name = el.querySelector('a[name]')?.textContent?.trim() 
                  || el.querySelector('[class*="name"]')?.textContent?.trim()
                  || el.querySelector('h3')?.textContent?.trim();
                
                const rating = el.querySelector('[class*="rating"]')?.textContent?.trim()
                  || el.querySelector('[aria-label*="star"]')?.getAttribute('aria-label');
                
                const address = el.querySelector('[class*="address"]')?.textContent?.trim();
                const phone = el.querySelector('[class*="phone"]')?.textContent?.trim();
                const categoryText = el.querySelector('[class*="category"]')?.textContent?.trim();
                
                if (name) {
                  items.push({
                    name,
                    rating: rating || null,
                    address: address || null,
                    phone: phone || null,
                    services: categoryText || null
                  });
                }
              } catch (e) {}
            });
            break;
          }
        }
        
        return items;
      });
      
      results.push(...contractors.slice(0, limit));
      console.log(`    Found ${contractors.length} results, kept ${Math.min(contractors.length, limit)}`);
      
      await page.close();
      
    } catch (error) {
      console.log(`    [!] Error: ${error.message}`);
    }
    
    this.siteResults['yelp'] = results;
    return results;
  }

  async scrapeYellowPages(city, category, limit = 10) {
    console.log(`\n[>] Scraping YellowPages: ${category} in ${city}`);
    const results = [];
    
    try {
      const page = await this.context.newPage();
      await page.setExtraHTTPHeaders({ 'User-Agent': getRandomUserAgent() });
      
      const searchUrl = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(category)}&geo_location_terms=${encodeURIComponent(city)}`;
      
      console.log(`    URL: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(randomDelay(1500, 3000));
      
      const contractors = await page.evaluate(() => {
        const items = [];
        const elements = document.querySelectorAll('.search-results .result');
        
        elements.forEach(el => {
          try {
            const name = el.querySelector('.business-name')?.textContent?.trim();
            const rating = el.querySelector('.rating')?.textContent?.trim();
            const address = el.querySelector('.street-address')?.textContent?.trim();
            const phone = el.querySelector('.phone')?.textContent?.trim();
            const categories = el.querySelector('.categories')?.textContent?.trim();
            
            if (name) {
              items.push({
                name,
                rating: rating || null,
                address: address || null,
                phone: phone || null,
                services: categories || null
              });
            }
          } catch (e) {}
        });
        
        return items;
      });
      
      results.push(...contractors.slice(0, limit));
      console.log(`    Found ${contractors.length} results, kept ${Math.min(contractors.length, limit)}`);
      
      await page.close();
      
    } catch (error) {
      console.log(`    [!] Error: ${error.message}`);
    }
    
    this.siteResults['yellowpages'] = results;
    return results;
  }

  async scrapeAngi(category, city, limit = 10) {
    console.log(`\n[>] Scraping Angi: ${category} in ${city}`);
    const results = [];
    
    try {
      const page = await this.context.newPage();
      await page.setExtraHTTPHeaders({ 'User-Agent': getRandomUserAgent() });
      
      // Angi (formerly Angie's List)
      const searchUrl = `https://www.angi.com/search?search=${encodeURIComponent(category)}&location=${encodeURIComponent(city)}`;
      
      console.log(`    URL: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(randomDelay(1500, 3000));
      
      const contractors = await page.evaluate(() => {
        const items = [];
        const elements = document.querySelectorAll('[class*="pro-card"], .pro-card, .contractor-card');
        
        elements.forEach(el => {
          try {
            const name = el.querySelector('[class*="name"]')?.textContent?.trim()
              || el.querySelector('h3')?.textContent?.trim();
            const rating = el.querySelector('[class*="rating"]')?.textContent?.trim()
              || el.querySelector('[class*="stars"]')?.textContent?.trim();
            const address = el.querySelector('[class*="address"]')?.textContent?.trim();
            const phone = el.querySelector('[class*="phone"]')?.textContent?.trim();
            const services = el.querySelector('[class*="service"]')?.textContent?.trim();
            
            if (name) {
              items.push({
                name,
                rating: rating || null,
                address: address || null,
                phone: phone || null,
                services: services || null
              });
            }
          } catch (e) {}
        });
        
        return items;
      });
      
      results.push(...contractors.slice(0, limit));
      console.log(`    Found ${contractors.length} results, kept ${Math.min(contractors.length, limit)}`);
      
      await page.close();
      
    } catch (error) {
      console.log(`    [!] Error: ${error.message}`);
    }
    
    this.siteResults['angi'] = results;
    return results;
  }

  async scrapeHomeAdvisor(category, city, limit = 10) {
    console.log(`\n[>] Scraping HomeAdvisor: ${category} in ${city}`);
    const results = [];
    
    try {
      const page = await this.context.newPage();
      await page.setExtraHTTPHeaders({ 'User-Agent': getRandomUserAgent() });
      
      const searchUrl = `https://www.homeadvisor.com/search?search=${encodeURIComponent(category)}&location=${encodeURIComponent(city)}`;
      
      console.log(`    URL: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(randomDelay(1500, 3000));
      
      const contractors = await page.evaluate(() => {
        const items = [];
        const elements = document.querySelectorAll('.pro-card, [class*="contractor"], [class*="provider"]');
        
        elements.forEach(el => {
          try {
            const name = el.querySelector('[class*="name"]')?.textContent?.trim()
              || el.querySelector('h3')?.textContent?.trim();
            const rating = el.querySelector('[class*="rating"]')?.textContent?.trim();
            const address = el.querySelector('[class*="address"]')?.textContent?.trim();
            const phone = el.querySelector('[class*="phone"]')?.textContent?.trim();
            const services = el.querySelector('[class*="services"]')?.textContent?.trim();
            
            if (name) {
              items.push({
                name,
                rating: rating || null,
                address: address || null,
                phone: phone || null,
                services: services || null
              });
            }
          } catch (e) {}
        });
        
        return items;
      });
      
      results.push(...contractors.slice(0, limit));
      console.log(`    Found ${contractors.length} results, kept ${Math.min(contractors.length, limit)}`);
      
      await page.close();
      
    } catch (error) {
      console.log(`    [!] Error: ${error.message}`);
    }
    
    this.siteResults['homeadvisor'] = results;
    return results;
  }

  async runFullScraper() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║   Playwright Contractor Scraper - Full Run       ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    await this.init();

    // Test configurations
    const configs = [
      { site: 'yelp', city: 'Los Angeles, CA', category: 'plumber' },
      { site: 'yelp', city: 'New York, NY', category: 'electrician' },
      { site: 'yellowpages', city: 'Chicago, IL', category: 'hvac' },
      { site: 'angi', city: 'Houston, TX', category: 'plumber' },
      { site: 'homeadvisor', city: 'Phoenix, AZ', category: 'electrician' }
    ];

    for (const config of configs) {
      console.log(`\n--- ${config.site.toUpperCase()} Test ---`);
      
      try {
        switch (config.site) {
          case 'yelp':
            await this.scrapeYelp(config.city, config.category, 5);
            break;
          case 'yellowpages':
            await this.scrapeYellowPages(config.city, config.category, 5);
            break;
          case 'angi':
            await this.scrapeAngi(config.category, config.city, 5);
            break;
          case 'homeadvisor':
            await this.scrapeHomeAdvisor(config.category, config.city, 5);
            break;
        }
      } catch (e) {
        console.log(`    [!] Failed: ${e.message}`);
      }

      // Rate limiting delay between sites
      console.log(`    [*] Waiting for rate limit...`);
      await new Promise(r => setTimeout(r, randomDelay(3000, 6000)));
    }

    await this.close();
    
    // Save results
    this.saveResults();
    
    return this.siteResults;
  }

  saveResults() {
    const outputPath = path.join(DATA_DIR, 'contractors-playwright.json');
    
    const output = {
      timestamp: new Date().toISOString(),
      summary: {
        yelp: this.siteResults.yelp?.length || 0,
        yellowpages: this.siteResults.yellowpages?.length || 0,
        angi: this.siteResults.angi?.length || 0,
        homeadvisor: this.siteResults.homeadvisor?.length || 0,
        total: Object.values(this.siteResults).reduce((sum, arr) => sum + (arr?.length || 0), 0)
      },
      data: this.siteResults
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n[+] Results saved to: ${outputPath}`);
  }
}

// Run if executed directly
if (require.main === module) {
  const scraper = new PlaywrightScraper();
  
  scraper.runFullScraper()
    .then(results => {
      console.log('\n╔════════════════════════════════════════════════════╗');
      console.log('║                    SUMMARY                          ║');
      console.log('╚════════════════════════════════════════════════════╝');
      
      for (const [site, data] of Object.entries(results)) {
        console.log(`  ${site}: ${data?.length || 0} contractors`);
      }
      
      process.exit(0);
    })
    .catch(async (err) => {
      // If browser fails (missing libraries), run demo mode
      if (err.message.includes('shared libraries') || err.message.includes('libglib')) {
        console.log('\n[!] Browser launch failed (missing system libraries)');
        console.log('[!] Switching to demo mode with simulated data...\n');
        
        const demoResults = runDemoMode();
        
        console.log('\n╔════════════════════════════════════════════════════╗');
        console.log('║                    SUMMARY                          ║');
        console.log('╚════════════════════════════════════════════════════╝');
        
        for (const [site, data] of Object.entries(demoResults)) {
          console.log(`  ${site}: ${data?.length || 0} contractors`);
        }
        
        process.exit(0);
      }
      
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

// Demo mode when browser can't run
function runDemoMode() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   Playwright Contractor Scraper - Demo Mode       ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  const demoResults = {
    yelp: generateDemoContractors('Yelp', 8),
    yellowpages: generateDemoContractors('YellowPages', 5),
    angi: generateDemoContractors('Angi', 4),
    homeadvisor: generateDemoContractors('HomeAdvisor', 3)
  };
  
  // Save demo results
  const outputPath = path.join(DATA_DIR, 'contractors-playwright.json');
  
  const output = {
    timestamp: new Date().toISOString(),
    summary: {
      yelp: demoResults.yelp.length,
      yellowpages: demoResults.yellowpages.length,
      angi: demoResults.angi.length,
      homeadvisor: demoResults.homeadvisor.length,
      total: Object.values(demoResults).reduce((sum, arr) => sum + arr.length, 0)
    },
    data: demoResults,
    note: "Demo mode - browser not available. Run on a system with display libraries for real scraping."
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n[+] Demo results saved to: ${outputPath}`);
  
  return demoResults;
}

function generateDemoContractors(source, count) {
  const types = ['plumber', 'electrician', 'hvac', 'roofing', 'landscaping'];
  const cities = ['Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
  const names = ['ABC Services', 'Premier Fix', 'City Wide', 'Elite Tech', 'Pro Solutions', 'Rapid Response', 'Quality First', 'Expert Care'];
  
  return Array.from({ length: count }, (_, i) => ({
    name: `${names[i % names.length]} ${types[i % types.length] === 'hvac' ? 'HVAC' : 'Services'}`,
    rating: `${(3.5 + Math.random() * 1.5).toFixed(1)} stars`,
    address: `${1000 + i * 100} Main Street, ${cities[i % cities.length]}`,
    phone: `(555) ${100 + i}-${1000 + i * 100}`,
    services: types[i % types.length],
    source: source,
    scrapedAt: new Date().toISOString()
  }));
}

module.exports = PlaywrightScraper;