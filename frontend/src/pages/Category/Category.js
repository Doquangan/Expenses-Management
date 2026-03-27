import React, { useState, useEffect } from 'react';
import API_BASE from '../../config';
import Modal from '../../components/Modal';
import './Category.css';
import { useNotification } from '../../components/Notification';
import { FaEdit, FaTrash } from 'react-icons/fa';

function Category() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [updateName, setUpdateName] = useState('');
  const [updateDesc, setUpdateDesc] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newName.trim(), description: newDesc })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message || 'Error');
      showNotification(data.message || 'Error', 'error');
    } else {
      setCategories([...categories, data]);
      setNewName('');
      setNewDesc('');
      showNotification('Thêm danh mục thành công!', 'success');
    }
  };

  const handleUpdate = (cat) => {
    setUpdateTarget(cat);
    setUpdateName(cat.name);
    setUpdateDesc(cat.description || '');
  };

  const updateCategory = async (id, name, description) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, description })
    });
    const data = await res.json();
    if (res.ok) {
      setCategories(cats => cats.map(c => (c._id === id || c.id === id ? data : c)));
      showNotification('Cập nhật thành công!', 'success');
    } else {
      showNotification(data.message || 'Lỗi cập nhật', 'error');
    }
  };

  const handleDelete = async (cat) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/categories/${cat._id || cat.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      setCategories(cats => cats.filter(c => c._id !== cat._id && c.id !== cat.id));
      showNotification('Đã xóa danh mục!', 'success');
    } else {
      showNotification(data.message || 'Lỗi xóa', 'error');
    }
  };

  return (
    <>
      <div className="category-page">
        <h2 className="page-title">Manage Categories</h2>
        <p className="page-subtitle">Add and organize your expense categories.</p>

        <form onSubmit={handleCreate} className="category-form">
          <input className="form-input" type="text" placeholder="Category name" value={newName} onChange={e => setNewName(e.target.value)} required />
          <input className="form-input" type="text" placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}

        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id || cat.id}>
                  <td><strong className="cat-name">{cat.name}</strong></td>
                  <td className="text-muted">{cat.description}</td>
                  <td>
                    {cat.user
                      ? <span className="badge badge-income">Custom</span>
                      : <span className="badge badge-category">Default</span>}
                  </td>
                  <td>
                    {cat.user && (
                      <>
                        <button className="btn-icon" title="Edit" onClick={() => handleUpdate(cat)}><FaEdit /></button>
                        <button className="btn-icon danger" title="Delete" onClick={() => setDeleteTarget(cat)}><FaTrash /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <Modal title="Delete Category" onClose={() => setDeleteTarget(null)}>
          <p>Are you sure you want to delete <strong style={{color: 'var(--accent-red)'}}>{deleteTarget.name}</strong>?</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={async () => { await handleDelete(deleteTarget); setDeleteTarget(null); }}>Delete</button>
          </div>
        </Modal>
      )}

      {updateTarget && (
        <Modal title={`Update: ${updateTarget.name}`} onClose={() => setUpdateTarget(null)}>
          <div className="form-group"><label>Name</label><input className="form-input" type="text" value={updateName} onChange={e => setUpdateName(e.target.value)} /></div>
          <div className="form-group"><label>Description</label><input className="form-input" type="text" value={updateDesc} onChange={e => setUpdateDesc(e.target.value)} placeholder="Optional" /></div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setUpdateTarget(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={async () => { if (!updateName.trim()) return; await updateCategory(updateTarget._id || updateTarget.id, updateName.trim(), updateDesc); setUpdateTarget(null); }}>Save</button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default Category;
