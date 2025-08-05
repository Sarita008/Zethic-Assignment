# 🤖 AI Web Crawler & Chat System

A full-stack MERN application that intelligently crawls websites and provides AI-powered conversational interfaces to interact with the extracted content. Built with modern technologies and enterprise-grade features.


## 🌟 Features

### 🕷️ **Intelligent Web Crawling**
- **Advanced Puppeteer Integration** - Dynamic content extraction with JavaScript rendering
- **Configurable Crawl Depth** - Control how deep the crawler explores (1-5 levels)
- **Real-time Status Monitoring** - Live updates on crawling progress and status
- **Smart Content Extraction** - Automatic text, image, and link extraction
- **Scheduled Crawling** - Automated periodic updates of website content
- **Bulk Operations** - Crawl multiple websites simultaneously
- **Error Handling** - Robust error recovery and status reporting

### 🤖 **AI-Powered Chat System**
- **Google Gemini Integration** - Advanced AI responses using Google's latest models
- **Context-Aware Responses** - AI understands website content for accurate answers
- **Multiple AI Models Support** - Easy integration with OpenAI, Cohere, and other providers
- **Relevance Scoring** - Automatic quality assessment of AI responses
- **Response Time Tracking** - Performance monitoring for AI interactions
- **Chat History Management** - Complete conversation history with search capabilities

### 👨‍💼 **Advanced User Management**
- **JWT Authentication** - Secure token-based authentication system
- **Role-Based Access Control** - User and Admin roles with granular permissions
- **Profile Management** - Complete user profiles with image upload
- **Session Management** - Secure session handling with refresh tokens
- **Activity Tracking** - Comprehensive user activity and analytics
- **Bulk User Operations** - Administrative tools for managing multiple users

### 📊 **Comprehensive Analytics Dashboard**
- **Real-time Metrics** - Live system performance and usage statistics
- **User Behavior Analytics** - Detailed insights into user interactions
- **Website Performance Metrics** - Content effectiveness and query analysis
- **System Health Monitoring** - Database, crawler, and API health checks
- **Advanced Reporting** - Exportable reports in CSV and JSON formats
- **Interactive Charts** - Beautiful visualizations using Recharts

### 🛡️ **Enterprise Security**
- **Password Hashing** - Bcrypt encryption for secure password storage
- **Rate Limiting** - API protection against abuse and DDoS attacks
- **Input Validation** - Comprehensive validation using express-validator
- **CORS Configuration** - Proper cross-origin resource sharing setup
- **Audit Logging** - Complete activity logs for security monitoring

### 🎨 **Modern UI/UX**
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Dark/Light Mode Ready** - Prepared for theme switching
- **Component Library** - Reusable React components with consistent design
- **Loading States** - Smooth loading animations and skeleton screens
- **Error Boundaries** - Graceful error handling and recovery
- **Accessibility** - WCAG compliant with proper ARIA labels

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks and concurrent features
- **React Router v6** - Client-side routing with data loading
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Recharts** - Responsive chart library
- **React Hook Form** - Performant form handling
- **Axios** - HTTP client with interceptors

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **Puppeteer** - Headless Chrome for web scraping
- **Google Gemini AI** - Advanced language model integration
- **Multer & Sharp** - File upload and image processing


## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Google Gemini API key
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
```

### 2. Install Dependencies
```bash

#  Install Dependencies
cd server && npm install # Backend dependencies
cd client && npm install # Frontend dependencies
```

### 3. Environment Configuration

#### Backend Environment (`server/.env`)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-crawler?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_REFRESH_SECRET=your_super_secret_refresh_key_different_from_jwt_secret
JWT_EXPIRE=7d

# AI Integration
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# CORS
CLIENT_URL=http://localhost:3000
```

#### Frontend Environment (`client/.env`)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# App Configuration
REACT_APP_NAME=AI Crawler
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_FILE_UPLOAD=true
```

### 5. Start Development Servers
```bash

# Start Individually
npm run start  # Backend: http://localhost:5000
npm run start  # Frontend: http://localhost:3000
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health**: http://localhost:5000/api/health

## 📚 API Documentation

### Authentication Endpoints
```bash
POST /api/auth/register          # User registration
POST /api/auth/login            # User login
POST /api/auth/logout           # User logout
POST /api/auth/refresh-token    # Refresh access token
GET  /api/auth/profile          # Get user profile
PUT  /api/auth/profile          # Update user profile
PUT  /api/auth/change-password  # Change password
```

### User Management
```bash
GET    /api/users               # Get all users (paginated)
GET    /api/users/:id           # Get user by ID
GET    /api/users/email/:email  # Get user by email
PUT    /api/users/:id           # Update user
```

### Website Management
```bash
GET    /api/websites            # Get all websites
POST   /api/websites            # Create website
GET    /api/websites/active     # Get active websites
GET    /api/websites/:id        # Get website details
PUT    /api/websites/:id        # Update website
DELETE /api/websites/:id        # Delete website
```

### Crawler Operations
```bash
POST /api/crawler/crawl         # Start crawling
GET  /api/crawler/status/:id    # Get crawl status
POST /api/crawler/recrawl/:id   # Recrawl website
POST /api/crawler/stop/:id      # Stop crawling
```

### Chat System
```bash
POST /api/chat/message          # Send chat message
GET  /api/chat/history/:userId  # Get chat history
GET  /api/chat/recent/:userId   # Get recent chats
GET  /api/chat/stats/:userId    # Get chat statistics
DELETE /api/chat/:chatId        # Delete chat message
```

### Analytics & Reporting
```bash
GET /api/analytics/dashboard           # Dashboard statistics
GET /api/analytics/user/:userId       # User analytics
GET /api/analytics/website/:websiteId # Website analytics
GET /api/analytics/health             # System health
GET /api/analytics/advanced           # Advanced analytics
```

