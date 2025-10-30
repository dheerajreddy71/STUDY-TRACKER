# Quick Start Guide - Testing Recommendation System

## Prerequisites

✅ Database schema fixed (performance_entries table recreated)  
✅ All analytics modules implemented  
✅ API endpoints created  
✅ No TypeScript compilation errors

---

## Step 1: Start Development Server

```powershell
cd c:\Users\byred\Downloads\study-tracker
pnpm dev
```

Expected: Server running on http://localhost:3000

---

## Step 2: Test Basic Recommendation API

### A. Test Original Recommendations Endpoint

Open browser or Postman:

```
GET http://localhost:3000/api/v1/recommendations?userId=user123
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "burnout": { ... },
    "duration": { ... },
    "trends": [ ... ],
    "patterns": [ ... ],
    "recommendations": [ ... ]
  }
}
```

### B. Test Comprehensive Recommendations

```
GET http://localhost:3000/api/v1/recommendations/comprehensive?userId=user123
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "recommendations": [ ... ],
    "insights": {
      "burnout": { ... },
      "performance": { ... },
      "learningStyle": { ... },
      "subjectAllocation": { ... },
      "spacedRepetition": { ... }
    },
    "summary": {
      "criticalIssues": 0,
      "optimizationOpportunities": 2,
      "strengthsIdentified": 1,
      "overallHealth": "good"
    }
  }
}
```

---

## Step 3: Test Spaced Repetition

### A. Get Items Due for Review

```
GET http://localhost:3000/api/v1/spaced-repetition?userId=user123&action=due
```

### B. Get 7-Day Review Schedule

```
GET http://localhost:3000/api/v1/spaced-repetition?userId=user123&action=schedule&days=7
```

### C. Get Topics at Risk (< 60% retention)

```
GET http://localhost:3000/api/v1/spaced-repetition?userId=user123&action=at-risk&threshold=60
```

### D. Create New Spaced Repetition Item

```
POST http://localhost:3000/api/v1/spaced-repetition
Content-Type: application/json

{
  "action": "create",
  "userId": "user123",
  "subjectId": "math101",
  "topicName": "Quadratic Equations",
  "confidence": 7,
  "difficultyLevel": 3,
  "chapterReference": "Chapter 5"
}
```

### E. Record a Review

```
POST http://localhost:3000/api/v1/spaced-repetition
Content-Type: application/json

{
  "action": "review",
  "itemId": "<item-id-from-create>",
  "confidence": 8,
  "timeSpent": 25,
  "result": "good"
}
```

**Result Values:** "easy", "good", "hard", "forgot"

---

## Step 4: Test Learning Profile

### A. Get Existing Profile

```
GET http://localhost:3000/api/v1/learning-profile?userId=user123&recommendations=true
```

### B. Generate New Profile

```
POST http://localhost:3000/api/v1/learning-profile
Content-Type: application/json

{
  "userId": "user123"
}
```

**Expected:** Learning style classification (visual/auditory/kinesthetic/reading_writing/multimodal)

---

## Step 5: Test Subject Allocation

### A. Get Weekly Allocation Plan

```
GET http://localhost:3000/api/v1/subject-allocation?userId=user123&hours=20&action=plan
```

### B. Get Priority Subjects

```
GET http://localhost:3000/api/v1/subject-allocation?userId=user123&action=priorities
```

### C. Get Neglected Subjects

```
GET http://localhost:3000/api/v1/subject-allocation?userId=user123&action=neglected&days=5
```

---

## Step 6: Create Test Data

### A. Create Study Sessions (using existing sessions API)

```
POST http://localhost:3000/api/v1/sessions
Content-Type: application/json

{
  "userId": "user123",
  "subjectId": "math101",
  "startedAt": "2025-10-25T09:00:00Z",
  "duration": 45,
  "focusRating": 8,
  "studyMethod": "practice_problems"
}
```

Repeat with variations:

- Different durations: 25, 45, 60, 90 minutes
- Different focus ratings: 5-10
- Different times of day
- Different study methods
- Different subjects

