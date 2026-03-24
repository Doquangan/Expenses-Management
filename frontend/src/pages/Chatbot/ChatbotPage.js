import React, { useState, useRef, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { BotIcon, UserIcon, SendIcon, SparkleIcon } from '../../components/Icons';
import './ChatbotPage.css';

const API_BASE = 'http://localhost:3000/api';

const SUGGESTIONS = [
  'Tháng này tôi chi tiêu bao nhiêu?',
  'Tôi có đang vượt hạn mức không?',
  'Hãy phân tích chi tiêu của tôi',
  'Gợi ý cách tiết kiệm cho tôi',
];

// ==================== ICONS ====================
const PlusIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ChatIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MenuIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// ==================== HELPERS ====================
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

// ==================== COMPONENT ====================
function ChatbotPage() {
  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Conversation state
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // ===== Scroll & Auto-resize =====
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '46px';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // ===== Load danh sách conversations khi mount =====
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await fetch(`${API_BASE}/conversations`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ===== Load chi tiết conversation =====
  const loadConversation = async (id) => {
    try {
      setError('');
      const res = await fetch(`${API_BASE}/conversations/${id}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setActiveConversationId(data._id);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  // ===== Tạo cuộc trò chuyện mới =====
  const startNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    setError('');
    setInput('');
  };

  // ===== Xóa conversation =====
  const deleteConversation = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/conversations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c._id !== id));
        if (activeConversationId === id) {
          startNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // ===== Gửi tin nhắn =====
  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          messages: newMessages,
          conversationId: activeConversationId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Không thể kết nối đến AI.');
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);

      // Cập nhật conversationId nếu là cuộc trò chuyện mới
      if (data.conversationId) {
        setActiveConversationId(data.conversationId);
        // Refresh danh sách conversations
        fetchConversations();
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ==================== RENDER ====================
  return (
    <Layout>
      <div className="chatbot-page">
        {/* ===== SIDEBAR ===== */}
        <aside className={`chat-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h3>Lịch sử chat</h3>
            <button className="new-chat-btn" onClick={startNewChat} title="Cuộc trò chuyện mới">
              <PlusIcon size={16} />
              <span>Mới</span>
            </button>
          </div>

          <div className="conversation-list">
            {loadingConversations ? (
              <div className="sidebar-loading">Đang tải...</div>
            ) : conversations.length === 0 ? (
              <div className="sidebar-empty">Chưa có cuộc trò chuyện nào</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`conversation-item ${activeConversationId === conv._id ? 'active' : ''}`}
                  onClick={() => loadConversation(conv._id)}
                >
                  <div className="conversation-icon">
                    <ChatIcon size={14} />
                  </div>
                  <div className="conversation-info">
                    <span className="conversation-title">{conv.title}</span>
                    <span className="conversation-time">{formatTime(conv.updatedAt)}</span>
                  </div>
                  <button
                    className="conversation-delete"
                    onClick={(e) => deleteConversation(e, conv._id)}
                    title="Xóa"
                  >
                    <TrashIcon size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ===== MAIN CHAT AREA ===== */}
        <div className="chatbot-container">
          <div className="chat-header">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar"
            >
              <MenuIcon size={20} />
            </button>
            <div className="chat-header-icon">
              <BotIcon size={22} color="#fff" />
            </div>
            <div className="chat-header-info">
              <h2>AI Financial Assistant</h2>
              <p>Ask anything about your spending</p>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && !isLoading ? (
              <div className="chat-welcome">
                <div className="chat-welcome-icon">
                  <SparkleIcon size={48} color="var(--primary)" />
                </div>
                <h3>Welcome to AI Assistant!</h3>
                <p>I can help you analyze spending, check limits, and give saving advice based on your real data.</p>
                <div className="chat-suggestions">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    <div className="chat-avatar">
                      {msg.role === 'user' ? <UserIcon size={16} /> : <BotIcon size={16} />}
                    </div>
                    <div className="chat-bubble">{msg.content}</div>
                  </div>
                ))}
                {isLoading && (
                  <div className="typing-indicator">
                    <div className="chat-avatar assistant-avatar">
                      <BotIcon size={16} />
                    </div>
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                {error && <div className="chat-error">{error}</div>}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="chat-input-area">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your expenses..."
              rows={1}
              disabled={isLoading}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              title="Send"
            >
              <SendIcon size={18} color="#fff" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ChatbotPage;
