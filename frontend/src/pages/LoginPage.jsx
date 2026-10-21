import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';
import { Sparkles, ArrowRight, Lock, Mail, UserCheck, Zap, KeyRound } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('DemoCareer2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [instantLoading, setInstantLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide an email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    setError('');
    setInstantLoading(true);
    try {
      await login({
        email: 'demo.candidate@careerai.local',
        password: 'DemoCareer2026!'
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setInstantLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
          }}>
            <Sparkles size={22} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Welcome Back to CareerAI
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Log in to access your resume analyses and job recommendations.
          </p>
        </div>

        {/* 1-Click Demo Login Box */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.5rem' }}>
            ⚡ Instant 1-Click Access
          </div>
          <button
            type="button"
            onClick={handleInstantDemoLogin}
            disabled={instantLoading || loading}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Zap size={15} /> {instantLoading ? 'Logging in demo account...' : '1-Click Instant Demo Login'}
          </button>
        </div>

        {error && <Alert type="danger" message={error} onDismiss={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Any Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Type ANY email (e.g. you@gmail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            </div>
            <div className="form-help" style={{ color: '#059669', fontWeight: 600 }}>
              ✓ You can enter ANY email of your choice!
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>
                Universal Passcode
              </label>
              <button
                type="button"
                onClick={() => setPassword('DemoCareer2026!')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Reset to DemoCareer2026!
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="text"
                className="form-input"
                placeholder="DemoCareer2026!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ paddingLeft: '2.5rem', fontWeight: 600, letterSpacing: '0.02em' }}
              />
              <KeyRound size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            </div>
            <div className="form-help">
              Keep password as <strong>DemoCareer2026!</strong> to log in with any email immediately.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1.25rem' }}
            disabled={loading || instantLoading}
          >
            {loading ? 'Authenticating...' : 'Sign In with This Email'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Want to register a brand new account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};
