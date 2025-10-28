# Enhanced Application Planner - Orbit AI

An enhanced version of Orbit AI's Application Planner with intelligent university comparison and peer insights features.

## Product Choice & Rationale

**I chose to build the Application Planner** for the following strategic reasons:

1. **Differentiation from typical implementations**: Most candidates would likely choose AI-heavy products like Right Fit Matcher, Solvi, or Essay Editor, which require complex algorithms. The Application Planner is UX-focused, allowing me to demonstrate product thinking and user experience design.

2. **Rapid MVP with significant value**: Within the 24-hour constraint, I can deliver a working, enhanced product rather than a partial AI implementation.

3. **Identified enhancement opportunities**: After analyzing the existing Application Planner, I identified two key areas for improvement:
   - **University Comparison Tool**: Side-by-side analysis with rankings, deadlines, and workload comparison
   - **Peer Comparison Insights**: Social benchmarking with anonymized progress data to motivate students

4. **Production-ready scope**: The feature set is complete, deployable, and demonstrates full-stack capabilities without compromising quality.

## Enhancements Made

### 1. Intelligent University Matching Algorithm (NEW)
- **Algorithm**: Weighted Sum Model (WSM) + Softmax Probability Transformation
- **Purpose**: Matches students to universities based on profile compatibility
- **How It Works**:
  1. **Input**: Student assessment (GMAT, GPA, work experience, preferences, budget, location)
  2. **Process**:
     - Evaluates all universities in database against 9 criteria
     - Calculates similarity scores for each criterion (GMAT match, GPA compatibility, work experience fit, program alignment, university ranking, acceptance probability, cost fit, scholarship opportunities, location preference)
     - Applies user-defined weights to each criterion (default: GMAT 25%, GPA 20%, Program 15%, Work 10%, Rank 10%, Acceptance 5%, Cost 5%, Scholarship 5%, Location 5%)
     - Computes weighted sum score for each university
     - Converts scores to probabilities using Softmax with temperature parameter (0.1 for sharp distribution)
  3. **Output**: Top 5 university recommendations ranked by match score with detailed breakdown

- **Key Features**:
  - **Dynamic Weighting**: Users can adjust priority weights to personalize results
  - **Normalization**: All metrics scaled to [0,1] for fair comparison
  - **Probability Scoring**: Uses Softmax to convert raw scores into admission probability estimates
  - **Robust Handling**: Gracefully handles missing data with default values

- **Value**: Provides data-driven, personalized university recommendations based on proven multi-criteria decision-making techniques used by major tech companies

### 2. University Comparison Tool (NEW)
- **Feature**: Side-by-side comparison of selected universities
- **Columns**: Name, World Ranking, Application Deadline, Program Type, Tasks Remaining, Days Left, Assessment Score
- **Sorting**: By ranking, deadline, tasks remaining, assessment score, or program type
- **Visual Indicators**: Color-coded urgency (red for urgent <7 days, yellow for <14 days)
- **Task Breakdown**: Show tasks by phase (Research, Essays, Recommendations, etc.)
- **Assessment Integration**: Displays user's fit score for each university
- **Value**: Helps students make data-driven decisions by comparing workload and priorities with their profile

### 3. Peer Comparison Insights (NEW)
- **Feature**: Anonymized progress benchmarks from fellow applicants
- **Metrics Displayed**:
  - Average progress percentage per university
  - Average tasks completed
  - Average submission time before deadline
  - Sample size for credibility
- **Visualization**: Progress bars and charts using Recharts
- **Integration**: Embedded in comparison view and individual university cards
- **Value**: Provides motivation and realistic expectations for students

### 4. Enhanced UI/UX
- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive**: Mobile, tablet, and desktop support
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation with React Hook Form + Zod
- **Accessibility**: ARIA labels, keyboard navigation

### 4. Dashboard Improvements
- **Quick Stats**: Schools, tasks, progress, and next deadline
- **Task Breakdown**: Visual representation of task status
- **Quick Actions**: Shortcuts to key features
- **Overdue Alerts**: Highlight tasks needing attention

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 
- **State Management**: React Query (TanStack Query) + Context API
- **Routing**: React Router v6
- **Notifications**: React-toastify for notifications
- **Search**: Lodash.debounce for better search
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Architecture**: RESTful API with proper separation of concerns
- **Algorithms Implemented**:
  - **Weighted Sum Model (WSM)**: Multi-criteria decision-making algorithm for university matching
  - **Softmax Transformation**: Converts raw match scores to probability distributions
  - **Similarity Metrics**: Custom scoring functions for 9 evaluation criteria
  - **Dynamic Weighting**: User-customizable priority weights with automatic normalization
- **Deployment**: Render ready

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MySQL server
- npm or yarn

### Frontend Setup

```bash
cd frontend/orbit
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

```bash
.env example

# Backend URL (for CORS)
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Backend Setup

```bash
cd backend
npm install

# Create .env file with your database credentials
cp .env.example .env
# Edit .env with your MySQL credentials

# Initialize and seed database
npm run seed

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

```bash
.env example

SUPABASE_URL=
SUPABASE_ANON_KEY=
PORT=
NODE_ENV=
FRONTEND_URL=

