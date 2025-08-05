// AI Controller: Gợi ý tiết kiệm
// require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const Expense = require('../models/Expense');
const Limit = require('../models/Limit');
const Category = require('../models/Category');
const User = require('../models/User');

const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.getSavingSuggestion = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('AI suggestion for user:', userId);
    // Lấy chi tiêu tháng hiện tại
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const expenses = await Expense.find({
      userId: userId,
      type: 'expense',
      date: { $gte: start, $lt: end }
    }).populate('category');
    console.log('Expenses:', expenses);
    // Tổng hợp chi tiêu theo danh mục
    let summary = '';
    let total = 0;
    const byCategory = {};
    expenses.forEach(exp => {
      const cat = exp.category || 'Khác';
      if (!byCategory[cat]) byCategory[cat] = 0;
      byCategory[cat] += Math.abs(exp.amount);
      total += Math.abs(exp.amount);
    });
    console.log('byCategory:', byCategory);
    Object.keys(byCategory).forEach(cat => {
      summary += `- ${cat}: ${byCategory[cat].toLocaleString()} VNĐ\n`;
    });
    // Lấy hạn mức đúng tháng hiện tại, populate categoryId để lấy tên danh mục
    const periodValue = `${year}-${String(month).padStart(2, '0')}`;
    const limits = await Limit.find({
      userId: userId,
      period: 'month',
      periodValue: periodValue
    }).populate('categoryId');
    console.log('Limits:', limits);
    let limitSummary = '';
    const limitMap = {};
    limits.forEach(lim => {
      const catName = lim.categoryId?.name || 'Tổng';
      limitSummary += `- ${catName}: ${lim.amount.toLocaleString()} VNĐ\n`;
      limitMap[catName] = lim.amount;
    });
    console.log('limitMap:', limitMap);

    let suggestions = [];
    Object.keys(byCategory).forEach(cat => {
    const spent = byCategory[cat];
    const limit = limitMap[cat] || null;
    // console.log(`Category: ${cat}, Spent: ${spent}, Limit: ${limit}`);    
    if (limit && spent > limit) {
        suggestions.push(`Bạn đã vượt hạn mức ở danh mục "${cat}". Hãy giảm chi tiêu ở mục này.`);
    } else if (limit && spent > 0.8 * limit) {
        suggestions.push(`Chi tiêu ở "${cat}" đã gần chạm hạn mức (${spent.toLocaleString()} / ${limit.toLocaleString()} VNĐ). Nên cân nhắc tiết kiệm thêm.`);
    } else if (!limit) {
        suggestions.push(`Danh mục "${cat}" chưa có hạn mức. Hãy cân nhắc đặt hạn mức để kiểm soát chi tiêu tốt hơn.`);
    }
    });

    // Gợi ý tổng thể
    if (typeof limitMap['Tổng'] === 'undefined') {
      suggestions.push('Bạn chưa đặt hạn mức tổng cho tháng này. Hãy cân nhắc đặt hạn mức tổng để kiểm soát chi tiêu toàn bộ tốt hơn.');
    } else if (total > limitMap['Tổng']) {
      suggestions.push('Tổng chi tiêu tháng này đã vượt hạn mức. Hãy xem lại các khoản chi lớn và ưu tiên tiết kiệm.');
    } else if (total > 0.8 * limitMap['Tổng']) {
      suggestions.push('Tổng chi tiêu tháng này đã gần chạm hạn mức. Nên kiểm soát các khoản chi tiếp theo.');
    }

    // Nếu không có cảnh báo, gợi ý tiết kiệm chung
    if (suggestions.length === 0) {
      suggestions.push('Chi tiêu của bạn đang trong mức kiểm soát. Hãy tiếp tục duy trì thói quen tiết kiệm!');
    }

    res.json({ suggestion: suggestions.join('\n') });
  } catch (err) {
    console.error('AI suggestion error:', err);
    res.status(500).json({ error: 'AI service error', detail: err.message });
  }
};
