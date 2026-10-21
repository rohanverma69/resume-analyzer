# CareerAI — AI-Based Resume Analyzer & Job Recommendation Platform

CareerAI is a production-oriented, full-stack web application designed for real users, public deployment, portfolio demonstration, and B.Tech final-year project evaluation.

It delivers explainable 5-pillar ATS resume scoring, deterministic skill extraction, missing keyword diagnostics, downloadable evaluation reports, and algorithmic benchmark job matching without requiring paid commercial AI APIs.

---

## Architecture Overview

```
                            ┌──────────────────────────────────┐
                            │    React 19 + Vite Frontend      │
                            │   (SPA, React Router, CSS)       │
                            └────────────────┬─────────────────┘
                                             │ REST API (JSON / FormData)
                                             ▼
                            ┌──────────────────────────────────┐
                            │      Flask Application Core      │
                            │   - JWT / Cookie Auth & Rate Lim │
                            │   - PyMuPDF (PDF Parser)         │
                            │   - python-docx (DOCX Parser)    │
                            │   - Deterministic 5-Pillar ATS   │
                            │   - ReportLab PDF Generator      │
                            └─────────┬──────────────┬─────────┘
                                      │              │
                   ┌──────────────────▼──┐        ┌──▼───────────────────┐
                   │ SQLite (Dev / Test) │        │  MySQL (Production)  │
                   └─────────────────────┘        └──────────────────────┘
```

---

## 1. Technology Stack

- **Frontend**: React 19, Vite, React Router 7, Lucide Icons, Modern Responsive CSS.
- **Backend**: Python 3.14+, Flask (Application Factory Pattern), Flask-SQLAlchemy, Flask-Migrate (Alembic), Flask-Limiter, Flask-CORS.
- **Document Processing**: PyMuPDF (`pymupdf`) for PDF extraction, `python-docx` for Word documents.
- **Reporting**: ReportLab for on-the-fly downloadable PDF evaluation certificates.
- **Security & Auth**: PyJWT, `werkzeug.security` (scrypt password hashing), HTTP security headers (CSP, HSTS, X-Content-Type-Options).
- **WSGI Production Servers**: Waitress (Windows native production hosting), Gunicorn (Linux hosting).
- **Testing**: pytest test suite covering authentication, parsing, scoring boundaries, and authorization.

---

## 2. Core Features

### A. Explainable 5-Pillar ATS Scoring (0 - 100)
Scores are calculated using transparent, audited rules without black-box hallucination:
- **Skills Match (40 points)**: Exact overlap against target Job Description skills or overall technical taxonomy breadth.
- **Relevant Experience (20 points)**: Professional duration detection and role seniority alignment.
- **Education Alignment (15 points)**: Recognized degree hierarchy (Bachelor's, Master's, Ph.D, BCA/MCA).
- **Projects Relevance (15 points)**: Portfolio depth and technical project indicators.
- **Completeness & Formatting (10 points)**: Contact verification (email, phone, LinkedIn/GitHub) and ATS scannable density.

Two operating modes:
1. **Job-Specific Compatibility Mode**: When a target Job Description is provided, matching keywords against actual requirements.
2. **General Completeness Mode**: When no Job Description is provided, evaluating overall candidate strength and technical coverage.

### B. Secure In-Memory Document Processing
- Supports PDF and DOCX uploads up to 5 MB.
- Inspects binary headers (`%PDF-` and OpenXML ZIP signatures) before parsing to prevent extension spoofing.
- Documents are parsed in-memory or inside secure temporary files deleted immediately upon processing.
- Resumes are never exposed through public URL routes.

### C. Benchmark Job Matching & Skill Gap Analysis
- Pre-seeded with 22 realistic benchmark technology job profiles.
- Ranks jobs using a weighted formula: Required skills (65%), Preferred skills (20%), Experience alignment (15%).
- Clearly visualizes matched competencies versus missing keywords.
- *Transparent Disclaimer*: All listings are sample benchmark specs used for preparation; no fake external vacancies are invented.

