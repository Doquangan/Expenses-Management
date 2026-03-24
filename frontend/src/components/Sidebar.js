import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { DashboardIcon, WalletIcon, TagIcon, TargetIcon, ChatIcon, UserIcon, LogoutIcon } from './Icons';

function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:3000/api/users/me', {
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

  return (
    <div className="sidebar">
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
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <DashboardIcon size={18} /> Dashboard
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => isActive ? 'active' : ''}>
            <WalletIcon size={18} /> Expenses
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''}>
            <TagIcon size={18} /> Categories
          </NavLink>
          <NavLink to="/limits" className={({ isActive }) => isActive ? 'active' : ''}>
            <TargetIcon size={18} /> Limits
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''}>
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
  );
}

export default Sidebar;
