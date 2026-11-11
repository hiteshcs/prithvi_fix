import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, X, Send, Bot, User, Sparkles,
  Volume2, VolumeX, Mic, MicOff, Trash2, Maximize2,
  Minimize2, ExternalLink, ChevronRight, ShieldCheck,
  Zap, HelpCircle, PhoneCall
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const SESSION_STORAGE_KEY = 'prithvi_fix_ai_chat_session';

const INITIAL_GREETING = {
  role: 'assistant',
  content: `👋 **Namaste! I am Prithvi AI**, your official **Prithvi Fix** Cooperative Intelligence Assistant.\n\nI can help you with:\n• 🛠️ **Service Booking & Diagnostic Matching**\n• 💰 **Cooperative 93-2-5 Transparent Tariffs**\n• 🔐 **2-Stage Security OTP Handshakes**\n• 🛡️ **30-Day Free Repair Guarantee**\n• 👷 **Artisan Registration & Cooperative Welfare**\n\nHow can I help you today?`,
  suggestions: [
    'How does the 93-2-5 tariff split work?',
    'Book an Electrician or Plumber',
    'What is the 2-Stage OTP Handshake?',
    'How to claim 30-Day Free Guarantee?',
    'How can artisans register with cooperative?',
    'Emergency SOS & 112 helpline',
  ],
  links: [
    { label: '📅 Book a Service', url: '/book-service' },
    { label: '📜 View Regulated Tariffs', url: '/services' },
  ],
  timestamp: new Date().toISOString(),
};

