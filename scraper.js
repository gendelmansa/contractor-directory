/**
 * Main Contractor Directory Scraper
 * Uses Cheerio + Axios to collect contractor/service data
 * 
 * Usage:
 *   node scraper.js                    - Run all scrapers
 *   node scraper.js --scraper=bbb     - Run specific scraper
 *   node scraper.js --category=plumber - Search specific category
 *   node scraper.js --location=NYC     - Search specific location
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments (handles both --arg=value and --arg value)
function getArgValue(arg) {
  // First try --arg value format
  const idx = process.argv.indexOf(arg);
  if (idx > -1 && idx + 1 < process.argv.length) {
    const next = process.argv[idx + 1];
    if (next && !next.startsWith('--')) {
      return next;
    }
  }
  // Then try --arg=value format
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i].startsWith(arg + '=')) {
      return process.argv[i].substring(arg.length + 1);
    }
  }
  return null;
}

const config = {
  scraper: getArgValue('--scraper') || 'all',
  category: getArgValue('--category') || 'general-contractor',
  location: getArgValue('--location') || '10001',
  output: getArgValue('--output') || 'contractors.json'
};

// Import scrapers (after config to ensure correct path resolution)
const BBBScraper = require('./scrapers/BBBScraper');
const HomeAdvisorScraper = require('./scrapers/HomeAdvisorScraper');

console.log('='.repeat(60));
console.log('  CONTRACTOR DIRECTORY SCRAPER');
console.log('  Using Cheerio + Axios');
console.log('='.repeat(60));
console.log(`\nConfiguration:`);
console.log(`  Scraper: ${config.scraper}`);
console.log(`  Category: ${config.category}`);
console.log(`  Location: ${config.location}`);
console.log(`  Output: ${config.output}`);

/**
 * Run the BBB Scraper
 */
async function runBBBScraper() {
  console.log('\n' + '='.repeat(60));
  console.log('  RUNNING BBB SCRAPER');
  console.log('='.repeat(60));
  
  const scraper = new BBBScraper();
  const results = await scraper.search(config.category, config.location);
  
  console.log(`\n  Total results: ${results.length}`);
  return results;
}

/**
 * Run the HomeAdvisor Scraper
 */
async function runHomeAdvisorScraper() {
  console.log('\n' + '='.repeat(60));
  console.log('  RUNNING HOMEADVISOR SCRAPER');
  console.log('='.repeat(60));
  
  const scraper = new HomeAdvisorScraper();
  const results = await scraper.search(config.category, config.location);
  
  console.log(`\n  Total results: ${results.length}`);
  return results;
}

/**
 * Save results to file
 */
function saveResults(allResults) {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const filepath = path.join(dataDir, config.output);
  fs.writeFileSync(filepath, JSON.stringify(allResults, null, 2));
  console.log(`\n✓ Saved ${allResults.length} results to ${filepath}`);
  
  return filepath;
}

/**
 * Display sample results
 */
function displaySampleResults(results) {
  console.log('\n' + '-'.repeat(60));
  console.log('  SAMPLE RESULTS (first 5)');
  console.log('-'.repeat(60));
  
  results.slice(0, 5).forEach((contractor, i) => {
    console.log(`\n${i + 1}. ${contractor.name}`);
    console.log(`   Source: ${contractor.source}`);
    if (contractor.phone) console.log(`   Phone: ${contractor.phone}`);
    if (contractor.address || contractor.city) {
      console.log(`   Address: ${contractor.address || ''} ${contractor.city || ''} ${contractor.state || ''} ${contractor.zip || ''}`.trim());
    }
    if (contractor.rating) console.log(`   Rating: ${contractor.rating}`);
    if (contractor.category) console.log(`   Category: ${contractor.category}`);
  });
}

/**
 * Main execution
 */
async function main() {
  let allResults = [];
  
  try {
    // Run selected scraper(s)
    if (config.scraper === 'all' || config.scraper === 'bbb') {
      const bbbResults = await runBBBScraper();
      allResults = [...allResults, ...bbbResults];
    }
    
    if (config.scraper === 'all' || config.scraper === 'homeadvisor') {
      const haResults = await runHomeAdvisorScraper();
      allResults = [...allResults, ...haResults];
    }
    
    // Deduplicate by name
    const uniqueResults = [];
    const seen = new Set();
    allResults.forEach(contractor => {
      const key = contractor.name?.toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        uniqueResults.push(contractor);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('  SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Total unique contractors found: ${uniqueResults.length}`);
    
    // Save results
    if (uniqueResults.length > 0) {
      const filepath = saveResults(uniqueResults);
      displaySampleResults(uniqueResults);
      
      // Also save individual scraper results
      const bbbResults = uniqueResults.filter(r => r.source === 'BBB');
      const haResults = uniqueResults.filter(r => r.source === 'HomeAdvisor');
      
      if (bbbResults.length > 0) {
        fs.writeFileSync(path.join(dataDir, 'bbb_contractors.json'), JSON.stringify(bbbResults, null, 2));
        console.log(`\n✓ Saved ${bbbResults.length} BBB results to data/bbb_contractors.json`);
      }
      
      if (haResults.length > 0) {
        fs.writeFileSync(path.join(dataDir, 'homeadvisor_contractors.json'), JSON.stringify(haResults, null, 2));
        console.log(`\n✓ Saved ${haResults.length} HomeAdvisor results to data/homeadvisor_contractors.json`);
      }
    } else {
      console.log('\n⚠️  No results found. This may be due to:');
      console.log('  - JavaScript-rendered content requiring browser automation');
      console.log('  - Site API changes or protection measures');
      console.log('  - Rate limiting or blocking');
      
      // Create sample output for demonstration
      const sampleData = [
        {
          name: "ABC Plumbing Services",
          phone: "(555) 123-4567",
          address: "123 Main Street",
          city: "New York",
          state: "NY",
          zip: "10001",
          category: "plumber",
          rating: "A+",
          source: "BBB (sample)",
          scrapedAt: new Date().toISOString()
        },
        {
          name: "XYZ Electrical Co.",
          phone: "(555) 987-6543",
          address: "456 Oak Avenue",
          city: "New York",
          state: "NY",
          zip: "10001",
          category: "electrician",
          rating: "A",
          source: "BBB (sample)",
          scrapedAt: new Date().toISOString()
        },
        {
          name: "Reliable Home Repairs",
          phone: "(555) 456-7890",
          address: "789 Elm Street",
          city: "Brooklyn",
          state: "NY",
          zip: "11201",
          category: "general-contractor",
          rating: "A-",
          source: "HomeAdvisor (sample)",
          scrapedAt: new Date().toISOString()
        }
      ];
      
      const filepath = saveResults(sampleData);
      console.log('\n→ Created sample data for demonstration purposes');
      displaySampleResults(sampleData);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('  SCRAPING COMPLETE');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the scraper
main();