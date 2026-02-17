import React, { useState, useRef, useEffect } from 'react';
import './FloatingChatbot.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type Language = 'english' | 'tagalog' | 'taglish';

const LANGUAGE_OPTIONS: { value: Language; label: string; flag: string }[] = [
  { value: 'taglish', label: 'Taglish', flag: '🇵🇭' },
  { value: 'tagalog', label: 'Filipino', flag: '🇵🇭' },
  { value: 'english', label: 'English', flag: '🇬🇧' },
];

const WELCOME_MESSAGES: Record<Language, string> = {
  taglish: "Kumusta! I'm Molly, your malunggay expert! Tanungin mo ako about malunggay! 🌿",
  tagalog: "Kumusta! Ako si Molly, ang iyong eksperto sa malunggay! Tanungin mo ako tungkol sa malunggay! 🌿",
  english: "Hello! I'm Molly, your leafy friend and malunggay expert! Ask me anything about malunggay! 🌿",
};


const PLACEHOLDERS: Record<Language, string> = {
  taglish: "Magtanong tungkol sa malunggay...",
  tagalog: "Magtanong tungkol sa malunggay...",
  english: "Ask about malunggay...",
};

const QUICK_QUESTIONS: Record<Language, string[]> = {
  taglish: ["Paano mag-tanim ng malunggay?", "Kailan mag-harvest?", "Mga benepisyo?", "Magkano ang presyo?"],
  tagalog: ["Paano magtanim ng malunggay?", "Kailan mag-aani?", "Ano ang mga benepisyo?", "Magkano ang presyo?"],
  english: ["How to plant malunggay?", "When to harvest?", "Malunggay benefits?", "Current prices?"],
};

function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let i = 0;
  const inlineFormat = (line: string, key: string): React.ReactNode => {
    const parts = line.split(/(\*\*[^*]+\*\*|(?<!\*)\*(?!\*)[^*]+\*(?!\*)|__[^_]+__|(?<!_)_(?!_)[^_]+_(?!_))/g);
    return (
      <span key={key}>
        {parts.map((part, pi) => {
          if (/^\*\*(.+)\*\*$/.test(part) || /^__(.+)__$/.test(part))
            return <strong key={pi}>{part.slice(2, -2)}</strong>;
          if (/^\*(.+)\*$/.test(part) || /^_(.+)_$/.test(part))
            return <em key={pi}>{part.slice(1, -1)}</em>;
          return part;
        })}
      </span>
    );
  };
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { result.push(<div key={`gap-${i}`} className="md-spacer" />); i++; continue; }
    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^(#+)/)?.[1].length ?? 1;
      const Tag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements;
      result.push(<Tag key={i} className={`md-h${level}`}>{inlineFormat(line.replace(/^#+\s/, ''), `h-${i}`)}</Tag>);
      i++; continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={i}>{inlineFormat(lines[i].replace(/^\d+\.\s/, ''), `ol-${i}`)}</li>);
        i++;
      }
      result.push(<ol key={`ol-${i}`} className="md-ol">{items}</ol>);
      continue;
    }
    if (/^[*\-•]\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[*\-•]\s/.test(lines[i])) {
        items.push(<li key={i}>{inlineFormat(lines[i].replace(/^[*\-•]\s/, ''), `ul-${i}`)}</li>);
        i++;
      }
      result.push(<ul key={`ul-${i}`} className="md-ul">{items}</ul>);
      continue;
    }
    result.push(<p key={i} className="md-p">{inlineFormat(line, `p-${i}`)}</p>);
    i++;
  }
  return result;
}

const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('taglish');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant', content: WELCOME_MESSAGES['taglish'], timestamp: new Date()
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node))
        setShowLangMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setShowLangMenu(false);
    setMessages([{ role: 'assistant', content: WELCOME_MESSAGES[newLang], timestamp: new Date() }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage, language,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        }),
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'english'
          ? 'Sorry, I encountered an error. Please make sure the backend is running.'
          : 'Pasensya na, may error. Siguraduhing tumatakbo ang backend.',
        timestamp: new Date()
      }]);
    } finally { setIsLoading(false); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const currentLang = LANGUAGE_OPTIONS.find(l => l.value === language)!;

  return (
    <>
      {/* FAB — Molly peeking out */}
      <div className={`chat-fab ${isOpen ? 'hidden' : ''}`} onClick={() => setIsOpen(true)}>
        <div className="molly-hover-wrap">
          <img src="/images/Molly.png" alt="Molly" className="molly-img-fab" />
          <span className="molly-heart">💚</span>
          <span className="molly-heart">💛</span>
          <span className="molly-heart">🤍</span>
          <span className="molly-heart">💚</span>
          <span className="molly-heart">💛</span>
          <span className="molly-heart">🤍</span>
        </div>
      </div>

      {isOpen && (
        <div className="chat-window">

          {/* ── Header ── */}
          <div className="chat-header">
            <div className="molly-leaves">
              <span className="molly-leaf">🍃</span>
              <span className="molly-leaf">🍃</span>
              <span className="molly-leaf">🍃</span>
              <span className="molly-leaf">🍃</span>
            </div>

            {/* Controls row */}
            <div className="chat-header-top">
              <div className="chat-header-actions">
                <div className="lang-selector" ref={langMenuRef}>
                  <button className="lang-btn" onClick={() => setShowLangMenu(p => !p)}>
                    {currentLang.flag} {currentLang.label} ▾
                  </button>
                  {showLangMenu && (
                    <div className="lang-dropdown">
                      {LANGUAGE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          className={`lang-option ${language === opt.value ? 'active' : ''}`}
                          onClick={() => handleLanguageChange(opt.value)}
                        >
                          {opt.flag} {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="chat-close-btn" onClick={() => setIsOpen(false)}>✕</button>
              </div>
            </div>

            {/* Molly character + name side by side */}
            <div className="molly-center">
              <div className="molly-hover-wrap molly-avatar-wrap">
                <img src="/images/Molly.png" alt="Molly" className="molly-img-header" />
                <span className="molly-heart">💚</span>
                <span className="molly-heart">💛</span>
                <span className="molly-heart">🤍</span>
                <span className="molly-heart">💚</span>
                <span className="molly-heart">💛</span>
                <span className="molly-heart">🤍</span>
              </div>
              <div className="chat-header-info">
                <div className="chat-header-title">Molly</div>
                <div className="chat-header-subtitle">Malunggay Expert</div>
                <div className="chat-header-status">● Online!</div>
              </div>
            </div>

            {/* Speech bubble */}
         
          </div>

          {/* ── Messages ── */}
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="chat-message-avatar">
                    <img src="/images/Molly.png" alt="Molly" className="molly-img-bubble" />
                  </div>
                )}
                <div className="chat-message-bubble">
                  {msg.role === 'assistant'
                    ? <div className="md-body">{parseMarkdown(msg.content)}</div>
                    : msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="chat-message-avatar user">👤</div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="chat-message-avatar">
                  <img src="/images/Molly.png" alt="Molly" className="molly-img-bubble" />
                </div>
                <div className="chat-message-bubble">
                  <div className="typing-indicator"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Questions ── */}
          {messages.length <= 1 && (
            <div className="quick-questions">
              {QUICK_QUESTIONS[language].map((q, idx) => (
                <button key={idx} className="quick-question-btn" onClick={() => setInputMessage(q)}>{q}</button>
              ))}
            </div>
          )}

          {/* ── Input ── */}
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder={PLACEHOLDERS[language]}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button className="chat-send-btn" onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;