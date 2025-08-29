# 🚀 Tech Prep Blog - Helping UBC Students Prepare for Tech Interviews

A modern, full-stack blog application built with React.js frontend and Flask backend, featuring a complete authentication system, code editor integration, and real-time commenting.

## ✨ Features

### 🔐 **Authentication System**

- **User Registration & Login** with JWT tokens
- **Secure Password Hashing** using Werkzeug
- **Protected Routes** for posts and comments
- **User Profile Management** with secure endpoints
- **Session Persistence** across browser restarts

### 📝 **Blog Functionality**

- **Rich Post Creation** with integrated code editor
- **Real-time Comments** with user attribution
- **Tag System** for post categorization
- **Course Integration** for UBC students
- **Responsive Design** with modern UI/UX

### 💻 **Code Editor Integration**

- **Monaco Editor** (VS Code's editor) integration
- **Multiple Language Support** (Python, JavaScript, C++, Java)
- **Syntax Highlighting** and code formatting
- **Fullscreen Mode** for better code viewing

### ️ **Database & Backend**

- **PostgreSQL Database** with Docker containerization
- **Flask REST API** with SQLAlchemy ORM
- **Database Migrations** using Flask-Migrate
- **Secure API Endpoints** with authentication

## 🛠️ Tech Stack

### **Frontend**

- **React.js** - Modern UI framework
- **Monaco Editor** - Professional code editor
- **CSS3** - Custom styling with responsive design

### **Backend**

- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **Flask-Migrate** - Database migrations
- **PyJWT** - JWT token authentication
- **Werkzeug** - Password hashing

### **Database & Infrastructure**

- **PostgreSQL** - Relational database
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js (v16 or higher)
- Python 3.11+

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/techprep.git
cd techprep
```

### 2. Start Backend & Database

```bash
docker compose up --build
```

This will start:

- PostgreSQL database on port 5432
- Flask backend on port 5001

### 3. Start Frontend

```bash
cd frontend
npm install
npm start
```

The React app will open at `http://localhost:3000`

### 4. Access the Application

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:5001>
- **Database**: localhost:5432

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Monaco Editor** - Professional code editing experience
- **Flask** - Lightweight Python web framework
- **React** - Modern UI development
- **PostgreSQL** - Robust database system

## 📞 Support

If you have any questions or need help:

- Open an issue on GitHub
- Check the [CHANGELOG.md](CHANGELOG.md) for recent updates
- Review the [startup.txt](startup.txt) for quick setup notes

---

**Built with ❤️ for UBC students and tech enthusiasts**

*Last updated: August 2025*
