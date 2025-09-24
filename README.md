# 🎓 Encore EdTech

An AI-powered educational technology platform that generates customized questions based on subject areas and competency levels. Built with Flask backend API and React frontend.

## 🚀 Features

- **JWT Authentication**: Secure user authentication with 30-minute access tokens and 1-day refresh tokens
- **User Management**: Registration, login, logout, and automatic token refresh
- **Protected Routes**: API endpoints secured with JWT middleware
- **AI-Powered Question Generation**: Uses OpenAI GPT or Google Gemini to create educational questions
- **Multiple Subject Areas**: Support for Mathematics, Science, History, Literature, Computer Science, and more
- **Competency-Based Learning**: Questions tailored to beginner, intermediate, advanced, and expert levels
- **Interactive UI**: Modern React frontend with responsive design and authentication flow
- **Multiple Question Types**: Multiple choice, short answer, and essay questions
- **Export Functionality**: Download generated questions as text files
- **Real-time API**: RESTful Flask backend with CORS support

## 🏗️ Architecture

- **Flask Backend**: Serves both the React frontend as static files and provides REST API endpoints
- **JWT Authentication**: Secure token-based authentication with access/refresh tokens
- **React Frontend**: Built and served as static files from Flask, with client-side routing support  
- **Single Server**: Everything runs on one Flask server for simplified deployment
- **Token Management**: Automatic token refresh and secure storage in localStorage
- **API Communication**: Direct communication within the same origin (no CORS needed)

## 📋 Prerequisites

- Python 3.8+ 
- Node.js 16+
- npm or yarn
- OpenAI API key (optional - app works with mock data without it)

## 🛠️ Installation

### Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create environment file:
```bash
cp .env.example .env
```

4. (Optional) Add your OpenAI API key and JWT secret key to `.env`:
```bash
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET_KEY=your_secure_jwt_secret_key_here
```

5. Build the React frontend:
```bash
cd ../frontend
npm install
npm run build
```

6. Start the Flask server (from backend directory):
```bash
cd ../backend
python app.py
```

The application will run on `http://localhost:5000` serving both the React frontend and API endpoints.

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
- `OPENAI_API_KEY`: Your OpenAI API key
- `FLASK_ENV`: Set to `development` for debug mode
- `PORT`: Backend port (default: 5000)
- `JWT_SECRET_KEY`: Secret key for JWT token signing (required for authentication)

**Note**: The React frontend is built and served as static files by Flask, so no separate frontend configuration is needed.

## 📚 API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login  
POST /api/auth/refresh
GET /api/auth/me
```

### Health Check
```
GET /api/health
```

### Get Available Subjects
```
GET /api/subjects
```

### Get Competency Levels
```
GET /api/competency-levels
```

### Generate Questions (Protected)
```
POST /api/generate-questions
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "subject": "Mathematics",
  "competency_level": "beginner", 
  "num_questions": 5
}
```

**Authentication Flow:**
1. Register: `POST /api/auth/register` with `{email, password, name}`
2. Login: `POST /api/auth/login` with `{email, password}`
3. Receive: `{access_token, refresh_token, user, expires_in}`
4. Use: Include `Authorization: Bearer <access_token>` in protected requests
5. Refresh: `POST /api/auth/refresh` with `{refresh_token}` when token expires

**Demo Account:**
- Email: `demo@example.com`
- Password: `demo123`

## 🎯 Usage

1. **Select Subject**: Choose from available subjects like Mathematics, Science, etc.
2. **Choose Competency Level**: Select beginner, intermediate, advanced, or expert
3. **Set Question Count**: Choose 1-10 questions to generate
4. **Generate Questions**: Click generate to create AI-powered questions
5. **Review Results**: Expand questions to view answers and explanations
6. **Export**: Download questions as a text file for offline use

## 🏃‍♂️ Development

### Project Structure
```
Encore/
├── backend/
│   ├── app.py              # Main Flask application (serves React build + API)
│   ├── requirements.txt    # Python dependencies
│   └── .env.example       # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   ├── types.ts       # TypeScript type definitions
│   │   └── App.tsx        # Main App component
│   ├── build/             # Production build (served by Flask)
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
└── README.md              # Project documentation
```

### Available Scripts

**Backend**:
- `python app.py` - Start Flask server (serves React build + API)
- `gunicorn app:app` - Start production server

**Frontend**:
- `npm run build` - Build React app for production
- `npm start` - Start development server (for development only)
- `npm test` - Run tests

## 🚀 Deployment

The application is now a single Flask server that serves both the React frontend and API endpoints:

### Single Server Deployment
Build the React app and deploy the Flask server to any Python hosting service:

```bash
# Build React frontend
cd frontend && npm run build

# Deploy Flask backend (includes serving React build)
cd ../backend && gunicorn app:app --bind 0.0.0.0:$PORT
```

Deploy to platforms like Heroku, Railway, or any Python hosting service. The Flask app automatically serves the React build files and handles client-side routing.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

- [ ] Google Gemini API integration
- [ ] User authentication and progress tracking
- [ ] Question difficulty scoring
- [ ] Multi-language support
- [ ] Question bank and favorites
- [ ] Performance analytics
- [ ] Mobile app version

## 🛟 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using Flask, React, and AI**
