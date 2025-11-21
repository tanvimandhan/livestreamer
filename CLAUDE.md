# Development Commands

## Backend

### Install dependencies
```bash
cd backend
npm install
```

### Run development server (requires Redis running on localhost:6379)
```bash
npm run dev
```

### Type check
```bash
npm run typecheck
```

### Build
```bash
npm run build
```

### Start production server
```bash
npm start
```

## Frontend

### Install dependencies
```bash
cd frontend
npm install --legacy-peer-deps
```

### Run development server
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Environment Setup

### Backend .env file
```
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
SPEECH_TO_TEXT_API_KEY=your_api_key_here
SENTIMENT_API_KEY=your_api_key_here
```

### Frontend .env file
```
REACT_APP_API_URL=http://localhost:3001/api
```

## What was fixed

1. **Fixed backend package.json**
   - Removed invalid commented JSON
   - Added Redis dependencies (redis, ws)
   - Cleaned up structure

2. **Restored Redis code**
   - Fixed backend/src/index.ts to use Redis and WebSockets
   - Fixed redisClient.ts with correct Redis v4 API (socket config)
   - Restored streamProcessor.ts to use Redis
   - Restored highlightDetector.ts with Redis storage
   - Restored sentimentAnalysis.ts
   - Restored reelGenerator.ts

3. **Fixed demo routes**
   - Uncommented demo API routes in routes/demo.ts

4. **Fixed TypeScript compilation**
   - Fixed type annotations for arrays in mockData.ts
   - Fixed Redis client type imports
   - Fixed hgetall and hget return types

5. **Frontend**
   - API service already correctly configured to point to http://localhost:3001/api
   - All components ready to work with backend

## Backend API Endpoints

- `GET /health` - Health check
- `POST /api/streams/start` - Start monitoring a stream
- `POST /api/streams/stop` - Stop monitoring a stream
- `GET /api/streams/:streamId/highlights` - Get highlights for a stream
- `POST /api/reels/generate` - Generate a reel from highlights
- `GET /api/demo/sample-highlights` - Demo endpoint for sample highlights
- `GET /api/demo/sample-reel` - Demo endpoint for sample reel
- `GET /api/demo/sample-stream` - Demo endpoint for sample stream
- `GET /api/demo/metrics-over-time` - Demo endpoint for metrics

## WebSocket Support

The backend supports WebSocket connections at the root path for real-time stream updates.
