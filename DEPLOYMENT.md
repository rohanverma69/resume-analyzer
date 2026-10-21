# CareerAI — Production Deployment Guide & Operations Checklist

This document provides step-by-step instructions for deploying and running **CareerAI** in staging and production environments.

---

## 1. Pre-Deployment Security Checklist

Before exposing CareerAI to public internet traffic, verify every item below:

- [ ] **Unique Secrets**: `SECRET_KEY` and `JWT_SECRET_KEY` are randomly generated, unique to this environment, and contain at least 32 characters.
- [ ] **HTTPS Enforced**: All HTTP requests are redirected to HTTPS via reverse proxy (Nginx or Cloudflare).
- [ ] **CORS Restricted**: `CORS_ORIGINS` explicitly lists only your registered frontend domain(s) (no wildcards `*` or untrusted origins).
- [ ] **Database Credentials**: Production database credentials (MySQL) are stored solely in environment variables and never checked into version control.
- [ ] **Upload Size Enforced**: Nginx and Flask `MAX_CONTENT_LENGTH` limit uploads to 5 MB.
- [ ] **Rate Limiting**: Rate limits are active on `/api/auth/login`, `/api/auth/register`, and `/api/resume/analyze`.
- [ ] **Debug Mode Disabled**: `DEBUG=False` and `FLASK_ENV=production`.

---

## 2. Generating Strong Production Keys

Run this command in Python to generate cryptographically secure keys:

```bash
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32)); print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
```

---

## 3. Database Setup: MySQL (Production)

1. Create database and dedicated user:
   ```sql
   CREATE DATABASE careerai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'careerai_user'@'localhost' IDENTIFIED BY 'StrongRandomPasswordHere!';
   GRANT ALL PRIVILEGES ON careerai_db.* TO 'careerai_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. Add the MySQL URI in `backend/.env`:
   ```env
   DATABASE_URL=mysql+pymysql://careerai_user:StrongRandomPasswordHere!@localhost:3306/careerai_db
   ```

3. Run schema migrations:
   ```bash
   export PYTHONPATH="backend"
   export FLASK_APP="backend/run.py"
   flask db upgrade
   ```

---

## 4. Serving the Backend

### Windows Deployment (Waitress)

Waitress is a production-quality, multi-threaded pure Python WSGI server designed for Windows hosting:

```powershell
$env:PYTHONPATH="backend"
$env:FLASK_ENV="production"
.\venv\Scripts\python.exe backend\wsgi.py
```

Waitress will bind to `http://0.0.0.0:5000` with 6 concurrent worker threads.

### Linux Deployment (Gunicorn)

Run Gunicorn with 4 workers:

```bash
gunicorn -w 4 -b 127.0.0.1:5000 --access-logfile - --error-logfile - wsgi:app
```

---

## 5. Serving the Frontend

Build the optimized single-page application bundle:

```bash
cd frontend
npm install
npm run build
```

The resulting `frontend/dist` directory contains static HTML, CSS, and JS assets ready to be served by Nginx, Apache, or AWS S3 + CloudFront.

---

## 6. Health & Uptime Monitoring

Monitor application availability using the `/api/health` endpoint:
- **URL**: `https://careerai.yourdomain.com/api/health`
- **Expected Status Code**: `200 OK`
- **Expected Payload**:
  ```json
  {
    "database": "operational",
    "service": "CareerAI API",
    "status": "healthy",
    "timestamp": "2026-10-16T04:40:00.000000Z",
    "version": "1.0.0"
  }
  ```
If the database connection degrades, the endpoint returns HTTP `503 Service Unavailable` without leaking connection credentials.
