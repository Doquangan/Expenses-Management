import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
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
      const res = await fetch('http://localhost:3000/api/categories', {
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
    const res = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: newName.trim(), description: newDesc })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message || 'Error');
      showNotification(data.message || 'Error', 'error');
      return;
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
  }

  const updateCategory = async (id, name, description) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/categories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
    const res = await fetch(`http://localhost:3000/api/categories/${cat._id || cat.id}`, {
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
      <Sidebar />
      <div style={{ marginLeft: 220 }}>
        <div className="category-page">
          <h2>Manage Category</h2>
          <p>Manage your expense categories here.</p>
          <form onSubmit={handleCreate} style={{margin:'18px 0', display:'flex', gap:12, alignItems:'center'}}>
            <input
              type="text"
              placeholder="Category name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              style={{padding:'8px 14px', borderRadius:8, border:'1.5px solid #b3d3fa', fontSize:'1rem'}}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              style={{padding:'8px 14px', borderRadius:8, border:'1.5px solid #b3d3fa', fontSize:'1rem'}}
            />
            <button type="submit" disabled={loading} style={{padding:'8px 18px', borderRadius:8, background:'#2d7be5', color:'#fff', fontWeight:600, border:'none', cursor:'pointer'}}>
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </form>
          {error && <div style={{color:'#e74c3c', marginBottom:8}}>{error}</div>}
          <div style={{marginTop:18}}>
            <h4>Default & Your Categories</h4>
            <table style={{width:'100%', borderCollapse:'collapse', marginTop:12}}>
              <thead>
                <tr style={{background:'#f6f8fa'}}>
                  <th style={{padding:'8px', border:'1px solid #e0eafc'}}>Name</th>
                  <th style={{padding:'8px', border:'1px solid #e0eafc'}}>Description</th>
                  <th style={{padding:'8px', border:'1px solid #e0eafc'}}>Type</th>
                  <th style={{padding:'8px', border:'1px solid #e0eafc'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat._id || cat.id}>
                    <td style={{padding:'8px', border:'1px solid #e0eafc', fontWeight:600, color:'#1760b0'}}>{cat.name}</td>
                    <td style={{padding:'8px', border:'1px solid #e0eafc', color:'#888'}}>{cat.description}</td>
                    <td style={{padding:'8px', border:'1px solid #e0eafc'}}>
                      {cat.user
                        ? <span style={{color:'#27ae60'}}>Your category</span>
                        : <span style={{color:'#555'}}>Default</span>
                      }
                    </td>
                    <td style={{padding:'8px', border:'1px solid #e0eafc'}}>
                      {cat.user && (
                        <>
                          <button
                            className="icon-btn update"
                            title="Update"
                            onClick={() => handleUpdate(cat)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="icon-btn delete"
                            title="Delete"
                            onClick={() => setDeleteTarget(cat)}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal xác nhận xóa category */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Are you sure you want to delete <span style={{color:'#e74c3c'}}>{deleteTarget.name}</span>?</h4>
            <div style={{marginTop:18, display:'flex', gap:12, justifyContent:'center'}}>
              <button
                className="icon-btn delete"
                onClick={async () => {
                  await handleDelete(deleteTarget);
                  setDeleteTarget(null);
                }}
              >Yes</button>
              <button
                className="icon-btn"
                style={{background:'#e0eafc'}}
                onClick={() => setDeleteTarget(null)}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal cập nhật category */}
      {updateTarget && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Update category <span style={{color:'#2d7be5'}}>{updateTarget.name}</span></h4>
            <div style={{marginTop:18, display:'flex', flexDirection:'column', gap:14, alignItems:'center'}}>
              <input
                type="text"
                value={updateName}
                onChange={e => setUpdateName(e.target.value)}
                placeholder="Category name"
                style={{padding:'8px 14px', borderRadius:8, border:'1.5px solid #b3d3fa', fontSize:'1rem', width:'90%'}}
              />
              <input
                type="text"
                value={updateDesc}
                onChange={e => setUpdateDesc(e.target.value)}
                placeholder="Description (optional)"
                style={{padding:'8px 14px', borderRadius:8, border:'1.5px solid #b3d3fa', fontSize:'1rem', width:'90%'}}
              />
              <div style={{display:'flex', gap:12, justifyContent:'center', marginTop:8}}>
                <button
                  className="icon-btn update"
                  style={{background:'#2d7be5', color:'#fff', border:'1px solid #2d7be5', fontWeight:600}}
                  onClick={async () => {
                    if (!updateName.trim()) return;
                    await updateCategory(updateTarget._id || updateTarget.id, updateName.trim(), updateDesc);
                    setUpdateTarget(null);
                  }}
                >Save</button>
                <button
                  className="icon-btn"
                  style={{background:'#e0eafc'}}
                  onClick={() => setUpdateTarget(null)}
                >Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default Category;