### D. Downloadable PDF Diagnostic Report
- Generates a branded, printable evaluation report using ReportLab containing scores, pillar breakdowns, candidate metadata, and prioritized recommendations.

### E. User Privacy & Complete Erasure
- Individual resume analyses can be deleted from the archive at any time.
- Users can permanently delete their account from the Profile page, cascading full deletion of all personal data and analyses.

---

## 3. Production Security Implementation

- **Strict Environment Validation**: In production mode (`FLASK_ENV=production`), startup halts immediately if `SECRET_KEY` or `JWT_SECRET_KEY` is missing, insecure, or under 32 characters.
- **Authorization & IDOR Protection**: Every private endpoint verifies that the resource belongs to the authenticated user. Tests confirm User B receives `403 Forbidden` if attempting to view or delete User A's analysis.
- **Data Redaction**: Sensitive information such as emails and phone numbers are masked prior to internal logging.
- **Security Headers**: Injects `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **Safe Filename Sanitization**: Strips paths, directory traversal dots (`..`), and special characters before processing.

---

## 4. REST API Documentation

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new candidate account |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT token |
| `POST` | `/api/auth/logout` | Public | Clear session credentials |
| `GET` | `/api/auth/me` | Bearer | Retrieve current user profile & stats |
| `DELETE` | `/api/auth/account` | Bearer | Permanently delete account and all data |
| `POST` | `/api/resume/analyze` | Bearer | Upload PDF/DOCX resume for ATS analysis |
| `GET` | `/api/analyses` | Bearer | Paginated history of user's analyses |
| `GET` | `/api/analyses/<id>` | Bearer | Get full details for an analysis (IDOR protected) |
| `DELETE` | `/api/analyses/<id>` | Bearer | Delete an analysis record (IDOR protected) |
| `GET` | `/api/analyses/<id>/download` | Bearer | Download branded PDF evaluation report |
| `GET` | `/api/jobs` | Public | Browse & filter benchmark job profiles |
| `GET` | `/api/jobs/recommendations` | Bearer | Get ranked jobs matched to candidate's resume |
| `GET` | `/api/health` | Public | Health check (does not leak credentials) |

---

## 5. Local Development Quickstart

### Prerequisites
- Python 3.11+ (Python 3.14 compatible)
- Node.js 18+ & npm

### Windows (PowerShell)

1. **Activate Virtual Environment & Install Dependencies**:
   ```powershell
   # In workspace root
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r backend\requirements.txt
   ```

2. **Configure Environment**:
   ```powershell
   Copy-Item backend\.env.example backend\.env
   Copy-Item frontend\.env.example frontend\.env
   ```

3. **Run Backend Migrations & Start Dev Server**:
   ```powershell
   $env:PYTHONPATH="backend"
   $env:FLASK_APP="backend/run.py"
   python -m flask db upgrade
   python backend\run.py
   # Backend runs on http://127.0.0.1:5000
   ```

4. **Start Frontend Client** (in a second terminal):
   ```powershell
   cd frontend
   npm install
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

### Linux / macOS (Bash)

```bash
# 1. Setup Python Environment
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# 2. Configure Environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Initialize Database & Run Backend
export PYTHONPATH="backend"
export FLASK_APP="backend/run.py"
flask db upgrade
python backend/run.py

# 4. In a second terminal, start Frontend
cd frontend
npm install
npm run dev
```

---

## 6. Running Automated Tests

Run the complete test suite:
```powershell
# Windows PowerShell
$env:PYTHONPATH="backend"
.\venv\Scripts\python.exe -m pytest -v backend/tests
```

```bash
# Linux / macOS
PYTHONPATH="backend" pytest -v backend/tests
```

---

## 7. Production Deployment Guide

### Windows Production Hosting (Waitress)

1. Build Frontend Static Assets:
   ```powershell
   cd frontend
   npm run build
   ```

2. Configure Production Secrets in `backend\.env`:
   ```env
   FLASK_ENV=production
   PORT=5000
   SECRET_KEY=generate-at-least-32-random-characters-here-for-security
   JWT_SECRET_KEY=generate-at-least-32-random-characters-for-jwt-signing
   DATABASE_URL=sqlite:///careerai.db
   CORS_ORIGINS=https://yourdomain.com
   ```

