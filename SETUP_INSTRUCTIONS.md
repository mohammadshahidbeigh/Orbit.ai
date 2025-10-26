# Setup Instructions

## Important: You need to install dependencies first!

The project requires Node.js dependencies to be installed before running.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend/orbit
```

2. Install all dependencies:
```bash
npm install
```

This will install all required packages including:
- React and React DOM
- React Router for navigation
- React Query (TanStack Query) for API calls
- Axios for HTTP requests
- Tailwind CSS and related packages
- Recharts for charts
- dnd-kit for drag and drop
- And many more...

3. Create `.env` file:
Create a file named `.env` in `frontend/orbit/` with:
```
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install all dependencies:
```bash
npm install
```

3. Create `.env` file:
Create a file named `.env` in `backend/` with:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=application_planner
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Make sure MySQL is running and create the database:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS application_planner;"
```

5. Seed the database:
```bash
npm run seed
```

6. Start the backend server:
```bash
npm run dev
```

## What's the Issue?

The error shows that Node.js dependencies haven't been installed yet. When you see errors like:
- "Failed to resolve import 'axios'"
- "Failed to resolve import 'clsx'"
- "Failed to resolve import '@tanstack/react-query'"

This means the `node_modules` folder doesn't exist or is incomplete. Running `npm install` will download and install all the required packages listed in `package.json`.

