# 🎓 Encore EdTech

An AI-powered educational technology platform that generates customized questions based on subject areas and competency levels. Built with Flask backend API and React frontend.

## 🚀 Features

- **AI-Powered Question Generation**: Uses OpenAI GPT or Google Gemini to create educational questions
- **Multiple Subject Areas**: Support for Mathematics, Science, History, Literature, Computer Science, and more
- **Competency-Based Learning**: Questions tailored to beginner, intermediate, advanced, and expert levels
- **Interactive UI**: Modern React frontend with responsive design
- **Multiple Question Types**: Multiple choice, short answer, and essay questions
- **Export Functionality**: Download generated questions as text files
- **Real-time API**: RESTful Flask backend with CORS support

## 🏗️ Architecture

- **Backend**: Flask REST API with OpenAI integration
- **Frontend**: React with TypeScript
- **Styling**: Custom CSS with responsive design
- **API Communication**: Axios for HTTP requests

## 📋 Prerequisites

- Python 3.8+ 
- Node.js 16+
- npm or yarn
- OpenAI API key (optional - app works with mock data without it)

## 🛠️ Installation

### Backend Setup

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

4. (Optional) Add your OpenAI API key to `.env`:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

5. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
- `OPENAI_API_KEY`: Your OpenAI API key
- `FLASK_ENV`: Set to `development` for debug mode
- `PORT`: Backend port (default: 5000)

**Frontend**:
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000/api)

## 📚 API Endpoints

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

### Generate Questions
```
POST /api/generate-questions
Content-Type: application/json

{
  "subject": "Mathematics",
  "competency_level": "beginner", 
  "num_questions": 5
}
```

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
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .env.example       # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   ├── types.ts       # TypeScript type definitions
│   │   └── App.tsx        # Main App component
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
└── README.md              # Project documentation
```

### Available Scripts

**Backend**:
- `python app.py` - Start development server
- `gunicorn app:app` - Start production server

**Frontend**:
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🚀 Deployment

### Backend Deployment
The backend is ready for deployment on platforms like Heroku, Railway, or any Python hosting service. Use `gunicorn` for production:

```bash
gunicorn app:app --bind 0.0.0.0:$PORT
```

### Frontend Deployment
Build the React app and deploy to static hosting:

```bash
npm run build
```

Deploy the `build/` directory to services like Netlify, Vercel, or GitHub Pages.

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
