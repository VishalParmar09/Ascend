// src/components/AuthModal.jsx
import { useState } from 'react';
import { ascendApi } from '../services/ascendApi';

export default function AuthModal({ isOpen = true, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState(''); // username or email for login
  const [username, setUsername] = useState('');     // for register
  const [email, setEmail] = useState('');           // for register
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick fill helper for testing
  function handleQuickFillDemo() {
    setMode('login');
    setIdentifier('ShadowMonarch');
    setPassword('hunter123');
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let response;
      if (mode === 'login') {
        if (!identifier.trim() || !password) {
          throw new Error('Please provide your codename/email and security key.');
        }
        response = await ascendApi.login({
          identifier: identifier.trim(),
          password,
        });
      } else {
        if (!username.trim() || !password) {
          throw new Error('Codename and security key are required.');
        }
        if (password.length < 6) {
          throw new Error('Security key must be at least 6 characters.');
        }
        response = await ascendApi.register({
          username: username.trim(),
          email: email.trim() || undefined,
          password,
        });
      }

      // Successful auth returns: { token, tokenType, hunterProfile }
      if (onAuthSuccess) {
        onAuthSuccess(response);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-window">
        {/* Terminal Header */}
        <div className="auth-modal-header">
          <div className="auth-bureau-tag">
            <span className="pulsing-dot-blue"></span>
            HUNTER ASSOCIATION // IDENTIFICATION TERMINAL
          </div>
          <h2>{mode === 'login' ? 'System Gateway Access' : 'New Hunter Registration'}</h2>
          <p className="auth-modal-subtitle">
            {mode === 'login'
              ? 'Authenticate your hunter license to access the progression network.'
              : 'Register your biometrics with the Association to awaken your Hunter Status.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-mode-switch">
          <button
            type="button"
            className={`auth-mode-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            ⚡ ACCESS GATE (LOGIN)
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            ⚔️ RECRUIT AWAKENING (REGISTER)
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="auth-error-banner">
            <span className="auth-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'login' ? (
            <div className="auth-input-group">
              <label>HUNTER CODENAME OR EMAIL</label>
              <input
                type="text"
                placeholder="e.g. ShadowMonarch or shadow@ascend.system"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
              />
            </div>
          ) : (
            <>
              <div className="auth-input-group">
                <label>DESIRED CODENAME</label>
                <input
                  type="text"
                  placeholder="e.g. IronHunter, JinWoo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  autoFocus
                />
              </div>

              <div className="auth-input-group">
                <label>ASSOCIATION REGISTRY EMAIL (OPTIONAL)</label>
                <input
                  type="email"
                  placeholder="hunter@ascend.system"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label>SECURITY KEY (PASSWORD)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading
              ? 'VERIFYING CREDENTIALS... ⚡'
              : mode === 'login'
              ? 'ACCESS SYSTEM GATE ⚡'
              : 'INITIATE REGISTRATION PROTOCOL ⚔️'}
          </button>
        </form>

        {/* Footer / Demo helper */}
        <div className="auth-modal-footer">
          <button
            type="button"
            className="auth-demo-shortcut"
            onClick={handleQuickFillDemo}
          >
            ⚡ Demo Shortcut: Fill Veteran Hunter (ShadowMonarch)
          </button>

          {onClose && (
            <button type="button" className="auth-cancel-btn" onClick={onClose}>
              Abort Terminal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
