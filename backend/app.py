from flask import Flask, request, jsonify, send_from_directory, send_file, abort
from flask_cors import CORS
import os
import openai
from dotenv import load_dotenv
import logging
import jwt
from datetime import datetime, timedelta
from functools import wraps
import hashlib

# Load environment variables
load_dotenv()

# Create Flask app with static folder pointing to React build
app = Flask(__name__, 
            static_folder='../frontend/build/static',
            static_url_path='/static')

# Configure CORS
CORS(app)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure OpenAI (can be switched to Gemini later)
openai.api_key = os.getenv('OPENAI_API_KEY')

# Simple in-memory user store (replace with database in production)
users = {
    'demo@example.com': {
        'email': 'demo@example.com',
        'password_hash': hashlib.sha256('demo123'.encode()).hexdigest(),
        'name': 'Demo User'
    }
}

# JWT Helper Functions
def generate_tokens(user_email):
    """Generate access and refresh tokens for a user"""
    current_time = datetime.utcnow()
    
    # Access token payload
    access_payload = {
        'user_email': user_email,
        'exp': current_time + app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'iat': current_time,
        'type': 'access'
    }
    
    # Refresh token payload
    refresh_payload = {
        'user_email': user_email,
        'exp': current_time + app.config['JWT_REFRESH_TOKEN_EXPIRES'],
        'iat': current_time,
        'type': 'refresh'
    }
    
    access_token = jwt.encode(access_payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return access_token, refresh_token

def verify_token(token, token_type='access'):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        if payload.get('type') != token_type:
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Check if user still exists
        user_email = payload.get('user_email')
        if user_email not in users:
            return jsonify({'error': 'User not found'}), 401
        
        request.current_user = users[user_email]
        return f(*args, **kwargs)
    
    return decorated

# Serve React App
@app.route('/')
def serve_react_app():
    """Serve the React app"""
    return send_file('../frontend/build/index.html')

@app.route('/<path:path>')
def serve_react_app_routing(path):
    """Handle React Router paths"""
    # Check if it's an API route
    if path.startswith('api/'):
        # Let Flask handle API routes normally
        return abort(404)
    
    # Check if it's a static asset
    if path.startswith('static/'):
        return send_from_directory('../frontend/build', path)
    
    # For other assets (favicon, manifest, etc.)
    if '.' in path:
        try:
            return send_from_directory('../frontend/build', path)
        except:
            pass
    
    # For all other paths, serve the React app (SPA routing)
    return send_file('../frontend/build/index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'EdTech API is running'})

# Authentication Endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        # Validate input
        if not email or not password or not name:
            return jsonify({'error': 'Email, password, and name are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Check if user already exists
        if email in users:
            return jsonify({'error': 'User already exists'}), 409
        
        # Create new user
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        users[email] = {
            'email': email,
            'password_hash': password_hash,
            'name': name
        }
        
        # Generate tokens
        access_token, refresh_token = generate_tokens(email)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'email': email,
                'name': name
            },
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': int(app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds())
        }), 201
        
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validate input
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Check if user exists
        user = users.get(email)
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        if user['password_hash'] != password_hash:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate tokens
        access_token, refresh_token = generate_tokens(email)
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'email': user['email'],
                'name': user['name']
            },
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': int(app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds())
        })
        
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/refresh', methods=['POST'])
def refresh_token():
    """Refresh access token using refresh token"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        refresh_token = data.get('refresh_token', '')
        
        if not refresh_token:
            return jsonify({'error': 'Refresh token is required'}), 400
        
        # Verify refresh token
        payload = verify_token(refresh_token, 'refresh')
        if not payload:
            return jsonify({'error': 'Invalid or expired refresh token'}), 401
        
        user_email = payload.get('user_email')
        if user_email not in users:
            return jsonify({'error': 'User not found'}), 401
        
        # Generate new access token
        access_token, _ = generate_tokens(user_email)
        
        return jsonify({
            'access_token': access_token,
            'expires_in': int(app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds())
        })
        
    except Exception as e:
        logger.error(f"Error during token refresh: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current user information"""
    user = request.current_user
    return jsonify({
        'user': {
            'email': user['email'],
            'name': user['name']
        }
    })

