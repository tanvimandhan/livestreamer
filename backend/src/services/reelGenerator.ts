// import { v4 as uuidv4 } from 'uuid';
// import { RedisClient } from './redisClient';

// export interface ReelConfig {
//   format: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
//   includeIntro: boolean;
//   includeOutro: boolean;
//   includeMusic: boolean;
//   musicGenre: string;
//   maxDuration: number;
// }

// export interface GeneratedReel {
//   id: string;
//   streamId: string;
//   format: string;
//   duration: number;
//   highlights: string[];
//   createdAt: number;
//   status: 'pending' | 'processing' | 'completed' | 'failed';
//   outputPath?: string;
//   metadata?: {
//     title?: string;
//     description?: string;
//     hashtags?: string[];
//   };
// }

// export class ReelGenerator {
//   private platformConfigs = {
//     instagram: { maxDuration: 60, aspectRatio: '9:16' },
//     tiktok: { maxDuration: 60, aspectRatio: '9:16' },
//     youtube: { maxDuration: 300, aspectRatio: '16:9' },
//     twitter: { maxDuration: 60, aspectRatio: '16:9' },
//   };

//   constructor(private redisClient: RedisClient) {}

//   async generateReel(
//     streamId: string,
//     highlights: any[],
//     config: ReelConfig
//   ): Promise<GeneratedReel> {
//     const reelId = uuidv4();

//     const reel: GeneratedReel = {
//       id: reelId,
//       streamId,
//       format: config.format,
//       duration: 0,
//       highlights: highlights.map((h) => h.id),
//       createdAt: Date.now(),
//       status: 'pending',
//     };

//     await this.redisClient.set(`reel:${reelId}`, JSON.stringify(reel), 86400);

//     this.processReelInBackground(reelId, streamId, highlights, config);

//     return reel;
//   }

//   private async processReelInBackground(
//     reelId: string,
//     streamId: string,
//     highlights: any[],
//     config: ReelConfig
//   ): Promise<void> {
//     try {
//       const reel = await this.compileHighlights(highlights, config);
//       reel.id = reelId;
//       reel.streamId = streamId;

//       if (config.includeIntro) {
//         await this.addIntro(reel);
//       }

//       if (config.includeOutro) {
//         await this.addOutro(reel);
//       }

//       if (config.includeMusic) {
//         await this.addMusic(reel, config.musicGenre);
//       }

//       const optimized = await this.optimizeForPlatform(reel, config.format);
//       optimized.status = 'completed';

//       await this.redisClient.set(
//         `reel:${reelId}`,
//         JSON.stringify(optimized),
//         86400
//       );

//       console.log(`Reel ${reelId} completed`);
//     } catch (error) {
//       console.error(`Error generating reel ${reelId}:`, error);
//       const reel: GeneratedReel = {
//         id: reelId,
//         streamId,
//         format: config.format,
//         duration: 0,
//         highlights: [],
//         createdAt: Date.now(),
//         status: 'failed',
//       };

//       await this.redisClient.set(`reel:${reelId}`, JSON.stringify(reel), 86400);
//     }
//   }

//   private async compileHighlights(
//     highlights: any[],
//     config: ReelConfig
//   ): Promise<GeneratedReel> {
//     let totalDuration = 0;
//     const selectedHighlights: string[] = [];

//     for (const highlight of highlights) {
//       const duration = highlight.endTime - highlight.startTime;

//       if (totalDuration + duration <= config.maxDuration) {
//         selectedHighlights.push(highlight.id);
//         totalDuration += duration;
//       } else {
//         break;
//       }
//     }

//     return {
//       id: '',
//       streamId: '',
//       format: config.format,
//       duration: totalDuration,
//       highlights: selectedHighlights,
//       createdAt: Date.now(),
//       status: 'processing',
//     };
//   }

//   private async addIntro(reel: GeneratedReel): Promise<void> {
//     console.log(`Adding intro to reel ${reel.id}`);
//     reel.duration += 3;
//   }

//   private async addOutro(reel: GeneratedReel): Promise<void> {
//     console.log(`Adding outro to reel ${reel.id}`);
//     reel.duration += 2;
//   }

//   private async addMusic(reel: GeneratedReel, genre: string): Promise<void> {
//     console.log(`Adding ${genre} music to reel ${reel.id}`);
//   }

//   private async optimizeForPlatform(
//     reel: GeneratedReel,
//     platform: string
//   ): Promise<GeneratedReel> {
//     const config = this.platformConfigs[platform as keyof typeof this.platformConfigs];

//     if (!config) {
//       throw new Error(`Unknown platform: ${platform}`);
//     }

//     if (reel.duration > config.maxDuration) {
//       reel.highlights = reel.highlights.slice(
//         0,
//         Math.floor((config.maxDuration / reel.duration) * reel.highlights.length)
//       );
//       reel.duration = config.maxDuration;
//     }

//     reel.metadata = {
//       title: `Highlight Reel - ${new Date().toLocaleDateString()}`,
//       description: `Top moments from the livestream`,
//       hashtags: ['#livestream', `#${platform}`, '#highlights'],
//     };

//     return reel;
//   }

//   async getReel(reelId: string): Promise<GeneratedReel | null> {
//     const data = await this.redisClient.get(`reel:${reelId}`);
//     return data ? JSON.parse(data) : null;
//   }

//   async generateThumbnail(reel: GeneratedReel): Promise<string> {
//     console.log(`Generating thumbnail for reel ${reel.id}`);

//     const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA502', '#9B59B6'];
//     const randomColor = colors[Math.floor(Math.random() * colors.length)];

//     return `data:image/svg+xml;base64,${Buffer.from(`<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"><rect fill="${randomColor}" width="1080" height="1920"/><text x="540" y="960" font-size="80" fill="white" text-anchor="middle" font-weight="bold">HIGHLIGHT REEL</text><text x="540" y="1100" font-size="40" fill="white" text-anchor="middle">${reel.highlights.length} Best Moments</text></svg>`).toString('base64')}`;
//   }
// }

import { v4 as uuidv4 } from "uuid";
import { MongoDBClient } from "../db/mongoClient";

export class ReelGenerator {
  constructor(private mongo: MongoDBClient) {}

  async generateReel(streamId: string, highlights: any[], config: any) {
    const reelId = uuidv4();
    const reels = this.mongo.collection("reels");

    const reel = {
      id: reelId,
      streamId,
      format: config.format,
      highlights: highlights.map(h => h.id),
      createdAt: Date.now(),
      duration: 0,
      status: "pending"
    };

    await reels.insertOne(reel);

    this.processReelInBackground(reelId, streamId, highlights, config);

    return reel;
  }

  async processReelInBackground(reelId: string, streamId: string, highlights: any[], config: any) {
    const reels = this.mongo.collection("reels");

    try {
      let reel = await reels.findOne({ id: reelId });
      if (!reel) return;

      // processing logic...
      reel.status = "completed";
      reel.duration = highlights.length * 10;

      await reels.updateOne({ id: reelId }, { $set: reel });
    } catch (err) {
      await reels.updateOne(
        { id: reelId },
        { $set: { status: "failed" } }
      );
    }
  }

  async getReel(reelId: string) {
    return this.mongo.collection("reels").findOne({ id: reelId });
  }
}
