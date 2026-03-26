import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { useNotification } from '../../components/Notification';
import { GoogleIcon, FacebookIcon } from '../../components/Icons';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const provider = urlParams.get('provider');
    if (token) {
      localStorage.setItem('token', token);
      showNotification(`Đăng nhập ${provider === 'facebook' ? 'Facebook' : 'Google'} thành công!`, 'success');
      navigate('/dashboard');
    }
  }, [navigate, showNotification]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        showNotification('Đăng nhập thành công!', 'success');
        navigate('/dashboard');
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome back</h2>
        <p className="login-subtitle">Sign in to manage your expenses</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Sign in</button>
          {error && <p className="login-error">{error}</p>}
        </form>

        <div className="login-divider">or continue with</div>

        <div className="social-buttons">
          <a href="http://localhost:3000/api/auth/google" className="btn-social">
            <GoogleIcon size={18} /> Continue with Google
          </a>
          <a href="http://localhost:3000/api/auth/facebook" className="btn-social">
            <FacebookIcon size={18} /> Continue with Facebook
          </a>
        </div>

        <p className="login-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
