
# Personal Expense Management System

## Introduction
This is a personal expense management project. It helps users control their spending, set limits, receive warnings, and get smart saving suggestions. The system includes a backend (Node.js/Express/MongoDB) and a frontend (React).

## Main Features
- Register, login, JWT authentication
- Manage expense categories, expenses, and limits
- Set spending limits for each category and for the whole month
- Warning when spending is close to or over the limit
- Smart saving suggestions (rule-based AI)
- Dashboard with pie and bar charts
- Modern and easy-to-use interface

## Project Structure
```
backend/
  src/
    controllers/    // API logic
    models/         // MongoDB data models
    routes/         // API routes
    middlewares/    // Authentication, API protection
    config/         // Database connection
frontend/
  src/
    pages/          // Main pages: Dashboard, Category, Expense, Limit, Login, Register, Profile
    components/     // Sidebar, Notification, ...
```

## Installation Guide
### Backend (using Docker)
The backend and the MongoDB database are containerized for easy setup.
1. Make sure you have **Docker** and **Docker Compose** installed.
2. In the `backend` folder, create a `.env` file and set the required environment variables (e.g. `JWT_SECRET`, `GOOGLE_CLIENT_ID`, etc.). Note that MongoDB connection is automatically overridden in Docker to point to the local container.
3. In the root directory of the project, run:
   ```bash
   docker-compose up -d --build
   ```
   This will start both the MongoDB database (on port 27017) and the Node.js backend (on port 3000). To view logs, run `docker-compose logs -f backend`.

### Frontend (Local Development)
1. Go to the `frontend` folder
2. Install packages:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```

## Local Database Connection (TablePlus)
If you want to connect to the local MongoDB instance using tools like TablePlus, use the following details:
- **Host**: `localhost`
- **Port**: `27017`
- **Authentication**: None (by default)

## Main APIs
- `/api/expenses` CRUD expenses
- `/api/categories` CRUD categories
- `/api/limits` Set/get limits
- `/api/dashboard/limit-warnings` Limit warnings
- `/api/ai/saving-suggestion` Saving suggestions

## API Documentation
After starting the backend server (via Docker or locally), you can access the Swagger API documentation at:
`http://localhost:3000/api-docs`

## Contribution
All contributions, bug reports, or new ideas are welcome via Issues or Pull Requests on Github.

## Author
- Doquangan