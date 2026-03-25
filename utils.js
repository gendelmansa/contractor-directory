/**
 * Utility functions for the scraper
 */

const axios = require('axios');

/**
 * Simple rate limiter using in-memory storage
 */
class RateLimiter {
  constructor(requestsPerSecond = 1) {
    this.requestsPerSecond = requestsPerSecond;
    this.lastRequest = 0;
  }

  async wait() {
    const now = Date.now();
    const minInterval = 1000 / this.requestsPerSecond;
    const timeToWait = Math.max(0, minInterval - (now - this.lastRequest));
    
    if (timeToWait > 0) {
      await this.sleep(timeToWait);
    }
    this.lastRequest = Date.now();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Check if a URL is allowed to be scraped based on robots.txt
 */
async function checkRobotsTxt(baseUrl, userAgent = 'ContractorDirectoryBot/1.0') {
  try {
    const url = new URL(baseUrl);
    const robotsUrl = `${url.protocol}//${url.host}/robots.txt`;
    
    const response = await axios.get(robotsUrl, {
      timeout: 5000,
      headers: { 'User-Agent': userAgent }
    });
    
    const rules = response.data;
    
    // Simple parser - check for disallow rules
    const lines = rules.split('\n');
    let disallowed = [];
    let currentUserAgent = null;
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed.startsWith('user-agent:')) {
        currentUserAgent = trimmed.substring(11).trim();
      } else if (trimmed.startsWith('disallow:')) {
        const path = trimmed.substring(9).trim();
        if (currentUserAgent === userAgent.toLowerCase() || currentUserAgent === '*') {
          disallowed.push(path);
        }
      }
    }
    
    // Check if the path is disallowed
    const path = url.pathname;
    for (const disallow of disallowed) {
      if (path.startsWith(disallow) && disallow.length > 0) {
        return { allowed: false, reason: `Disallowed by robots.txt: ${disallow}` };
      }
    }
    
    return { allowed: true };
  } catch (error) {
    // If robots.txt doesn't exist or can't be fetched, assume allowed
    console.log(`  Note: Could not check robots.txt: ${error.message}`);
    return { allowed: true, warning: 'Could not verify robots.txt' };
  }
}

/**
 * Clean and normalize text
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
}

/**
 * Extract phone number from various formats
 */
function extractPhone(text) {
  if (!text) return null;
  // Match common phone formats
  const phoneMatch = text.match(/(\+1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
  return phoneMatch ? phoneMatch[0] : null;
}

/**
 * Validate contractor data
 */
function validateContractor(contractor) {
  const required = ['name'];
  const missing = required.filter(field => !contractor[field]);
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  
  return { valid: true };
}

module.exports = {
  RateLimiter,
  checkRobotsTxt,
  cleanText,
  extractPhone,
  validateContractor
};