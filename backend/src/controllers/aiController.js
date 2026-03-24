// AI Controller: Gợi ý tiết kiệm và Chatbot dùng Google Gemini
const { GoogleGenAI } = require("@google/genai");
const Expense = require('../models/Expense');
const Limit = require('../models/Limit');
const Category = require('../models/Category');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

// Helper to get genAI instance lazily
const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

// ========== GỢI Ý TIẾT KIỆM (Tự động) ==========
exports.getSavingSuggestion = async (req, res) => {
  try {
    const userId = req.user.userId;
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
    }).populate('categoryId');

    // Tổng hợp chi tiêu theo danh mục
    let summary = '';
    let total = 0;
    const byCategory = {};
    expenses.forEach(exp => {
      const catName = exp.categoryId?.name || exp.category || 'Khác';
      if (!byCategory[catName]) byCategory[catName] = 0;
      byCategory[catName] += Math.abs(exp.amount);
      total += Math.abs(exp.amount);
    });

    Object.keys(byCategory).forEach(cat => {
      summary += `- ${cat}: ${byCategory[cat].toLocaleString('vi-VN')} VNĐ\n`;
    });

    // Lấy hạn mức tháng hiện tại
    const periodValue = `${year}-${String(month).padStart(2, '0')}`;
    const limits = await Limit.find({
      userId: userId,
      period: 'month',
      periodValue: periodValue
    }).populate('categoryId');

    let limitSummary = '';
    const limitMap = {};
    limits.forEach(lim => {
      const catName = lim.categoryId?.name || 'Tổng';
      limitSummary += `- ${catName}: ${lim.amount.toLocaleString('vi-VN')} VNĐ\n`;
      limitMap[catName] = lim.amount;
    });

    const helpPrompt = `Bạn là một chuyên gia tài chính. Dựa trên dữ liệu dưới đây, hãy đưa ra 3 lời khuyên tiết kiệm ngắn gọn nhất (tối đa 2 câu mỗi lời khuyên) bằng tiếng Việt.

DỮ LIỆU CHI TIÊU THÁNG ${month}/${year}:
${summary || '(Chưa có chi tiêu)'}
Tổng chi tiêu: ${total.toLocaleString('vi-VN')} VNĐ

HẠN MỨC ĐÃ ĐẶT:
${limitSummary || '(Chưa đặt hạn mức)'}

Lưu ý: Nếu chi tiêu vượt quá hạn mức, hãy cảnh báo ngay. Dùng emoji phù hợp.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: helpPrompt,
    });
    const suggestions = response.text;

    res.json({ suggestion: suggestions });
  } catch (err) {
    console.error('Gemini suggestion error:', err);
    res.status(500).json({ error: 'AI service error', detail: err.message });
  }
};

// ========== CHATBOT: Trả lời câu hỏi dùng Google Gemini ==========
exports.handleChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { messages, conversationId } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages is required and must be a non-empty array.' });
    }

    // --- Lấy dữ liệu chi tiêu tháng hiện tại ---
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const expenses = await Expense.find({
      userId: userId,
      date: { $gte: start, $lt: end }
    }).populate('categoryId');

    // --- Tổng hợp chi tiết ---
    let totalExpense = 0;
    let totalIncome = 0;
    const byCategory = {};
    const recentTransactions = [];

    expenses.forEach(exp => {
      const catName = exp.categoryId?.name || exp.category || 'Khác';
      const amount = Math.abs(exp.amount);
      if (exp.type === 'expense') {
        totalExpense += amount;
        if (!byCategory[catName]) byCategory[catName] = 0;
        byCategory[catName] += amount;
      } else {
        totalIncome += amount;
      }
      recentTransactions.push({
        type: exp.type,
        amount: exp.amount,
        category: catName,
        description: exp.description || '',
        date: exp.date.toISOString().split('T')[0]
      });
    });

    let expenseSummary = '';
    Object.keys(byCategory).forEach(cat => {
      expenseSummary += `  - ${cat}: ${byCategory[cat].toLocaleString('vi-VN')} VNĐ\n`;
    });

    // --- Lấy hạn mức ---
    const periodValue = `${year}-${String(month).padStart(2, '0')}`;
    const limits = await Limit.find({
      userId: userId,
      period: 'month',
      periodValue: periodValue
    }).populate('categoryId');

    let limitSummary = '';
    limits.forEach(lim => {
      const catName = lim.categoryId?.name || 'Tổng';
      limitSummary += `  - ${catName}: ${lim.amount.toLocaleString('vi-VN')} VNĐ\n`;
    });

    // --- Lấy danh mục ---
    const categories = await Category.find({ $or: [{ user: null }, { user: userId }] });
    const categoryNames = categories.map(c => c.name).join(', ');

    // --- Xây dựng System Context cho Gemini ---
    const systemInstruction = `Bạn là một trợ lý tài chính cá nhân thông minh. Dưới đây là dữ liệu thực tế của người dùng tháng ${month}/${year}:
📊 TỔNG QUAN:
- Tổng chi: ${totalExpense.toLocaleString('vi-VN')} VNĐ
- Tổng thu: ${totalIncome.toLocaleString('vi-VN')} VNĐ
- Số dư: ${(totalIncome - totalExpense).toLocaleString('vi-VN')} VNĐ

📂 CHI THEO DANH MỤC:
${expenseSummary || '  (Trống)'}

🎯 HẠN MỨC:
${limitSummary || '  (Chưa đặt)'}

📋 DANH MỤC CÓ SẴN: ${categoryNames}

📝 GIAO DỊCH GẦN ĐÂY:
${recentTransactions.slice(0, 15).map(t => `  - [${t.date}] ${t.category}: ${Math.abs(t.amount).toLocaleString('vi-VN')} VNĐ ${t.description ? '(' + t.description + ')' : ''}`).join('\n')}

Quy tắc: Tiếng Việt, thân thiện, dựa trên dữ liệu thực tế ở trên để trả lời, format đẹp dùng emoji.`;

    // --- Chuyển lịch sử chat sang định dạng của Gemini (user/model) ---
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const lastUserMessage = messages[messages.length - 1].content;

    // --- Gọi Gemini API (New SDK) ---
    const ai = getAI();
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: history,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const result = await chat.sendMessage({ message: lastUserMessage });
    const reply = result.text;

    // --- Lưu lịch sử vào DB ---
    let conversation;
    const userMsg = { role: 'user', content: lastUserMessage };
    const assistantMsg = { role: 'assistant', content: reply };

    if (conversationId) {
      // Append vào conversation đã có
      conversation = await Conversation.findOneAndUpdate(
        { _id: conversationId, userId },
        { $push: { messages: { $each: [userMsg, assistantMsg] } } },
        { new: true }
      );
    }

    if (!conversation) {
      // Tạo conversation mới
      const title = lastUserMessage.length > 50
        ? lastUserMessage.substring(0, 50) + '...'
        : lastUserMessage;

      conversation = await Conversation.create({
        userId,
        title,
        messages: [...messages.slice(0, -1).map(m => ({
          role: m.role,
          content: m.content,
        })), userMsg, assistantMsg],
      });
    }

    res.json({ reply, conversationId: conversation._id });

  } catch (err) {
    console.error('Gemini Chat error:', err);
    res.status(500).json({ error: 'AI service error', detail: err.message });
  }
};
