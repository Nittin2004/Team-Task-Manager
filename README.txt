TaskFlow - Project Management App
================================

A full-stack project management web application with role-based access control (Admin/Member), task tracking, and a Kanban board interface.

Features
--------

- Authentication - Signup, Login with JWT tokens
- Role-Based Access - Admin can create projects, assign tasks; Members can view and update task status
- Project Management - Create, edit, delete projects with team members
- Task Tracking - Kanban board (To Do / In Progress / Done), priority levels, due dates
- Dashboard - Overview of your assigned tasks, overdue alerts, and recent projects

Tech Stack
----------

- Backend: Node.js, Express.js, MongoDB (Mongoose), JWT
- Frontend: React (Vite), React Router, Axios, Lucide Icons
- Deployment: Railway (backend + frontend served together)

Local Development Setup
-----------------------

1. Clone the repository
   git clone <your-repo-url>
   cd Assign

2. Setup Backend
   cd backend
   npm install

   Create a .env file in the backend/ folder:
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskflow
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development

   Start the backend:
   npm run dev

3. Setup Frontend
   cd frontend
   npm install

   Create a .env file in the frontend/ folder:
   VITE_API_URL=http://localhost:5000/api

   Start the frontend:
   npm run dev

   Open http://localhost:5173 in your browser.

Default Roles
-------------

- The first user to register automatically becomes an Admin
- All subsequent users who register as "Admin" during signup also get Admin role
- Otherwise users get the "Member" role

API Endpoints
-------------

Method | Endpoint                 | Access | Description
-------|--------------------------|--------|--------------------------
POST   | /api/auth/register       | Public | Register new user
POST   | /api/auth/login          | Public | Login
GET    | /api/auth/me             | Auth   | Get current user
GET    | /api/auth/users          | Admin  | Get all users
GET    | /api/projects            | Auth   | List projects
POST   | /api/projects            | Admin  | Create project
GET    | /api/projects/:id        | Auth   | Get project
PUT    | /api/projects/:id        | Admin  | Update project
DELETE | /api/projects/:id        | Admin  | Delete project
GET    | /api/tasks               | Auth   | My tasks (dashboard)
GET    | /api/tasks/project/:id   | Auth   | Project tasks
POST   | /api/tasks/project/:id   | Admin  | Create task
PUT    | /api/tasks/:id           | Auth   | Update task
DELETE | /api/tasks/:id           | Admin  | Delete task

Deployment on Railway
---------------------

Step 1 - Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main

Step 2 - Set up MongoDB Atlas
1. Go to MongoDB Atlas (https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user and get your connection string

Step 3 - Deploy on Railway
1. Go to Railway (https://railway.app)
2. Click New Project -> Deploy from GitHub repo
3. Select your repository
4. Add environment variables in Railway dashboard:
   - MONGO_URI = your MongoDB Atlas connection string
   - JWT_SECRET = a long random string
   - NODE_ENV = production
   - PORT = 5000
5. Set the Root Directory to / and Start Command to:
   npm run build && npm start

The backend serves the built frontend in production mode.

Project Structure
-----------------

Assign/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── vite.config.js
├── package.json
└── README.md
