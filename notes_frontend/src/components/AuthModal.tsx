/**
 * AuthModal component for NoteMaster Pro.
 * Handles user login and registration with retro styling.
 */
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// PUBLIC_INTERFACE
interface AuthModalProps {
  /** Callback invoked when the modal should close */
  onClose?: () => void;
}

// PUBLIC_INTERFACE
/** Modal dialog for user authentication (login + register) */
export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      onClose?.();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal-box">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2" style={{ color: 'var(--retro-primary)' }}>📓</div>
          <h1 className="retro-heading text-xl">NoteMaster Pro</h1>
          <p style={{ color: 'var(--retro-text-dim)', fontSize: '0.75rem', marginTop: '4px' }}>
            {mode === 'login' ? '// ACCESS TERMINAL' : '// CREATE ACCOUNT'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', border: '1px solid var(--retro-border)' }}>
          <button
            className={`retro-btn ${mode === 'login' ? '' : 'retro-btn-accent'}`}
            style={{ flex: 1, border: 'none', borderRight: '1px solid var(--retro-border)' }}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`retro-btn ${mode === 'register' ? '' : 'retro-btn-accent'}`}
            style={{ flex: 1, border: 'none' }}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="retro-label">Username</label>
            <input
              className="retro-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="enter_username"
              required
              autoFocus
            />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '1rem' }}>
              <label className="retro-label">Email</label>
              <input
                className="retro-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="retro-label">Password</label>
            <input
              className="retro-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div style={{
              color: 'var(--retro-error)',
              border: '1px solid var(--retro-error)',
              padding: '8px',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              fontFamily: 'Courier New'
            }}>
              ⚠ ERROR: {error}
            </div>
          )}

          <button
            className="retro-btn"
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', padding: '10px' }}
          >
            {isLoading ? '[ PROCESSING... ]' : mode === 'login' ? '[ LOGIN ]' : '[ CREATE ACCOUNT ]'}
          </button>
        </form>
      </div>
    </div>
  );
}
