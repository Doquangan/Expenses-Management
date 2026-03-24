import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import './Expense.css';
import { useNotification } from '../../components/Notification';

function Expense() {
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', category: '', type: '', date: '' });
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/expenses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setExpenses(data);
        else setError(data.message || 'Lỗi tải dữ liệu');
      } catch {
        setError('Lỗi kết nối server');
      }
      setLoading(false);
    };
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setCategories(data);
      } catch {}
    };
    fetchExpenses();
    fetchCategories();
  }, []);

  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddOrEditExpense = async e => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    try {
      let url = 'http://localhost:3000/api/expenses';
      let method = 'POST';
      if (editExpense) { url += `/${editExpense.id}`; method = 'PATCH'; }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        if (!editExpense && data.expense && data.warning) {
          setExpenses(prev => [data.expense, ...prev]);
          showNotification('Thêm thành công!', 'success');
          showNotification(data.warning, 'warning');
        } else if (!editExpense && (data.expense || data.id)) {
          setExpenses(prev => [data.expense || data, ...prev]);
          showNotification('Thêm thành công!', 'success');
        } else if (!editExpense && data.warning) {
          showNotification('Thêm thành công!', 'success');
          showNotification(data.warning, 'warning');
        } else if (editExpense) {
          const updatedExp = data.expense || data;
          setExpenses(prev => prev.map(exp => exp.id === updatedExp.id ? updatedExp : exp));
          showNotification('Cập nhật thành công!', 'success');
          if (data.warning) showNotification(data.warning, 'warning');
        }
        setShowModal(false);
        setEditExpense(null);
        setForm({ description: '', amount: '', category: '', type: '', date: '' });
      } else {
        setError(data.message || (editExpense ? 'Cập nhật thất bại' : 'Thêm thất bại'));
        showNotification(data.message || 'Error', 'error');
      }
    } catch {
      setError('Lỗi kết nối server');
      showNotification('Lỗi kết nối server', 'error');
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const handleDeleteExpense = async exp => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/expenses/${exp.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setExpenses(prev => prev.filter(e => e.id !== exp.id));
        showNotification('Xóa thành công!', 'success');
      } else {
        showNotification(data.message || 'Xóa thất bại', 'error');
      }
    } catch {
      showNotification('Lỗi kết nối server', 'error');
    }
    setDeleteTarget(null);
  };

  const openEditModal = exp => {
    setEditExpense(exp);
    setForm({
      description: exp.description || '',
      amount: Math.abs(exp.amount) || '',
      category: exp.category || '',
      type: exp.type || '',
      date: exp.date ? exp.date.slice(0,10) : ''
    });
    setShowModal(true);
  };

  const filteredExpenses = expenses.filter(exp => {
    if (filterCategory && exp.category !== filterCategory) return false;
    if (filterType && exp.type !== filterType) return false;
    if (filterDate && exp.date?.slice(0,10) !== filterDate) return false;
    if (filterMonth) {
      const expMonth = exp.date ? new Date(exp.date).getMonth() + 1 : null;
      if (expMonth !== Number(filterMonth)) return false;
    }
    if (filterYear) {
      const expYear = exp.date ? new Date(exp.date).getFullYear() : null;
      if (expYear !== Number(filterYear)) return false;
    }
    return true;
  });

  return (
    <Layout>
      <div className="expense-page">
        <h2 className="page-title">Manage Expenses</h2>
        <div className="expense-toolbar">
          <div className="expense-filters">
            <select className="form-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat.id || cat._id} value={cat.name}>{cat.name}</option>)}
            </select>
            <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input className="form-input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            <input className="form-input" type="number" placeholder="Month" min="1" max="12" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: 90 }} />
            <input className="form-input" type="number" placeholder="Year" min="2020" max="2100" value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ width: 100 }} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Expense</button>
        </div>

        {loading ? (
          <div className="empty-state">Loading data...</div>
        ) : (
          <div className="card table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{exp.description}</td>
                    <td><span className={`badge ${exp.type === 'expense' ? 'badge-expense' : 'badge-income'}`}>{exp.amount?.toLocaleString()} đ</span></td>
                    <td><span className="badge badge-category">{exp.category}</span></td>
                    <td><span className={`badge ${exp.type === 'expense' ? 'badge-expense' : 'badge-income'}`}>{exp.type === 'expense' ? 'Expense' : 'Income'}</span></td>
                    <td>{exp.date?.slice(0,10)}</td>
                    <td>
                      <button className="btn-icon" title="Edit" onClick={() => openEditModal(exp)}><FaEdit /></button>
                      <button className="btn-icon danger" title="Delete" onClick={() => setDeleteTarget(exp)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}

        {showModal && (
          <Modal title={editExpense ? 'Edit Expense' : 'Add New Expense'} onClose={() => { setShowModal(false); setEditExpense(null); setForm({ description: '', amount: '', category: '', type: '', date: '' }); }}>
            <form onSubmit={handleAddOrEditExpense}>
              <div className="form-group"><label>Description</label><input className="form-input" name="description" type="text" placeholder="Expense description" value={form.description} onChange={handleFormChange} required /></div>
              <div className="form-group"><label>Amount</label><input className="form-input" name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleFormChange} required /></div>
              <div className="form-group"><label>Category</label><select className="form-select" name="category" value={form.category} onChange={handleFormChange} required><option value="">-- Select --</option>{categories.map(cat => <option key={cat.id || cat._id} value={cat.name}>{cat.name}</option>)}</select></div>
              <div className="form-group"><label>Type</label><select className="form-select" name="type" value={form.type} onChange={handleFormChange} required><option value="">-- Select --</option><option value="expense">Expense</option><option value="income">Income</option></select></div>
              <div className="form-group"><label>Date</label><input className="form-input" name="date" type="date" value={form.date} onChange={handleFormChange} required /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setEditExpense(null); setForm({ description: '', amount: '', category: '', type: '', date: '' }); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editExpense ? 'Save Changes' : 'Save'}</button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </form>
          </Modal>
        )}

        {deleteTarget && (
          <Modal title="Delete Expense" onClose={() => setDeleteTarget(null)}>
            <p>Are you sure you want to delete <strong>{deleteTarget.description}</strong> ({deleteTarget.amount?.toLocaleString()} đ)?</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={async () => await handleDeleteExpense(deleteTarget)}>Delete</button>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}

export default Expense;
