import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
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
  // Đặt mật khẩu cho user social login
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/users/set-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ newPassword: newSetPassword })
    });
    const data = await res.json();
    if (res.ok) {
      showNotification('Đặt mật khẩu thành công! Bạn có thể đăng nhập bằng email và mật khẩu.', 'success');
      setSetPasswordMode(false);
      setNewSetPassword('');
      window.location.reload();
    } else {
      showNotification(data.message || 'Lỗi đặt mật khẩu', 'error');
    }
  };
  const { showNotification } = useNotification();
//   const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/users/me', {
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
    const res = await fetch('http://localhost:3000/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data);
      setEditMode(false);
      setMessage('Cập nhật thành công!');
      showNotification('Cập nhật thông tin thành công!', 'success');
      window.location.reload();
        
    } else {
      setMessage(data.message || 'Lỗi cập nhật');
      showNotification(data.message || 'Lỗi cập nhật', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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

  if (!user) return <div>Loading...</div>;

  const isSocialLogin = user && (user.loginType === 'google' || user.loginType === 'facebook');
  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: 220 }}>
        <div className="profile-container">
          <h2>Profile</h2>
          <div className="profile-info">
            <div className="profile-row">
              <label htmlFor="name">Name:</label>   
              {editMode ? (
                <input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              ) : <span className="profile-value">{user.name}</span>}
            </div>
            <div className="profile-row">
              <label htmlFor="email">Email:</label>
              {editMode ? (
                <input id="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              ) : <span className="profile-value">{user.email}</span>}
            </div>
          </div>
          {editMode ? (
            <form onSubmit={handleUpdate} className="btn-row">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
            </form>
          ) : (
            !isSocialLogin && <button onClick={() => setEditMode(true)}>Update your Information</button>
          )}
          <hr />
          {/* Đổi mật khẩu cho local user */}
          {!isSocialLogin && (
            <form onSubmit={handleChangePassword}>
              <label htmlFor="currentPassword">Current Password:</label>
              <input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              <label htmlFor="newPassword">New Password:</label>
              <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <button type="submit">Change Password</button>
            </form>
          )}
          {/* Đặt mật khẩu cho user social login nếu chưa có mật khẩu */}
          {isSocialLogin && !setPasswordMode && (
            <button onClick={() => setSetPasswordMode(true)} style={{marginTop: 10}}>Đặt mật khẩu để đăng nhập bằng email</button>
          )}
          {isSocialLogin && setPasswordMode && (
            <form onSubmit={handleSetPassword}>
              <label htmlFor="newSetPassword">Mật khẩu mới:</label>
              <input id="newSetPassword" type="password" value={newSetPassword} onChange={e => setNewSetPassword(e.target.value)} />
              <button type="submit">Xác nhận đặt mật khẩu</button>
              <button type="button" onClick={() => {setSetPasswordMode(false); setNewSetPassword('');}}>Hủy</button>
            </form>
          )}
          {message && <div className="error">{message}</div>}
        </div>
      </div>
    </>
  );
}

export default Profile;
