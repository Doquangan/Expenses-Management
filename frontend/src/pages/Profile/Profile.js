import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import API_BASE from '../../config';
import './Profile.css';
import { useNotification } from '../../components/Notification';

function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [setPasswordMode, setSetPasswordMode] = useState(false);
  const [newSetPassword, setNewSetPassword] = useState('');
  const { showNotification } = useNotification();

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/users/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newPassword: newSetPassword })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Đặt mật khẩu thành công!', 'success');
        setSetPasswordMode(false);
        setNewSetPassword('');
        window.location.reload();
      } else {
        showNotification(data.message || 'Lỗi đặt mật khẩu', 'error');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      showNotification('Lỗi kết nối đến máy chủ', 'error');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setForm({ name: data.name, email: data.email });
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data);
      setEditMode(false);
      showNotification('Cập nhật thông tin thành công!', 'success');
      window.location.reload();
    } else {
      showNotification(data.message || 'Lỗi cập nhật', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/users/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (res.ok) {
      showNotification('Đổi mật khẩu thành công!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } else {
      showNotification(data.message || 'Lỗi đổi mật khẩu', 'error');
    }
  };

  if (!user) return <Layout><div className="empty-state">Loading...</div></Layout>;

  const isSocialLogin = user && (user.loginType === 'google' || user.loginType === 'facebook');

  return (
    <Layout>
      <div className="profile-page">
        <h2 className="page-title">Profile</h2>

        <div className="card profile-card">
          <div className="profile-avatar">
            {user.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user.name?.charAt(0).toUpperCase()}</span>}
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <label>Name</label>
              {editMode ? (
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              ) : (
                <div className="profile-value">{user.name}</div>
              )}
            </div>
            <div className="profile-field">
              <label>Email</label>
              {editMode ? (
                <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              ) : (
                <div className="profile-value">{user.email}</div>
              )}
            </div>
          </div>

          {editMode ? (
            <div className="profile-actions">
              <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
              <button className="btn btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          ) : (
            !isSocialLogin && <button className="btn btn-ghost" onClick={() => setEditMode(true)}>Edit Profile</button>
          )}
        </div>

        {!isSocialLogin && (
          <div className="card">
            <h3 className="section-title">Change Password</h3>
            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label>Current Password</label>
                <input className="form-input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input className="form-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary">Change Password</button>
            </form>
          </div>
        )}

        {isSocialLogin && !setPasswordMode && (
          <div className="card">
            <h3 className="section-title">Set Password</h3>
            <p className="text-muted">Set a password so you can also log in with email.</p>
            <button className="btn btn-ghost" onClick={() => setSetPasswordMode(true)}>Set Password</button>
          </div>
        )}

        {isSocialLogin && setPasswordMode && (
          <div className="card">
            <h3 className="section-title">Set Password</h3>
            <form onSubmit={handleSetPassword} className="password-form">
              <div className="form-group">
                <label>New Password</label>
                <input className="form-input" type="password" value={newSetPassword} onChange={e => setNewSetPassword(e.target.value)} />
              </div>
              <div className="profile-actions">
                <button type="submit" className="btn btn-primary">Confirm</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setSetPasswordMode(false); setNewSetPassword(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {message && <div className="error-message">{message}</div>}
      </div>
    </Layout>
  );
}

export default Profile;
