import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, FileText, Briefcase, History, User, LogOut, Menu, X, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.875rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}>
            <Sparkles size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Career<span style={{ color: 'var(--primary)' }}>AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <Link
            to="/jobs"
            style={{
              color: isActive('/jobs') ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: isActive('/jobs') ? 600 : 500,
              fontSize: '0.925rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <Briefcase size={16} /> Jobs
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                style={{
                  color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive('/dashboard') ? 600 : 500,
                  fontSize: '0.925rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/analyze"
                style={{
                  color: isActive('/analyze') ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive('/analyze') ? 600 : 500,
                  fontSize: '0.925rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <FileText size={16} /> Analyze Resume
              </Link>
              <Link
                to="/history"
                style={{
                  color: isActive('/history') ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive('/history') ? 600 : 500,
                  fontSize: '0.925rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <History size={16} /> History
              </Link>
              <Link
                to="/profile"
                style={{
                  color: isActive('/profile') ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive('/profile') ? 600 : 500,
                  fontSize: '0.925rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <User size={16} /> Profile
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out of CareerAI"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
