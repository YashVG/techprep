# Maintenance Guide

This guide provides instructions for maintaining and operating the UBC Tech Prep Portfolio application.

## Table of Contents

1. [Setup & Installation](#setup--installation)
2. [Environment Configuration](#environment-configuration)
3. [Running the Application](#running-the-application)
4. [Database Management](#database-management)
5. [Code Quality](#code-quality)
6. [Monitoring & Logs](#monitoring--logs)
7. [Dependency Updates](#dependency-updates)
8. [Troubleshooting](#troubleshooting)

---

## Setup & Installation

### Prerequisites

- Python 3.11+
- Node.js 16+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd techprep
   ```

2. **Backend Setup**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r ../requirements.txt
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   ```

4. **Database Setup**

   ```bash
   # Create PostgreSQL database
   createdb blog
   
   # Run migrations
   cd backend
   flask db upgrade
   ```

---

## Environment Configuration

### Backend Configuration

1. **Copy environment template**

   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Generate secure keys**

   ```bash
   # Generate SECRET_KEY
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   
   # Generate JWT_SECRET_KEY  
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. **Update `.env` file**

   ```bash
   # Essential variables
   SECRET_KEY=<generated-secret-key>
   JWT_SECRET_KEY=<generated-jwt-secret>
   DB_PASSWORD=<secure-database-password>
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

### Frontend Configuration

Create `frontend/.env`:

```bash
REACT_APP_API_URL=http://localhost:5001
```

### Production Configuration

For production, ensure:

- `FLASK_DEBUG=False`
- `FLASK_ENV=production`
- Strong, unique keys
- Restricted CORS origins
- HTTPS enabled
- Proper database credentials

---

## Running the Application

### Development Mode

**Using Docker (Recommended)**

```bash
docker-compose up
```

- Backend: <http://localhost:5001>
- Frontend: <http://localhost:3000>
- Database: localhost:5432

**Manual Start**

Terminal 1 - Backend:

```bash
cd backend
source venv/bin/activate
python app.py
```

Terminal 2 - Frontend:

```bash
cd frontend
npm start
```

Terminal 3 - Database:

```bash
# If not using Docker
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux
```

### Production Mode

1. **Build frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Configure reverse proxy (nginx)**

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           root /path/to/frontend/build;
           try_files $uri /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **Run backend with production server**

   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5001 app:app
   ```

---

## Database Management

### Migrations

**Create a migration**

```bash
cd backend
flask db migrate -m "Description of changes"
```

**Apply migrations**

```bash
flask db upgrade
```

**Rollback migration**

```bash
flask db downgrade
```

**View migration history**

```bash
flask db history
```

### Backup & Restore

**Backup database**

```bash
pg_dump -U postgres -d blog -F c -f backup_$(date +%Y%m%d).dump
```

**Restore database**

```bash
pg_restore -U postgres -d blog -F c backup_20251005.dump
```

**Automated backups (cron)**

```bash
# Add to crontab (crontab -e)
0 2 * * * pg_dump -U postgres -d blog -F c -f /backups/blog_$(date +\%Y\%m\%d).dump
```

### Database Maintenance

**Vacuum database**

```bash
psql -U postgres -d blog -c "VACUUM ANALYZE;"
```

**Check database size**

```bash
psql -U postgres -d blog -c "SELECT pg_size_pretty(pg_database_size('blog'));"
```

---

## Code Quality

### Linting

**Python (Backend)**

```bash
cd backend
pylint app.py models.py config.py utils/ middlewares/
```

**JavaScript (Frontend)**

```bash
cd frontend
npm run lint
# or
npx eslint src/
```

### Code Formatting

**Python**

```bash
pip install black
black backend/
```

**JavaScript**

```bash
cd frontend
npm install --save-dev prettier
npx prettier --write src/
```

### Type Checking (Optional)

**Python**

```bash
pip install mypy
mypy backend/
```

**JavaScript**

```bash
cd frontend
npm install --save-dev typescript
npx tsc --noEmit
```

---

## Monitoring & Logs

### Application Logs

**View logs**

```bash
tail -f backend/app.log
```

**Search logs**

```bash
# Find failed logins
grep "login_failed" backend/app.log

# Find errors
grep "ERROR" backend/app.log

# Count security events
grep "SECURITY EVENT" backend/app.log | wc -l
```

### Log Rotation

Create `/etc/logrotate.d/techprep`:

```
/path/to/techprep/backend/app.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
}
```

### System Monitoring

**Check application status**

```bash
# Docker
docker-compose ps

# Manual
ps aux | grep python  # Backend
ps aux | grep node    # Frontend (dev)
```

**Monitor resource usage**

```bash
docker stats  # Docker
htop          # System
```

### Health Checks

**Backend health**

```bash
curl http://localhost:5001/
# Should return: {"message": "Welcome to the Cloud Blog API"}
```

**Database connection**

```bash
psql -U postgres -d blog -c "SELECT 1;"
```

---

## Dependency Updates

### Check for Updates

**Python**

```bash
pip list --outdated
```

**JavaScript**

```bash
cd frontend
npm outdated
```

### Update Dependencies

**Python**

```bash
pip install --upgrade <package-name>
pip freeze > requirements.txt
```

**JavaScript**

```bash
cd frontend
npm update
# or for major versions
npm install <package>@latest
```

### Security Audit

**Python**

```bash
pip install safety
safety check
```

**JavaScript**

```bash
cd frontend
npm audit
npm audit fix  # Auto-fix vulnerabilities
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```
Error: could not connect to server
```

**Solution:**

- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check `DB_HOST` and `DB_PORT`

#### 2. CORS Errors

```
Access to fetch at 'http://localhost:5001/...' has been blocked by CORS policy
```

**Solution:**

- Update `CORS_ORIGINS` in `.env`
- Ensure frontend URL is whitelisted
- Restart backend after changes

#### 3. Token Expired

```
{"error": "Invalid or expired token"}
```

**Solution:**

- Re-login to get new token
- Check `JWT_ACCESS_TOKEN_EXPIRES` setting
- Implement token refresh mechanism

#### 4. Rate Limit Exceeded

```
{"error": "Rate limit exceeded. Please try again later."}
```

**Solution:**

- Wait for rate limit window to reset
- Adjust `RATE_LIMIT_DEFAULT` in `.env` if needed
- Check for malicious activity in logs

#### 5. Migration Errors

```
Error: Can't locate revision identified by 'abc123'
```

**Solution:**

```bash
flask db stamp head  # Reset to current state
flask db migrate     # Create new migration
flask db upgrade     # Apply migration
```

### Debug Mode

Enable debug logging:

```bash
# In .env
LOG_LEVEL=DEBUG
FLASK_DEBUG=True
```

**Warning:** Never enable debug mode in production!

### Getting Help

1. Check logs: `tail -f backend/app.log`
2. Review error messages carefully
3. Search documentation and issues
4. Check Stack Overflow
5. Review SECURITY.md for security-related issues

---

## Regular Maintenance Schedule

### Daily

- Monitor error logs
- Check application health
- Review security events

### Weekly

- Review and rotate logs
- Check database size
- Monitor performance metrics
- Review rate limit violations

### Monthly

- Update dependencies
- Security audit
- Database optimization (VACUUM)
- Review and archive old data

### Quarterly

- Comprehensive security review
- Performance testing
- Backup restoration test
- Update documentation

### Annually

- Major version upgrades
- Penetration testing
- Disaster recovery drill
- Architecture review

---

## Contact

For maintenance issues or questions, contact:

- **Technical Lead**: [email]
- **DevOps**: [email]
- **Security**: <security@yourdomain.com>
