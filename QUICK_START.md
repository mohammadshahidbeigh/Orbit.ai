# Quick Start Guide - Fix Import Errors

## The Problem

You're seeing errors like:
```
Failed to resolve import "axios"
Failed to resolve import "clsx"
Failed to resolve import "@tanstack/react-query"
```

This happens because **Node.js dependencies haven't been installed yet**.

## Solution (3 simple steps)

### Step 1: Install Frontend Dependencies

Open your terminal and run:

```bash
cd frontend/orbit
npm install
```

Wait for it to complete (takes 1-2 minutes).

### Step 2: Set Up Backend Database

In your MySQL, create the database:

```sql
CREATE DATABASE application_planner;
```

### Step 3: Install Backend Dependencies

In a new terminal:

```bash
cd backend
npm install
```

## Then Run the Application

### Start Backend (Terminal 1)

```bash
cd backend

# Create .env file (copy from env.template.txt)
# Edit .env with your MySQL password

# Seed the database
npm run seed

# Start the server
npm run dev
```

### Start Frontend (Terminal 2)

```bash
cd frontend/orbit
npm run dev
```

## Environment Files

### Frontend `.env` (create in `frontend/orbit/`):
```
VITE_API_URL=http://localhost:5000
```

### Backend `.env` (create in `backend/`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=application_planner
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## What You'll Get

After running `npm install` in both directories:
- ✅ All missing imports will be resolved
- ✅ Vite will start properly
- ✅ React app will load with Dashboard
- ✅ Navigation will work between pages

## Troubleshooting

**If `npm install` fails:**
- Make sure you have Node.js 18+ installed
- Try clearing cache: `npm cache clean --force`
- Then retry: `npm install`

**If you see MySQL errors:**
- Make sure MySQL server is running
- Check your DB_USER and DB_PASSWORD in .env
- Test connection: `mysql -u root -p`

**Port already in use:**
- Frontend: Change Vite port in `vite.config.ts`
- Backend: Change PORT in `.env`

## Once Running

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Backend Health Check: http://localhost:5000/health

Enjoy building! 🚀

