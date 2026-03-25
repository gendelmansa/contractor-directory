/**
 * HomeAdvisor Scraper
 * HomeAdvisor is a service that connects homeowners with contractors
 */

const BaseScraper = require('../BaseScraper');
const { cleanText, extractPhone } = require('../utils');

class HomeAdvisorScraper extends BaseScraper {
  constructor() {
    super('HomeAdvisor', 'https://www.homeadvisor.com');
    // Note: HomeAdvisor has merged with Angi, so this may redirect
    this.categories = [
      'plumbers',
      'electricians',
      'roofers',
      'hvac',
      'general-contractors'
    ];
  }

  async search(query, zipCode = '10001') {
    console.log(`\n=== HomeAdvisor Search: ${query} near ${zipCode} ===`);
    
    const canScrape = await this.init();
    if (!canScrape) {
      console.log('  ⚠️ Skipping HomeAdvisor - robots.txt blocked');
      return [];
    }

    // Try different URL formats (HomeAdvisor/Angi have merged)
    const searchUrls = [
      `https://www.angi.com/search/${query.toLowerCase().replace(/\s+/g, '-')}/`,
      `https://www.homeadvisor.com/search/?search=${encodeURIComponent(query)}&zip=${zipCode}`
    ];

    for (const searchUrl of searchUrls) {
      try {
        console.log(`  Trying: ${searchUrl}`);
        const html = await this.fetch(searchUrl);
        
        // Check if we got redirected or have results
        if (html.includes(' angi ') || html.includes('Angi')) {
          console.log('  → Redirected to Angi, trying Angi format...');
          // Angi format - try to parse
          const $ = this.parse(html);
          
          // Angi results are heavily JS-dependent
          // Look for JSON data in scripts
          $('script').each((i, el) => {
            const content = $(el).html();
            if (content && (content.includes('"pros"') || content.includes('"results"'))) {
              try {
                const match = content.match(/{.*?(?:pros|results).*?}/i);
                if (match) {
                  const data = JSON.parse(match[0]);
                  const pros = data.pros || data.results || [];
                  pros.forEach(pro => {
                    this.addContractor({
                      name: cleanText(pro.name || pro.businessName),
                      phone: extractPhone(pro.phone || pro.phoneNumber),
                      address: cleanText(pro.address || pro.streetAddress),
                      city: cleanText(pro.city),
                      state: pro.state,
                      zip: pro.zipCode || pro.zip,
                      rating: pro.rating || pro.ratingAverage,
                      reviews: pro.reviewCount || pro.reviews,
                      services: cleanText(pro.services || pro.specialties),
                      category: query
                    });
                  });
                }
              } catch (e) {}
            }
          });
        }
        
        break; // Stop after trying first URL
      } catch (error) {
        console.log(`  Error with ${searchUrl}: ${error.message}`);
      }
    }

    return this.getResults();
  }

  async scrapeCategory(category, zipCode = '10001') {
    return this.search(category, zipCode);
  }
}

module.exports = HomeAdvisorScraper;