import React, { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';
import { BotIcon, UserIcon, SendIcon, SparkleIcon } from '../../components/Icons';
import './ChatbotPage.css';

const SUGGESTIONS = [
  'Tháng này tôi chi tiêu bao nhiêu?',
  'Tôi có đang vượt hạn mức không?',
  'Hãy phân tích chi tiêu của tôi',
  'Gợi ý cách tiết kiệm cho tôi',
];

function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Không thể kết nối đến AI.');
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
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

  return (
    <Layout>
      <div className="chatbot-container">
        <div className="chat-header">
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
    </Layout>
  );
}

export default ChatbotPage;