@app.route('/api/generate-questions', methods=['POST'])
@token_required
def generate_questions():
    """Generate questions based on subject and competency level"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        subject = data.get('subject', '').strip()
        competency_level = data.get('competency_level', '').strip()
        num_questions = data.get('num_questions', 5)
        
        if not subject:
            return jsonify({'error': 'Subject is required'}), 400
        
        if not competency_level:
            return jsonify({'error': 'Competency level is required'}), 400
        
        # Validate competency level
        valid_levels = ['beginner', 'intermediate', 'advanced', 'expert']
        if competency_level.lower() not in valid_levels:
            return jsonify({'error': f'Invalid competency level. Must be one of: {", ".join(valid_levels)}'}), 400
        
        # Validate number of questions
        if not isinstance(num_questions, int) or num_questions < 1 or num_questions > 20:
            return jsonify({'error': 'Number of questions must be between 1 and 20'}), 400
        
        # Generate questions using AI
        questions = generate_ai_questions(subject, competency_level, num_questions)
        
        return jsonify({
            'questions': questions,
            'subject': subject,
            'competency_level': competency_level,
            'count': len(questions)
        })
        
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

def generate_ai_questions(subject, competency_level, num_questions):
    """Generate questions using OpenAI GPT"""
    try:
        # Create prompt based on subject and competency level
        prompt = f"""Generate {num_questions} educational questions for the subject "{subject}" at {competency_level} level.

Requirements:
- Questions should be appropriate for {competency_level} learners
- Include a mix of question types (multiple choice, short answer, essay)
- Provide correct answers where applicable
- Make questions engaging and educational

Format each question as a JSON object with:
- question: the question text
- type: "multiple_choice", "short_answer", or "essay"  
- options: array of options (for multiple choice only)
- correct_answer: the correct answer
- explanation: brief explanation of the answer

Return only valid JSON array format."""

        # Check if OpenAI API key is available
        if not openai.api_key:
            # Return mock questions if no API key
            return generate_mock_questions(subject, competency_level, num_questions)
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert educational content creator. Generate high-quality questions for educational purposes."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.7
        )
        
        # Parse the response
        content = response.choices[0].message.content.strip()
        
        # Try to parse JSON response
        import json
        try:
            questions = json.loads(content)
            return questions
        except json.JSONDecodeError:
            logger.warning("Failed to parse AI response as JSON, using mock questions")
            return generate_mock_questions(subject, competency_level, num_questions)
            
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {str(e)}")
        return generate_mock_questions(subject, competency_level, num_questions)

def generate_mock_questions(subject, competency_level, num_questions):
    """Generate mock questions when AI service is unavailable"""
    mock_questions = [
        {
            "question": f"What is a fundamental concept in {subject}?",
            "type": "short_answer",
            "correct_answer": f"A key principle or basic element of {subject}",
            "explanation": f"This tests understanding of core {subject} concepts at {competency_level} level"
        },
        {
            "question": f"Which of the following best describes {subject}?",
            "type": "multiple_choice",
            "options": [
                f"A complex field of study",
                f"A simple concept",
                f"An outdated practice",
                f"A modern innovation"
            ],
            "correct_answer": "A complex field of study",
            "explanation": f"This question assesses basic knowledge of {subject}"
        },
        {
            "question": f"Explain the importance of {subject} in today's world.",
            "type": "essay",
            "correct_answer": f"{subject} plays a crucial role in various aspects of modern life and continues to evolve with technological advancement.",
            "explanation": f"This essay question evaluates comprehensive understanding of {subject}'s relevance"
        }
    ]
    
    # Return the requested number of questions (cycling through if needed)
    questions = []
    for i in range(num_questions):
        question = mock_questions[i % len(mock_questions)].copy()
        question["question"] = f"[{competency_level.title()} Level] {question['question']}"
        questions.append(question)
    
    return questions

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """Get list of available subjects"""
    subjects = [
        'Mathematics',
        'Science',
        'History',
        'Literature',
        'Computer Science',
        'Physics',
        'Chemistry',
        'Biology',
        'Geography',
        'Philosophy',
        'Economics',
        'Psychology'
    ]
    return jsonify({'subjects': subjects})

@app.route('/api/competency-levels', methods=['GET'])
def get_competency_levels():
    """Get list of available competency levels"""
    levels = [
        {'value': 'beginner', 'label': 'Beginner', 'description': 'Basic understanding and foundational concepts'},
        {'value': 'intermediate', 'label': 'Intermediate', 'description': 'Moderate knowledge with some practical experience'},
        {'value': 'advanced', 'label': 'Advanced', 'description': 'Deep understanding with significant experience'},
        {'value': 'expert', 'label': 'Expert', 'description': 'Comprehensive mastery and specialized knowledge'}
    ]
    return jsonify({'levels': levels})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)