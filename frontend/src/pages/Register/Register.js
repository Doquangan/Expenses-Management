import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE from '../../config';
import './Register.css';
import { useNotification } from '../../components/Notification';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Đăng ký thành công!', 'success');
        setFormData({ name: '', email: '', password: '' });
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Create account</h2>
        <p className="login-subtitle">Start managing your expenses today</p>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            className="form-input"
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            className="form-input"
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="form-input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
          {error && <p className="login-error">{error}</p>}
        </form>

        <p className="login-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
