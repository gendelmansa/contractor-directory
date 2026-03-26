/**
 * QA Test Suite for Contractor Directory
 * Run with: node scripts/qa-test.js
 */

const SUPABASE_URL = 'https://bvoaijksstjzseiywylf.supabase.co';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2b2Fpamtzc3RqenNlaXl3eWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0Njc3NjksImV4cCI6MjA5MDA0Mzc2OX0.vtM9V0knv9rwbFE4PkRHAtCW5puIXVHHaU8K8ddoANk';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(msg, type) {
  const color = type === 'pass' ? colors.green : type === 'fail' ? colors.red : type === 'warn' ? colors.yellow : type === 'info' ? colors.blue : colors.cyan;
  console.log(color + '[' + type.toUpperCase() + ']' + colors.reset + ' ' + msg);
}

async function fetchAllContractors() {
  const response = await fetch(SUPABASE_URL + '/rest/v1/contractors?select=*', {
    headers: {
      'apikey': API_KEY,
      'Authorization': 'Bearer ' + API_KEY
    }
  });
  return response.json();
}

function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

async function runQATests() {
  log('Starting QA Test Suite for Contractor Directory', 'info');
  console.log('==========================================\n');
  
  // Fetch all contractors
  log('Fetching contractor data from API...', 'info');
  let contractors = [];
  try {
    contractors = await fetchAllContractors();
    log('Found ' + contractors.length + ' contractors in database', 'info');
  } catch (e) {
    log('Failed to fetch contractors: ' + e.message, 'fail');
    process.exit(1);
  }
  
  const results = {
    data: { passed: 0, failed: 0, issues: [] },
    phones: { passed: 0, failed: 0, issues: [] },
    names: { passed: 0, failed: 0, issues: [] },
    locations: { passed: 0, failed: 0, issues: [] }
  };
  
  // Test 1: Data completeness
  log('\n--- Test: Data Completeness ---', 'info');
  const requiredFields = ['name', 'city', 'state'];
  contractors.forEach(function(c) {
    requiredFields.forEach(function(field) {
      if (!c[field] || c[field].trim() === '') {
        results.data.issues.push((c.name || 'Unknown') + ': missing ' + field);
        results.data.failed++;
      } else {
        results.data.passed++;
      }
    });
  });
  
  if (results.data.issues.length > 0) {
    log('Found ' + results.data.issues.length + ' missing fields', 'fail');
    results.data.issues.slice(0, 5).forEach(function(i) {
      log('  - ' + i, 'fail');
    });
  } else {
    log('All required fields populated', 'pass');
  }
  
  // Test 2: Phone numbers
  log('\n--- Test: Phone Numbers ---', 'info');
  var missingPhones = contractors.filter(function(c) { return !validatePhone(c.phone); });
  var validPhones = contractors.filter(function(c) { return validatePhone(c.phone); });
  
  if (missingPhones.length > 0) {
    log(missingPhones.length + ' contractors have missing/invalid phone numbers', 'fail');
    missingPhones.slice(0, 10).forEach(function(c) {
      log('  - ' + c.name + ' (' + c.city + '): "' + (c.phone || 'empty') + '"', 'fail');
      results.phones.issues.push(c.name + ': ' + (c.phone || 'empty'));
      results.phones.failed++;
    });
  } else {
    log('All ' + contractors.length + ' contractors have valid phone numbers', 'pass');
    results.phones.passed = contractors.length;
  }
  
  // Test 3: Business names
  log('\n--- Test: Business Names ---', 'info');
  contractors.forEach(function(c) {
    if (!c.name || c.name.length < 3) {
      results.names.issues.push(c.id + ': name too short or empty');
      results.names.failed++;
    } else if (c.name.match(/^[0-9]+$/)) {
      results.names.issues.push(c.name + ': name is only numbers');
      results.names.failed++;
    } else {
      results.names.passed++;
    }
  });
  
  if (results.names.issues.length > 0) {
    log('Found ' + results.names.issues.length + ' name issues', 'fail');
    results.names.issues.slice(0, 3).forEach(function(i) {
      log('  - ' + i, 'fail');
    });
  } else {
    log('All business names look valid', 'pass');
  }
  
  // Test 4: Location data
  log('\n--- Test: Location Data ---', 'info');
  contractors.forEach(function(c) {
    if (!c.city || !c.state) {
      results.locations.issues.push(c.name + ': missing city or state');
      results.locations.failed++;
    } else if (c.state !== 'MI') {
      results.locations.issues.push(c.name + ': state is ' + c.state + ' (not MI)');
      results.locations.failed++;
    } else {
      results.locations.passed++;
    }
  });
  
  if (results.locations.issues.length > 0) {
    log('Found ' + results.locations.issues.length + ' location issues', 'fail');
    results.locations.issues.slice(0, 3).forEach(function(i) {
      log('  - ' + i, 'fail');
    });
  } else {
    log('All locations are valid Michigan contractors', 'pass');
  }
  
  // Summary
  console.log('\n==========================================');
  log('QA Test Summary', 'info');
  console.log('==========================================');
  
  var totalPassed = Object.values(results).reduce(function(sum, r) { return sum + r.passed; }, 0);
  var totalFailed = Object.values(results).reduce(function(sum, r) { return sum + r.failed; }, 0);
  
  console.log('\nData fields: ' + results.data.passed + ' OK, ' + results.data.failed + ' issues');
  console.log('Phone numbers: ' + validPhones.length + '/' + contractors.length + ' valid');
  console.log('Business names: ' + results.names.passed + ' OK, ' + results.names.failed + ' issues');
  console.log('Locations: ' + results.locations.passed + ' OK, ' + results.locations.failed + ' issues');
  
  if (totalFailed === 0) {
    log('\nAll QA tests passed!', 'pass');
    process.exit(0);
  } else {
    log('\nFound ' + totalFailed + ' issues across all tests:', 'fail');
    if (missingPhones.length > 0) {
      console.log('\n  PHONE NUMBERS NEED ATTENTION (' + missingPhones.length + '):');
      missingPhones.forEach(function(c) {
        console.log('    - ' + c.name + ', ' + c.city);
      });
    }
    process.exit(1);
  }
}

runQATests().catch(function(e) {
  log('QA test error: ' + e.message, 'fail');
  process.exit(1);
});
