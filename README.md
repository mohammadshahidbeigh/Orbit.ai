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

### 1. University Comparison Tool (NEW)
- **Feature**: Side-by-side comparison of selected universities
- **Columns**: Name, World Ranking, Application Deadline, Program Type, Tasks Remaining, Days Left
- **Sorting**: By ranking, deadline, tasks remaining, or program type
- **Visual Indicators**: Color-coded urgency (red for urgent <7 days, yellow for <14 days)
- **Task Breakdown**: Show tasks by phase (Research, Essays, Recommendations, etc.)
- **Value**: Helps students make data-driven decisions by comparing workload and priorities

### 2. Peer Comparison Insights (NEW)
- **Feature**: Anonymized progress benchmarks from fellow applicants
- **Metrics Displayed**:
  - Average progress percentage per university
  - Average tasks completed
  - Average submission time before deadline
  - Sample size for credibility
- **Visualization**: Progress bars and charts using Recharts
- **Integration**: Embedded in comparison view and individual university cards
- **Value**: Provides motivation and realistic expectations for students

### 3. Enhanced UI/UX
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
- **Components**: Custom UI components inspired by shadcn
- **State Management**: React Query (TanStack Query) + Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Drag & Drop**: dnd-kit
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL
- **Architecture**: RESTful API with proper separation of concerns
- **Deployment**: Render/Railway ready

### Deployment
- **Frontend**: Vercel
- **Backend**: Render/Railway
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

- `universities`: 30 top-ranked universities with rankings, country, website
- `user_universities`: User's selected schools with deadlines and program types
- `tasks`: Application tasks organized by 7 phases
- `peer_stats`: Aggregated peer progress data for insights

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

## Improvements Over Original

1. **University rankings** in comparison view (world rankings)
2. **Peer insights** to show how other applicants are progressing
3. **Better UX** with loading states, error handling, and form validation
4. **Export capabilities** for better external integration
5. **Responsive design** for mobile users
6. **Cleaner, modern UI** with Tailwind CSS

## Demo Data

The database is seeded with:
- **30 top-ranked universities** (MIT, Stanford, Harvard, etc.)
- **Realistic peer statistics** for each university
- **Sample tasks** auto-generated based on deadlines

## Future Enhancements (Not Implemented)

- User authentication and profile management
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

