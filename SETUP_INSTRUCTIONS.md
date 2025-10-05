# Setup Instructions - Quick Start Guide

This guide will help you get started with the newly enhanced security and maintainability features.

## 🚀 For Existing Users

If you've been using this application before the security update:

### Step 1: Install New Dependencies

```bash
# Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r ../requirements.txt
```

### Step 2: Create Environment File

```bash
# Copy the example environment file
cp backend/.env.example backend/.env
```

### Step 3: Generate Secure Keys

```bash
# Generate SECRET_KEY
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# Generate JWT_SECRET_KEY
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"
```

Copy these values into your `backend/.env` file.

### Step 4: Update Your .env File

Edit `backend/.env` with your settings:

```bash
# Required - Replace with generated keys from Step 3
SECRET_KEY=your-generated-secret-key-here
JWT_SECRET_KEY=your-generated-jwt-secret-here

# Database (update if different from defaults)
DB_USER=postgres
DB_PASSWORD=password  # Change in production!
DB_NAME=blog
DB_HOST=localhost
DB_PORT=5432

# CORS - Add your frontend URL(s)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Other settings (defaults are fine for development)
FLASK_ENV=development
FLASK_DEBUG=True
RATE_LIMIT_ENABLED=True
LOG_LEVEL=DEBUG
```

### Step 5: Restart Your Application

```bash
# If using Docker
docker-compose down
docker-compose up --build

# If running manually
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python app.py

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 6: Verify Everything Works

1. Visit <http://localhost:3000>
2. Try registering a new user
3. Try logging in
4. Check backend logs: `tail -f backend/app.log`

You should see security warnings about default keys if you haven't changed them yet.

---

## 🆕 For New Users

### Complete Setup from Scratch

1. **Clone and Navigate**

   ```bash
   git clone <repository-url>
   cd techprep
   ```

2. **Backend Setup**

   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r ../requirements.txt
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Database Setup**

   ```bash
   # Install PostgreSQL if not already installed
   # macOS:
   brew install postgresql
   brew services start postgresql
   
   # Linux:
   sudo apt-get install postgresql
   sudo systemctl start postgresql
   
   # Create database
   createdb blog
   ```

5. **Environment Configuration**

   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   
   # Generate secure keys and add to .env
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   # Copy output to SECRET_KEY in .env
   
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   # Copy output to JWT_SECRET_KEY in .env
   ```

6. **Run Migrations**

   ```bash
   cd backend
   source venv/bin/activate
   flask db upgrade
   ```

7. **Start Application**

   **Option A - Using Docker (Recommended):**

   ```bash
   docker-compose up
   ```

   **Option B - Manual Start:**

   ```bash
   # Terminal 1 - Backend
   cd backend
   source venv/bin/activate
   python app.py
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

8. **Access Application**
   - Frontend: <http://localhost:3000>
   - Backend API: <http://localhost:5001>

---

## 📚 What Changed?

### New Features You'll Notice

1. **Rate Limiting**: Registration and login attempts are now limited to prevent abuse
2. **Better Error Messages**: More informative error messages with proper validation
3. **Security Headers**: All responses now include security headers (check browser DevTools)
4. **Comprehensive Logging**: All actions are logged in `backend/app.log`

### Under the Hood

- Input sanitization prevents XSS attacks
- Strong password requirements enforced
- Environment-based configuration
- Modular code organization
- Production-ready security

---

## 🔍 Testing the New Features

### Test Rate Limiting

Try registering multiple times rapidly - you'll hit the rate limit!

### Test Input Validation

Try creating a user with:

- Weak password (e.g., "123") - Will be rejected
- Invalid email format - Will be rejected
- Short username - Will be rejected

### Check Security Logs

```bash
tail -f backend/app.log
# Try a failed login and watch the logs
```

### Verify Security Headers

Open browser DevTools (F12) → Network tab → Click any API request → Check Response Headers

You should see:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: ...

---

## 📖 Further Reading

- **SECURITY.md** - Comprehensive security documentation
- **API_DOCUMENTATION.md** - Complete API reference
- **MAINTENANCE.md** - Operations and maintenance guide
- **CHANGELOG.md** - Detailed list of all changes

---

## ❓ Troubleshooting

### Issue: "WARNING: Using default SECRET_KEY"

**Solution**: You need to set unique secret keys in your `.env` file. Follow Step 3 above.

### Issue: Rate limit errors when testing

**Solution**: Either wait for the time window to pass, or temporarily disable rate limiting in `.env`:

```bash
RATE_LIMIT_ENABLED=False
```

### Issue: CORS errors

**Solution**: Make sure your frontend URL is in the `CORS_ORIGINS` list in `.env`:

```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Issue: Database connection errors

**Solution**:

1. Check PostgreSQL is running: `pg_isready`
2. Verify database exists: `psql -l | grep blog`
3. Check credentials in `.env`

### Issue: Import errors after update

**Solution**: Reinstall dependencies:

```bash
cd backend
source venv/bin/activate
pip install --upgrade -r ../requirements.txt
```

---

## 🆘 Need Help?

1. Check the logs: `tail -f backend/app.log`
2. Review **MAINTENANCE.md** troubleshooting section
3. Verify all environment variables are set correctly
4. Make sure all dependencies are installed

---

## 🎯 Ready for Production?

See the **Production Readiness Checklist** in SECURITY.md before deploying!

Key items:

- [ ] Set strong, unique SECRET_KEY and JWT_SECRET_KEY
- [ ] Set FLASK_DEBUG=False
- [ ] Use HTTPS
- [ ] Set proper CORS_ORIGINS (your domain)
- [ ] Use strong database password
- [ ] Enable HSTS header (uncomment in security.py)
- [ ] Set up log monitoring
- [ ] Configure regular backups

---

Happy coding! 🚀
