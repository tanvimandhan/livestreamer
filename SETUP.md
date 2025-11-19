# Setup Guide - Livestream Highlight Generator

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Testing the System](#testing-the-system)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** >= 16.0.0 ([Download](https://nodejs.org/))
- **npm** >= 8.0.0 (comes with Node.js)
- **Redis** >= 6.0 ([Download](https://redis.io/download) or use Docker)
- **Git** ([Download](https://git-scm.com/))

### Optional
- **FFmpeg** (for video processing) - `brew install ffmpeg` (macOS) or `apt-get install ffmpeg` (Linux)
- **Docker & Docker Compose** (for containerized setup)

### Recommended System Specs
- **CPU**: 4+ cores
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 10GB free space
- **Network**: 1 Mbps+ internet connection

---

## Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/livestream-highlight-generator.git
cd livestreamer
```

### Step 2: Install Dependencies

```bash
# Install root and all sub-projects dependencies
npm run install-all

# Or manually:
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Step 3: Redis Setup

#### Option A: Local Redis Installation

**macOS (using Homebrew)**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Linux**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Windows**
Download from: https://github.com/microsoftarchive/redis/releases

#### Option B: Docker Redis

```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

#### Option C: Using Redis Cloud (Free Tier)

1. Sign up at https://redis.com/try-free/
2. Create a database
3. Copy the connection string
4. Add to `.env` file (see Configuration section)

### Step 4: Verify Installation

```bash
# Check Node.js
node --version  # Should be >= 16.0.0
npm --version   # Should be >= 8.0.0

# Check Redis
redis-cli ping  # Should return: PONG
```

---

## Configuration

### Step 1: Create Environment Files

```bash
# Copy example to actual env files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Step 2: Edit Configuration Files

**`backend/.env`**
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
# Or for Redis Cloud:
# REDIS_URL=redis://username:password@hostname:port

# API Keys (Optional - for enhanced features)
SPEECH_TO_TEXT_API_KEY=your_openai_key_here
SENTIMENT_API_KEY=your_api_key_here
```

**`frontend/.env`**
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001
```

### Step 3: Obtain API Keys (Optional)

For enhanced transcription and sentiment analysis:

1. **OpenAI API Key**:
   - Visit https://platform.openai.com/api-keys
   - Create a new API key
   - Add to `SPEECH_TO_TEXT_API_KEY` in backend/.env

2. **Sentiment Analysis API**:
   - Optional (local analysis is built-in)
   - For premium services, integrate your preferred provider

---

## Running the Application

### Development Mode

**Option 1: Run Both Services Together**
```bash
npm run dev
```

This starts:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

**Option 2: Run Services Separately**

Terminal 1 - Start Redis:
```bash
redis-server
```

Terminal 2 - Start Backend:
```bash
cd backend
npm run dev
```

Terminal 3 - Start Frontend:
```bash
cd frontend
npm run dev
```

### Verify Services

```bash
# Check backend health
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"2024-11-17T..."}

# Frontend should be accessible at
# http://localhost:3000
```

---

## Testing the System

### Manual Testing with Demo Endpoints

**Get Sample Highlights**
```bash
curl http://localhost:3001/api/demo/sample-highlights
```

**Get Sample Reel**
```bash
curl http://localhost:3001/api/demo/sample-reel
```

**Get Stream Metrics**
```bash
curl http://localhost:3001/api/demo/sample-stream
```

### Test Stream Monitoring

1. Open http://localhost:3000 in your browser
2. On the "Monitor" tab, enter a Twitch stream URL:
   ```
   https://twitch.tv/your_channel_name
   ```
3. Select platform: **Twitch**
4. Click "Start Monitoring"
5. Switch to "Analytics" tab to see live metrics

### Test Reel Generation

1. Go to "Reels" tab
2. Select output format (Instagram, TikTok, YouTube, Twitter)
3. Configure options (intro, outro, music)
4. Click "Generate Reel"
5. View generated reel preview

---

## Troubleshooting

### Redis Connection Issues

**Error: `Redis not connected`**

Solution:
```bash
# Check if Redis is running
redis-cli ping

# If not running:
redis-server              # Linux/macOS
redis-server.exe         # Windows

# Check Redis connection details
redis-cli info
```

### Port Already in Use

**Error: `Port 3001 or 3000 is already in use`**

Solution:
```bash
# Find and kill process using port 3001
lsof -i :3001
kill -9 <PID>

# Or change port in backend/.env
PORT=3002
```

### Build Errors

**Error: `Missing dependencies`**

Solution:
```bash
# Clear and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install-all

# Clear npm cache if issues persist
npm cache clean --force
npm run install-all
```

### WebSocket Connection Failed

**Error: `WebSocket connection failed`**

Solution:
```bash
# Check backend is running on correct port
curl http://localhost:3001/health

# Check frontend env file
cat frontend/.env

# Should have:
# REACT_APP_WS_URL=ws://localhost:3001
```

### Memory Issues

**Error: `JavaScript heap out of memory`**

Solution:
```bash
# Increase Node.js heap size
NODE_OPTIONS=--max-old-space-size=4096 npm run dev
```

---

## Production Deployment

### Environment Setup

**Production .env files**

`backend/.env`:
```env
PORT=3001
NODE_ENV=production

REDIS_HOST=production-redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

SPEECH_TO_TEXT_API_KEY=your_production_key
SENTIMENT_API_KEY=your_production_key
```

### Build for Production

```bash
# Build both frontend and backend
npm run build

# Build individual projects
npm run build:backend
npm run build:frontend
```

### Docker Deployment

**Create `Dockerfile` for backend:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/dist ./dist
COPY backend/.env .env

EXPOSE 3001
CMD ["node", "dist/index.js"]
```

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - PORT=3001
    depends_on:
      - redis

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://backend:3001/api
      - REACT_APP_WS_URL=ws://backend:3001
    depends_on:
      - backend

volumes:
  redis_data:
```

**Deploy with Docker:**
```bash
docker-compose up -d
```

### Kubernetes Deployment (Optional)

```bash
# Create namespace
kubectl create namespace livestreamer

# Create Redis pod
kubectl apply -f k8s/redis-deployment.yaml -n livestreamer

# Create backend deployment
kubectl apply -f k8s/backend-deployment.yaml -n livestreamer

# Create frontend deployment
kubectl apply -f k8s/frontend-deployment.yaml -n livestreamer

# Check status
kubectl get pods -n livestreamer
```

### Monitoring & Logging

Setup logging:
```bash
# Install pm2 for production process management
npm install -g pm2

# Start backend with PM2
pm2 start "cd backend && npm start" --name livestreamer-backend

# View logs
pm2 logs livestreamer-backend

# Setup monitoring
pm2 monitor
```

### Security Checklist

- [ ] Set strong Redis password
- [ ] Use HTTPS/WSS in production
- [ ] Set secure CORS headers
- [ ] Implement rate limiting
- [ ] Use API authentication tokens
- [ ] Keep dependencies updated
- [ ] Enable Redis persistence
- [ ] Setup firewall rules
- [ ] Monitor error rates
- [ ] Backup data regularly

---

## Next Steps

After successful setup:

1. **Explore Features**:
   - Test stream monitoring
   - Generate sample highlight reels
   - View real-time analytics

2. **Customize**:
   - Modify sentiment analysis keywords
   - Adjust highlight detection thresholds
   - Change reel generation templates

3. **Scale**:
   - Deploy to cloud (AWS, GCP, Azure)
   - Setup CDN for video delivery
   - Implement auto-scaling

4. **Integrate**:
   - Connect to streaming platforms
   - Add webhook notifications
   - Integrate with social media APIs

---

## Support & Resources

### Documentation
- Main README: [README.md](./README.md)
- Performance Analysis: [PERFORMANCE_ANALYSIS.md](./PERFORMANCE_ANALYSIS.md)
- API Endpoints: See README.md section 📊

### Getting Help
- Check [Troubleshooting](#troubleshooting) section above
- Review logs: `pm2 logs livestreamer-backend`
- Open an issue on GitHub

### Community
- Star the project ⭐
- Share feedback and suggestions
- Contribute improvements!

---

**You're all set! Start building amazing highlight reels! 🚀**
