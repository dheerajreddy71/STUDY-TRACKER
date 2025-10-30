// Simulating what happens when you create a subject through the UI
const { database } = require('./lib/db.ts');

async function simulateUIFlow() {
  console.log('\n🎨 Simulating UI Subject Creation Flow\n');
  console.log('='.repeat(60));

  // This is what the SubjectForm component sends (from subject-form.tsx line 47)
  const formData = {
    name: "Test Mathematics",
    category: "mathematics",
    difficultyLevel: "medium",
    currentGrade: 75,
    targetGrade: 90,
    colorTheme: "#EC4899", // PINK - user selected this color
    instructorName: "",
    examDate: "",
  };

  console.log('\n📝 Form Data (what SubjectForm sends):');
  console.log(JSON.stringify(formData, null, 2));

  // This is what the API receives and transforms (from subjects/route.ts)
  const apiPayload = {
    userId: 'test-ui-flow',
    ...formData,
    currentGrade: formData.currentGrade ? parseFloat(formData.currentGrade) : null,
    targetGrade: formData.targetGrade ? parseFloat(formData.targetGrade) : null,
  };

  console.log('\n📡 API Payload (what route.ts processes):');
  console.log(JSON.stringify(apiPayload, null, 2));

  // This is what gets passed to database.createSubject
  const dbInput = {
    userId: apiPayload.userId,
    name: apiPayload.name,
    subjectCode: apiPayload.subjectCode || null,
    category: apiPayload.category || 'mathematics',
    difficultyLevel: apiPayload.difficultyLevel || "medium",
    priorityLevel: apiPayload.priorityLevel || "medium",
    priorityReason: apiPayload.priorityReason || null,
    subjectDescription: apiPayload.subjectDescription || null,
    colorTheme: apiPayload.colorTheme || "blue", // ⚠️ FALLBACK HERE
    targetWeeklyHours: apiPayload.targetWeeklyHours || 5,
    // ... other fields
  };

  console.log('\n💾 Database Input (what createSubject receives):');
  console.log(`   colorTheme: ${dbInput.colorTheme}`);

  try {
    const result = await database.createSubject(dbInput);
    
    console.log('\n✅ Subject Created:');
    console.log(`   ID: ${result.id}`);
    console.log(`   Name: ${result.name}`);
    console.log(`   color_theme: ${result.color_theme}`);

    // Now fetch it back
    const subjects = await database.getSubjects(apiPayload.userId);
    const created = subjects.find(s => s.id === result.id);

    console.log('\n🔍 Fetched Back:');
    console.log(`   color_theme: ${created.color_theme}`);

    console.log('\n' + '='.repeat(60));
    if (created.color_theme === formData.colorTheme) {
      console.log('✅ SUCCESS: Color preserved through entire flow!');
    } else {
      console.log('❌ FAILURE: Color changed!');
      console.log(`   Expected: ${formData.colorTheme}`);
      console.log(`   Got: ${created.color_theme}`);
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

simulateUIFlow();
