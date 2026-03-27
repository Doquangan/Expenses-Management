import React, { useState, useEffect } from 'react';
import { useNotification } from '../../components/Notification';
import API_BASE from '../../config';
import './Limit.css';

function Limit() {
  const [limits, setLimits] = useState([]);
  const [form, setForm] = useState({ categoryId: '', amount: '', period: 'month', periodValue: '' });
  const [categories, setCategories] = useState([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCategories(await res.json());
    };
    fetchCategories();
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    const token = localStorage.getItem('token');
    const now = new Date();
    const periodValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const res = await fetch(`${API_BASE}/limits?period=month&periodValue=${periodValue}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setLimits(await res.json());
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
    const res = await fetch(`${API_BASE}/limits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
      <div className="limit-page">
        <h2 className="page-title">Spending Limits</h2>

        <div className="card limit-form-card">
          <h3 className="section-title">Set a new limit</h3>
          <form onSubmit={handleSubmit} className="limit-form">
            <div className="form-group">
              <label>Category</label>
              <select className="form-select" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Limit (VNĐ)</label>
              <input className="form-input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} min="0" placeholder="e.g. 5,000,000" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Period</label>
                <select className="form-select" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                  <option value="month">Monthly</option>
                  <option value="week">Weekly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Period Value</label>
                <input className="form-input" type="text" placeholder={form.period === 'month' ? 'YYYY-MM' : 'YYYY-WW'} value={form.periodValue} onChange={e => setForm({ ...form, periodValue: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Set Limit</button>
          </form>
        </div>

        <div className="card">
          <h3 className="section-title">Current month limits</h3>
          {limits.length === 0 ? (
            <div className="empty-state">No limits set yet.</div>
          ) : (
            <div className="limits-list">
              {limits.map(lim => (
                <div className="limit-item" key={lim._id}>
                  <div className="limit-item-name">{lim.categoryId ? (categories.find(c => c._id === lim.categoryId)?.name || '---') : 'All Categories'}</div>
                  <div className="limit-item-amount">{lim.amount.toLocaleString()} VNĐ</div>
                  <div className="limit-item-period">{lim.period === 'month' ? 'Monthly' : 'Weekly'} · {lim.periodValue}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Limit;
