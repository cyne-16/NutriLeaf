import React, { useState, useRef, useEffect } from 'react';
import { Send, Leaf, ArrowLeft, Bot } from 'lucide-react';

const ChatScreen = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi there! 👋 How may I help you today with your Malunggay plants?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const quickActions = [
        { icon: '🌱', label: 'Talk with Bot', color: 'linear-gradient(135deg, #2d5016 0%, #1a5f3a 100%)' },
        { icon: '🔍', label: 'Scan Leaf', color: 'linear-gradient(135deg, #1a5f3a 0%, #2d7a50 100%)' },
        { icon: '📚', label: 'Learn More', color: 'linear-gradient(135deg, #2d7a50 0%, #3a8f60 100%)' }
    ];

    const suggestions = [
        "How do I treat leaf spot disease?",
        "What's the best fertilizer for Malunggay?",
        "When should I prune my plant?",
        "How often should I water?"
    ];

    const handleSend = () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage = {
                role: 'assistant',
                content: `I understand you're asking about "${inputMessage}". As an AI assistant specialized in Malunggay care, I can help you with plant health monitoring, disease detection, and cultivation tips. Let me provide you with detailed guidance on this topic.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputMessage(suggestion);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Background Elements */}
            <div style={{
                position: 'absolute',
                top: '10%',
                right: '-5%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(129, 199, 132, 0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '20%',
                left: '-5%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(165, 214, 167, 0.25) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }} />

            {/* Header */}
            <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(45, 80, 22, 0.1)',
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <button style={{
                    background: 'rgba(45, 80, 22, 0.1)',
                    border: 'none',
                    borderRadius: '12px',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}>
                    <ArrowLeft size={20} color="#2d5016" />
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #2d5016 0%, #1a5f3a 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(45, 80, 22, 0.3)'
                        }}>
                            <Leaf size={20} color="#ffffff" />
                        </div>
                        <div>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#0f2419',
                                marginBottom: '2px'
                            }}>NutriChat</div>
                            <div style={{
                                fontSize: '12px',
                                color: '#2d7a50',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#2d7a50',
                                    animation: 'pulse 2s infinite'
                                }} />
                                Online
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {messages.length === 1 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px',
                        gap: '32px'
                    }}>
                        {/* Welcome Bot Avatar */}
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '30px',
                            background: 'linear-gradient(135deg, #2d5016 0%, #1a5f3a 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 60px rgba(45, 80, 22, 0.3)',
                            position: 'relative',
                            animation: 'float 3s ease-in-out infinite'
                        }}>
                            <Bot size={60} color="#ffffff" />
                            <div style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#8bc34a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(139, 195, 74, 0.4)'
                            }}>
                              
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                            <h2 style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#0f2419',
                                marginBottom: '12px',
                                lineHeight: '1.2'
                            }}>
                                How may I help you today?
                            </h2>
                            <p style={{
                                fontSize: '15px',
                                color: '#5a6c62',
                                lineHeight: '1.6'
                            }}>
                                Ask me anything about Malunggay plant
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '12px',
                            width: '100%',
                            maxWidth: '500px'
                        }}>
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    style={{
                                        background: action.color,
                                        border: 'none',
                                        borderRadius: '16px',
                                        padding: '20px 16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 16px rgba(45, 80, 22, 0.2)'
                                    }}
                                >
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{action.icon}</div>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#ffffff'
                                    }}>{action.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            animation: 'slideIn 0.3s ease'
                        }}
                    >
                        <div style={{
                            maxWidth: '80%',
                            display: 'flex',
                            gap: '12px',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                        }}>
                            {msg.role === 'assistant' && (
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #2d5016 0%, #1a5f3a 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: '0 4px 12px rgba(45, 80, 22, 0.3)'
                                }}>
                                    <Leaf size={18} color="#ffffff" />
                                </div>
                            )}
                            <div>
                                <div style={{
                                    background: msg.role === 'user' 
                                        ? 'linear-gradient(135deg, #2d5016 0%, #1a5f3a 100%)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    color: msg.role === 'user' ? '#ffffff' : '#0f2419',
                                    padding: '14px 18px',
                                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    fontSize: '15px',
                                    lineHeight: '1.5',
                                    backdropFilter: 'blur(10px)',
                                    border: msg.role === 'user' ? 'none' : '1px solid rgba(45, 80, 22, 0.1)',
                                    boxShadow: msg.role === 'user' 
                                        ? '0 4px 16px rgba(45, 80, 22, 0.3)'
                                        : '0 2px 8px rgba(0, 0, 0, 0.05)'
                                }}>
                                    {msg.content}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#5a6c62',
                                    marginTop: '6px',
                                    textAlign: msg.role === 'user' ? 'right' : 'left'
                                }}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        animation: 'slideIn 0.3s ease'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #2d5016 0%, #1a5f3a 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(45, 80, 22, 0.3)'
                        }}>
                            <Leaf size={18} color="#ffffff" />
                        </div>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '14px 18px',
                            borderRadius: '18px 18px 18px 4px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(45, 80, 22, 0.1)',
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#2d7a50',
                                animation: 'bounce 1.4s infinite ease-in-out'
                            }} />
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#2d7a50',
                                animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                            }} />
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#2d7a50',
                                animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                            }} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
                <div style={{
                    padding: '0 24px 16px',
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                border: '1px solid rgba(45, 80, 22, 0.15)',
                                borderRadius: '20px',
                                padding: '10px 16px',
                                fontSize: '13px',
                                color: '#2d5016',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div style={{
                padding: '20px 24px',
                borderTop: '1px solid rgba(45, 80, 22, 0.1)',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-end',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '24px',
                        padding: '12px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1px solid rgba(45, 80, 22, 0.15)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Write a message..."
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#0f2419',
                                fontSize: '15px',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!inputMessage.trim()}
                        style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: inputMessage.trim() 
                                ? 'linear-gradient(135deg, #2d5016 0%, #1a5f3a 100%)'
                                : 'rgba(45, 80, 22, 0.2)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                            boxShadow: inputMessage.trim() 
                                ? '0 8px 24px rgba(45, 80, 22, 0.4)'
                                : 'none'
                        }}
                    >
                        <Send size={20} color="#ffffff" />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes bounce {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-8px);
                    }
                }
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
};

export default ChatScreen;