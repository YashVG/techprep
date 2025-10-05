# Security Best Practices

This document outlines the security measures implemented in this application and best practices for maintaining security.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Input Validation & Sanitization](#input-validation--sanitization)
3. [Rate Limiting](#rate-limiting)
4. [Security Headers](#security-headers)
5. [Environment Variables](#environment-variables)
6. [CORS Configuration](#cors-configuration)
7. [Logging & Monitoring](#logging--monitoring)
8. [Deployment Security](#deployment-security)

## Authentication & Authorization

### JWT Tokens

- **Token Expiration**: Tokens expire after 24 hours by default (configurable via `JWT_ACCESS_TOKEN_EXPIRES`)
- **Secure Storage**: Tokens should be stored securely on the client (HttpOnly cookies recommended)
- **Token Verification**: All protected routes verify tokens before granting access

### Password Security

- **Hashing**: Passwords are hashed using Werkzeug's `generate_password_hash` with PBKDF2
- **Strength Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Password Changes**: Rate limited to 3 attempts per hour

### Best Practices

1. Never log passwords or tokens
2. Implement password reset functionality with email verification
3. Consider implementing 2FA for sensitive accounts
4. Rotate JWT secret keys periodically

## Input Validation & Sanitization

### Implemented Protections

- **XSS Prevention**: All user inputs are sanitized using the `bleach` library
- **SQL Injection**: SQLAlchemy ORM provides parameterized queries
- **Length Validation**: All inputs have maximum length constraints
- **Format Validation**: Email, username, and course codes are validated with regex

### Sanitization Levels

1. **Plain Text** (`sanitize_plain_text`): Removes all HTML tags
   - Used for: usernames, emails, course codes
2. **HTML Content** (`sanitize_html`): Allows safe HTML tags only
   - Used for: post content, comments
3. **Code** (`sanitize_code`): Escapes HTML entities
   - Used for: code snippets

## Rate Limiting

### Current Limits

- **Registration**: 5 attempts per hour per IP
- **Login**: 10 attempts per minute per IP
- **Password Change**: 3 attempts per hour per IP
- **General API**: 100 requests per hour per IP (configurable)

### Configuration

Rate limiting can be disabled or adjusted in `.env`:

```bash
RATE_LIMIT_ENABLED=True
RATE_LIMIT_DEFAULT=100 per hour
```

### Recommendations

- Monitor rate limit violations
- Implement CAPTCHA for repeated violations
- Consider user-based rate limiting for authenticated endpoints

## Security Headers

### Implemented Headers

1. **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
2. **X-Frame-Options**: `DENY` - Prevents clickjacking attacks
3. **X-XSS-Protection**: `1; mode=block` - Enables browser XSS protection
4. **Content-Security-Policy**: Restricts resource loading
5. **Strict-Transport-Security**: (Commented out, enable with HTTPS)

### HTTPS Requirements

**CRITICAL**: Always use HTTPS in production. To enable HSTS:

1. Set up SSL/TLS certificates
2. Uncomment HSTS header in `backend/middlewares/security.py`
3. Configure reverse proxy (nginx/Apache) for HTTPS

## Environment Variables

### Critical Variables

Never commit these to version control:

- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT signing key
- `DB_PASSWORD` - Database password

### Setup

1. Copy `.env.example` to `.env`
2. Generate secure random keys:

   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. Update all variables with production values
4. Ensure `.env` is in `.gitignore`

### Validation

The application warns on startup if default keys are detected.

## CORS Configuration

### Current Setup

CORS is configured to accept requests from specific origins only.

### Configuration

Update `CORS_ORIGINS` in `.env`:

```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Production Recommendations

1. Never use `*` for allowed origins
2. Only whitelist your production domain(s)
3. Enable credentials only if needed: `supports_credentials=True`

## Logging & Monitoring

### What We Log

- **Security Events**: Failed logins, invalid tokens, rate limit violations
- **User Actions**: Registration, login, post creation
- **Errors**: All exceptions with context

### Log Files

- Location: Configured via `LOG_FILE` environment variable (default: `app.log`)
- Level: Configured via `LOG_LEVEL` (DEBUG, INFO, WARNING, ERROR, CRITICAL)

### Monitoring Recommendations

1. Set up log rotation (logrotate)
2. Monitor for suspicious patterns:
   - Multiple failed login attempts
   - Unusual rate limit violations
   - Error spikes
3. Consider using a log aggregation service (e.g., ELK stack, Datadog)
4. Set up alerts for critical security events

### Sample Log Entries

```
2025-10-05 12:34:56 | __main__ | WARNING | SECURITY EVENT: login_failed | Details: Username: hacker | IP: 192.168.1.100
2025-10-05 12:35:01 | __main__ | INFO | User logged in: john_doe (ID: 42)
```

## Deployment Security

### Pre-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Debug mode disabled (`FLASK_DEBUG=False`)
- [ ] Strong, unique secret keys generated
- [ ] HTTPS configured with valid certificates
- [ ] Database credentials secured
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting enabled
- [ ] Log monitoring set up
- [ ] Security headers enabled (including HSTS)
- [ ] Regular security updates scheduled

### Database Security

1. Use strong database passwords
2. Limit database user permissions (principle of least privilege)
3. Enable database connection encryption
4. Regular backups with encryption
5. Keep PostgreSQL updated

### Container Security

If using Docker:

1. Don't run containers as root
2. Use official, minimal base images
3. Scan images for vulnerabilities
4. Keep images updated
5. Use Docker secrets for sensitive data

### Network Security

1. Use a reverse proxy (nginx, Traefik)
2. Configure firewall rules
3. Use VPC/private networks for database
4. Implement DDoS protection (Cloudflare, AWS Shield)

### Regular Maintenance

- **Weekly**: Review security logs
- **Monthly**: Update dependencies, scan for vulnerabilities
- **Quarterly**: Security audit, penetration testing
- **Annually**: Comprehensive security review

## Vulnerability Reporting

If you discover a security vulnerability, please email: <security@yourdomain.com>

Do not create public GitHub issues for security vulnerabilities.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Flask Security Considerations](https://flask.palletsprojects.com/en/2.3.x/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
