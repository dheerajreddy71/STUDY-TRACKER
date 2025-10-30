// Test all API endpoints for errors
const baseUrl = 'http://localhost:3000';
const testUserId = 'test-user-1';

const tests = [];
let passed = 0;
let failed = 0;

async function testEndpoint(name, url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success !== false) {
      console.log(`✓ ${name}`);
      passed++;
      return { success: true, data };
    } else {
      console.log(`✗ ${name}: ${response.status} - ${data.error || 'Unknown error'}`);
      failed++;
      return { success: false, error: data.error, status: response.status };
    }
  } catch (error) {
    console.log(`✗ ${name}: ${error.message}`);
    failed++;
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n🧪 API ENDPOINT TESTING');
  console.log('='.repeat(80) + '\n');
  
  // Test Sessions
  console.log('📊 Testing Sessions API...');
  await testEndpoint('GET /api/v1/sessions', `${baseUrl}/api/v1/sessions?userId=${testUserId}`);
  
  // Test Subjects
  console.log('\n📚 Testing Subjects API...');
  await testEndpoint('GET /api/v1/subjects', `${baseUrl}/api/v1/subjects?userId=${testUserId}`);
  
  // Test Performance
  console.log('\n📈 Testing Performance API...');
  await testEndpoint('GET /api/v1/performance', `${baseUrl}/api/v1/performance?userId=${testUserId}`);
  
  // Test Goals
  console.log('\n🎯 Testing Goals API...');
  await testEndpoint('GET /api/v1/goals', `${baseUrl}/api/v1/goals?userId=${testUserId}`);
  
  // Test Achievements
  console.log('\n🏆 Testing Achievements API...');
  await testEndpoint('GET /api/v1/achievements', `${baseUrl}/api/v1/achievements?userId=${testUserId}`);
  
  // Test Streaks
  console.log('\n🔥 Testing Streaks API...');
  await testEndpoint('GET /api/v1/achievements/streaks', `${baseUrl}/api/v1/achievements/streaks?userId=${testUserId}`);
  
  // Test Recommendations
  console.log('\n💡 Testing Recommendations API...');
  await testEndpoint('GET /api/v1/recommendations/comprehensive', `${baseUrl}/api/v1/recommendations/comprehensive?userId=${testUserId}`);
  
  // Test Analytics endpoints
  console.log('\n📊 Testing Analytics APIs...');
  await testEndpoint('GET /api/v1/analytics', `${baseUrl}/api/v1/analytics?userId=${testUserId}`);
  await testEndpoint('GET /api/v1/analytics/dashboard', `${baseUrl}/api/v1/analytics/dashboard?userId=${testUserId}`);
  await testEndpoint('GET /api/v1/analytics/trends', `${baseUrl}/api/v1/analytics/trends?userId=${testUserId}`);
  await testEndpoint('GET /api/v1/analytics/stats', `${baseUrl}/api/v1/analytics/stats?userId=${testUserId}`);
  await testEndpoint('GET /api/v1/analytics/correlations', `${baseUrl}/api/v1/analytics/correlations?userId=${testUserId}`);
  
  // Test Learning Profile
  console.log('\n🧠 Testing Learning Profile API...');
  await testEndpoint('GET /api/v1/learning-profile', `${baseUrl}/api/v1/learning-profile?userId=${testUserId}`);
  
  // Test Subject Allocation
  console.log('\n⚖️  Testing Subject Allocation API...');
  await testEndpoint('GET /api/v1/subject-allocation', `${baseUrl}/api/v1/subject-allocation?userId=${testUserId}`);
  
  // Test Spaced Repetition
  console.log('\n🔄 Testing Spaced Repetition API...');
  await testEndpoint('GET /api/v1/spaced-repetition', `${baseUrl}/api/v1/spaced-repetition?userId=${testUserId}`);
  
  // Test Scheduled Sessions
  console.log('\n📅 Testing Scheduled Sessions API...');
  await testEndpoint('GET /api/v1/scheduled-sessions', `${baseUrl}/api/v1/scheduled-sessions?userId=${testUserId}`);
  
  // Test Preferences
  console.log('\n⚙️  Testing Preferences API...');
  await testEndpoint('GET /api/v1/preferences', `${baseUrl}/api/v1/preferences?userId=${testUserId}`);
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n✅ All tests passed! API is healthy.');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Review errors above.`);
  }
}

runTests().catch(console.error);
