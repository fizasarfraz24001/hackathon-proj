# Deployment Guide

## Development Setup

### Prerequisites
- Python 3.9+
- pip package manager
- OpenAI API key
- Firebase project with service account key
- Node.js (for frontend, if needed)

### Installation Steps

1. **Clone the repository**
```bash
git clone <your-repository-url>
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your actual values
```

5. **Run the application**
```bash
python -m app.main
# or
uvicorn app.main:app --reload
```

## Environment Variables Configuration

Create a `.env` file in the backend root directory with the following variables:

```env
# FastAPI
APP_NAME=AI Career Guidance Platform
APP_VERSION=1.0.0
API_V1_STR=/api/v1
DEBUG=True

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o

# Firebase - Get these from your Firebase Console
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_client_cert_url

# Context7 MCP (Optional - only if using MCP server)
MCP_SERVER_URL=http://localhost:8080
MCP_API_KEY=your_mcp_api_key

# Database (if using local DB in addition to Firestore)
DATABASE_URL=sqlite:///./career_guidance.db

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

## Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one

2. **Enable Firestore**
   - Navigate to "Firestore Database" in the left sidebar
   - Click "Create database" and select "test mode" (for development) or "production mode" (for production)

3. **Create Service Account**
   - Go to "Project Settings" → "Service Accounts"
   - Click "Generate new private key"
   - Save the JSON file and extract the values for your .env file

4. **Set up Authentication**
   - Enable "Email/Password" authentication in Firebase Authentication
   - Update security rules as needed

## Context7 MCP Integration (Optional)

If implementing Context7 MCP for memory persistence:

1. Set up the MCP server separately
2. Configure the appropriate URL and API key in environment variables
3. The application will automatically use MCP for:
   - Storing user contexts
   - Maintaining conversation history
   - Preserving personalization data

## Running Tests (Optional)

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest tests/
```

## Production Deployment

### Option 1: VPS/Server Deployment

1. **Install system dependencies** (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv nginx supervisor
```

2. **Deploy application**:
```bash
cd /var/www/ai-career-platform
# Copy your code here
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. **Configure Gunicorn** (production WSGI server):
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

4. **Configure Nginx** as reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 2: Cloud Platform Deployment

#### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy
eb init
eb create prod-env
eb deploy
```

#### Google Cloud Run
```bash
# Build and deploy
gcloud run deploy ai-career-guidance-platform \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Heroku
```bash
# Add Heroku remote and deploy
heroku create your-app-name
git push heroku main
heroku config:set OPENAI_API_KEY=your_key_here
```

## Monitoring and Maintenance

### Logging
The application logs to standard output. For production:

1. **Configure structured logging**
2. **Set up log rotation**
3. **Monitor error rates and performance**

### Health Checks
The application provides health check endpoints:
- `GET /health` - Returns service health status
- `GET /` - Returns basic service info

### Performance Optimization
- Use connection pooling
- Implement caching where appropriate
- Monitor API usage for OpenAI and Firebase quotas

## Security Best Practices

1. **Never commit .env files** (already in .gitignore)
2. **Rotate API keys regularly**
3. **Use HTTPS in production**
4. **Validate all user inputs**
5. **Implement rate limiting**
6. **Regular security scanning**

## Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**: Check service account permissions
2. **OpenAI API Errors**: Verify API key and rate limits
3. **CORS Errors**: Check allowed origins in settings
4. **Database Connection Issues**: Verify Firebase project ID and permissions

### Debugging
```bash
# Enable detailed logging
DEBUG=True uvicorn app.main:app --reload --log-level debug
```

## Backup Strategy

1. **Firestore Backups**: Use Firebase scheduled backups
2. **Environment Variables**: Store securely in password manager
3. **Code**: Maintain in version control
4. **Configuration**: Document deployment configurations