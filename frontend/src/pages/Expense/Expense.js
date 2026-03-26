import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import ImageEditor from '../../components/ImageEditor';
import './Expense.css';
import { useNotification } from '../../components/Notification';

const API_BASE = 'http://localhost:3000/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

function Expense() {
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', category: '', type: '', date: '', image: null });
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/expenses`, { headers: getAuthHeaders() });
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
        const res = await fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (res.ok) setCategories(data);
      } catch {}
    };
    fetchExpenses();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm({ description: '', amount: '', category: '', type: '', date: '', image: null });
    setEditExpense(null);
    setShowModal(false);
    setIsNewCategoryMode(false);
    setError('');
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (base64) => setForm({ ...form, image: base64 });

  // ===== AI OCR Scan =====
  const handleScanOCR = async () => {
    if (!form.image) return;
    setIsScanning(true);
    try {
      const res = await fetch(`${API_BASE}/ai/ocr`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ image: form.image }),
      });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          amount: data.amount || prev.amount,
          description: data.description || prev.description,
          category: data.category || prev.category,
          type: data.type || prev.type,
          date: data.date || prev.date,
        }));
        if (data.isNewCategory) {
          showNotification(`AI suggested a new category: "${data.category}"`, 'info');
        } else {
          showNotification('AI scan completed! Please review the data.', 'success');
        }
      } else {
        const err = await res.json();
        showNotification(err.error || 'OCR failed.', 'error');
      }
    } catch {
      showNotification('Error connecting to AI service.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // ===== Add / Edit =====
  const handleAddOrEditExpense = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let url = `${API_BASE}/expenses`;
      let method = 'POST';
      if (editExpense) { url += `/${editExpense.id}`; method = 'PATCH'; }
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh categories if a new one was potentially created
        const catRes = await fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() });
        const catData = await catRes.json();
        if (catRes.ok) setCategories(catData);

        if (!editExpense && data.expense && data.warning) {
          setExpenses((prev) => [data.expense, ...prev]);
          showNotification('Added successfully!', 'success');
          showNotification(data.warning, 'warning');
        } else if (!editExpense && (data.expense || data.id)) {
          setExpenses((prev) => [data.expense || data, ...prev]);
          showNotification('Added successfully!', 'success');
        } else if (editExpense) {
          const updatedExp = data.expense || data;
          setExpenses((prev) => prev.map((exp) => (exp.id === updatedExp.id ? updatedExp : exp)));
          showNotification('Updated successfully!', 'success');
          if (data.warning) showNotification(data.warning, 'warning');
        }
        resetForm();
      } else {
        setError(data.message || (editExpense ? 'Update failed' : 'Add failed'));
        showNotification(data.message || 'Error', 'error');
      }
    } catch {
      setError('Server connection error');
      showNotification('Server connection error', 'error');
    }
  };

  // ===== Delete =====
  const [deleteTarget, setDeleteTarget] = useState(null);
  const handleDeleteExpense = async (exp) => {
    try {
      const res = await fetch(`${API_BASE}/expenses/${exp.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== exp.id));
        showNotification('Deleted successfully!', 'success');
      } else {
        showNotification(data.message || 'Delete failed', 'error');
      }
    } catch {
      showNotification('Server connection error', 'error');
    }
    setDeleteTarget(null);
  };

  // ===== Edit Modal =====
  const openEditModal = (exp) => {
    setEditExpense(exp);
    setForm({
      description: exp.description || '',
      amount: Math.abs(exp.amount) || '',
      category: exp.category || '',
      type: exp.type || '',
      date: exp.date ? exp.date.slice(0, 10) : '',
      image: exp.image || null,
    });
    setShowModal(true);
  };

  // ===== Filter =====
  const filteredExpenses = expenses.filter((exp) => {
    if (filterCategory && exp.category !== filterCategory) return false;
    if (filterType && exp.type !== filterType) return false;
    if (filterDate && exp.date?.slice(0, 10) !== filterDate) return false;
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

  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);

  return (
    <Layout>
      <div className="expense-page">
        <h2 className="page-title">Manage Expenses</h2>
        <div className="expense-toolbar">
          <div className="expense-filters">
            <select className="form-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat) => <option key={cat.id || cat._id} value={cat.name}>{cat.name}</option>)}
            </select>
            <select className="form-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input className="form-input" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            <input className="form-input" type="number" placeholder="Month" min="1" max="12" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ width: 90 }} />
            <input className="form-input" type="number" placeholder="Year" min="2020" max="2100" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ width: 100 }} />
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
                  <th>Img</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.description}</td>
                    <td><span className={`badge ${exp.type === 'expense' ? 'badge-expense' : 'badge-income'}`}>{exp.amount?.toLocaleString()} đ</span></td>
                    <td><span className="badge badge-category">{exp.category}</span></td>
                    <td><span className={`badge ${exp.type === 'expense' ? 'badge-expense' : 'badge-income'}`}>{exp.type === 'expense' ? 'Expense' : 'Income'}</span></td>
                    <td>{exp.date?.slice(0, 10)}</td>
                    <td>
                      {exp.image && (
                        <img
                          src={exp.image}
                          alt=""
                          className="expense-thumb"
                          onClick={() => setViewExpense(exp)}
                          title="Click to view"
                        />
                      )}
                    </td>
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

        {/* ===== Add/Edit Modal ===== */}
        {showModal && (
          <Modal title={editExpense ? 'Edit Expense' : 'Add New Expense'} onClose={resetForm}>
            <form onSubmit={handleAddOrEditExpense}>
              <ImageEditor
                image={form.image}
                onImageChange={handleImageChange}
                onScanOCR={handleScanOCR}
                isScanning={isScanning}
              />
              <div className="form-group"><label>Description</label><input className="form-input" name="description" type="text" placeholder="Expense description" value={form.description} onChange={handleFormChange} required /></div>
              <div className="form-group"><label>Amount</label><input className="form-input" name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleFormChange} required /></div>
              
              <div className="form-group">
                <label>Category {isNewCategoryMode && <span className="ai-badge">✨ New</span>}</label>
                {!isNewCategoryMode ? (
                  <div className="category-select-wrapper">
                    <select 
                      className="form-select" 
                      name="category" 
                      value={form.category} 
                      onChange={(e) => {
                        if (e.target.value === 'NEW_CAT') setIsNewCategoryMode(true);
                        else handleFormChange(e);
                      }} 
                      required
                    >
                      <option value="">-- Select --</option>
                      {categories.map((cat) => <option key={cat.id || cat._id} value={cat.name}>{cat.name}</option>)}
                      <option value="NEW_CAT">+ Add New Category...</option>
                    </select>
                    <button 
                      type="button" 
                      className="btn-icon add-cat-btn" 
                      onClick={() => setIsNewCategoryMode(true)} 
                      title="Create new category"
                    >+</button>
                  </div>
                ) : (
                  <div className="new-category-input">
                    <input 
                      className="form-input" 
                      name="category" 
                      type="text" 
                      placeholder="Enter new category name" 
                      value={form.category} 
                      onChange={handleFormChange} 
                      autoFocus 
                      required 
                    />
                    <button type="button" className="btn-icon danger" onClick={() => { setIsNewCategoryMode(false); setForm({...form, category: ''}); }} title="Cancel new category">×</button>
                  </div>
                )}
                {/* AI suggests a category name that isn't in our list */}
                {form.category && !categories.find(c => c.name === form.category) && !isNewCategoryMode && (
                  <div className="ai-suggestion-tip" onClick={() => setIsNewCategoryMode(true)}>
                    <span>✨ AI suggested a new category. Click to edit.</span>
                  </div>
                )}
              </div>
              <div className="form-group"><label>Type</label><select className="form-select" name="type" value={form.type} onChange={handleFormChange} required><option value="">-- Select --</option><option value="expense">Expense</option><option value="income">Income</option></select></div>
              <div className="form-group"><label>Date</label><input className="form-input" name="date" type="date" value={form.date} onChange={handleFormChange} required /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editExpense ? 'Save Changes' : 'Save'}</button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </form>
          </Modal>
        )}

        {/* ===== Delete Confirm ===== */}
        {deleteTarget && (
          <Modal title="Delete Expense" onClose={() => setDeleteTarget(null)}>
            <p>Are you sure you want to delete <strong>{deleteTarget.description}</strong> ({deleteTarget.amount?.toLocaleString()} đ)?</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={async () => await handleDeleteExpense(deleteTarget)}>Delete</button>
            </div>
          </Modal>
        )}

        {/* ===== View Expense Detail (with Image) ===== */}
        {viewExpense && (
          <Modal title="Transaction Detail" onClose={() => setViewExpense(null)}>
            <div className="expense-detail">
              {viewExpense.image && (
                <img src={viewExpense.image} alt="Receipt" className="expense-detail-image" />
              )}
              <div className="expense-detail-info">
                <div className="detail-row"><span className="detail-label">Description</span><span>{viewExpense.description}</span></div>
                <div className="detail-row"><span className="detail-label">Amount</span><span className={viewExpense.type === 'expense' ? 'text-red' : 'text-green'}>{viewExpense.amount?.toLocaleString()} đ</span></div>
                <div className="detail-row"><span className="detail-label">Category</span><span className="badge badge-category">{viewExpense.category}</span></div>
                <div className="detail-row"><span className="detail-label">Type</span><span>{viewExpense.type === 'expense' ? 'Expense' : 'Income'}</span></div>
                <div className="detail-row"><span className="detail-label">Date</span><span>{viewExpense.date?.slice(0, 10)}</span></div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}

export default Expense;
