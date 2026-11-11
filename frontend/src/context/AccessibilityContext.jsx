import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from './LanguageContext';

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const { lang } = useLanguage();

  // Font scale: 'normal' (1x), 'large' (1.12x), 'xlarge' (1.25x)
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('gov_font_size') || 'normal';
  });

  // Modern Civic Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('gov_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Accessibility High Contrast Mode (Outdoor Sunlight & Low-Vision)
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('gov_high_contrast') === 'true';
  });

  // Opt-in Voice Announcements for Workers & Public
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(() => {
    return localStorage.getItem('gov_voice_alerts') === 'true';
  });

  // Speech narration state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);

  // Persistent reference to prevent Chromium/WebKit garbage collection during speech playback
  const activeUtteranceRef = useRef(null);

  // Synchronize Font Scale
  useEffect(() => {
    localStorage.setItem('gov_font_size', fontSize);
    const root = document.documentElement;
    if (fontSize === 'large') {
      root.style.setProperty('--font-scale', '1.12');
      root.classList.add('font-scale-large');
      root.classList.remove('font-scale-xlarge');
    } else if (fontSize === 'xlarge') {
      root.style.setProperty('--font-scale', '1.25');
      root.classList.add('font-scale-xlarge');
      root.classList.remove('font-scale-large');
    } else {
      root.style.setProperty('--font-scale', '1');
      root.classList.remove('font-scale-large', 'font-scale-xlarge');
    }
  }, [fontSize]);

  // Synchronize Dark Mode (.dark class on root html)
  useEffect(() => {
    localStorage.setItem('gov_dark_mode', isDarkMode ? 'true' : 'false');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Synchronize High Contrast Mode (.high-contrast class on root html)
  useEffect(() => {
    localStorage.setItem('gov_high_contrast', highContrast ? 'true' : 'false');
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Synchronize Voice Alerts Preference
  useEffect(() => {
    localStorage.setItem('gov_voice_alerts', voiceAlertsEnabled ? 'true' : 'false');
  }, [voiceAlertsEnabled]);

  // Stop any active speech synthesis immediately
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn('speechSynthesis.cancel error:', err);
      }
    }
    activeUtteranceRef.current = null;
    if (typeof window !== 'undefined') {
      window.__activeGovUtterance = null;
    }
    setIsSpeaking(false);
    setActiveSpeakingId(null);
  }, []);

  // Robust Text-to-Speech handler
  const speakText = useCallback(
    (text, options = null) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        alert('Voice assistant is not supported in this browser. Please use Chrome, Edge, or Firefox.');
        return;
      }

      if (!text || typeof text !== 'string' || !text.trim()) {
        stopSpeaking();
        return;
      }

      // Parse options (supports either a customLang string or an options object)
      let customLang = null;
      let speakerId = null;
      let rate = 0.95;

      if (typeof options === 'string') {
        customLang = options;
      } else if (options && typeof options === 'object') {
        customLang = options.lang || null;
        speakerId = options.id || null;
        rate = options.rate || 0.95;
      }

      // If already speaking this exact ID, toggle off
      if (isSpeaking && speakerId && activeSpeakingId === speakerId) {
        stopSpeaking();
        return;
      }

      // Cancel any ongoing utterance before queuing the new one
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.debug('Speech cancel note:', e);
      }

      // Clean markdown symbols for natural speech
      const cleanText = text
        .replace(/[*#_`]/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/₹/g, 'Rupees ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetLang = customLang || lang;

      // Map language code to speech synthesis BCP-47 tag
      switch (targetLang) {
        case 'HI':
          utterance.lang = 'hi-IN';
          break;
        case 'OR':
          utterance.lang = 'or-IN';
          break;
        case 'BN':
          utterance.lang = 'bn-IN';
          break;
        case 'TE':
          utterance.lang = 'te-IN';
          break;
        default:
          utterance.lang = 'en-IN';
          break;
      }

      utterance.rate = rate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setActiveSpeakingId(speakerId);
      };

      utterance.onend = () => {
        activeUtteranceRef.current = null;
        if (typeof window !== 'undefined') window.__activeGovUtterance = null;
        setIsSpeaking(false);
        setActiveSpeakingId(null);
      };

      utterance.onerror = (e) => {
        // Ignore normal cancellation errors
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('SpeechSynthesis error:', e);
        }
        activeUtteranceRef.current = null;
        if (typeof window !== 'undefined') window.__activeGovUtterance = null;
        setIsSpeaking(false);
        setActiveSpeakingId(null);
      };

      // Store in ref & window to prevent garbage collection dropping event handlers
      activeUtteranceRef.current = utterance;
      window.__activeGovUtterance = utterance;

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis speak call failed:', err);
        stopSpeaking();
      }
    },
    [lang, isSpeaking, activeSpeakingId, stopSpeaking]
  );

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => !prev);
  }, []);

  const toggleVoiceAlerts = useCallback(() => {
    setVoiceAlertsEnabled((prev) => !prev);
  }, []);

  const cycleFontSize = useCallback(() => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  }, [fontSize]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        cycleFontSize,
        isDarkMode,
        setIsDarkMode,
        toggleDarkMode,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        voiceAlertsEnabled,
        setVoiceAlertsEnabled,
        toggleVoiceAlerts,
        isSpeaking,
        activeSpeakingId,
        speakText,
        stopSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
