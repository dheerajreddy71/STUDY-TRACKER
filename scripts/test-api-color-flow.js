const BASE_URL = 'http://localhost:3000';

async function testSubjectColorFlow() {
  console.log('\n🎨 Testing Subject Color Flow (Full API)\n');
  console.log('='.repeat(60));

  const userId = 'test-user-color-flow';
  
  try {
    // Create a subject with a specific color
    const testSubject = {
      userId,
      name: 'Test Subject - Red',
      category: 'mathematics',
      difficultyLevel: 'medium',
      colorTheme: '#EF4444', // RED
      currentGrade: 85,
      targetGrade: 95
    };

    console.log('\n📝 Creating subject via API...');
    console.log(`   Color to send: ${testSubject.colorTheme}`);
    
    const createResponse = await fetch(`${BASE_URL}/api/v1/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSubject)
    });

    const createResult = await createResponse.json();
    
    if (!createResult.success) {
      console.log('❌ Failed to create subject:', createResult.error);
      return;
    }

    console.log('✅ Subject created successfully');
    console.log(`   ID: ${createResult.data.id}`);
    console.log(`   Color returned: ${createResult.data.color_theme}`);

    // Now fetch all subjects for this user
    console.log('\n🔍 Fetching subjects via API...');
    
    const getResponse = await fetch(`${BASE_URL}/api/v1/subjects?userId=${userId}`);
    const getResult = await getResponse.json();

    if (!getResult.success) {
      console.log('❌ Failed to fetch subjects:', getResult.error);
      return;
    }

    const createdSubject = getResult.data.find(s => s.id === createResult.data.id);
    
    if (!createdSubject) {
      console.log('❌ Created subject not found in response');
      return;
    }

    console.log('✅ Subject fetched successfully');
    console.log(`   Name: ${createdSubject.name}`);
    console.log(`   Color in response: ${createdSubject.color_theme}`);

    // Test analytics subject breakdown endpoint
    console.log('\n📊 Fetching subject breakdown via analytics API...');
    
    const breakdownResponse = await fetch(`${BASE_URL}/api/v1/analytics/subject-breakdown?userId=${userId}`);
    const breakdownResult = await breakdownResponse.json();

    if (Array.isArray(breakdownResult)) {
      const breakdownSubject = breakdownResult.find(s => s.id === createResult.data.id);
      
      if (breakdownSubject) {
        console.log('✅ Subject found in breakdown');
        console.log(`   Color in breakdown: ${breakdownSubject.color}`);
        
        if (breakdownSubject.color === testSubject.colorTheme) {
          console.log('\n' + '='.repeat(60));
          console.log('✅ SUCCESS: Color is preserved through entire flow!');
          console.log('='.repeat(60));
        } else {
          console.log('\n' + '='.repeat(60));
          console.log('❌ FAILURE: Color mismatch!');
          console.log(`   Expected: ${testSubject.colorTheme}`);
          console.log(`   Got:      ${breakdownSubject.color}`);
          console.log('='.repeat(60));
        }
      } else {
        console.log('❌ Subject not found in breakdown response');
      }
    } else {
      console.log('❌ Unexpected breakdown response format');
    }

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    console.log('\n⚠️  Make sure the dev server is running: pnpm dev');
  }
}

testSubjectColorFlow();
