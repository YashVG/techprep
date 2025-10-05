"""
Configuration module for the Flask application.

This module loads environment variables and provides configuration
settings for database, security, CORS, and rate limiting.

Environment variables should be defined in a .env file (see .env.example).
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database Configuration
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "blog")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Flask Configuration
FLASK_ENV = os.getenv("FLASK_ENV", "development")
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-CHANGE-IN-PRODUCTION")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-CHANGE-IN-PRODUCTION")
JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", "86400"))  # 24 hours

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

# Rate Limiting Configuration
RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "True").lower() == "true"
RATE_LIMIT_DEFAULT = os.getenv("RATE_LIMIT_DEFAULT", "100 per hour")

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = os.getenv("LOG_FILE", "app.log")

# Security Warnings
if SECRET_KEY in ["dev-secret-key-CHANGE-IN-PRODUCTION", "your-secret-key-change-in-production"]:
    print("⚠️  WARNING: Using default SECRET_KEY. Set a secure SECRET_KEY environment variable in production!")

if JWT_SECRET_KEY in ["dev-jwt-secret-CHANGE-IN-PRODUCTION", "your-secret-key-change-in-production"]:
    print("⚠️  WARNING: Using default JWT_SECRET_KEY. Set a secure JWT_SECRET_KEY environment variable in production!")