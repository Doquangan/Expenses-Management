import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import './Category.css';

function Category() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    } else {
      setCategories([...categories, data]);
      setNewName('');
      setNewDesc('');
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
            <ul style={{listStyle:'none', padding:0}}>
              {categories.map(cat => (
                <li key={cat._id || cat.id} style={{padding:'8px 0', borderBottom:'1px solid #eee'}}>
                  <span style={{fontWeight:600, color:'#1760b0'}}>{cat.name}</span>
                  {cat.description && <span style={{marginLeft:8, color:'#888'}}>{cat.description}</span>}
                  {cat.user ? <span style={{marginLeft:8, color:'#27ae60', fontSize:'0.98rem'}}> (Your category)</span> : <span style={{marginLeft:8, color:'#555', fontSize:'0.98rem'}}> (Default)</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Category;
