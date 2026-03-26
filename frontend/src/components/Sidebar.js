import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { DashboardIcon, WalletIcon, TagIcon, TargetIcon, ChatIcon, UserIcon, LogoutIcon, CalendarIcon } from './Icons';
import API_BASE from '../config';

function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUser(data);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button className="sidebar-hamburger" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <WalletIcon size={18} color="#fff" />
            </div>
            <h3>ExpenseTracker</h3>
          </div>
          {user && (
            <div className="sidebar-user">
              Hello, {user.name}!
            </div>
          )}
          <nav>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
              <DashboardIcon size={18} /> Dashboard
            </NavLink>
            <NavLink to="/expenses" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
              <WalletIcon size={18} /> Expenses
            </NavLink>
            <NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
              <TagIcon size={18} /> Categories
            </NavLink>
            <NavLink to="/limits" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
              <TargetIcon size={18} /> Limits
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
              <CalendarIcon size={18} /> Calendar
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
              <ChatIcon size={18} /> AI Assistant
            </NavLink>
          </nav>
        </div>
        <div className="sidebar-footer">
          <button className="btn btn-ghost" onClick={handleProfile}>
            <UserIcon size={16} /> Profile
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            <LogoutIcon size={16} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
