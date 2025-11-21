export interface SentimentResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export class SentimentAnalysis {
  private positiveKeywords = [
    'amazing',
    'awesome',
    'great',
    'fantastic',
    'incredible',
    'clutch',
    'pogU',
    'pog',
    'sick',
    'fire',
    'lit',
    'epic',
    'insane',
    'genius',
  ];

  private negativeKeywords = [
    'bad',
    'terrible',
    'awful',
    'horrible',
    'trash',
    'cringe',
    'hate',
    'sucks',
    'boring',
    'fail',
  ];

  async analyze(text: string): Promise<SentimentResult> {
    try {
      const apiKey = process.env.SENTIMENT_API_KEY;

      if (!apiKey) {
        return this.analyzeSentimentLocally(text);
      }

      return this.analyzeWithAPI(text, apiKey);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return this.analyzeSentimentLocally(text);
    }
  }

  private analyzeWithAPI(text: string, apiKey: string): Promise<SentimentResult> {
    return new Promise((resolve) => {
      resolve(this.analyzeSentimentLocally(text));
    });
  }

  private analyzeSentimentLocally(text: string): SentimentResult {
    const lowerText = text.toLowerCase();

    let positiveCount = 0;
    let negativeCount = 0;

    this.positiveKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        positiveCount++;
      }
    });

    this.negativeKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        negativeCount++;
      }
    });

    let score: number;
    let label: 'positive' | 'negative' | 'neutral';

    if (positiveCount > negativeCount) {
      score = 0.5 + (positiveCount / (positiveCount + negativeCount + 1)) * 0.5;
      label = 'positive';
    } else if (negativeCount > positiveCount) {
      score = -(negativeCount / (positiveCount + negativeCount + 1)) * 0.5;
      label = 'negative';
    } else {
      score = 0;
      label = 'neutral';
    }

    return {
      score: Math.max(-1, Math.min(1, score)),
      label,
      confidence: Math.abs(score),
    };
  }
}