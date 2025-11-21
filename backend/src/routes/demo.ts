import { Router, Request, Response } from 'express';
import {
  generateMockHighlights,
  generateMockReel,
  generateMockStreamMetadata,
} from '../utils/mockData';

const router = Router();

router.get('/sample-highlights', (req: Request, res: Response) => {
  const streamId = 'demo-stream-123';
  const highlights = generateMockHighlights(streamId, 8);
  res.json({
    streamId,
    highlights,
    total: highlights.length,
  });
});

router.get('/sample-reel', (req: Request, res: Response) => {
  const streamId = 'demo-stream-123';
  const reel = generateMockReel(streamId);
  res.json({ reel });
});

router.get('/sample-stream', (req: Request, res: Response) => {
  const streamId = 'demo-stream-123';
  const metadata = generateMockStreamMetadata(streamId);
  res.json({ stream: metadata });
});

router.get('/metrics-over-time', (req: Request, res: Response) => {
  const metrics: any[] = [];
  const baseTime = Date.now() - 3600000;

  for (let i = 0; i < 60; i++) {
    metrics.push({
      timestamp: baseTime + i * 60000,
      viewers: 5000 + Math.random() * 5000,
      engagement: Math.random() * 100,
      sentiment: -50 + Math.random() * 100,
    });
  }

  res.json({ metrics });
});

export default router;