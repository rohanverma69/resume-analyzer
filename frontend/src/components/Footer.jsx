import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid var(--border)',
      padding: '3rem 1.5rem 2rem 1.5rem',
      marginTop: 'auto',
      fontSize: '0.875rem',
      color: 'var(--text-muted)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}>
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}>
                <Sparkles size={16} />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Career<span style={{ color: 'var(--primary)' }}>AI</span>
              </span>
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: '1rem' }}>
              Production-oriented AI Resume Analyzer & Job Recommendation Platform. Engineered with explainable ATS diagnostics, transparent skill matching, and zero hallucinations.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
              <CheckCircle2 size={15} /> Free & Open Architecture (No Paid APIs Required)
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.85rem' }}>Platform Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/analyze">Analyze Resume</Link></li>
              <li><Link to="/jobs">Benchmark Jobs Directory</Link></li>
              <li><Link to="/dashboard">Candidate Dashboard</Link></li>
              <li><Link to="/history">Analysis Archive</Link></li>
              <li><Link to="/privacy">Privacy Notice & Data Retention</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.85rem' }}>Security & Transparency</h4>
            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              fontSize: '0.825rem',
              lineHeight: 1.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.35rem' }}>
                <Shield size={14} color="var(--primary)" /> Honest ATS Disclaimer
              </div>
              CareerAI scores are algorithmic estimates designed for career preparation. Sample jobs are curated benchmarks and do not represent active external vacancies. Resumes are processed ephemerally in-memory.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
        }}>
          <div>
            © {new Date().getFullYear()} CareerAI. Built for portfolio & B.Tech evaluation.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Link to="/privacy">Privacy Notice</Link>
            <span>•</span>
            <span style={{ color: 'var(--text-light)' }}>PyMuPDF & python-docx Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
