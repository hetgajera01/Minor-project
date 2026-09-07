import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaRobot, FaPaperPlane, FaLeaf, FaSpinner, FaChevronDown, FaMicrophone, FaHistory } from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';

const SUGGESTED_QUESTIONS = [
  "My wheat leaves are turning yellow. What should I do?",
  "When should I irrigate my cotton crop?",
  "Which fertilizer is best for rice at tillering stage?",
  "Why are my farming expenses increasing this month?",
  "When is the best time to sell my wheat?",
  "How can I improve my soil quality?",
  "What crop should I grow this Rabi season?",
  "How do I protect my tomato crop from pests?",
];

const SEASONS = ['Kharif (June-Nov)', 'Rabi (Nov-Apr)', 'Zaid (Apr-June)'];
const CROPS = ['Rice', 'Wheat', 'Cotton', 'Maize', 'Sugarcane', 'Soybean', 'Groundnut', 'Tomato', 'Onion', 'Potato', 'Chickpea', 'Mustard'];

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const AgriAI = ({ userEmail, userCrop, userLocation }) => {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [sessionId, setSessionId]   = useState(null);
  const [crop, setCrop]             = useState(userCrop || '');
  const [season, setSeason]         = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [error, setError]           = useState('');
  const bottomRef                   = useRef(null);
  const inputRef                    = useRef(null);

  // Welcome message on first load
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `🌱 **Namaste! I'm AgriAI**, your personal agricultural advisor.\n\nI can help you with:\n- Crop selection and planting schedules\n- Soil health and fertilizer advice\n- Pest and disease management\n- Farm financial planning\n- Weather impact on your crops\n- Best time to sell your produce\n\nWhat can I help you with today?`,
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    setInput('');
    setError('');
    setShowSuggestions(false);

    const userMessage = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post(`${API}/user/ai/chat`, {
        email: userEmail,
        message: msg,
        sessionId,
        context: { crop, season, location: userLocation },
      });
      setSessionId(res.data.sessionId);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(),
        source: res.data.source,
      }]);
    } catch (err) {
      setError('Unable to connect to AgriAI. Please try again.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: '🌱 Chat cleared. How can I help you with your farm today?',
      timestamp: new Date(),
    }]);
    setSessionId(null);
    setShowSuggestions(true);
  };

  // Render markdown-like formatting
  function renderContent(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 560, fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #15803d, #166534)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaRobot style={{ fontSize: 22, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>AgriAI Assistant</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Powered by Gemini · Agricultural Expert</div>
          </div>
        </div>
        <button onClick={clearChat} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
          New Chat
        </button>
      </div>

      {/* Context Bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <select value={crop} onChange={e => setCrop(e.target.value)} style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 8, padding: '7px 10px', fontSize: 13, background: '#fff', color: '#374151' }}>
          <option value="">🌿 Select Crop (optional)</option>
          {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={season} onChange={e => setSeason(e.target.value)} style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 8, padding: '7px 10px', fontSize: 13, background: '#fff', color: '#374151' }}>
          <option value="">☀️ Season (optional)</option>
          {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1, overflowY: 'auto', background: '#f9fafb',
        border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 12,
        minHeight: 320, maxHeight: 400,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaLeaf style={{ fontSize: 14, color: '#16a34a' }} />
              </div>
            )}
            <div style={{
              maxWidth: '80%',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #15803d, #16a34a)' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#111827',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              padding: '12px 16px',
              fontSize: 14, lineHeight: 1.7,
              border: msg.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6, textAlign: 'right' }}>
                {formatTime(msg.timestamp)}
                {msg.source === 'rule-based' && ' · Built-in KB'}
                {msg.source === 'gemini' && ' · Gemini AI'}
              </div>
            </div>
            {msg.role === 'user' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GiWheat style={{ fontSize: 16, color: '#2563eb' }} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaLeaf style={{ fontSize: 14, color: '#16a34a' }} />
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px 14px 14px 4px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#16a34a',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested Questions */}
      {showSuggestions && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Suggested questions
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)} style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20,
                padding: '5px 12px', fontSize: 12, color: '#15803d', cursor: 'pointer',
                fontWeight: 500, transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about your crops, soil, finances, market prices..."
          rows={2}
          style={{
            flex: 1, border: '1.5px solid #d1d5db', borderRadius: 12,
            padding: '10px 14px', fontSize: 14, resize: 'none',
            fontFamily: "'Inter', sans-serif", outline: 'none', color: '#111827',
            lineHeight: 1.5,
          }}
          onFocus={e => e.target.style.borderColor = '#16a34a'}
          onBlur={e => e.target.style.borderColor = '#d1d5db'}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#9ca3af' : '#16a34a',
            border: 'none', borderRadius: 12, width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s', flexShrink: 0,
          }}
        >
          {loading ? <FaSpinner style={{ color: '#fff', fontSize: 16, animation: 'spin 1s linear infinite' }} /> : <FaPaperPlane style={{ color: '#fff', fontSize: 15 }} />}
        </button>
      </div>

      <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
        ⚠️ AI advice is for guidance only. Consult a local agricultural expert for critical decisions.
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AgriAI;
