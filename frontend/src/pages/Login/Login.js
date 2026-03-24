import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { useNotification } from '../../components/Notification';
import { GoogleIcon, FacebookIcon } from '../../components/Icons';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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
          <input
            className="form-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
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
