import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, FileSearch, ShieldCheck, Target, ArrowRight, CheckCircle2, TrendingUp, Cpu, Award } from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '4rem 1rem 3.5rem 1rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '3.5rem',
        border: '1px solid #dbeafe',
      }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#dbeafe',
            color: '#1d4ed8',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            marginBottom: '1.5rem',
          }}>
            <Sparkles size={14} /> Production-Ready AI Resume Optimization Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: 'var(--text-main)',
            marginBottom: '1.25rem',
          }}>
            Land More Interviews with <span style={{ color: 'var(--primary)' }}>Explainable ATS</span> & Benchmark Matching
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '2.25rem',
            maxWidth: '680px',
            margin: '0 auto 2.25rem auto',
          }}>
            Upload your PDF or DOCX resume. Get an algorithmic 5-pillar ATS compatibility score, uncover missing technical keywords, and match against realistic benchmark tech jobs.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            <Link to={isAuthenticated ? "/analyze" : "/register"} className="btn btn-primary btn-lg">
              {isAuthenticated ? "Analyze Your Resume" : "Start Free Evaluation"} <ArrowRight size={18} />
            </Link>
            <Link to="/jobs" className="btn btn-secondary btn-lg">
              Explore Benchmark Jobs
            </Link>
          </div>

          {/* Quick Trust Badges */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1.75rem',
            marginTop: '2.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--success)" /> In-Memory Parsing
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--success)" /> Zero Hallucinations
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--success)" /> 100% Free & Open
            </span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Engineered for Precision & Transparency
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Unlike black-box commercial tools that generate arbitrary numbers, CareerAI uses deterministic, auditable scoring rules.
          </p>
        </div>

        <div className="grid grid-cols-3">
          <div className="card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              5-Pillar Explainable ATS Score
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Audited 0-100 score evaluating Skills (40%), Experience (20%), Education (15%), Projects (15%), and ATS formatting density (10%).
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Transparent Keyword Gap Analysis
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Instantly see exactly which required skills were found and which critical competencies are missing for your target role.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Smart Benchmark Job Matching
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Compare your resume profile against 20+ realistic industry benchmark job descriptions categorized by experience level and tech stack.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Step Walkthrough */}
      <section style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2rem',
        marginBottom: '4rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            How CareerAI Works
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Three simple steps to optimize your resume for employer ATS filters.</p>
        </div>

        <div className="grid grid-cols-3">
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}>
              1
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Upload Resume
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Submit your PDF or DOCX file (up to 5 MB). Optionally paste a target job description for customized scoring.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}>
              2
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Deterministic Scoring
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Our engine parses layout, verifies contact details, classifies skills, and generates an auditable 0-100 ATS diagnostic.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}>
              3
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Optimize & Match Jobs
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Review prioritized suggestions, download a formal PDF diagnostic report, and explore high-affinity benchmark job roles.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: '#1e293b',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', color: '#ffffff' }}>
          Ready to Audit Your Resume?
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '540px', margin: '0 auto 1.75rem auto', fontSize: '1rem' }}>
          Join students, software engineers, and professionals optimizing their application readiness with CareerAI.
        </p>
        <Link to={isAuthenticated ? "/analyze" : "/register"} className="btn btn-primary btn-lg">
          Get Started Now <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
};
