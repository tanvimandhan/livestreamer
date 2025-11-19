// import WebSocket from 'ws';
// import axios from 'axios';
// import { v4 as uuidv4 } from 'uuid';
// import { RedisClient } from './redisClient';
// import { TranscriptionService } from './transcriptionService';
// import { SentimentAnalysis } from './sentimentAnalysis';

// interface StreamMetadata {
//   id: string;
//   url: string;
//   platform: string;
//   startTime: number;
//   transcription: string[];
//   chatMessages: any[];
//   viewerMetrics: any;
// }

// export class StreamProcessor {
//   private activeStreams: Map<string, StreamMetadata> = new Map();
//   private transcriptionService: TranscriptionService;
//   private sentimentAnalysis: SentimentAnalysis;
//   private wsSubscribers: Map<string, Set<WebSocket>> = new Map();

//   constructor(private redisClient: RedisClient) {
//     this.transcriptionService = new TranscriptionService();
//     this.sentimentAnalysis = new SentimentAnalysis();
//   }

//   async startMonitoring(streamUrl: string, platform: string): Promise<string> {
//     const streamId = uuidv4();
    
//     const metadata: StreamMetadata = {
//       id: streamId,
//       url: streamUrl,
//       platform,
//       startTime: Date.now(),
//       transcription: [],
//       chatMessages: [],
//       viewerMetrics: {
//         currentViewers: 0,
//         peakViewers: 0,
//         averageEngagement: 0,
//       },
//     };

//     this.activeStreams.set(streamId, metadata);
//     await this.redisClient.set(
//       `stream:${streamId}`,
//       JSON.stringify(metadata),
//       3600
//     );

//     this.startStreamAnalysis(streamId, streamUrl, platform);

//     return streamId;
//   }

//   private async startStreamAnalysis(
//     streamId: string,
//     streamUrl: string,
//     platform: string
//   ): Promise<void> {
//     console.log(`Starting analysis for stream ${streamId}`);

//     const metadata = this.activeStreams.get(streamId);
//     if (!metadata) return;

//     try {
//       await this.processStreamData(streamId, streamUrl, platform);
//     } catch (error) {
//       console.error(`Error processing stream ${streamId}:`, error);
//       this.stopMonitoring(streamId);
//     }
//   }

//   private async processStreamData(
//     streamId: string,
//     streamUrl: string,
//     platform: string
//   ): Promise<void> {
//     const interval = setInterval(async () => {
//       if (!this.activeStreams.has(streamId)) {
//         clearInterval(interval);
//         return;
//       }

//       try {
//         const metadata = this.activeStreams.get(streamId)!;

//         if (platform === 'twitch') {
//           await this.fetchTwitchData(streamId, metadata);
//         }

//         await this.analyzeChatSentiment(streamId, metadata);
//         await this.updateViewerMetrics(streamId, metadata);

//         await this.redisClient.set(
//           `stream:${streamId}`,
//           JSON.stringify(metadata),
//           3600
//         );

//         this.broadcastUpdate(streamId, {
//           type: 'stream-update',
//           data: metadata,
//         });
//       } catch (error) {
//         console.error(`Error in stream analysis loop: ${error}`);
//       }
//     }, 5000);
//   }

//   private async fetchTwitchData(
//     streamId: string,
//     metadata: StreamMetadata
//   ): Promise<void> {
//     const mockChatMessages = [
//       { user: 'user1', message: 'This is amazing!', timestamp: Date.now() },
//       { user: 'user2', message: 'Great play!', timestamp: Date.now() },
//       {
//         user: 'user3',
//         message: 'PogU moment',
//         timestamp: Date.now(),
//       },
//     ];

//     for (const msg of mockChatMessages) {
//       metadata.chatMessages.push(msg);
//       const sentiment = await this.sentimentAnalysis.analyze(msg.message);
//       await this.redisClient.lpush(
//         `stream:${streamId}:chat`,
//         JSON.stringify({ ...msg, sentiment })
//       );
//     }
//   }

