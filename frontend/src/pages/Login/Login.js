import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { useNotification } from '../../components/Notification';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { showNotification } = useNotification();
  
  // Xử lý nhận token từ Google/Facebook OAuth callback
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
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <div style={{ margin: '16px 0', textAlign: 'center' }}>
        <span>Or</span>
        <br />
        <a href="http://localhost:3000/api/auth/google">
          <button type="button" style={{ marginTop: 8, background: '#4285F4', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
            Login with Google
          </button>
        </a>
        <br />
        <a href="http://localhost:3000/api/auth/facebook">
          <button type="button" style={{ marginTop: 8, background: '#4267B2', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
            Login with Facebook
          </button>
        </a>
      </div>
      <p style={{ marginTop: '16px' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;
