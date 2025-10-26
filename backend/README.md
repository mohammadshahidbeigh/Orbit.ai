# Application Planner Backend

Backend API for the Enhanced Application Planner built for Orbit AI.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Runtime**: JavaScript (ES Modules)

## Features

- RESTful API endpoints for universities, user universities, tasks, and dashboard stats
- Auto-generation of application tasks when a university is added
- University comparison with rankings and peer insights
- Task management with Kanban and Gantt views
- Progress tracking and deadline monitoring

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MySQL server
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=application_planner
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

3. Initialize and seed the database:
```bash
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Universities
- `GET /api/universities` - List all universities (with optional search, ranking, and country filters)
- `GET /api/universities/:id` - Get single university details
- `GET /api/universities/compare?ids=1,2,3` - Get comparison data for multiple universities
- `GET /api/universities/:id/peer-stats` - Get peer insights for a university

### User Universities
- `GET /api/user-universities` - Get user's selected universities
- `POST /api/user-universities` - Add university to user's list (auto-generates tasks)
- `PUT /api/user-universities/:id` - Update deadline/program type
- `DELETE /api/user-universities/:id` - Remove university

### Tasks
- `GET /api/tasks` - Get all tasks (optional filter by university_id)
- `GET /api/tasks/kanban` - Get tasks grouped by status for Kanban view
- `GET /api/tasks/timeline` - Get tasks for Gantt timeline view
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Dashboard
- `GET /api/dashboard/stats` - Get overview statistics (schools, tasks, progress, next deadline)

## Database Schema

See `config/db.js` for table structures:
- `universities` - University data with rankings
- `user_universities` - User's selected universities with deadlines
- `tasks` - Application tasks organized by phase
- `peer_stats` - Aggregated peer progress data

## Demo User

The API uses a demo user ID (`demo-user`) for all operations. In a production environment, implement proper authentication.

## Deployment

The backend is designed to be deployed on platforms like Render or Railway:
- Set up a MySQL database instance
- Configure environment variables
- Deploy and connect to database
- Set CORS to allow requests from frontend domain

