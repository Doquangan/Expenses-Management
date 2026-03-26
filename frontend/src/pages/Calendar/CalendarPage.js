import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import './CalendarPage.css';

const API_BASE = 'http://localhost:3000/api';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewExpense, setViewExpense] = useState(null);

  // Fetch all expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/expenses`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (res.ok) setExpenses(data);
      } catch (err) {
        console.error('Failed to load expenses:', err);
      }
      setLoading(false);
    };
    fetchExpenses();
  }, []);

  // Group expenses by date string (YYYY-MM-DD)
  const groupedByDate = useMemo(() => {
    const map = {};
    expenses.forEach((exp) => {
      const dateStr = exp.date?.slice(0, 10);
      if (!dateStr) return;
      if (!map[dateStr]) map[dateStr] = { income: 0, expense: 0, items: [] };
      const amount = Math.abs(exp.amount);
      if (exp.type === 'income') map[dateStr].income += amount;
      else map[dateStr].expense += amount;
      map[dateStr].items.push(exp);
    });
    return map;
  }, [expenses]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday = 0, Sunday = 6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days = [];

    // Empty slots before first day
    for (let i = 0; i < startDow; i++) {
      days.push({ day: null, dateStr: null });
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr });
    }

    return days;
  }, [currentMonth, currentYear]);

  const isToday = (dateStr) => {
    return dateStr === today.toISOString().slice(0, 10);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  // Monthly totals
  const monthlyTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    Object.keys(groupedByDate).forEach((dateStr) => {
      const [y, m] = dateStr.split('-').map(Number);
      if (y === currentYear && m === currentMonth + 1) {
        income += groupedByDate[dateStr].income;
        expense += groupedByDate[dateStr].expense;
      }
    });
    return { income, expense };
  }, [groupedByDate, currentMonth, currentYear]);

  const selectedDayData = selectedDate ? groupedByDate[selectedDate] : null;

  return (
    <Layout>
      <div className="calendar-page">
        <h2 className="page-title">Calendar</h2>

        {/* Monthly Summary */}
        <div className="calendar-summary">
          <div className="summary-card income">
            <span className="summary-label">Income</span>
            <span className="summary-amount">+{monthlyTotals.income.toLocaleString()} đ</span>
          </div>
          <div className="summary-card expense">
            <span className="summary-label">Expense</span>
            <span className="summary-amount">-{monthlyTotals.expense.toLocaleString()} đ</span>
          </div>
          <div className="summary-card balance">
            <span className="summary-label">Balance</span>
            <span className="summary-amount">{(monthlyTotals.income - monthlyTotals.expense).toLocaleString()} đ</span>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="calendar-nav">
          <button className="cal-nav-btn" onClick={prevMonth}>&lt;</button>
          <h3>{MONTH_NAMES[currentMonth]} {currentYear}</h3>
          <button className="cal-nav-btn" onClick={nextMonth}>&gt;</button>
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : (
          <div className="calendar-grid">
            {/* Weekday Headers */}
            {WEEKDAYS.map((day) => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}

            {/* Day Cells */}
            {calendarDays.map((cell, idx) => {
              if (!cell.day) return <div key={idx} className="calendar-cell empty" />;
              const data = groupedByDate[cell.dateStr];
              return (
                <div
                  key={idx}
                  className={`calendar-cell ${isToday(cell.dateStr) ? 'today' : ''} ${data ? 'has-data' : ''} ${selectedDate === cell.dateStr ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(cell.dateStr)}
                >
                  <span className="cell-day">{cell.day}</span>
                  {data && (
                    <div className="cell-amounts">
                      {data.income > 0 && <span className="cell-income">+{data.income >= 1000000 ? (data.income / 1000000).toFixed(1) + 'M' : data.income >= 1000 ? (data.income / 1000).toFixed(0) + 'k' : data.income}</span>}
                      {data.expense > 0 && <span className="cell-expense">-{data.expense >= 1000000 ? (data.expense / 1000000).toFixed(1) + 'M' : data.expense >= 1000 ? (data.expense / 1000).toFixed(0) + 'k' : data.expense}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Day Detail Panel */}
        {selectedDate && (
          <div className="day-detail-panel">
            <div className="day-detail-header">
              <h4>Transactions on {selectedDate}</h4>
              <button className="cal-nav-btn" onClick={() => setSelectedDate(null)}>×</button>
            </div>
            {!selectedDayData || selectedDayData.items.length === 0 ? (
              <p className="no-transactions">No transactions on this day.</p>
            ) : (
              <div className="day-transactions">
                {selectedDayData.items.map((exp) => (
                  <div
                    key={exp.id || exp._id}
                    className="day-tx-item"
                    onClick={() => setViewExpense(exp)}
                  >
                    <div className="tx-left">
                      {exp.image && <img src={exp.image} alt="" className="tx-thumb" />}
                      <div className="tx-info">
                        <span className="tx-desc">{exp.description || 'No description'}</span>
                        <span className="tx-cat">{exp.category}</span>
                      </div>
                    </div>
                    <span className={`tx-amount ${exp.type}`}>
                      {exp.type === 'expense' ? '-' : '+'}{Math.abs(exp.amount).toLocaleString()} đ
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transaction Detail Modal */}
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

export default CalendarPage;