### Admin Endpoints (Protected)
```bash
GET    /api/admin/dashboard           # Admin dashboard
GET    /api/admin/users              # Manage users
GET    /api/admin/websites           # Manage websites
GET    /api/admin/system/health      # System monitoring
POST   /api/admin/crawler/bulk-crawl # Bulk crawling
GET    /api/admin/reports/usage      # Usage reports
POST   /api/admin/system/maintenance # System maintenance
```

## 🏗️ Project Structure

```
ai-web-crawler/
├── client/                          # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/              # Reusable Components
│   │   │   ├── common/             # Common UI components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   ├── auth/               # Authentication components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── chat/               # Chat interface
│   │   │   │   ├── ChatInterface.jsx
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   └── WebsiteSelector.jsx
│   │   │   ├── dashboard/          # Dashboard components
│   │   │   │   ├── Analytics.jsx
│   │   │   │   ├── UserStats.jsx
│   │   │   │   └── RecentQueries.jsx
│   │   │   ├── user/               # User management
│   │   │   │   ├── UserForm.jsx
│   │   │   │   └── ProfileCard.jsx
│   │   │   └── website/            # Website management
│   │   │       ├── WebsiteCard.jsx
│   │   │       ├── WebsiteForm.jsx
│   │   │       └── WebsiteList.jsx
│   │   ├── pages/                  # Main Pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Admin.jsx
│   │   ├── services/               # API Services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── chatService.js
│   │   │   ├── userService.js
│   │   │   ├── websiteService.js
│   │   │   └── analyticsService.js
│   │   ├── hooks/                  # Custom Hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useChat.js
│   │   │   └── useUser.js
│   │   ├── context/                # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── UserContext.jsx
│   │   ├── utils/                  # Utility Functions
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── storage.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── controllers/            # Route Controllers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── chatController.js
│   │   │   ├── websiteController.js
│   │   │   ├── crawlerController.js
│   │   │   ├── analyticsController.js
│   │   │   └── adminController.js
│   │   ├── models/                 # Database Models
│   │   │   ├── User.js
│   │   │   ├── Website.js
│   │   │   ├── CrawledContent.js
│   │   │   └── ChatHistory.js
│   │   ├── routes/                 # API Routes
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── websiteRoutes.js
│   │   │   ├── crawlerRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── services/               # Business Logic
│   │   │   ├── crawlerService.js
│   │   │   ├── aiService.js
│   │   │   ├── fileService.js
│   │   │   └── schedulerService.js
│   │   ├── middleware/             # Express Middleware
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validation.js
│   │   │   └── rateLimiter.js
│   │   ├── config/                 # Configuration
│   │   │   ├── database.js
│   │   │   └── config.js
│   │   ├── utils/                  # Utility Functions
│   │   │   ├── logger.js
│   │   │   └── helpers.js
│   │   └── app.js                  # Main Application
│   ├── scripts/                    # Utility Scripts
│   │   ├── seedDatabase.js
│   │   └── cleanup.js
│   ├── package.json
│   └── .env
├── docs/                           # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
├── README.md
├── package.json                    # Root package.json
└── .gitignore
```

## 🔧 Development

### Available Scripts

#### Server Scripts
```bash
npm run dev              # Start with nodemon
npm run start            # Start production server
npm run test             # Run server tests
npm run lint             # Lint server code
```

#### Client Scripts
```bash
npm start                # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run eject            # Eject from Create React App
```

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Check MongoDB URI format
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-crawler

# Verify network access for MongoDB Atlas
```

#### 2. Gemini API Errors
```bash
# Verify API key is correct
GEMINI_API_KEY=your_actual_api_key_here

# Check API quota limits in Google AI Studio
# Ensure proper environment variable setup
```

#### 3. File Upload Issues
```bash
# Check file size limits (default 5MB)
MAX_FILE_SIZE=5242880

# Verify upload directory permissions
chmod 755 ./uploads

# Ensure Sharp is properly installed
npm install sharp --platform=linux --arch=x64
```

#### 4. CORS Errors
```bash
# Verify CLIENT_URL in server environment
CLIENT_URL=http://localhost:3000

# Check CORS configuration in server/src/app.js
# Ensure frontend URL matches CORS origin
```

#### 5. JWT Token Issues
```bash
# Check JWT secrets are set
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=different_secret_here

# Clear browser localStorage if tokens are corrupted
localStorage.clear()

# Verify token expiration settings
JWT_EXPIRE=7d
```

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development
DEBUG=app:*

# Frontend debug mode
REACT_APP_DEBUG=true

# Backend debug mode with verbose logging
npm run dev -- --verbose
```

### Performance Issues
```bash
# Check database indexes
# Add indexes for frequently queried fields

# Monitor API response times
# Check browser network tab

# Optimize images
# Ensure Sharp is processing images correctly

# Check rate limiting
# Verify rate limit settings aren't too restrictive
```

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 AI Web Crawler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **Google Gemini AI** - For providing advanced language model capabilities
- **React Team** - For the amazing React framework
- **Express.js** - For the fast and minimal web framework
- **MongoDB** - For the flexible NoSQL database
- **Tailwind CSS** - For the utility-first CSS framework
- **Puppeteer** - For reliable web scraping capabilities
- **Open Source Community** - For all the amazing libraries and tools

## 📞 Support

### Documentation
- **API Documentation**: `/docs/API_DOCUMENTATION.md`
- **Deployment Guide**: `/docs/DEPLOYMENT.md`
- **Troubleshooting**: `/docs/TROUBLESHOOTING.md`

---

**Built with ❤️ by the Sarita Sharma**

*Ready to explore the web with AI? Get started today!* 🚀