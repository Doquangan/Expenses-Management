import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import API_BASE from '../../config';
import { SparkleIcon } from '../../components/Icons';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './Dashboard.css';

function Dashboard() {
  const [summary, setSummary] = useState({ totalExpense: 0, totalIncome: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const toggleCategory = (cat) => {
    setExpandedCategories(prev => prev.includes(cat)
      ? prev.filter(c => c !== cat)
      : [...prev, cat]);
  };
  const [chartType, setChartType] = useState('expense');
  const [filterType, setFilterType] = useState('month');
  const [filterValue, setFilterValue] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [limitWarnings, setLimitWarnings] = useState([]);
  const [loadingWarnings, setLoadingWarnings] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAiPopup, setShowAiPopup] = useState(false);

  const fetchAiSuggestion = async () => {
    setLoadingAi(true);
    setShowAiPopup(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/ai/saving-suggestion`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAiSuggestion(data.suggestion || 'Không có gợi ý.');
    } catch {
      setAiSuggestion('Không thể lấy gợi ý từ AI.');
    }
    setLoadingAi(false);
  };

  useEffect(() => {
    const fetchWarnings = async () => {
      setLoadingWarnings(true);
      try {
        const token = localStorage.getItem('token');
        let periodValue = '';
        if (filterType === 'month' && filterValue) periodValue = filterValue;
        else {
          const now = new Date();
          periodValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        const res = await fetch(`${API_BASE}/dashboard/limit-warnings?period=month&periodValue=${periodValue}`, {
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

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE}/dashboard/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setSummary(data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/expenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setExpenses(data);
    };
    fetchExpenses();
  }, []);

  const filtered = expenses.filter(exp => {
    if (exp.type !== chartType) return false;
    if (filterType === 'day' && filterValue) return exp.date?.slice(0,10) === filterValue;
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

  const totalExpense = expenses.filter(exp => exp.type === 'expense').filter(exp => {
    if (filterType === 'day' && filterValue) return exp.date?.slice(0,10) === filterValue;
    if (filterType === 'month' && filterValue) {
      const d = new Date(exp.date);
      return d.getMonth() + 1 === Number(filterValue.split('-')[1]) && d.getFullYear() === Number(filterValue.split('-')[0]);
    }
    if (filterType === 'year' && filterValue) return new Date(exp.date).getFullYear() === Number(filterValue);
    return true;
  }).reduce((sum, exp) => sum + Math.abs(exp.amount), 0);

  const totalIncome = expenses.filter(exp => exp.type === 'income').filter(exp => {
    if (filterType === 'day' && filterValue) return exp.date?.slice(0,10) === filterValue;
    if (filterType === 'month' && filterValue) {
      const d = new Date(exp.date);
      return d.getMonth() + 1 === Number(filterValue.split('-')[1]) && d.getFullYear() === Number(filterValue.split('-')[0]);
    }
    if (filterType === 'year' && filterValue) return new Date(exp.date).getFullYear() === Number(filterValue);
    return true;
  }).reduce((sum, exp) => sum + Math.abs(exp.amount), 0);

  const categoryData = {};
  filtered.forEach(exp => {
    if (!categoryData[exp.category]) categoryData[exp.category] = 0;
    categoryData[exp.category] += Math.abs(exp.amount);
  });

  const CHART_COLORS = [
    '#4f6ef7', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  ];

  const pieData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: Object.keys(categoryData).map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
      borderWidth: 0,
    }]
  };

  const totalPie = Object.values(categoryData).reduce((a, b) => a + b, 0);
  const percentLabels = pieData.labels.map((cat, i) => {
    const val = pieData.datasets[0].data[i];
    const percent = totalPie ? ((val / totalPie) * 100).toFixed(1) : 0;
    return `${cat} (${percent}%)`;
  });

  let barLabels = [], barValues = [];
  if (filterType === 'month' && filterValue) {
    const days = {};
    filtered.forEach(exp => { const day = exp.date?.slice(8,10); if (!days[day]) days[day] = 0; days[day] += Math.abs(exp.amount); });
    barLabels = Object.keys(days); barValues = Object.values(days);
  } else if (filterType === 'year' && filterValue) {
    const months = {};
    filtered.forEach(exp => { const month = new Date(exp.date).getMonth() + 1; if (!months[month]) months[month] = 0; months[month] += Math.abs(exp.amount); });
    barLabels = Object.keys(months); barValues = Object.values(months);
  } else {
    barLabels = Object.keys(categoryData); barValues = Object.values(categoryData);
  }
  const barData = {
    labels: barLabels,
    datasets: [{
      label: chartType === 'expense' ? 'Expense' : 'Income',
      data: barValues,
      backgroundColor: chartType === 'expense' ? 'rgba(79, 110, 247, 0.7)' : 'rgba(34, 197, 94, 0.7)',
      borderRadius: 6,
    }]
  };

  const onPieClick = (elems) => {
    if (elems.length > 0) setSelectedCategory(pieData.labels[elems[0].index]);
    else setSelectedCategory(null);
  };

  let barDataFiltered = barData;
  if (selectedCategory) {
    const filteredByCat = filtered.filter(exp => exp.category === selectedCategory);
    if (filterType === 'month' && filterValue) {
      const days = {}; filteredByCat.forEach(exp => { const day = exp.date?.slice(8,10); if (!days[day]) days[day] = 0; days[day] += Math.abs(exp.amount); });
      barDataFiltered = { labels: Object.keys(days), datasets: [{ label: selectedCategory, data: Object.values(days), backgroundColor: 'rgba(245, 158, 11, 0.7)', borderRadius: 6 }] };
    } else if (filterType === 'year' && filterValue) {
      const months = {}; filteredByCat.forEach(exp => { const month = new Date(exp.date).getMonth() + 1; if (!months[month]) months[month] = 0; months[month] += Math.abs(exp.amount); });
      barDataFiltered = { labels: Object.keys(months), datasets: [{ label: selectedCategory, data: Object.values(months), backgroundColor: 'rgba(245, 158, 11, 0.7)', borderRadius: 6 }] };
    } else {
      barDataFiltered = { labels: [selectedCategory], datasets: [{ label: selectedCategory, data: [categoryData[selectedCategory]], backgroundColor: 'rgba(245, 158, 11, 0.7)', borderRadius: 6 }] };
    }
  }

  const monthCompare = (type) => {
    if (filterType !== 'month' || !filterValue) return null;
    const [year, month] = filterValue.split('-').map(Number);
    let prevMonth = month - 1, prevYear = year;
    if (prevMonth < 1) { prevMonth = 12; prevYear -= 1; }
    const total = expenses.filter(e => e.type === type).filter(e => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
    }).reduce((s, e) => s + Math.abs(e.amount), 0);
    const current = type === 'expense' ? totalExpense : totalIncome;
    const diff = current - total;
    return { diff, isPositive: diff > 0 };
  };

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-top">
          <h2 className="page-title">Dashboard</h2>
          <button className="btn btn-primary ai-btn" onClick={fetchAiSuggestion}>
            <SparkleIcon size={16} color="#fff" /> AI Saving Tips
          </button>
        </div>

        {showAiPopup && (
          <Modal title="AI Saving Suggestions" onClose={() => setShowAiPopup(false)}>
            {loadingAi ? (
              <div className="ai-loading">Analyzing your spending data...</div>
            ) : (
              <div className="ai-content">{aiSuggestion.split('\n').map((line, idx) => <div key={idx}>{line}</div>)}</div>
            )}
          </Modal>
        )}

        {!loadingWarnings && limitWarnings.length > 0 && (
          <div className="warnings-section">
            {limitWarnings.map(warn => (
              <div key={warn.limitId} className={`warning-card ${warn.type}`}>
                <div className="warning-label">
                  <strong>{warn.categoryName || 'All Categories'}</strong>
                  <span className="warning-tag">{warn.type === 'over' ? 'EXCEEDED' : 'Warning 80%'}</span>
                </div>
                <div className="warning-bar-track">
                  <div className="warning-bar-fill" style={{ width: `${Math.min(warn.percent, 100)}%` }}></div>
                </div>
                <div className="warning-amounts">
                  {warn.total.toLocaleString()} / {warn.amount.toLocaleString()} VNĐ ({warn.percent}%)
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="summary-cards">
          <div className="summary-card expense-card">
            <div className="summary-card-label">Total Expense</div>
            <div className="summary-card-value">{totalExpense.toLocaleString()} đ</div>
            {(() => {
              const cmp = monthCompare('expense');
              if (!cmp) return null;
              return <div className={`summary-diff ${cmp.diff > 0 ? 'negative' : 'positive'}`}>{cmp.diff > 0 ? '↑' : '↓'} {Math.abs(cmp.diff).toLocaleString()} đ vs last month</div>;
            })()}
          </div>
          <div className="summary-card income-card">
            <div className="summary-card-label">Total Income</div>
            <div className="summary-card-value">{totalIncome.toLocaleString()} đ</div>
            {(() => {
              const cmp = monthCompare('income');
              if (!cmp) return null;
              return <div className={`summary-diff ${cmp.diff > 0 ? 'positive' : 'negative'}`}>{cmp.diff > 0 ? '↑' : '↓'} {Math.abs(cmp.diff).toLocaleString()} đ vs last month</div>;
            })()}
          </div>
          <div className="summary-card balance-card">
            <div className="summary-card-label">Balance</div>
            <div className="summary-card-value">{(totalIncome - totalExpense).toLocaleString()} đ</div>
          </div>
        </div>

        <div className="dashboard-filters">
          <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
          {filterType === 'day' && <input className="form-input" type="date" value={filterValue} onChange={e => setFilterValue(e.target.value)} />}
          {filterType === 'month' && <input className="form-input" type="month" value={filterValue} onChange={e => setFilterValue(e.target.value)} />}
          {filterType === 'year' && <input className="form-input" type="number" min="2020" max="2100" placeholder="Year" value={filterValue} onChange={e => setFilterValue(e.target.value)} />}
          {selectedCategory && <button className="btn btn-ghost" onClick={() => setSelectedCategory(null)}>Clear filter</button>}
          <select className="form-select" value={chartType} onChange={e => setChartType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="chart-grid">
          <div className="chart-card">
            <h4>By Category ({chartType === 'expense' ? 'Expense' : 'Income'})</h4>
            <Pie data={pieData} options={{
              onClick: (evt, elems) => onPieClick(elems),
              plugins: {
                legend: { position: 'right', labels: {
                  generateLabels: (chart) => {
                    const data = chart.data;
                    return percentLabels.map((label, i) => ({
                      text: label,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].backgroundColor[i],
                      index: i
                    }));
                  },
                  font: { family: 'Inter', size: 12 },
                  padding: 14,
                }}
              }
            }} />
          </div>
          <div className="chart-card">
            <h4>Trend ({chartType === 'expense' ? 'Expense' : 'Income'})</h4>
            <Bar data={barDataFiltered} options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } }
            }} />
          </div>
        </div>

        <div className="category-details card">
          <h4 className="category-details-title">Details by category</h4>
          {pieData.labels.length === 0 && <div className="empty-state">No data found.</div>}
          {pieData.labels.map((cat, i) => (
            <div key={cat} className="category-row">
              <button className="category-toggle" onClick={() => toggleCategory(cat)}>
                <span className="toggle-arrow">{expandedCategories.includes(cat) ? '▾' : '▸'}</span>
                <span className="toggle-name">{cat}</span>
                <span className="toggle-amount">{pieData.datasets[0].data[i].toLocaleString()} đ</span>
              </button>
              {expandedCategories.includes(cat) && (
                <div className="category-transactions">
                  {filtered.filter(exp => exp.category === cat).length === 0
                    ? <div className="empty-state">No transactions.</div>
                    : filtered.filter(exp => exp.category === cat).map((exp, idx) => (
                      <div key={exp._id || idx} className="transaction-row">
                        {exp.note && <span className="transaction-note">{exp.note}: </span>}
                        <span className={`transaction-amount ${chartType}`}>{exp.amount.toLocaleString()} đ</span>
                        <span className="transaction-date">{new Date(exp.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
