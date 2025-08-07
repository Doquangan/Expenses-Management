
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
### Backend
1. Go to the `backend` folder
2. Install packages:
   ```bash
   npm install
   ```
3. Create a `.env` file and set environment variables (for example: MongoDB connection, JWT_SECRET, ...)
4. Start the server:
   ```bash
   npm start
   ```

### Frontend
1. Go to the `frontend` folder
2. Install packages:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```

## Main APIs
- `/api/expenses` CRUD expenses
- `/api/categories` CRUD categories
- `/api/limits` Set/get limits
- `/api/dashboard/limit-warnings` Limit warnings
- `/api/ai/saving-suggestion` Saving suggestions

## API Documentation
After starting the backend server, you can access the Swagger API documentation at:
`http://localhost:3000/api-docs`

## Contribution
All contributions, bug reports, or new ideas are welcome via Issues or Pull Requests on Github.

## Author
- Doquangan