import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

import { useNavigate } from 'react-router-dom';

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
        <h3>Expense Management</h3>
        {user && (
          <div style={{ marginBottom: 16, fontWeight: 600, color: '#1760b0' }}>
            Hello, {user.name}!
          </div>
        )}
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/expenses" className={({ isActive }) => isActive ? 'active' : ''}>Manage Expense</NavLink>
          <NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''}>Manage Category</NavLink>
          <NavLink to="/limits" className={({ isActive }) => isActive ? 'active' : ''}>Spending Limit</NavLink>
        </nav>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 18 }}>
        <button className="profile-btn" onClick={handleProfile}>Profile</button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Sidebar;
