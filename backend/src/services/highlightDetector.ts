// import { v4 as uuidv4 } from 'uuid';
// import { RedisClient } from './redisClient';

// export interface Highlight {
//   id: string;
//   streamId: string;
//   startTime: number;
//   endTime: number;
//   excitementScore: number;
//   reason: string;
//   chatSentiment: number;
//   viewerEngagement: number;
//   transcription: string;
// }

// export class HighlightDetector {
//   private excitementThreshold = 0.7;

//   constructor(private redisClient: RedisClient) {}

//   async detectHighlights(
//     streamId: string,
//     metadata: any
//   ): Promise<Highlight[]> {
//     const highlights: Highlight[] = [];

//     const chatMessages = metadata.chatMessages.slice(-100);

//     for (let i = 0; i < chatMessages.length - 5; i++) {
//       const window = chatMessages.slice(i, i + 5);
//       const excitementScore = this.calculateExcitementScore(window);

//       if (excitementScore > this.excitementThreshold) {
//         const avgSentiment =
//           window
//             .filter((m) => m.sentiment)
//             .reduce((sum, m) => sum + (m.sentiment.score || 0), 0) /
//             Math.max(1, window.filter((m) => m.sentiment).length);

//         const highlight: Highlight = {
//           id: uuidv4(),
//           streamId,
//           startTime: window[0].timestamp,
//           endTime: window[window.length - 1].timestamp,
//           excitementScore,
//           reason: this.determineHighlightReason(window),
//           chatSentiment: avgSentiment,
//           viewerEngagement: metadata.viewerMetrics?.averageEngagement || 0,
//           transcription: window.map((m) => m.message).join(' '),
//         };

//         highlights.push(highlight);
//       }
//     }

//     for (const highlight of highlights) {
//       await this.redisClient.lpush(
//         `stream:${streamId}:highlights`,
//         JSON.stringify(highlight)
//       );
//     }

//     return highlights;
//   }

//   private calculateExcitementScore(messages: any[]): number {
//     let score = 0;

//     for (const msg of messages) {
//       if (msg.sentiment) {
//         score += msg.sentiment.confidence || 0;
//       }

//       const messageLength = msg.message.length;
//       if (messageLength > 20) {
//         score += 0.1;
//       }

//       if (msg.message.includes('!')) {
//         score += 0.2;
//       }

//       if (msg.message.toUpperCase() === msg.message && messageLength > 3) {
//         score += 0.15;
//       }

//       if (msg.message.includes('clip')) {
//         score += 0.3;
//       }
//     }

//     return Math.min(1, score / messages.length);
//   }

//   private determineHighlightReason(messages: any[]): string {
//     const reasons: string[] = [];

//     const avgSentiment =
//       messages
//         .filter((m) => m.sentiment)
//         .reduce((sum, m) => sum + (m.sentiment.score || 0), 0) /
//         Math.max(1, messages.filter((m) => m.sentiment).length);

//     if (avgSentiment > 0.5) {
//       reasons.push('High positive sentiment');
//     }

//     const exclamationCount = messages.filter((m) =>
//       m.message.includes('!')
//     ).length;
//     if (exclamationCount > 1) {
//       reasons.push('High engagement');
//     }

//     const allCaps = messages.filter(
//       (m) => m.message.toUpperCase() === m.message && m.message.length > 3
//     ).length;
//     if (allCaps > 0) {
//       reasons.push('Peak excitement');
//     }

//     return reasons.length > 0 ? reasons.join(' + ') : 'Interesting moment';
//   }

//   async getHighlights(streamId: string): Promise<Highlight[]> {
//     try {
//       const highlightsData = await this.redisClient.lrange(
//         `stream:${streamId}:highlights`,
//         0,
//         -1
//       );

//       return highlightsData.map((data) => JSON.parse(data));
//     } catch (error) {
//       console.error('Error getting highlights:', error);
//       return [];
//     }
//   }

//   async filterHighlightsByCriteria(
//     streamId: string,
//     criteria: {
//       minExcitementScore?: number;
//       minEngagement?: number;
//       minDuration?: number;
//     }
//   ): Promise<Highlight[]> {
//     let highlights = await this.getHighlights(streamId);

//     if (criteria.minExcitementScore) {
//       highlights = highlights.filter(
//         (h) => h.excitementScore >= criteria.minExcitementScore!
//       );
//     }

//     if (criteria.minEngagement) {
//       highlights = highlights.filter(
//         (h) => h.viewerEngagement >= criteria.minEngagement!
//       );
//     }

//     if (criteria.minDuration) {
//       highlights = highlights.filter(
//         (h) => h.endTime - h.startTime >= criteria.minDuration!
//       );
//     }

//     return highlights;
//   }
// }

import { v4 as uuidv4 } from "uuid";
import { MongoDBClient } from "../db/mongoClient";


export class HighlightDetector {
private excitementThreshold = 0.7;


constructor(private mongo: MongoDBClient) {}


calculateExcitementScore(messages: any[]) {
const capsRatio = messages.filter((m) => m.message === m.message.toUpperCase()).length / messages.length;
const sentimentAvg = messages.reduce((a, b) => a + (b.sentiment?.score || 0), 0) / messages.length;
const lengthScore = messages.reduce((a, b) => a + b.message.length, 0) / messages.length;


return capsRatio * 0.5 + sentimentAvg * 0.3 + lengthScore * 0.2;
}


determineHighlightReason(messages: any[]) {
const pos = messages.filter((m) => m.sentiment?.label === "positive").length;
const neg = messages.filter((m) => m.sentiment?.label === "negative").length;
const caps = messages.filter((m) => m.message === m.message.toUpperCase()).length;


if (caps > messages.length * 0.5) return "High chat intensity";
if (pos > neg) return "Positive hype moment";
return "General excitement";
}


async detectHighlights(streamId: string, metadata: any) {
const highlightsCollection = this.mongo.collection("highlights");


const chatMessages = metadata.chatMessages.slice(-100);
const highlights = [];


for (let i = 0; i < chatMessages.length - 5; i++) {
const window = chatMessages.slice(i, i + 5);
const score = this.calculateExcitementScore(window);


if (score > this.excitementThreshold) {
const highlight = {
id: uuidv4(),
streamId,
startTime: window[0].timestamp,
endTime: window[4].timestamp,
excitementScore: score,
reason: this.determineHighlightReason(window),
transcription: window.map((m) => m.message).join(" "),
createdAt: Date.now()
};


await highlightsCollection.insertOne(highlight);
highlights.push(highlight);
}
}


return highlights;
}


async getHighlights(streamId: string) {
return await this.mongo.collection("highlights").find({ streamId }).toArray();
}
}