export default function AIChatBot() {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat from session storage', e);
    }
    return [INITIAL_GREETING];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, loading]);

  // Persist messages to Session Storage (cleared when browser window/tab closes)
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat to session storage', e);
    }
  }, [messages]);

  // Clean up speech when modal is closed or component unmounted
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingIndex(null);
      setIsListening(false);
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  // Send message handler
  const handleSend = async (textToSend) => {
    const queryText = (textToSend || inputMessage).trim();
    if (!queryText || loading) return;

    const userMsg = {
      role: 'user',
      content: queryText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setLoading(true);

    try {
      // Build past history for multi-turn context memory
      const historyPayload = updatedMessages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendAIChat(queryText, historyPayload, lang);

      if (res && res.data) {
        const aiMsg = {
          role: 'assistant',
          content: res.data.reply,
          suggestions: res.data.suggestions || [],
          links: res.data.links || [],
          timestamp: res.data.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg = {
        role: 'assistant',
        content: `⚠️ I encountered a brief network delay. For immediate assistance, you can dial our 24x7 Toll-Free Cooperative Helpline: **[1800-345-7788](tel:18003457788)** or browse standard services directly.`,
        suggestions: ['View Standard Tariffs', 'Book a Service', 'Toll-Free Helpline'],
        links: [{ label: '📅 Book Service', url: '/book-service' }, { label: '📜 Services', url: '/services' }],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Clear chat session
  const handleClearSession = () => {
    if (window.confirm('Reset this conversation session?')) {
      const resetState = [INITIAL_GREETING];
      setMessages(resetState);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(resetState));
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }
  };

  // Voice Input (Speech-to-Text)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'HI' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        // Automatically send after voice capture
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      console.warn('Speech recognition error:', err);
    }
  };

  // Text-to-Speech (Read AI Answer Aloud)
  const handleSpeak = (text, index) => {
    if (!window.speechSynthesis) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner speech
    const cleanText = text.replace(/[*#_`]/g, '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Render markdown text simply and securely
  const renderFormattedContent = (content) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Bold & Links formatted line
          let parsed = line;
          // Format headers
          if (parsed.startsWith('### ')) {
            return <div key={idx} className="font-bold text-blue-950 text-sm mt-1 mb-0.5">{parsed.replace('### ', '')}</div>;
          }
          if (parsed.startsWith('## ') || parsed.startsWith('# ')) {
            return <div key={idx} className="font-extrabold text-blue-950 text-sm mt-1 mb-0.5">{parsed.replace(/^#+\s/, '')}</div>;
          }

          // Bullet points
          const isBullet = parsed.startsWith('• ') || parsed.startsWith('- ') || parsed.startsWith('* ');
          const cleanLine = isBullet ? parsed.substring(2) : parsed;

          return (
            <div key={idx} className={isBullet ? 'flex items-start gap-1.5 pl-1' : ''}>
              {isBullet && <span className="text-blue-600 font-bold shrink-0">•</span>}
              <span
                dangerouslySetInnerHTML={{
                  __html: cleanLine
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 font-bold underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">$1</a>')
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* ── 1. Floating Launch Badge (Bottom-Right) ── */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in duration-200">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all border border-slate-700/60 text-xs font-medium"
            aria-label="Open Prithvi Fix AI Assistant"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>Prithvi AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </button>
        </div>
      )}

      {/* ── 2. Full-Fledged Interactive Chat Window ── */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-10'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[420px] h-[580px] max-h-[88vh]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#0F294A] via-[#15355E] to-[#0A1931] text-white flex items-center justify-between shadow-md select-none">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden border border-amber-400/80 shrink-0">
                  <img src="/logo-emblem.png" alt="Prithvi AI" className="w-full h-full object-contain" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0F294A]"></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">Prithvi AI</h3>
                  <span className="text-[9px] font-medium bg-white/10 text-slate-200 px-1.5 py-0.5 rounded border border-white/15">
                    Cooperative Portal
                  </span>
                </div>
                <div className="text-[10px] text-blue-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Session Active (Auto-clears on tab close)</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearSession}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
                title="Reset Conversation Session"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition hidden sm:block"
                title={isExpanded ? 'Minimize Window' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
                title="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-200`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                      isUser
                        ? 'bg-blue-900 text-white'
                        : 'bg-amber-400 text-blue-950 border border-amber-300'
                    }`}
                  >
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[84%] space-y-2`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs shadow-xs relative ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-900 to-blue-950 text-white rounded-tr-xs'
                          : 'bg-white text-gray-800 border border-gray-200/80 rounded-tl-xs'
                      }`}
                    >
                      {/* Speech synthesis speaker button for AI answers */}
                      {!isUser && (
                        <button
                          onClick={() => handleSpeak(msg.content, index)}
                          className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-blue-900 transition"
                          title="Listen to this response"
                        >
                          {speakingIndex === index ? (
                            <VolumeX size={14} className="text-red-600 animate-pulse" />
                          ) : (
                            <Volume2 size={14} />
                          )}
                        </button>
                      )}

                      {/* Content */}
                      {isUser ? (
                        <div className="leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        renderFormattedContent(msg.content)
                      )}
                    </div>

                    {/* Action Links (e.g. Book Service, View Tariffs) */}
                    {!isUser && msg.links && msg.links.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {msg.links.map((link, lIdx) => (
                          <Link
                            key={lIdx}
                            to={link.url}
                            onClick={() => {
                              if (!link.url.startsWith('tel:')) {
                                setIsOpen(false);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-950 border border-blue-200 text-[11px] font-bold hover:bg-blue-100 transition shadow-2xs"
                          >
                            <span>{link.label}</span>
                            <ChevronRight size={12} className="text-blue-700" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Follow-up Suggestion Chips */}
                    {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={11} className="text-amber-500" /> Suggested Queries:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSend(sug)}
                              className="text-left text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-950 border border-gray-200 transition shadow-2xs"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Loader Indicator */}
            {loading && (
              <div className="flex items-start gap-2.5 animate-in fade-in">
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold text-xs shadow-xs">
                  <Bot size={14} />
                </div>
                <div className="p-3 bg-white rounded-2xl rounded-tl-xs border border-gray-200 text-xs text-gray-500 shadow-xs flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-900 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-900 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-900 animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-600">Prithvi AI is retrieving platform intelligence...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Helpline Strip */}
          <div className="px-4 py-1.5 bg-blue-50/80 border-t border-blue-100 flex items-center justify-between text-[10px] text-blue-900">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>National Hotline: 1800-345-7788</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-red-700">
              <PhoneCall size={11} />
              <a href="tel:112" className="hover:underline">Emergency: 112</a>
            </div>
          </div>

          {/* Input Console */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
          >
            {/* Voice Input Mic Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-xl transition ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-900'
              }`}
              title={isListening ? 'Listening... Click to stop' : 'Speak query via Microphone'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about tariffs, booking, guarantee, OTP, or trade skills..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-xl bg-blue-950 text-amber-400 hover:bg-blue-900 transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              title="Send Message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
