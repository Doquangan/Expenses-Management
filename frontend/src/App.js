import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Expense from './pages/Expense/Expense';
import Category from './pages/Category/Category';
import Profile from './pages/Profile/Profile';
import { NotificationProvider } from './components/Notification';
import Limit from './pages/Limit/Limit';
import ChatbotPage from './pages/Chatbot/ChatbotPage';
import CalendarPage from './pages/Calendar/CalendarPage';

import Layout from './components/Layout';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes wrapped in persistent Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expense />} />
            <Route path="/categories" element={<Category />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/limits" element={<Limit />} />
            <Route path="/chat" element={<ChatbotPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
