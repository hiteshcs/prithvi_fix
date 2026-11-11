import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Enterprise Session Inactivity Timeout Hook.
 * Automatically logs out authenticated sessions after prolonged inactivity.
 *
 * @param {number} timeoutMinutes - Inactivity duration before automatic logout (default: 30 minutes)
 * @param {number} warningMinutes - Duration before showing timeout warning (default: 25 minutes)
 */
export function useSessionTimeout(timeoutMinutes = 30, warningMinutes = 25) {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
    }
  }, [showWarning]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleUserActivity = () => resetActivity();

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    timerRef.current = setInterval(() => {
      const inactiveDuration = Date.now() - lastActivityRef.current;

      if (inactiveDuration >= timeoutMs) {
        // Inactivity exceeded -> Logout
        setShowWarning(false);
        logout();
      } else if (inactiveDuration >= warningMs) {
        // Warning threshold reached
        setShowWarning(true);
        setSecondsRemaining(Math.max(0, Math.ceil((timeoutMs - inactiveDuration) / 1000)));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated, logout, timeoutMs, warningMs, resetActivity]);

  return {
    showWarning,
    secondsRemaining,
    stayLoggedIn: resetActivity,
  };
}
