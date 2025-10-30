# Smart Study Habit Tracker - Complete Web Application Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Layers](#architecture-layers)
4. [Database Schema](#database-schema)
5. [Data Models & Types](#data-models--types)
6. [API Endpoints](#api-endpoints)
7. [Frontend Architecture](#frontend-architecture)
8. [Security Implementation](#security-implementation)
9. [Scalability & Performance](#scalability--performance)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Components (Next.js App Router)               │   │
│  │  - Dashboard, Sessions, Performance, Analytics       │   │
│  │  - Real-time UI Updates (SWR, React Query)           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js Route Handlers & Server Actions             │   │
│  │  - Request validation & rate limiting                │   │
│  │  - Authentication middleware                         │   │
│  │  - CORS & security headers                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Service Layer                                       │   │
│  │  - SessionService, PerformanceService                │   │
│  │  - AnalyticsService, RecommendationEngine            │   │
│  │  - UserService, AuthService                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database Abstraction (Prisma ORM)                   │   │
│  │  - Query builders, migrations                        │   │
│  │  - Connection pooling                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                 │   │
│  │  - Relational data storage                           │   │
│  │  - Indexes for performance                           │   │
│  │  - Backup & replication                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Key Principles

- **Separation of Concerns**: Each layer has distinct responsibilities
- **Scalability**: Horizontal scaling through stateless services
- **Security**: Defense in depth with multiple security layers
- **Performance**: Caching, indexing, and query optimization
- **Maintainability**: Clear interfaces and modular design

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **State Management**: SWR + React Context
- **Charts**: Recharts
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js (Next.js Route Handlers)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Validation**: Zod
- **Caching**: Redis (Upstash)
- **Job Queue**: Bull/Bee-Queue (for async tasks)

### Database
- **Primary**: PostgreSQL (Neon or Supabase)
- **Cache**: Redis
- **Search**: PostgreSQL Full-Text Search

### Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry
- **Logging**: Structured logging to cloud

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Responsibilities:**
- Render UI components
- Handle user interactions
- Manage client-side state
- Display real-time data updates
- Form validation and submission

**Key Components:**
- Page components (dashboard, sessions, performance, etc.)
- Reusable UI components (buttons, cards, modals)
- Layout components (navigation, sidebar)
- Custom hooks (useSession, usePerformance, etc.)

### 2. API Layer (Route Handlers & Server Actions)

**Responsibilities:**
- Handle HTTP requests
- Validate request data
- Authenticate users
- Authorize actions
- Transform data for responses

**Endpoints Structure:**
\`\`\`
/api/v1/
  ├── auth/
  │   ├── register
  │   ├── login
  │   ├── logout
  │   └── refresh
  ├── sessions/
  │   ├── [GET] list sessions
  │   ├── [POST] create session
  │   ├── [GET] get session
  │   ├── [PUT] update session
  │   └── [DELETE] delete session
  ├── performance/
  │   ├── [GET] list entries
  │   ├── [POST] create entry
  │   └── [GET] analytics
  ├── subjects/
  │   ├── [GET] list subjects
  │   ├── [POST] create subject
  │   └── [PUT] update subject
  ├── recommendations/
  │   ├── [GET] daily recommendations
  │   └── [GET] insights
  └── analytics/
      ├── [GET] dashboard stats
      ├── [GET] time analysis
      └── [GET] performance trends
\`\`\`

### 3. Business Logic Layer (Services)

**Core Services:**

**SessionService**
- Create/update/delete sessions
- Calculate session statistics
- Detect focus patterns
- Manage session history

**PerformanceService**
- Record performance entries
- Calculate performance metrics
- Track score trends
- Predict future performance

**AnalyticsService**
- Generate dashboard statistics
- Analyze time patterns
- Calculate correlations
- Identify trends

**RecommendationEngine**
- Generate daily study plans
- Suggest optimal study times
- Recommend study methods
- Provide personalized insights

**UserService**
- Manage user profiles
- Update preferences
- Handle settings

**AuthService**
- User registration
- Login/logout
- Token management
- Session validation

### 4. Data Access Layer (Prisma ORM)

**Responsibilities:**
- Database queries
- Data transformation
- Connection management
- Query optimization

**Key Features:**
- Type-safe queries
- Automatic migrations
- Relationship management
- Query caching

### 5. Persistence Layer (PostgreSQL)

**Responsibilities:**
- Data storage
- ACID compliance
- Indexing
- Backup & recovery

---

## Database Schema

### Core Tables

#### users
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  education_level VARCHAR(50),
  primary_goal VARCHAR(100),
  preferred_study_style VARCHAR(50),
  study_environment VARCHAR(100),
  energy_pattern VARCHAR(50),
  current_challenges TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);
\`\`\`

#### subjects
\`\`\`sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  difficulty_level VARCHAR(50),
  current_grade DECIMAL(5,2),
  target_grade DECIMAL(5,2),
  credits INT,
  color_theme VARCHAR(7),
  instructor_name VARCHAR(255),
  exam_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  INDEX idx_user_id (user_id),
  INDEX idx_exam_date (exam_date),
  UNIQUE(user_id, name)
);
\`\`\`

#### study_sessions
\`\`\`sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  study_method VARCHAR(100) NOT NULL,
  target_duration INT,
  actual_duration INT NOT NULL,
  session_goal TEXT,
  session_notes TEXT,
  focus_rating INT CHECK (focus_rating >= 1 AND focus_rating <= 10),
  goal_achieved VARCHAR(50),
  confidence_level INT CHECK (confidence_level >= 1 AND confidence_level <= 10),
  challenges TEXT[],
  location VARCHAR(100),
  break_duration INT DEFAULT 0,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_subject_id (subject_id),
  INDEX idx_started_at (started_at),
  INDEX idx_focus_rating (focus_rating)
);
\`\`\`

#### performance_entries
\`\`\`sql
CREATE TABLE performance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  entry_type VARCHAR(50) NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  total_possible DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (score / total_possible * 100) STORED,
  assessment_name VARCHAR(255),
  difficulty_rating INT CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  topics_covered TEXT[],
  time_spent INT,
  notes TEXT,
  assessment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_subject_id (subject_id),
  INDEX idx_assessment_date (assessment_date),
  INDEX idx_percentage (percentage)
);
\`\`\`

#### session_performance_links
\`\`\`sql
CREATE TABLE session_performance_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  performance_id UUID NOT NULL REFERENCES performance_entries(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, performance_id)
);
\`\`\`

#### user_goals
\`\`\`sql
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(100) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  deadline DATE,
  category VARCHAR(50),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_deadline (deadline)
);
\`\`\`

#### user_achievements
\`\`\`sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  description TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_earned_at (earned_at)
);
\`\`\`

#### user_insights
\`\`\`sql
CREATE TABLE user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type VARCHAR(100) NOT NULL,
  insight_text TEXT NOT NULL,
  confidence_level DECIMAL(3,2),
  data_points INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT false,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
\`\`\`

#### user_preferences
\`\`\`sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme VARCHAR(50) DEFAULT 'light',
  time_format VARCHAR(10) DEFAULT '24h',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  week_start_day VARCHAR(10) DEFAULT 'Monday',
  timezone VARCHAR(50) DEFAULT 'UTC',
  default_session_duration INT DEFAULT 60,
  break_interval INT DEFAULT 25,
  focus_check_frequency INT DEFAULT 15,
  notifications_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### audit_logs
\`\`\`sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_action (action)
);
\`\`\`

### Indexes for Performance

\`\`\`sql
-- Composite indexes for common queries
CREATE INDEX idx_sessions_user_subject ON study_sessions(user_id, subject_id);
CREATE INDEX idx_sessions_user_date ON study_sessions(user_id, started_at DESC);
CREATE INDEX idx_performance_user_subject ON performance_entries(user_id, subject_id);
CREATE INDEX idx_performance_user_date ON performance_entries(user_id, assessment_date DESC);

-- Full-text search indexes
CREATE INDEX idx_sessions_notes_fts ON study_sessions USING GIN(to_tsvector('english', session_notes));
CREATE INDEX idx_performance_notes_fts ON performance_entries USING GIN(to_tsvector('english', notes));
\`\`\`

---

## Data Models & Types

### TypeScript Interfaces

\`\`\`typescript
// User Models
interface User {
  id: string;
  email: string;
  name: string;
  educationLevel: 'high_school' | 'undergraduate' | 'graduate' | 'exam_prep';
  primaryGoal: string;
  preferredStudyStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  studyEnvironment: string;
  energyPattern: 'morning' | 'afternoon' | 'evening' | 'night_owl';
  currentChallenges: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// Subject Models
interface Subject {
  id: string;
  userId: string;
  name: string;
  category: string;
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'very_hard';
  currentGrade?: number;
  targetGrade?: number;
  credits?: number;
  colorTheme: string;
  instructorName?: string;
  examDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Study Session Models
interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  studyMethod: 'reading' | 'practice' | 'video' | 'notes' | 'flashcards' | 'group' | 'other';
  targetDuration?: number; // in minutes
  actualDuration: number; // in minutes
  sessionGoal?: string;
  sessionNotes?: string;
  focusRating: number; // 1-10
  goalAchieved: 'yes' | 'partial' | 'no';
  confidenceLevel: number; // 1-10
  challenges: string[];
  location?: string;
  breakDuration: number; // in minutes
  startedAt: Date;
  endedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Performance Entry Models
interface PerformanceEntry {
  id: string;
  userId: string;
  subjectId: string;
  entryType: 'quiz' | 'test' | 'exam' | 'assignment' | 'self_assessment' | 'mock_test';
  score: number;
  totalPossible: number;
  percentage: number; // calculated
  assessmentName?: string;
  difficultyRating?: number; // 1-10
  topicsCovered: string[];
  timeSpent?: number; // in minutes
  notes?: string;
  assessmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Models
interface DashboardStats {
  totalStudyHours: number;
  sessionsCompleted: number;
  currentStreak: number;
  averageFocusScore: number;
  bestPerformingSubject: string;
  mostImprovedSubject: string;
  subjectNeedingAttention: string;
  weeklyStudyTime: number[];
  dailyConsistency: number;
}

interface TimeAnalysis {
  hourlyHeatmap: Record<number, number>; // hour -> study minutes
  bestProductiveHours: number[];
  worstProductiveHours: number[];
  dayOfWeekPatterns: Record<string, number>;
}

interface PerformanceAnalysis {
  subjectPerformance: SubjectPerformanceMetric[];
  methodEffectiveness: MethodEffectiveness[];
  sessionDurationAnalysis: DurationAnalysis;
  focusQualityTrends: FocusQualityTrend[];
}

interface Recommendation {
  type: 'study_plan' | 'timing' | 'method' | 'break' | 'insight' | 'alert';
  subject?: string;
  suggestedTime?: string;
  suggestedDuration?: number;
  suggestedMethod?: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
}

interface UserInsight {
  id: string;
  userId: string;
  insightType: string;
  insightText: string;
  confidenceLevel: number; // 0-1
  dataPoints: number;
  createdAt: Date;
  isRead: boolean;
}
\`\`\`

---

## API Endpoints

### Authentication Endpoints

\`\`\`
POST /api/v1/auth/register
  Request: { email, password, name, educationLevel, primaryGoal }
  Response: { user, token, refreshToken }
  Status: 201 Created

POST /api/v1/auth/login
  Request: { email, password }
  Response: { user, token, refreshToken }
  Status: 200 OK

POST /api/v1/auth/logout
  Request: {}
  Response: { success: true }
  Status: 200 OK

POST /api/v1/auth/refresh
  Request: { refreshToken }
  Response: { token, refreshToken }
  Status: 200 OK

GET /api/v1/auth/me
  Response: { user }
  Status: 200 OK
\`\`\`

### Session Endpoints

\`\`\`
GET /api/v1/sessions
  Query: { subjectId?, startDate?, endDate?, method?, focusLevel?, limit, offset }
  Response: { sessions: StudySession[], total, hasMore }
  Status: 200 OK

POST /api/v1/sessions
  Request: { subjectId, studyMethod, targetDuration?, sessionGoal?, location? }
  Response: { session }
  Status: 201 Created

GET /api/v1/sessions/:id
  Response: { session }
  Status: 200 OK

PUT /api/v1/sessions/:id
  Request: { focusRating, goalAchieved, confidenceLevel, challenges, sessionNotes }
  Response: { session }
  Status: 200 OK

DELETE /api/v1/sessions/:id
  Response: { success: true }
  Status: 200 OK

POST /api/v1/sessions/:id/end
  Request: { focusRating, goalAchieved, confidenceLevel, challenges, sessionNotes }
  Response: { session, stats }
  Status: 200 OK
\`\`\`

### Performance Endpoints

\`\`\`
GET /api/v1/performance
  Query: { subjectId?, startDate?, endDate?, entryType?, limit, offset }
  Response: { entries: PerformanceEntry[], total }
  Status: 200 OK

POST /api/v1/performance
  Request: { subjectId, entryType, score, totalPossible, assessmentName?, assessmentDate }
  Response: { entry }
  Status: 201 Created

GET /api/v1/performance/analytics
  Query: { subjectId?, startDate?, endDate? }
  Response: { analysis: PerformanceAnalysis }
  Status: 200 OK

GET /api/v1/performance/:id
  Response: { entry }
  Status: 200 OK

PUT /api/v1/performance/:id
  Request: { score, totalPossible, notes?, assessmentDate? }
  Response: { entry }
  Status: 200 OK

DELETE /api/v1/performance/:id
  Response: { success: true }
  Status: 200 OK
\`\`\`

### Subject Endpoints

\`\`\`
GET /api/v1/subjects
  Response: { subjects: Subject[] }
  Status: 200 OK

POST /api/v1/subjects
  Request: { name, category, difficultyLevel, targetGrade?, colorTheme }
  Response: { subject }
  Status: 201 Created

GET /api/v1/subjects/:id
  Response: { subject, stats }
  Status: 200 OK

PUT /api/v1/subjects/:id
  Request: { name?, category?, difficultyLevel?, targetGrade?, colorTheme? }
  Response: { subject }
  Status: 200 OK

DELETE /api/v1/subjects/:id
  Response: { success: true }
  Status: 200 OK
\`\`\`

### Analytics Endpoints

\`\`\`
GET /api/v1/analytics/dashboard
  Response: { stats: DashboardStats }
  Status: 200 OK

GET /api/v1/analytics/time-analysis
  Query: { startDate?, endDate? }
  Response: { analysis: TimeAnalysis }
  Status: 200 OK

GET /api/v1/analytics/performance-trends
  Query: { subjectId?, startDate?, endDate? }
  Response: { trends: PerformanceAnalysis }
  Status: 200 OK

GET /api/v1/analytics/correlations
  Query: { metric1, metric2 }
  Response: { correlation: number, confidence: number }
  Status: 200 OK
\`\`\`

### Recommendations Endpoints

\`\`\`
GET /api/v1/recommendations/daily
  Response: { recommendations: Recommendation[] }
  Status: 200 OK

GET /api/v1/recommendations/insights
  Response: { insights: UserInsight[] }
  Status: 200 OK

POST /api/v1/recommendations/insights/:id/read
  Response: { success: true }
  Status: 200 OK
\`\`\`

### User Endpoints

\`\`\`
GET /api/v1/users/profile
  Response: { user }
  Status: 200 OK

PUT /api/v1/users/profile
  Request: { name?, educationLevel?, primaryGoal?, preferredStudyStyle? }
  Response: { user }
  Status: 200 OK

GET /api/v1/users/preferences
  Response: { preferences }
  Status: 200 OK

PUT /api/v1/users/preferences
  Request: { theme?, timeFormat?, timezone?, ... }
  Response: { preferences }
  Status: 200 OK

POST /api/v1/users/export-data
  Response: { downloadUrl }
  Status: 200 OK

POST /api/v1/users/import-data
  Request: { file }
  Response: { success: true, imported: number }
  Status: 200 OK
\`\`\`

---

## Frontend Architecture

### Directory Structure

\`\`\`
app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Home/landing
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── layout.tsx             # Dashboard layout with nav
│   ├── page.tsx               # Main dashboard
│   ├── sessions/
│   │   ├── page.tsx           # Sessions list
│   │   ├── [id]/page.tsx      # Session detail
│   │   └── new/page.tsx       # New session
│   ├── performance/
│   │   ├── page.tsx           # Performance list
│   │   ├── [id]/page.tsx      # Performance detail
│   │   └── new/page.tsx       # New performance entry
│   ├── subjects/
│   │   ├── page.tsx           # Subjects list
│   │   ├── [id]/page.tsx      # Subject detail
│   │   └── new/page.tsx       # New subject
│   ├── analytics/
│   │   ├── page.tsx           # Analytics dashboard
│   │   ├── time-analysis/page.tsx
│   │   └── performance-trends/page.tsx
│   ├── calendar/page.tsx
│   ├── reports/page.tsx
│   └── settings/page.tsx
├── api/
│   └── v1/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── refresh/route.ts
│       ├── sessions/
│       │   ├── route.ts        # GET, POST
│       │   └── [id]/route.ts   # GET, PUT, DELETE
│       ├── performance/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   └── analytics/route.ts
│       ├── subjects/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── analytics/
│       │   ├── dashboard/route.ts
│       │   ├── time-analysis/route.ts
│       │   └── performance-trends/route.ts
│       ├── recommendations/
│       │   ├── daily/route.ts
│       │   └── insights/route.ts
│       └── users/
│           ├── profile/route.ts
│           └── preferences/route.ts
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── dashboard/
│   │   ├── dashboard-overview.tsx
│   │   ├── weekly-chart.tsx
│   │   ├── performance-highlights.tsx
│   │   └── activity-feed.tsx
│   ├── sessions/
│   │   ├── session-timer.tsx
│   │   ├── session-form.tsx
│   │   ├── session-list.tsx
│   │   └── session-detail.tsx
│   ├── performance/
│   │   ├── performance-form.tsx
│   │   ├── performance-list.tsx
│   │   └── performance-chart.tsx
│   ├── analytics/
│   │   ├── time-heatmap.tsx
│   │   ├── subject-performance-matrix.tsx
│   │   ├── method-effectiveness.tsx
│   │   └── focus-quality-chart.tsx
│   ├── recommendations/
│   │   ├── recommendation-card.tsx
│   │   ├── insight-card.tsx
│   │   └── daily-plan.tsx
│   └── common/
│       ├── loading-spinner.tsx
│       ├── error-boundary.tsx
│       └── empty-state.tsx
├── hooks/
│   ├── use-sessions.ts
│   ├── use-performance.ts
│   ├── use-analytics.ts
│   ├── use-recommendations.ts
│   ├── use-auth.ts
│   └── use-user.ts
├── lib/
│   ├── api-client.ts          # API request utilities
│   ├── auth.ts                # Auth utilities
│   ├── validators.ts          # Zod schemas
│   ├── utils.ts               # General utilities
│   └── constants.ts           # App constants
├── types/
│   ├── index.ts               # All TypeScript types
│   ├── api.ts                 # API response types
│   └── models.ts              # Data model types
├── styles/
│   └── globals.css
└── middleware.ts              # Auth middleware
\`\`\`

### Key Components

**Dashboard Overview Component**
- Displays today's summary, weekly overview, performance highlights
- Real-time updates using SWR
- Responsive grid layout

**Session Timer Component**
- Large, readable timer display
- Play/pause/stop controls
- Focus check-in prompts
- Break reminders

**Analytics Dashboard**
- Multiple chart types (line, bar, heatmap)
- Responsive design
- Interactive filters
- Export functionality

**Recommendation Engine UI**
- Daily study plan display
- Insight cards with confidence levels
- Alert notifications
- Actionable suggestions

### State Management

**Client-Side State (SWR + React Context)**
\`\`\`typescript
// Hooks for data fetching and caching
const { data: sessions, mutate: mutateSessions } = useSessions();
const { data: performance, mutate: mutatePerformance } = usePerformance();
const { data: analytics, mutate: mutateAnalytics } = useAnalytics();

// Context for global state
const { user, isLoading, error } = useAuth();
const { preferences, updatePreferences } = useUserPreferences();
\`\`\`

**Server-Side State (Next.js Server Components)**
- Fetch initial data in server components
- Pass data to client components
- Use Server Actions for mutations

---

## Security Implementation

### Authentication & Authorization

**JWT-Based Authentication**
\`\`\`typescript
// Token structure
{
  sub: userId,
  email: userEmail,
  iat: issuedAt,
  exp: expiresAt,
  type: 'access' | 'refresh'
}
\`\`\`

**Session Management**
- Access tokens: 15 minutes expiration
- Refresh tokens: 7 days expiration
- Secure HTTP-only cookies for refresh tokens
- Token rotation on refresh

**Authorization Levels**
\`\`\`typescript
enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

// Middleware for role-based access
function requireAuth(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
\`\`\`

### Data Protection

**Encryption**
- Passwords: bcrypt with salt rounds 12
- Sensitive data: AES-256 encryption at rest
- TLS 1.3 for data in transit

**Data Validation**
\`\`\`typescript
// Zod schemas for input validation
const createSessionSchema = z.object({
  subjectId: z.string().uuid(),
  studyMethod: z.enum(['reading', 'practice', 'video', 'notes', 'flashcards', 'group', 'other']),
  targetDuration: z.number().int().positive().optional(),
  sessionGoal: z.string().max(500).optional(),
  location: z.string().max(100).optional()
});

// Validate before processing
const validatedData = createSessionSchema.parse(req.body);
\`\`\`

### API Security

**Rate Limiting**
\`\`\`typescript
// Rate limit: 100 requests per 15 minutes per user
const rateLimit = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user.id
};
\`\`\`

**CORS Configuration**
\`\`\`typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
\`\`\`

**Security Headers**
\`\`\`typescript
// Helmet.js configuration
{
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}
\`\`\`

### Database Security

**Row-Level Security (RLS)**
\`\`\`sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_isolation ON study_sessions
  FOR SELECT USING (user_id = current_user_id());

CREATE POLICY user_isolation ON performance_entries
  FOR SELECT USING (user_id = current_user_id());
\`\`\`

**SQL Injection Prevention**
- Use parameterized queries (Prisma ORM)
- Never concatenate user input into SQL
- Validate and sanitize all inputs

### Audit & Logging

**Audit Trail**
\`\`\`typescript
// Log all important actions
async function logAudit(userId, action, resourceType, resourceId, changes) {
  await db.auditLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      changes,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      createdAt: new Date()
    }
  });
}
\`\`\`

**Error Handling**
- Never expose sensitive information in error messages
- Log errors server-side for debugging
- Return generic error messages to clients

---

## Scalability & Performance

### Caching Strategy

**Multi-Level Caching**

1. **Browser Cache** (Client-side)
   - Static assets: 1 year
   - API responses: 5 minutes (SWR)

2. **CDN Cache** (Vercel Edge)
   - Static pages: 1 hour
   - API responses: 5 minutes

3. **Redis Cache** (Server-side)
   - User preferences: 24 hours
   - Analytics data: 1 hour
   - Recommendations: 30 minutes

\`\`\`typescript
// Redis caching example
async function getDashboardStats(userId) {
  const cacheKey = `dashboard:${userId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Compute if not cached
  const stats = await computeDashboardStats(userId);
  
  // Store in cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(stats));
  
  return stats;
}
\`\`\`

### Database Optimization

**Query Optimization**
- Use indexes on frequently queried columns
- Implement pagination for large datasets
- Use database views for complex queries
- Denormalize when necessary for read performance

**Connection Pooling**
\`\`\`typescript
// Prisma connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `${process.env.DATABASE_URL}?schema=public&connection_limit=10`
    }
  }
});
\`\`\`

### Frontend Performance

**Code Splitting**
- Route-based code splitting (Next.js automatic)
- Component-level lazy loading
- Dynamic imports for heavy components

\`\`\`typescript
// Lazy load analytics components
const TimeHeatmap = dynamic(() => import('@/components/analytics/time-heatmap'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
\`\`\`

**Image Optimization**
- Use Next.js Image component
- Responsive images with srcset
- WebP format with fallbacks

**Bundle Size Optimization**
- Tree shaking unused code
- Minification and compression
- Remove unused dependencies

### Horizontal Scaling

**Stateless Architecture**
- No session state on servers
- Use Redis for distributed sessions
- Load balance across multiple instances

**Database Replication**
- Read replicas for analytics queries
- Write to primary, read from replicas
- Automatic failover

**Async Processing**
\`\`\`typescript
// Use job queue for heavy operations
import Bull from 'bull';

const analyticsQueue = new Bull('analytics', {
  redis: { host: process.env.REDIS_HOST }
});

// Queue job
analyticsQueue.add({ userId }, { delay: 1000 });

// Process job
analyticsQueue.process(async (job) => {
  const { userId } = job.data;
  await generateAnalyticsReport(userId);
});
\`\`\`

---

## Deployment Architecture

### Infrastructure

**Vercel Deployment**
\`\`\`
┌─────────────────────────────────────┐
│     Vercel Edge Network (CDN)       │
│  - Static asset caching             │
│  - Global distribution              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Vercel Serverless Functions       │
│  - Next.js Route Handlers           │
│  - Server Actions                   │
│  - Automatic scaling                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   PostgreSQL Database               │
│  - Neon or Supabase                 │
│  - Automated backups                │
│  - Read replicas                    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Redis Cache                       │
│  - Upstash Redis                    │
│  - Distributed caching              │
└─────────────────────────────────────┘
\`\`\`

### Environment Configuration

\`\`\`env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://host:port

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com

# API
API_BASE_URL=https://yourdomain.com/api/v1

# Monitoring
SENTRY_DSN=https://key@sentry.io/project-id
\`\`\`

### CI/CD Pipeline

**GitHub Actions Workflow**
\`\`\`yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
\`\`\`

### Monitoring & Observability

**Key Metrics**
- API response times
- Database query performance
- Error rates and types
- User engagement metrics
- Resource utilization

**Logging**
\`\`\`typescript
// Structured logging
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info('Session created', { userId, sessionId, duration });
logger.error('Database error', { error: err.message, query });
\`\`\`

---

## Summary

This architecture provides:

✓ **Scalability**: Horizontal scaling with stateless services
✓ **Security**: Multi-layer security with encryption and validation
✓ **Performance**: Caching, indexing, and optimization
✓ **Maintainability**: Clear separation of concerns and modular design
✓ **Reliability**: Error handling, logging, and monitoring
✓ **User Experience**: Real-time updates and responsive UI

The system is designed to handle thousands of concurrent users while maintaining data integrity and security.