3. Start Production Server using Waitress:
   ```powershell
   $env:PYTHONPATH="backend"
   .\venv\Scripts\python.exe backend\wsgi.py
   ```

### Linux Production Hosting (Gunicorn + Nginx + MySQL)

1. Install production WSGI server:
   ```bash
   pip install gunicorn
   ```

2. Configure MySQL in `backend/.env`:
   ```env
   FLASK_ENV=production
   DATABASE_URL=mysql+pymysql://careerai_user:YourStrongPassword@localhost:3306/careerai_db
   SECRET_KEY=minimum-32-char-random-secret-key-must-be-configured
   JWT_SECRET_KEY=minimum-32-char-random-jwt-key-must-be-configured
   CORS_ORIGINS=https://careerai.yourdomain.com
   ```

3. Run migrations on MySQL:
   ```bash
   PYTHONPATH="backend" FLASK_APP="backend/run.py" flask db upgrade
   ```

4. Create Systemd Service (`/etc/systemd/system/careerai.service`):
   ```ini
   [Unit]
   Description=CareerAI Flask Gunicorn Service
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/careerai
   Environment="PATH=/var/www/careerai/venv/bin"
   Environment="PYTHONPATH=/var/www/careerai/backend"
   EnvironmentFile=/var/www/careerai/backend/.env
   ExecStart=/var/www/careerai/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 wsgi:app

   [Install]
   WantedBy=multi-user.target
   ```

5. Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/careerai`):
   ```nginx
   server {
       listen 80;
       server_name careerai.yourdomain.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name careerai.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/careerai.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/careerai.yourdomain.com/privkey.pem;

       # Frontend static files
       root /var/www/careerai/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Backend API proxy
       location /api/ {
           proxy_pass http://127.0.0.1:5000/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           client_max_body_size 6M;
       }
   }
   ```

---

## 8. Backup and Restore Procedures

### SQLite
- **Backup**:
  ```powershell
  Copy-Item backend\careerai.db backend\backups\careerai_$(Get-Date -Format 'yyyyMMdd_HHmmss').db
  ```
- **Restore**:
  ```powershell
  Copy-Item backend\backups\careerai_backup.db backend\careerai.db
  ```

### MySQL
- **Backup**:
  ```bash
  mysqldump -u careerai_user -p careerai_db > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- **Restore**:
  ```bash
  mysql -u careerai_user -p careerai_db < backup_file.sql
  ```

---

## 9. Troubleshooting Guide

| Issue | Cause | Solution |
|---|---|---|
| Startup fails with `ValueError: CRITICAL SECURITY CONFIGURATION ERROR` | In `production` mode, `SECRET_KEY` or `JWT_SECRET_KEY` is not set or under 32 characters. | Set a secure random string of at least 32 characters in your `.env` file. |
| Upload returns `413 Request Entity Too Large` | Document exceeds 5 MB limit. | Compress the PDF/DOCX or ensure file size is under 5 MB. |
| Upload returns `PARSE_ERROR: No readable text` | The PDF consists entirely of scanned images without text layer. | Use a text-based PDF or Word DOCX document with selectable text. |
| Tests fail with missing modules | Virtual environment not active or dependencies missing. | Run `pip install -r backend/requirements.txt` inside the activated virtual environment. |

---

## 10. Explicit Known Limitations

1. **Scanned Images (OCR)**: The current version uses native PyMuPDF text stream extraction for speed and zero external dependencies. Pure raster image scans without embedded text layers require pre-running OCR.
2. **Benchmark Jobs**: The 22 seeded jobs are benchmark career specifications for candidate preparation. Live job board scraping is intentionally excluded from the MVP to avoid flaky third-party rate limits.
3. **Multi-Column Resumes**: While PyMuPDF handles complex blocks, resumes with highly irregular artistic graphic boxes may have text blocks merged differently than linear single-column layouts.
