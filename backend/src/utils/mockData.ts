import { v4 as uuidv4 } from 'uuid';

export const generateMockHighlights = (streamId: string, count: number = 8) => {
  const baseTime = Date.now() - 3600000;
  const highlights: any[] = [];

  const reasons = [
    'High positive sentiment',
    'Peak excitement',
    'High engagement + Interesting moment',
    'High engagement',
    'Peak excitement + High positive sentiment',
    'Viewer peak + Positive sentiment',
  ];

  for (let i = 0; i < count; i++) {
    const startTime = baseTime + i * 300000;
    const duration = 30000 + Math.random() * 30000;

    highlights.push({
      id: uuidv4(),
      streamId,
      startTime,
      endTime: startTime + duration,
      excitementScore: 0.7 + Math.random() * 0.3,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      chatSentiment: -0.5 + Math.random(),
      viewerEngagement: 0.5 + Math.random() * 0.5,
      transcription: generateMockTranscription(),
    });
  }

  return highlights;
};

export const generateMockTranscription = (): string => {
  const messages = [
    'This is absolutely insane! Did you see that clutch play?',
    'PogU moment right there, chat is going wild!',
    'Amazing! What a fantastic turn of events!',
    'I cannot believe what I just witnessed, that was incredible!',
    'Chat is spamming emotes right now, this is epic!',
    'That was the highlight of the stream so far!',
    'No way! That was the sickest play I have ever seen!',
    'This is why we watch live streams, moments like this!',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

export const generateMockReel = (streamId: string) => {
  const reelId = uuidv4();
  const highlights = generateMockHighlights(streamId, 5);

  return {
    id: reelId,
    streamId,
    format: ['instagram', 'tiktok', 'youtube', 'twitter'][
      Math.floor(Math.random() * 4)
    ],
    duration: 45 + Math.random() * 15,
    highlights: highlights.map((h) => h.id),
    createdAt: Date.now(),
    status: 'completed',
    metadata: {
      title: `Highlight Reel - ${new Date().toLocaleDateString()}`,
      description: 'Top moments from the livestream',
      hashtags: ['#livestream', '#highlights', '#gaming'],
    },
  };
};

export const generateMockStreamMetadata = (streamId: string) => {
  return {
    id: streamId,
    url: 'https://twitch.tv/example_channel',
    platform: 'twitch',
    startTime: Date.now() - 7200000,
    transcription: [
      'Welcome to the stream!',
      'Today we are trying something new',
      'This is going to be epic!',
    ],
    chatMessages: generateMockChatMessages(50),
    viewerMetrics: {
      currentViewers: Math.floor(5000 + Math.random() * 5000),
      peakViewers: Math.floor(8000 + Math.random() * 7000),
      averageEngagement: 0.5 + Math.random() * 0.5,
    },
  };
};

export const generateMockChatMessages = (count: number) => {
  const users = ['user1', 'user2', 'user3', 'user4', 'user5', 'streamer'];
  const messages = [
    'This is amazing!',
    'Great play!',
    'PogU',
    'Wow!',
    'Best moment!',
    'I love this!',
    'This is incredible!',
    'Clutch!',
    'GG',
    'Epic!',
  ];

  const chatMessages: any[] = [];
  for (let i = 0; i < count; i++) {
    chatMessages.push({
      user: users[Math.floor(Math.random() * users.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: Date.now() - (count - i) * 5000,
      sentiment: {
        score: -0.5 + Math.random(),
        label: Math.random() > 0.3 ? 'positive' : 'neutral',
        confidence: 0.5 + Math.random() * 0.5,
      },
    });
  }

  return chatMessages;
};