Create 15-20 sessions over 30 days

### B. Create Performance Entries

```
POST http://localhost:3000/api/v1/performance
Content-Type: application/json

{
  "userId": "user123",
  "subjectId": "math101",
  "entryType": "assessment",
  "assessmentTitle": "Chapter 5 Quiz",
  "assessmentType": "quiz",
  "score": 85,
  "totalPossible": 100,
  "assessmentDate": "2025-10-26"
}
```

Create 8-10 performance entries linked to sessions

---

## Step 7: Test Dashboard Integration

### A. Navigate to Dashboard

```
http://localhost:3000
```

### B. Check Recommendations Section

Look for:

- ✅ Recommendations panel displayed
- ✅ Burnout assessment card
- ✅ Performance trends card
- ✅ Smart recommendations card
- ✅ Loading states work
- ✅ Refresh button functional

---

## Step 8: Test Burnout Detection

### A. Create Burnout Pattern

Create sessions with:

1. Declining focus ratings (8 → 7 → 6 → 5)
2. Increasing duration (45 → 60 → 90 → 120 minutes)
3. Late night sessions (11 PM - 2 AM)
4. Add notes with keywords: "exhausted", "frustrated", "giving up"

### B. Check Burnout Score

```
GET http://localhost:3000/api/v1/recommendations/comprehensive?userId=user123
```

Look for:

- `burnout.totalScore` > 60
- `burnout.severity` = "moderate", "high", or "critical"
- `burnout.needsIntervention` = true
- Recommendations include rest and intervention

---

## Step 9: Verify Database Storage

### A. Check SQLite Database

```powershell
cd c:\Users\byred\Downloads\study-tracker\data
sqlite3 study-tracker.db

# List tables
.tables

# Check spaced repetition items
SELECT COUNT(*) FROM spaced_repetition_items;

# Check recommendations
SELECT * FROM recommendations WHERE user_id = 'user123' ORDER BY created_at DESC LIMIT 5;

# Check learning profiles
SELECT * FROM learning_profiles WHERE user_id = 'user123';

# Exit
.quit
```

---

## Step 10: Performance Testing

### A. Check Response Times

- Comprehensive recommendations: < 2 seconds
- Spaced repetition queries: < 500ms
- Learning profile generation: < 1 second
- Subject allocation: < 1 second

### B. Check for Errors

Look in terminal for:

- ❌ No database errors
- ❌ No TypeScript errors
- ❌ No API 500 errors

---

## Common Issues & Solutions

### Issue: "Table not found"

**Solution:** Run schema creation:

```powershell
Get-Content scripts\comprehensive-schema.sql | sqlite3 data\study-tracker.db
```

### Issue: "Not enough data"

**Solution:** Create minimum 10 sessions for meaningful analysis

### Issue: "Module not found"

**Solution:** Check imports use correct paths with `@/lib/analytics/...`

### Issue: API returns null/empty

**Solution:** Check userId matches data in database

---

## Success Criteria

✅ All API endpoints return 200 status  
✅ Recommendations generated without errors  
✅ Learning profile classifies style correctly  
✅ Spaced repetition calculates review dates  
✅ Subject allocation distributes hours  
✅ Burnout detection scores accurately  
✅ Dashboard displays recommendations  
✅ Database stores all data correctly

---

## Next Steps After Testing

1. **Create UI Components:**

   - Spaced repetition calendar
   - Learning profile card
   - Subject allocation weekly view

2. **Enhance Dashboard:**

   - Tabbed recommendations interface
   - Visual charts for insights
   - Interactive action items

3. **Add User Interactions:**

   - Mark recommendations complete
   - Provide feedback (helpful/not helpful)
   - Track recommendation effectiveness

4. **Performance Optimization:**
   - Cache expensive calculations
   - Implement pagination
   - Add query optimization

---

**Testing Priority:** High → Medium → Low

1. Basic API functionality (High)
2. Data accuracy (High)
3. Performance/speed (Medium)
4. UI/UX polish (Low)

---

_Ready to test!_ 🚀
