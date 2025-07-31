import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useNotification } from '../../components/Notification';
import './Limit.css';

function Limit() {
  const [limits, setLimits] = useState([]);
  const [form, setForm] = useState({ categoryId: '', amount: '', period: 'month', periodValue: '' });
  const [categories, setCategories] = useState([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    // Lấy danh sách category
    const fetchCategories = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    };
    fetchCategories();
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    const token = localStorage.getItem('token');
    const now = new Date();
    const periodValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const res = await fetch(`http://localhost:3000/api/limits?period=month&periodValue=${periodValue}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setLimits(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const body = {
      ...form,
      amount: Number(form.amount),
      periodValue: form.periodValue || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    };
    if (!body.amount || body.amount <= 0) {
      showNotification('Số tiền hạn mức phải lớn hơn 0', 'error');
      return;
    }
    const res = await fetch('http://localhost:3000/api/limits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      showNotification('Đặt hạn mức thành công!', 'success');
      setForm({ categoryId: '', amount: '', period: 'month', periodValue: '' });
      fetchLimits();
    } else {
      showNotification(data.message || 'Lỗi đặt hạn mức', 'error');
    }
  };

  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: 220 }}>
        <div className="limit-container">
          <h2>Đặt hạn mức chi tiêu</h2>
          <form onSubmit={handleSubmit} className="limit-form">
            <div className="limit-row">
              <label>Loại chi tiêu:</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Tổng tất cả</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="limit-row">
              <label>Hạn mức (VNĐ):</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} min="0" />
            </div>
            <div className="limit-row">
              <label>Kỳ hạn:</label>
              <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                <option value="month">Tháng</option>
                <option value="week">Tuần</option>
              </select>
            </div>
            <div className="limit-row">
              <label>Giá trị kỳ hạn:</label>
              <input
                type="text"
                placeholder={form.period === 'month' ? 'YYYY-MM' : 'YYYY-WW'}
                value={form.periodValue}
                onChange={e => setForm({ ...form, periodValue: e.target.value })}
              />
            </div>
            <button type="submit">Đặt hạn mức</button>
          </form>
          <hr />
          <h3>Hạn mức đã đặt tháng này</h3>
          <div className="limit-list">
            {limits.length === 0 && <div>Chưa có hạn mức nào.</div>}
            {limits.map(lim => (
              <div className="limit-item" key={lim._id}>
                <span>{lim.categoryId ? (categories.find(c => c._id === lim.categoryId)?.name || '---') : 'Tổng tất cả'}</span>
                <span>{lim.amount.toLocaleString()} VNĐ</span>
                <span>{lim.period === 'month' ? 'Tháng' : 'Tuần'} {lim.periodValue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Limit;
