import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { setAuthenticated } from "../components/PrivateRoute";
import "./login-page.css";
import fatimaLogo from "../assets/fatima-logo.png";

export default function LoginPage() {
  const history = useHistory();
  // add a single custom reveal toggle inside the password input
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);
  const [toastKey, setToastKey] = useState(0);
  const formRef = useRef(null);
  const usernameRef = useRef(null);

  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const stored = localStorage.getItem('bfris_failed_attempts');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [lockoutEndTime, setLockoutEndTime] = useState(() => {
    const stored = localStorage.getItem('bfris_lockout_end');
    if (stored) {
      const endTime = parseInt(stored, 10);
      if (endTime > Date.now()) return endTime;
      localStorage.removeItem('bfris_lockout_end');
      localStorage.removeItem('bfris_failed_attempts');
    }
    return null;
  });
  const [lockoutRemaining, setLockoutRemaining] = useState(() => {
    const stored = localStorage.getItem('bfris_lockout_end');
    if (stored) {
      const remaining = Math.ceil((parseInt(stored, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  // Remove dark mode on login page
  useEffect(() => {
    document.documentElement.classList.remove('dark-mode');
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutEndTime) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutEndTime - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutEndTime(null);
        setLockoutRemaining(0);
        setFailedAttempts(0);
        localStorage.removeItem('bfris_lockout_end');
        localStorage.removeItem('bfris_failed_attempts');
        clearInterval(interval);
      } else {
        setLockoutRemaining(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutEndTime]);

  function handleSubmit(e) {
    e.preventDefault();
    // Check if locked out
    if (lockoutEndTime && Date.now() < lockoutEndTime) {
      showToast(`Too many failed attempts. Please wait ${lockoutRemaining} seconds.`);
      return;
    }
    const nextErrors = { username: '', password: '' };
    const missing = [];
    if (!username || !username.trim()) { nextErrors.username = 'Username is required'; missing.push('Username'); }
    if (!password || !password.trim()) { nextErrors.password = 'Password is required'; missing.push('Password'); }
    setErrors(nextErrors);
    if (missing.length) {
      const msg = `Please provide: ${missing.join(' and ')}`;
      showToast(msg);
      return;
    }
    // Mock credentials check (staff/junior)
    if (username.trim() !== 'staff' || password !== 'junior') {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('bfris_failed_attempts', newAttempts.toString());
      if (newAttempts >= 3) {
        const lockoutEnd = Date.now() + 60000; // 1 minute lockout
        setLockoutEndTime(lockoutEnd);
        setLockoutRemaining(60);
        localStorage.setItem('bfris_lockout_end', lockoutEnd.toString());
        showToast('Too many failed attempts. Please try again in 1 minute.');
      } else {
        showToast('Invalid username or password');
      }
      return;
    }
    // Reset failed attempts on successful login
    setFailedAttempts(0);
    setLockoutEndTime(null);
    localStorage.removeItem('bfris_lockout_end');
    localStorage.removeItem('bfris_failed_attempts');
    // simple client-side 'login' behavior: navigate to computer dashboard
    setAuthenticated(true);
    history.push('/computer');
  }

  // Prevent Enter from submitting the form when fields are empty
  function handleKeyDown(e) {
    if (e.key !== 'Enter') return;
    if (!username.trim() || !password.trim()) {
      e.preventDefault();
      const nextErrors = { username: '', password: '' };
      const missing = [];
      if (!username.trim()) { nextErrors.username = 'Username is required'; missing.push('Username'); }
      if (!password.trim()) { nextErrors.password = 'Password is required'; missing.push('Password'); }
      setErrors(nextErrors);
      const msg = `Please provide: ${missing.join(', ')}`;
      showToast(msg);
    }
  }

  function showToast(msg, duration = 3500) {
    setToast(msg);
    setToastKey(k => k + 1);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    toastTimerRef.current = setTimeout(() => {
      setToast('');
      toastTimerRef.current = null;
    }, duration);
  }

  function clearToast() {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast('');
  }

  useEffect(() => {
    // autofocus username when the component mounts
    usernameRef.current?.focus();
  }, []);

  useEffect(() => {
    // clear any logged-out flag and remove global pop handler when arriving at login
    try {
      sessionStorage.removeItem('bfris_logged_out');
      if (window.__bfris_onpop) {
        window.removeEventListener('popstate', window.__bfris_onpop);
        try { delete window.__bfris_onpop; } catch(e) {}
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && toast) {
        clearToast();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toast]);

  return (
    <div className="login-root">
      <div className="login-container">
        {/* Header Section */}
        <div className="login-header">
          <div className="header-content">
            <h1 className="header-title">BFRIS<span className="header-plus">+</span>S</h1>
            <p className="header-subtitle">Barangay Fatima Residential Information System</p>
            <p className="header-tagline">plus Secure</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="login-section">
          <div className="login-card">
            <img src={fatimaLogo} alt="Fatima Logo" className="login-logo" />
            <div className="login-welcome">
              <h3>Welcome to BFRIS+S.</h3>
              <p>Please login.</p>
            </div>
            <form ref={formRef} onSubmit={handleSubmit}>
          <div className="input-row">
            <svg className="input-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" />
            </svg>
                <input ref={usernameRef} type="text" name="username" placeholder="Username" className={`login-input ${errors.username ? 'invalid' : ''}`} value={username} onChange={e => { setUsername(e.target.value); if (errors.username) setErrors(es => ({...es, username: ''})); }} aria-invalid={errors.username ? 'true' : 'false'} />
          </div>

          <div className="input-row">
            <svg className="input-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-6V9a6 6 0 0 0-12 0v2H4v10h16V11h-2zm-8-2a4 4 0 0 1 8 0v2H10V9z" />
            </svg>
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" className={`login-input ${errors.password ? 'invalid' : ''}`} value={password} onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(es => ({...es, password: ''})); }} aria-invalid={errors.password ? 'true' : 'false'} />
            <button type="button" className="eye-btn" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(s => !s)}>
              {showPassword ? (
                <svg className="eye-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5c-7 0-11 6.5-11 7s4 7 11 7 11-6.5 11-7-4-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
              ) : (
                <svg className="eye-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5C7 4.5 3 8 1 12c2 4 6 7.5 11 7.5s9-3.5 11-7.5c-2-4-6-7.5-11-7.5zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/></svg>
              )}
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={lockoutEndTime && Date.now() < lockoutEndTime}>
            {lockoutEndTime && lockoutRemaining > 0 ? `Locked (${lockoutRemaining}s)` : 'Login'}
          </button>
        </form>
      </div>
      </div>
      </div>
      {toast && (
        <div className="toast-notification error" role="status" aria-live="polite">
          <div className="toast-icon">!</div>
          <div className="toast-message">{toast}</div>
        </div>
      )}
    </div>
  );
}
