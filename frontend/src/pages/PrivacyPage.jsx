import React from 'react';
import { ShieldCheck, Lock, Trash2, EyeOff, Server, Database } from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: '#eff6ff',
          color: 'var(--primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem',
        }}>
          <ShieldCheck size={28} />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          CareerAI Privacy Notice & Data Governance
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Transparent documentation of data processing, storage, retention, and deletion workflows.
        </p>
      </div>

      <div className="card" style={{ padding: '2.5rem', lineHeight: 1.7, fontSize: '0.925rem', color: '#334155' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Server size={18} color="var(--primary)" /> 1. Ephemeral In-Memory Document Processing
          </h2>
          <p>
            When a user uploads a PDF or DOCX resume to CareerAI, the document is processed in memory or inside secure operating system temporary directories. Once the text extraction pipeline (utilizing PyMuPDF and python-docx) completes, any temporary file handles are immediately unlinked and deleted in a guaranteed cleanup routine. CareerAI never exposes raw resume files through public URL routes or unauthenticated endpoints.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <EyeOff size={18} color="#059669" /> 2. No Third-Party Commercial Model API Sharing
          </h2>
          <p>
            CareerAI is architected around transparent, deterministic NLP and regex-based taxonomy evaluation. Your resume text, contact details, work history, and academic records are <strong>never</strong> transmitted to third-party commercial AI providers, proprietary closed-source LLMs, or advertising broker networks.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Database size={18} color="#7c3aed" /> 3. What Personal Data is Stored
          </h2>
          <p>
            CareerAI stores only the minimal structured data necessary to provide you with historical score tracking:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Account Identity:</strong> Email address, candidate full name, and an audited cryptographically salted password hash (scrypt). Plaintext passwords are never stored or logged.</li>
            <li><strong>Extracted Metadata:</strong> Extracted candidate contact details (email, phone, public LinkedIn/GitHub URLs), identified degrees, and technical skills detected for the purpose of computing ATS compatibility.</li>
            <li><strong>Audit Logs:</strong> Operational application logs mask email addresses and telephone numbers before writing.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Trash2 size={18} color="var(--danger)" /> 4. Data Retention & Erasure Policy
          </h2>
          <p>
            You retain absolute sovereignty over your diagnostic data:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Individual Analysis Deletion:</strong> You can delete any individual resume analysis from your History page. This immediately purges the score and extracted skills from the database.</li>
            <li><strong>Full Account Deletion:</strong> You can permanently delete your entire account from your Profile page. A database CASCADE trigger immediately removes your user profile, all associated resume analyses, and all matching records permanently.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lock size={18} color="#d97706" /> 5. Security Architecture
          </h2>
          <p>
            All network communication requires HTTPS in production. The backend implements Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Content-Type-Options: nosniff, X-Frame-Options: DENY, and strict rate limiting on authentication and document upload endpoints to protect against brute-force attacks and abuse.
          </p>
        </section>
      </div>
    </div>
  );
};
