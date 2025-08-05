
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './Dashboard.css';

function Dashboard() {
  // ...existing code...
  // State cho việc mở rộng chi tiết danh mục
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Hàm toggle mở rộng danh mục
  const toggleCategory = (cat) => {
    setExpandedCategories(prev => prev.includes(cat)
      ? prev.filter(c => c !== cat)
      : [...prev, cat]);
  };
  // State cho loại thống kê
  const [chartType, setChartType] = useState('expense'); // 'expense' hoặc 'income'

  // State cho filter
  const [filterType, setFilterType] = useState('month'); // 'day', 'month', 'year'
  const [filterValue, setFilterValue] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  // State cảnh báo hạn mức
  const [limitWarnings, setLimitWarnings] = useState([]);
  const [loadingWarnings, setLoadingWarnings] = useState(false);

  // State AI suggestion
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAiPopup, setShowAiPopup] = useState(false);
  // Không tự động lấy gợi ý khi vào dashboard nữa

  const fetchAiSuggestion = async () => {
    setLoadingAi(true);
    setShowAiPopup(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/ai/saving-suggestion', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAiSuggestion(data.suggestion || 'Không có gợi ý.');
    } catch {
      setAiSuggestion('Không thể lấy gợi ý từ AI.');
    }
    setLoadingAi(false);
  };
  // Lấy cảnh báo hạn mức khi vào dashboard hoặc khi filter tháng thay đổi
  useEffect(() => {
    const fetchWarnings = async () => {
      setLoadingWarnings(true);
      try {
        const token = localStorage.getItem('token');
        // Lấy periodValue theo filter tháng hiện tại
        let periodValue = '';
        if (filterType === 'month' && filterValue) periodValue = filterValue;
        else {
          const now = new Date();
          periodValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        const res = await fetch(`http://localhost:3000/api/dashboard/limit-warnings?period=month&periodValue=${periodValue}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLimitWarnings(data);
        } else {
          setLimitWarnings([]);
        }
      } catch {
        setLimitWarnings([]);
      }
      setLoadingWarnings(false);
    };
    fetchWarnings();
  }, [filterType, filterValue]);

  // Lấy dữ liệu expense
  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/expenses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setExpenses(data);
    };
    fetchExpenses();
  }, []);


  // Lọc dữ liệu theo loại expense/income
  const filtered = expenses.filter(exp => {
    if (exp.type !== chartType) return false;
    if (filterType === 'day' && filterValue) {
      return exp.date?.slice(0,10) === filterValue;
    }
    if (filterType === 'month' && filterValue) {
      const d = new Date(exp.date);
      return d.getMonth() + 1 === Number(filterValue.split('-')[1]) && d.getFullYear() === Number(filterValue.split('-')[0]);
    }
    if (filterType === 'year' && filterValue) {
      const d = new Date(exp.date);
      return d.getFullYear() === Number(filterValue);
    }
    return true;
  });

  // Tính tổng chi tiêu và tổng thu nhập theo filter
  const totalExpense = expenses.filter(exp => exp.type === 'expense').filter(exp => {
    if (filterType === 'day' && filterValue) {
      return exp.date?.slice(0,10) === filterValue;
    }
    if (filterType === 'month' && filterValue) {
      const d = new Date(exp.date);
      return d.getMonth() + 1 === Number(filterValue.split('-')[1]) && d.getFullYear() === Number(filterValue.split('-')[0]);
    }
    if (filterType === 'year' && filterValue) {
      const d = new Date(exp.date);
      return d.getFullYear() === Number(filterValue);
    }
    return true;
  }).reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
  const totalIncome = expenses.filter(exp => exp.type === 'income').filter(exp => {
    if (filterType === 'day' && filterValue) {
      return exp.date?.slice(0,10) === filterValue;
    }
    if (filterType === 'month' && filterValue) {
      const d = new Date(exp.date);
      return d.getMonth() + 1 === Number(filterValue.split('-')[1]) && d.getFullYear() === Number(filterValue.split('-')[0]);
    }
    if (filterType === 'year' && filterValue) {
      const d = new Date(exp.date);
      return d.getFullYear() === Number(filterValue);
    }
    return true;
  }).reduce((sum, exp) => sum + Math.abs(exp.amount), 0);

  // Tổng hợp theo category
  const categoryData = {};
  filtered.forEach(exp => {
    if (!categoryData[exp.category]) categoryData[exp.category] = 0;
    categoryData[exp.category] += Math.abs(exp.amount);
  });
  const pieData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: Object.keys(categoryData).map((_, i) => `hsl(${i*60},70%,80%)`)
    }]
  };

  // Tính phần trăm cho từng danh mục
  const totalPie = Object.values(categoryData).reduce((a, b) => a + b, 0);
  const percentLabels = pieData.labels.map((cat, i) => {
    const val = pieData.datasets[0].data[i];
    const percent = totalPie ? ((val / totalPie) * 100).toFixed(1) : 0;
    return `${cat} (${percent}%)`;
  });

  // Tổng hợp theo ngày/tháng/năm cho bar chart
  let barLabels = [], barValues = [];
  if (filterType === 'month' && filterValue) {
    // Bar theo ngày trong tháng
    const days = {};
    filtered.forEach(exp => {
      const day = exp.date?.slice(8,10);
      if (!days[day]) days[day] = 0;
      days[day] += Math.abs(exp.amount);
    });
    barLabels = Object.keys(days);
    barValues = Object.values(days);
  } else if (filterType === 'year' && filterValue) {
    // Bar theo tháng trong năm
    const months = {};
    filtered.forEach(exp => {
      const month = new Date(exp.date).getMonth() + 1;
      if (!months[month]) months[month] = 0;
      months[month] += Math.abs(exp.amount);
    });
    barLabels = Object.keys(months);
    barValues = Object.values(months);
  } else {
    // Bar theo category
    barLabels = Object.keys(categoryData);
    barValues = Object.values(categoryData);
  }
  const barData = {
    labels: barLabels,
    datasets: [{
      label: chartType === 'expense' ? 'Expense' : 'Income',
      data: barValues,
      backgroundColor: chartType === 'expense' ? '#2d7be5' : '#2ce77b'
    }]
  };

  // Khi click vào phần pie chart
  const onPieClick = (elems) => {
    if (elems.length > 0) {
      const idx = elems[0].index;
      setSelectedCategory(pieData.labels[idx]);
    } else {
      setSelectedCategory(null);
    }
  };

  // Nếu chọn category, chỉ hiển thị dữ liệu của category đó ở bar chart
  let barDataFiltered = barData;
  if (selectedCategory) {
    const filteredByCat = filtered.filter(exp => exp.category === selectedCategory);
    if (filterType === 'month' && filterValue) {
      const days = {};
      filteredByCat.forEach(exp => {
        const day = exp.date?.slice(8,10);
        if (!days[day]) days[day] = 0;
        days[day] += Math.abs(exp.amount);
      });
      barDataFiltered = {
        labels: Object.keys(days),
        datasets: [{ label: selectedCategory, data: Object.values(days), backgroundColor: '#e7a12c' }]
      };
    } else if (filterType === 'year' && filterValue) {
      const months = {};
      filteredByCat.forEach(exp => {
        const month = new Date(exp.date).getMonth() + 1;
        if (!months[month]) months[month] = 0;
        months[month] += Math.abs(exp.amount);
      });
      barDataFiltered = {
        labels: Object.keys(months),
        datasets: [{ label: selectedCategory, data: Object.values(months), backgroundColor: '#e7a12c' }]
      };
    } else {
      barDataFiltered = {
        labels: [selectedCategory],
        datasets: [{ label: selectedCategory, data: [categoryData[selectedCategory]], backgroundColor: '#e7a12c' }]
      };
    }
  }

  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: 220 }}>
        <div className="dashboard-page">
          {/* Nút nhận gợi ý tiết kiệm từ AI */}
          <div style={{margin:'16px 0'}}>
            <button onClick={fetchAiSuggestion} style={{background:'#2d7be5', color:'#fff', border:'none', borderRadius:4, padding:'8px 20px', fontWeight:600, cursor:'pointer', fontSize:16}}>Nhận gợi ý tiết kiệm từ AI</button>
          </div>

          {/* Popup hiển thị gợi ý */}
          {showAiPopup && (
            <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.18)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center'}}>
              <div style={{background:'#fff', borderRadius:10, boxShadow:'0 2px 16px #aaa', padding:32, minWidth:340, maxWidth:480, position:'relative'}}>
                <h3 style={{color:'#2d7be5', marginBottom:16}}>Gợi ý tiết kiệm từ AI</h3>
                {loadingAi ? (
                  <div style={{color:'#888'}}>Đang lấy gợi ý...</div>
                ) : (
                  <div style={{background:'#f6faff', border:'1.5px solid #2d7be5', color:'#2d7be5', borderRadius:6, padding:'10px 16px', fontWeight:500, fontSize:16, marginBottom:8, whiteSpace:'pre-line'}}>
                    {aiSuggestion.split('\n').map((line, idx) => (
                      <div key={idx} style={{marginBottom:6}}>{line}</div>
                    ))}
                  </div>
                )}
                <button onClick={()=>setShowAiPopup(false)} style={{position:'absolute', top:12, right:16, background:'#e74c3c', color:'#fff', border:'none', borderRadius:4, padding:'4px 12px', fontWeight:600, cursor:'pointer'}}>Đóng</button>
              </div>
            </div>
          )}
          {/* Cảnh báo hạn mức */}
          {loadingWarnings ? (
            <div style={{margin:'16px 0', color:'#888'}}>Đang kiểm tra hạn mức...</div>
          ) : limitWarnings.length > 0 && (
            <div style={{margin:'16px 0'}}>
              <h3 style={{color:'#e67e22', marginBottom:8}}>Cảnh báo hạn mức chi tiêu</h3>
              {limitWarnings.map(warn => (
                <div key={warn.limitId} style={{
                  background: warn.type === 'over' ? '#ffeaea' : '#fffbe6',
                  border: `1.5px solid ${warn.type === 'over' ? '#e74c3c' : '#e7a12c'}`,
                  color: warn.type === 'over' ? '#e74c3c' : '#e7a12c',
                  borderRadius: 6, padding: '10px 16px', marginBottom: 8, fontWeight: 500, fontSize: 16
                }}>
                  <span style={{fontWeight:600}}>
                    {warn.categoryName ? warn.categoryName : 'Tổng tất cả'}:
                  </span>
                  &nbsp;Đã chi {warn.total.toLocaleString()} / {warn.amount.toLocaleString()} VNĐ
                  &nbsp;({warn.percent}%)
                  <span style={{marginLeft:8, fontWeight:600}}>
                    {warn.type === 'over'
                      ? 'ĐÃ VƯỢT HẠN MỨC!'
                      : 'Đã chi trên 80% hạn mức!'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="dashboard-header-row">
            <h2>Dashboard</h2>
            <div className="dashboard-summary">
              <div className="summary-box expense">
                <div className="summary-label">Total Expense</div>
                <div className="summary-value">{totalExpense.toLocaleString()} đ</div>
                {filterType === 'month' && filterValue && (() => {
                  // Tính tổng chi tiêu/tháng trước
                  const [year, month] = filterValue.split('-').map(Number);
                  let prevMonth = month - 1;
                  let prevYear = year;
                  if (prevMonth < 1) {
                    prevMonth = 12;
                    prevYear -= 1;
                  }
                  const prevExpense = expenses.filter(exp => exp.type === 'expense').filter(exp => {
                    const d = new Date(exp.date);
                    return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
                  }).reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
                  const expenseDiff = totalExpense - prevExpense;
                  return (
                    <div style={{fontSize:'0.98rem', marginTop:4, color: expenseDiff > 0 ? '#e74c3c' : '#27ae60'}}>
                      {expenseDiff > 0 ? 'Tăng' : expenseDiff < 0 ? 'Giảm' : 'Không đổi'} {Math.abs(expenseDiff).toLocaleString()} đ so với tháng trước
                    </div>
                  );
                })()}
              </div>
              <div className="summary-box income">
                <div className="summary-label">Total Income</div>
                <div className="summary-value">{totalIncome.toLocaleString()} đ</div>
                {filterType === 'month' && filterValue && (() => {
                  // Tính tổng thu nhập/tháng trước
                  const [year, month] = filterValue.split('-').map(Number);
                  let prevMonth = month - 1;
                  let prevYear = year;
                  if (prevMonth < 1) {
                    prevMonth = 12;
                    prevYear -= 1;
                  }
                  const prevIncome = expenses.filter(exp => exp.type === 'income').filter(exp => {
                    const d = new Date(exp.date);
                    return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
                  }).reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
                  const incomeDiff = totalIncome - prevIncome;
                  return (
                    <div style={{fontSize:'0.98rem', marginTop:4, color: incomeDiff > 0 ? '#27ae60' : '#e74c3c'}}>
                      {incomeDiff > 0 ? 'Tăng' : incomeDiff < 0 ? 'Giảm' : 'Không đổi'} {Math.abs(incomeDiff).toLocaleString()} đ so với tháng trước
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          <div className="dashboard-filters">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
            {filterType === 'day' && (
              <input type="date" value={filterValue} onChange={e => setFilterValue(e.target.value)} />
            )}
            {filterType === 'month' && (
              <input type="month" value={filterValue} onChange={e => setFilterValue(e.target.value)} />
            )}
            {filterType === 'year' && (
              <input type="number" min="2020" max="2100" placeholder="Year" value={filterValue} onChange={e => setFilterValue(e.target.value)} />
            )}
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} style={{marginLeft:8}}>Bỏ lọc category</button>
            )}
            <select value={chartType} onChange={e => setChartType(e.target.value)} style={{marginLeft:16}}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="dashboard-charts" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
            marginBottom: 24,
            alignItems: 'flex-start',
            width: '100%'
          }}>
            <div className="chart-box" style={{ width: '100%', height: 420, minWidth: 350, minHeight: 320, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #eee', padding: 16 }}>
              <h4>Pie Chart by Category ({chartType === 'expense' ? 'Expense' : 'Income'})</h4>
              <Pie data={pieData} options={{
                onClick: (evt, elems) => onPieClick(elems),
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      generateLabels: (chart) => {
                        const data = chart.data;
                        return percentLabels.map((label, i) => ({
                          text: label,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          strokeStyle: data.datasets[0].backgroundColor[i],
                          index: i
                        }));
                      }
                    }
                  }
                }
              }} style={{ width: '100%', height: 360 }} />
            </div>
            <div className="chart-box" style={{ width: '100%', height: 420, minWidth: 350, minHeight: 320, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #eee', padding: 16 }}>
              <h4>Bar Chart ({chartType === 'expense' ? 'Expense' : 'Income'})</h4>
              <Bar data={barDataFiltered} style={{ width: '100%', height: 360 }} />
            </div>
          </div>

          {/* Chi tiết từng danh mục */}
          <div className="category-details-list" style={{marginTop:32}}>
            <h4 style={{marginBottom:12}}>View details by category</h4>
            {pieData.labels.length === 0 && <div>No data found.</div>}
            {pieData.labels.map((cat, i) => (
              <div key={cat} style={{borderBottom:'1px solid #eee', padding:'8px 0'}}>
                <button
                  style={{background:'none', border:'none', color:'#2d7be5', fontWeight:'bold', cursor:'pointer'}}
                  onClick={() => toggleCategory(cat)}
                >
                  {expandedCategories.includes(cat) ? '▼' : '►'} {cat} ({pieData.datasets[0].data[i].toLocaleString()} đ)
                </button>
                {expandedCategories.includes(cat) && (
                  <div style={{marginLeft:24, marginTop:6}}>
                    {filtered.filter(exp => exp.category === cat).length === 0
                      ? <div style={{color:'#888'}}>Không có giao dịch nào.</div>
                      : filtered.filter(exp => exp.category === cat).map((exp, idx) => (
                          <div key={exp._id || idx} style={{fontSize:'15px', marginBottom:4}}>
                            {exp.note ? <span style={{color:'#888'}}>{exp.note}: </span> : null}
                            <span style={{color: chartType === 'expense' ? '#e74c3c' : '#27ae60', fontWeight:'bold'}}>
                              {exp.amount.toLocaleString()} đ
                            </span>
                            <span style={{marginLeft:8, color:'#555'}}>{new Date(exp.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