```

## Project Structure

```
Orbit_AI/
├── backend/              # Node.js/Express backend
│   ├── config/          # Database configuration
│   ├── routes/           # API route handlers
│   ├── seed/             # Database seeding scripts
│   └── server.js         # Express server setup
│
└── frontend/
    └── orbit/            # React + Vite frontend
        ├── src/
        │   ├── components/  # React components
        │   ├── context/     # Context providers
        │   ├── lib/         # Utilities and API client
        │   ├── pages/       # Page components
        │   └── App.tsx      # Main app component
        ├── tailwind.config.js
        └── vite.config.ts
```

## Key Features

### Core Application Planner
1. **Manage Schools**: Add universities with deadlines and program types
2. **Task Auto-Generation**: Automatically creates 7 phase-based tasks per university
3. **Kanban Board**: Drag-and-drop task management (To Do, In Progress, Completed)
4. **Gantt Timeline**: Visual calendar view of tasks and deadlines
5. **Dashboard**: Overview of progress, stats, and next deadlines

### New Enhancements
1. **Compare Universities**: Side-by-side comparison with rankings and insights
2. **Peer Insights**: Anonymized progress benchmarks for motivation

## Database Schema

### Core Tables
- `universities`: 20 top-ranked universities with enhanced fields (avg_gmat_score, avg_gpa, acceptance_rate, scholarship_rate, etc.)
- `user_universities`: User's selected schools with deadlines and program types
- `tasks`: Application tasks organized by 7 phases
- `peer_stats`: Aggregated peer progress data for insights

### Assessment System Tables
- `user_assessments`: Stores student assessment data (GMAT, GPA, work experience, preferences, weights)
- `university_recommendations`: Caches recommendation results with match scores, probabilities, and breakdowns

### Key Design Decisions
- **Enhanced University Schema**: Added fields needed for matching algorithm (GMAT ranges, acceptance rates, costs)
- **Assessment Caching**: Recommendations are stored to avoid re-computation
- **Breakdown Storage**: Detailed criterion scores stored as JSONB for explainability

## API Documentation

See `backend/README.md` for complete API endpoint documentation.

## Deployment

### Frontend (Vercel)
- Connect GitHub repository
- Set build command: `cd frontend/orbit && npm install && npm run build`
- Set output directory: `frontend/orbit/dist`
- Configure environment variable: `VITE_API_URL`

### Backend (Render/Railway)
- Connect GitHub repository
- Add MySQL database instance - Supabase
- Configure environment variables
- Set build command: `cd backend && npm install && npm start`
- Set start command: `cd backend && npm start`

## Technical Implementation

### Matching Algorithm Details

The university matching system uses industry-standard algorithms for multi-criteria decision-making:

#### 1. Weighted Sum Model (WSM)
The WSM computes a final score for each university by:

```
Score = Σ(weight_i × metric_i) / Σ(weight_i)
```

Where:
- `weight_i` is the user-defined priority for criterion `i`
- `metric_i` is the similarity score (0-1) for criterion `i`
- The denominator normalizes the score to [0,1]

#### 2. Similarity Metrics
Each criterion uses a specialized similarity function:

- **GMAT/GPA Match**: `1 - |student_score - university_avg| / max_range`
- **Program Alignment**: Binary match for exact program type + field
- **Work Experience**: Ratio of student years to university preferred years (capped at 1.0)
- **Ranking Score**: `(max_rank - university_rank) / (max_rank - 1)`
- **Cost Fit**: `1 - max(0, tuition - budget) / max_tuition`
- **Location**: Binary for exact country match, 0.7 for region match, 0.3 otherwise

#### 3. Softmax Probability
Converts raw scores into probability distribution:

```
P(i) = exp(score_i / temperature) / Σ exp(score_j / temperature)
```

Temperature parameter (0.1) creates sharp distribution, highlighting top matches.

#### 4. Explainability
For each recommendation, the system shows:
- Top 3 contributing factors (criteria × weights)
- Percentage contribution of each factor
- Overall match score and admission probability

### Architecture Decisions

**Why WSM + Softmax over Machine Learning?**
1. **Interpretability**: Users can see exactly why a university was recommended
2. **Control**: Customizable weights give users agency over recommendations
3. **Speed**: O(n) computation vs. ML training overhead
4. **Transparency**: No black box - each score is explainable

**Why Supabase over pure MySQL?**
1. **Built-in Auth**: Supabase Auth handles user authentication
2. **Real-time**: Automatic updates via Supabase Realtime
3. **Row Level Security**: Data isolation per user
4. **Managed Service**: Less DevOps overhead

## Improvements Over Original

1. **Intelligent matching algorithm** using WSM + Softmax for personalized recommendations
2. **University rankings** in comparison view (world rankings)
3. **Peer insights** to show how other applicants are progressing
4. **Better UX** with loading states, error handling, and form validation
5. **Export capabilities** for better external integration
6. **Responsive design** for mobile users
7. **Cleaner, modern UI** with Tailwind CSS


## Demo Data

The database is seeded with:
- **20 top-ranked universities** (MIT, Stanford, Harvard, etc.)
- **Realistic peer statistics** for each university
- **Sample tasks** auto-generated based on deadlines

## Future Enhancements (Not Implemented)

- User profile management
- Advanced filtering and search
- Dark mode toggle
- Push notifications for deadlines
- Collaborative features (shared applications)
- Integration with external calendars
- AI-powered deadline recommendations

## License

Built for Orbit AI Product Enhancement Challenge.

## Contact

For questions or issues, please reach out.