//   private async analyzeChatSentiment(
//     streamId: string,
//     metadata: StreamMetadata
//   ): Promise<void> {
//     for (const msg of metadata.chatMessages.slice(-10)) {
//       const sentiment = await this.sentimentAnalysis.analyze(msg.message);
//       msg.sentiment = sentiment;
//     }
//   }

//   private async updateViewerMetrics(
//     streamId: string,
//     metadata: StreamMetadata
//   ): Promise<void> {
//     const currentViewers = Math.floor(Math.random() * 10000) + 1000;
//     metadata.viewerMetrics.currentViewers = currentViewers;
    
//     if (currentViewers > metadata.viewerMetrics.peakViewers) {
//       metadata.viewerMetrics.peakViewers = currentViewers;
//     }

//     const sentiments = metadata.chatMessages
//       .slice(-50)
//       .filter((m) => m.sentiment)
//       .map((m) => m.sentiment.score || 0);

//     if (sentiments.length > 0) {
//       metadata.viewerMetrics.averageEngagement =
//         sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
//     }
//   }

//   async subscribeToStream(streamId: string, ws: WebSocket): Promise<void> {
//     if (!this.wsSubscribers.has(streamId)) {
//       this.wsSubscribers.set(streamId, new Set());
//     }
//     this.wsSubscribers.get(streamId)!.add(ws);
//   }

//   private broadcastUpdate(streamId: string, message: any): void {
//     const subscribers = this.wsSubscribers.get(streamId);
//     if (subscribers) {
//       subscribers.forEach((ws) => {
//         if (ws.readyState === WebSocket.OPEN) {
//           ws.send(JSON.stringify(message));
//         }
//       });
//     }
//   }

//   async stopMonitoring(streamId: string): Promise<void> {
//     this.activeStreams.delete(streamId);
//     await this.redisClient.del(`stream:${streamId}`);
    
//     const subscribers = this.wsSubscribers.get(streamId);
//     if (subscribers) {
//       subscribers.forEach((ws) => ws.close());
//       this.wsSubscribers.delete(streamId);
//     }

//     console.log(`Stopped monitoring stream ${streamId}`);
//   }

//   async generateReel(
//     streamId: string,
//     highlights: any[]
//   ): Promise<string> {
//     const reelId = uuidv4();
//     const reelMetadata = {
//       id: reelId,
//       streamId,
//       highlights,
//       createdAt: Date.now(),
//       status: 'generating',
//     };

//     await this.redisClient.set(
//       `reel:${reelId}`,
//       JSON.stringify(reelMetadata),
//       86400
//     );

//     console.log(`Generating reel ${reelId} for stream ${streamId}`);

//     return reelId;
//   }
// }

import { v4 as uuidv4 } from "uuid";
import { MongoDBClient } from "../db/mongoClient";
import { SentimentAnalysis } from "./sentimentAnalysis";

export class StreamProcessor {
  private activeStreams = new Map();

  constructor(private mongo: MongoDBClient) {}

  async startMonitoring(streamUrl: string, platform: string) {
    const streamId = uuidv4();

    const metadata = {
      id: streamId,
      url: streamUrl,
      platform,
      startTime: Date.now(),
      chatMessages: [],
      viewerMetrics: { currentViewers: 0, peakViewers: 0, averageEngagement: 0 }
    };

    await this.mongo.collection("streams").insertOne(metadata);
    this.activeStreams.set(streamId, metadata);

    this.startStreamAnalysis(streamId);
    return streamId;
  }

  async fetchTwitchData(streamId: string, metadata: any) {
    const mockMessages = [
      { user: "user1", message: "Awesome!", timestamp: Date.now() },
      { user: "user2", message: "Crazy play!", timestamp: Date.now() }
    ];

    for (const msg of mockMessages) {
      metadata.chatMessages.push(msg);

      await this.mongo.collection("chatMessages").insertOne({
        streamId,
        ...msg
      });
    }
  }
}
