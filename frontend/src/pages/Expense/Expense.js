import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import './Expense.css';
import { useNotification } from '../../components/Notification';

function Expense() {
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null); // expense đang chỉnh sửa
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: '',
    type: '',
    date: ''
  });
  const [error, setError] = useState('');
  // Filter states
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const { showNotification } = useNotification();

  // Fetch expenses on mount
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

  // Handle form change
  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Xử lý thêm hoặc cập nhật expense
  const handleAddOrEditExpense = async e => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    try {
      let url = 'http://localhost:3000/api/expenses';
      let method = 'POST';
      if (editExpense) {
        url += `/${editExpense.id}`;
        method = 'PATCH';
      }
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        // Nếu là thêm mới và có cảnh báo hạn mức
        if (!editExpense && data.expense && data.warning) {
          setExpenses(prev => [data.expense, ...prev]);
          setShowModal(false);
          setEditExpense(null);
          setForm({ description: '', amount: '', category: '', type: '', date: '' });
          showNotification('Thêm thành công!', 'success');
          showNotification(data.warning, 'warning');
        } else if (!editExpense && (data.expense || data.id)) {
          // data.expense cho expense có cảnh báo, data.id cho income hoặc expense không cảnh báo
          const newExp = data.expense || data;
          setExpenses(prev => [newExp, ...prev]);
          setShowModal(false);
          setEditExpense(null);
          setForm({ description: '', amount: '', category: '', type: '', date: '' });
          showNotification('Thêm thành công!', 'success');
        } else if (!editExpense && data.warning) {
          // Trường hợp trả về warning nhưng không có expense (phòng ngừa)
          setShowModal(false);
          setEditExpense(null);
          setForm({ description: '', amount: '', category: '', type: '', date: '' });
          showNotification('Thêm thành công!', 'success');
          showNotification(data.warning, 'warning');
        } else if (editExpense) {
            const updatedExp = data.expense || data;
            setExpenses(prev => prev.map(exp => exp.id === updatedExp.id ? updatedExp : exp));
            setShowModal(false);
            setEditExpense(null);
            setForm({ description: '', amount: '', category: '', type: '', date: '' });
            showNotification('Cập nhật thành công!', 'success');
            if (data.warning) showNotification(data.warning, 'warning');
          }
      } else {
        setError(data.message || (editExpense ? 'Cập nhật thất bại' : 'Thêm thất bại'));
        showNotification(data.message || (editExpense ? 'Cập nhật thất bại' : 'Thêm thất bại'), 'error');
      }
    } catch {
      setError('Lỗi kết nối server');
      showNotification('Lỗi kết nối server', 'error');
    }
  };

  // Modal xác nhận xóa expense
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
        setError(data.message || 'Xóa thất bại');
        showNotification(data.message || 'Xóa thất bại', 'error');
      }
    } catch {
      setError('Lỗi kết nối server');
      showNotification('Lỗi kết nối server', 'error');
    }
    setDeleteTarget(null);
  };

  // Mở modal edit
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

  // Filter logic
  const filteredExpenses = expenses.filter(exp => {
    // Category
    if (filterCategory && exp.category !== filterCategory) return false;
    // Type
    if (filterType && exp.type !== filterType) return false;
    // Date (YYYY-MM-DD)
    if (filterDate && exp.date?.slice(0,10) !== filterDate) return false;
    // Month
    if (filterMonth) {
      const expMonth = exp.date ? new Date(exp.date).getMonth() + 1 : null;
      if (expMonth !== Number(filterMonth)) return false;
    }
    // Year
    if (filterYear) {
      const expYear = exp.date ? new Date(exp.date).getFullYear() : null;
      if (expYear !== Number(filterYear)) return false;
    }
    return true;
  });

  // Object lưu màu cho từng category (chỉ tồn tại khi component còn mounted)
  const categoryColors = React.useRef({});
  // Hàm sinh màu ngẫu nhiên
  function getRandomColor() {
    // Màu pastel
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 85%)`;
  }

  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: 220 }}>
        <div className="expense-page">
          <h2>Manage Expense</h2>
          <div className="expense-filters">
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">Category</option>
              {categories.map(cat => (
                <option key={cat.id || cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">Type</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            <input type="number" placeholder="Month" min="1" max="12" style={{ width: 80 }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
            <input type="number" placeholder="Year" min="2020" max="2100" style={{ width: 100 }} value={filterYear} onChange={e => setFilterYear(e.target.value)} />
            <button className="add-expense-btn" onClick={() => setShowModal(true)}>+ Add Expense</button>
          </div>
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <table className="expense-table">
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
                {filteredExpenses.map(exp => {
                  // Tạo màu cho category nếu chưa có
                  if (exp.category && !categoryColors.current[exp.category]) {
                    categoryColors.current[exp.category] = getRandomColor();
                  }
                  const badgeStyle = exp.category ? {
                    background: categoryColors.current[exp.category],
                    color: '#444',
                    border: '1px solid #e3e3e3'
                  } : {};
                  const amountType = exp.type === 'expense' ? 'expense' : 'income';
                  return (
                    <tr key={exp.id}>
                      <td>{exp.description}</td>
                      <td>
                        <span className={`amount-badge ${amountType}`}>{exp.amount?.toLocaleString()} đ</span>
                      </td>
                      <td><span className="category-badge" style={badgeStyle}>{exp.category}</span></td>
                      <td><span className={`type-badge ${exp.type}`}>{exp.type === 'expense' ? 'Expense' : 'Income'}</span></td>
                      <td>{exp.date?.slice(0,10)}</td>
                  <td>
                    <button
                      className="icon-btn update"
                      title="Edit"
                      style={{marginRight:8}}
                      onClick={() => openEditModal(exp)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="icon-btn delete"
                      title="Delete"
                      onClick={() => setDeleteTarget(exp)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>{editExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
                <form onSubmit={handleAddOrEditExpense}>
                  <input name="description" type="text" placeholder="Description" value={form.description} onChange={handleFormChange} required />
                  <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleFormChange} required />
                  <select name="category" value={form.category} onChange={handleFormChange} required>
                    <option value="">--Category--</option>
                    {categories.map(cat => (
                      <option key={cat.id || cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <select name="type" value={form.type} onChange={handleFormChange} required>
                    <option value="">--Type--</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <button type="submit" className="save-btn">{editExpense ? 'Save Changes' : 'Save'}</button>
                    <button type="button" className="cancel-btn" onClick={() => { setShowModal(false); setEditExpense(null); setForm({ description: '', amount: '', category: '', type: '', date: '' }); }}>Cancel</button>
                  </div>
                  {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
                </form>
              </div>
            </div>
          )}
          {/* Modal xác nhận xóa expense */}
          {deleteTarget && (
            <div className="modal-overlay">
              <div className="modal">
                <h3 style={{color:'#e74c3c'}}>Delete Expense</h3>
                <p>Bạn có chắc muốn xóa khoản <b>{deleteTarget.description}</b> ({deleteTarget.amount?.toLocaleString()} đ)?</p>
                <div style={{display:'flex', gap:12, justifyContent:'center', marginTop:18}}>
                  <button
                    className="delete-btn"
                    style={{background:'#e74c3c', color:'#fff', fontWeight:600}}
                    onClick={async () => await handleDeleteExpense(deleteTarget)}
                  >Delete</button>
                  <button
                    className="cancel-btn"
                    onClick={() => setDeleteTarget(null)}
                  >Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Expense;
