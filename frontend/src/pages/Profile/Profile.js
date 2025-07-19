import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import './Profile.css';
function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
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
    } else {
      setMessage(data.message || 'Lỗi cập nhật');
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
      setMessage('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setMessage(data.message || 'Lỗi đổi mật khẩu');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: 220 }}>
        <div className="profile-container">
          <h2>Profile</h2>
          <div className="profile-info">
            <div className="profile-row">
              <label htmlFor="name">Tên:</label>
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
              <button type="submit">Lưu</button>
              <button type="button" onClick={() => setEditMode(false)}>Hủy</button>
            </form>
          ) : (
            <button onClick={() => setEditMode(true)}>Chỉnh sửa thông tin</button>
          )}
          <hr />
          <form onSubmit={handleChangePassword}>
            <label htmlFor="currentPassword">Mật khẩu hiện tại:</label>
            <input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            <label htmlFor="newPassword">Mật khẩu mới:</label>
            <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <button type="submit">Đổi mật khẩu</button>
          </form>
          {message && <div className="error">{message}</div>}
        </div>
      </div>
    </>
  );
}

export default Profile;
