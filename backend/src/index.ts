// import express, { Express, Request, Response } from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import WebSocket, { WebSocketServer } from 'ws';
// import { createServer } from 'http';
// import { StreamProcessor } from './services/streamProcessor';
// import { RedisClient } from './services/redisClient';
// import { HighlightDetector } from './services/highlightDetector';
// import demoRoutes from './routes/demo';

// dotenv.config();

// const app: Express = express();
// const server = createServer(app);
// const wss = new WebSocketServer({ server });

// const PORT = process.env.PORT || 3001;

// app.use(cors());
// app.use(express.json());

// const redisClient = new RedisClient();
// const streamProcessor = new StreamProcessor(redisClient);
// const highlightDetector = new HighlightDetector(redisClient);

// app.use('/api/demo', demoRoutes);

// app.get('/health', (req: Request, res: Response) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// app.post('/api/streams/start', async (req: Request, res: Response) => {
//   try {
//     const { streamUrl, platform } = req.body;
    
//     if (!streamUrl) {
//       res.status(400).json({ error: 'streamUrl is required' });
//       return;
//     }

//     const streamId = await streamProcessor.startMonitoring(streamUrl, platform || 'twitch');
//     res.json({ success: true, streamId });
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// });

// app.post('/api/streams/stop', async (req: Request, res: Response) => {
//   try {
//     const { streamId } = req.body;
//     await streamProcessor.stopMonitoring(streamId);
//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// });

// app.get('/api/streams/:streamId/highlights', async (req: Request, res: Response) => {
//   try {
//     const { streamId } = req.params;
//     const highlights = await highlightDetector.getHighlights(streamId);
//     res.json({ highlights });
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// });

// app.post('/api/reels/generate', async (req: Request, res: Response) => {
//   try {
//     const { streamId, highlights } = req.body;
//     const reelId = await streamProcessor.generateReel(streamId, highlights);
//     res.json({ success: true, reelId });
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// });

// wss.on('connection', (ws: WebSocket) => {
//   console.log('New WebSocket connection');

//   ws.on('message', async (data: string) => {
//     try {
//       const message = JSON.parse(data);
      
//       if (message.type === 'subscribe') {
//         const { streamId } = message;
//         await streamProcessor.subscribeToStream(streamId, ws);
//       }
//     } catch (error) {
//       console.error('WebSocket error:', error);
//       ws.send(JSON.stringify({ type: 'error', message: (error as Error).message }));
//     }
//   });

//   ws.on('close', () => {
//     console.log('WebSocket disconnected');
//   });
// });

// server.listen(PORT, async () => {
//   console.log(`Server running on port ${PORT}`);
//   await redisClient.connect();
//   console.log('Connected to Redis');
// });


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoDBClient } from "./db/mongoClient";
import demoRouter from "./routes/demo";


dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());


const mongo = new MongoDBClient();
mongo.connect();


app.use("/api/demo", demoRouter);


app.get("/", (req, res) => {
res.send("Backend with MongoDB is running");
});


app.listen(5000, () => console.log("Server running on port 5000"));