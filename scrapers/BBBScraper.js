/**
 * BBB (Better Business Bureau) Scraper
 * Extracts contractor/business data from bbb.org
 */

const BaseScraper = require('../BaseScraper');
const { cleanText, extractPhone } = require('../utils');

class BBBScraper extends BaseScraper {
  constructor() {
    super('BBB', 'https://www.bbb.org');
    this.categories = [
      'general-contractor',
      'plumber',
      'electrician',
      'roofing-contractors',
      'heating-and-air-conditioning',
      'home-improvement'
    ];
  }

  async search(query, location = 'USA') {
    console.log(`\n=== BBB Search: ${query} in ${location} ===`);
    
    const canScrape = await this.init();
    if (!canScrape) {
      console.log('  ⚠️ Skipping BBB - robots.txt blocked');
      return [];
    }

    // Use the search URL format for BBB
    const searchUrl = `https://www.bbb.org/search?find_entity=${encodeURIComponent(query)}&find_loc=${encodeURIComponent(location)}`;
    
    try {
      console.log(`  Fetching: ${searchUrl}`);
      const html = await this.fetch(searchUrl);
      const $ = this.parse(html);
      
      // BBB search results are loaded via JavaScript, but let's try to extract what we can
      // The data is embedded in __PRELOADED_STATE__
      const scriptTags = $('script');
      let results = [];
      
      scriptTags.each((i, el) => {
        const content = $(el).html();
        if (content && content.includes('__PRELOADED_STATE__')) {
          try {
            const match = content.match(/window\.__PRELOADED_STATE__\s*=\s*({.*?});/s);
            if (match) {
              const state = JSON.parse(match[1]);
              if (state.searchResult && state.searchResult.results) {
                results = state.searchResult.results;
              }
            }
          } catch (e) {
            // Try to parse differently
          }
        }
      });
      
      console.log(`  Found ${results.length} results in preloaded state`);
      
      // Process results
      results.forEach(biz => {
        this.addContractor({
          name: cleanText(biz.name || biz.businessName),
          phone: extractPhone(biz.phone || biz.phoneNumber),
          address: cleanText(biz.address || biz.addressLine1),
          city: cleanText(biz.city || biz.location && biz.location.city),
          state: biz.state || (biz.location && biz.location.state),
          zip: biz.postalCode || biz.zipCode,
          rating: biz.rating || biz.bbbRating,
          accredited: biz.accredited,
          category: query,
          url: biz.url || biz.website
        });
      });
      
      // Also try to get from the embedded JSON in the page
      if (results.length === 0) {
        // Try alternative approach - parse the raw data from other script tags
        $('script').each((i, el) => {
          const text = $(el).text();
          if (text.includes('"searchResult"') || text.includes('"results"')) {
            try {
              // Try to find JSON data in the script
              const jsonMatch = text.match(/{.*?"results".*?}/s);
              if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                if (data.results) {
                  data.results.forEach(biz => {
                    if (!this.results.find(r => r.name === biz.name)) {
                      this.addContractor({
                        name: cleanText(biz.name),
                        phone: extractPhone(biz.phone),
                        address: cleanText(biz.addressLine1),
                        city: cleanText(biz.city),
                        state: biz.state,
                        rating: biz.rating,
                        category: query
                      });
                    }
                  });
                }
              }
            } catch (e) {}
          }
        });
      }
      
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }

    return this.getResults();
  }

  async scrapeCategory(category, location = 'USA') {
    return this.search(category, location);
  }
  
  // Scrape a specific business profile page
  async scrapeBusinessProfile(profileUrl) {
    console.log(`\n=== BBB Profile: ${profileUrl} ===`);
    
    try {
      const html = await this.fetch(profileUrl);
      const $ = this.parse(html);
      
      // Extract business details from the page
      const name = cleanText($('h1.business-name, h1[itemprop="name"]').first().text());
      const phone = extractPhone($('span[itemprop="telephone"], a[href^="tel:"]').first().text());
      const address = cleanText($('span[itemprop="streetAddress"]').first().text());
      const city = cleanText($('span[itemprop="addressLocality"]').first().text());
      const state = cleanText($('span[itemprop="addressRegion"]').first().text());
      const zip = cleanText($('span[itemprop="postalCode"]').first().text());
      const rating = $('span.rating-number, [itemprop="ratingValue"]').first().text();
      const website = $('a.website-link, a[itemprop="url"]').first().attr('href');
      
      this.addContractor({
        name,
        phone,
        address,
        city,
        state,
        zip,
        rating: rating ? parseFloat(rating) : null,
        url: website,
        category: 'general'
      });
      
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
    
    return this.getResults();
  }
}

module.exports = BBBScraper;