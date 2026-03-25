<h1 align="center">
Smart Personal Expense Management
</h1>

<p align="center">
  A full-stack financial tracking system enhanced with <strong>Google Gemini AI</strong> to provide intelligent saving suggestions and an interactive financial chatbot.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Gemini_AI-1A73E8?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</p>

---

## Project Overview

This is not just a standard CRUD expense tracker. It is a comprehensive financial application that helps users monitor their spending, set goals, and gain actionable insights. The integration of **Google Gemini's LLM** elevates the user experience by delivering a conversational interface to query spending habits and receive personalized financial advice.

## Key Features

### AI Financial Assistant (Powered by Gemini)
- **Smart Saving Suggestions**: Analyzes the user's monthly spending and limits to generate proactive, rule-based alerts and customized saving tips.
- **Context-Aware Chatbot**: Chat directly with your data. The AI assistant knows your real-time expenses, recent transactions, and budgets, functioning as a 24/7 personal financial advisor (History persisted in MongoDB).

### Secure Authentication
- Local Authentication with JWT (JSON Web Tokens).
- **OAuth 2.0 Integration**: Social login through Google and Facebook.
- Middleware protection to secure all API endpoints.

### Expense & Budget Management
- **Transactions Management**: Full CRUD operations for daily expenses and incomes.
- **Categorization**: Group spending into customizable categories.
- **Limits & Budgets**: Set spending limits per category or globally. The system proactively alerts users before they exceed predefined budgets.

### Interactive Dashboard
- Clean, modern UI to visualize spending behavior.
- Real-time pie and bar charts reflecting monthly and categorical data.
- Alerts and summary cards for immediate financial awareness.

---

## Architecture & Tech Stack

The system follows a modern decoupled architecture:

*   **Frontend**: Built with **React.js**, fully responsive CSS, utilizing hooks for state management.
*   **Backend**: A RESTful API driven by **Node.js** and **Express.js**. Organized following the MVC (Model-View-Controller) design pattern.
*   **Database**: **MongoDB** (with Mongoose ODM) for flexible schema design and fast queries.
*   **AI Integration**: `@google/genai` (Gemini 2.5 Flash SDK) customized with exact system prompts and injected contexts.
*   **DevOps**: Fully **Dockerized** (Docker Compose) for a seamless "one-click" developer experience across any OS. Containerized MongoDB storage.



---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- A Google Cloud Platform (GCP) Account for Gemini API Key.
- Google / Facebook OAuth credentials (Optional, for social auth).

### 1. Simple Setup (Using Docker)

The fastest way to get everything running locally:

1. Copy `.env.example` (if available) to `.env` inside the `/backend` folder.
2. Provide your secrets, specifically `GEMINI_API_KEY` and `JWT_SECRET`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_super_secret_key
   ```
3. Boot up the containers from the project root:
   ```bash
   docker-compose up -d --build
   ```
   *The backend will be available at `http://localhost:3000` and MongoDB will be bound to port `27017`.*

### 2. Run the Frontend

The React frontend runs separately in development mode:

```bash
cd frontend
npm install
npm start
```
*The React app will open automatically at `http://localhost:3001`.*

---

## API Documentation

The backend includes a fully documented **Swagger UI** to easily test endpoints and view the expected JSON schemas.

After starting the standard Docker containers, browse to:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

---

## Contact & Author

Created and maintained by **Doquangan**.

*Interested in my work or looking to collaborate? Let's connect!*