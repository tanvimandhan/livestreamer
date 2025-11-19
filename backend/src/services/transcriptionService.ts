export class TranscriptionService {
  async transcribe(audioBuffer: Buffer): Promise<string> {
    try {
      const apiKey = process.env.SPEECH_TO_TEXT_API_KEY;
      
      if (!apiKey) {
        console.warn('Speech-to-text API key not configured, using mock transcription');
        return this.getMockTranscription();
      }

      const formData = new FormData();
      formData.append('audio', new Blob([audioBuffer]));

      const response = await fetch(
        `https://api.openai.com/v1/audio/transcriptions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        }
      );

      const data = await response.json() as { text?: string };
      return data.text || '';
    } catch (error) {
      console.error('Transcription error:', error);
      return this.getMockTranscription();
    }
  }

  private getMockTranscription(): string {
    const mockTexts = [
      'This is an incredible moment',
      'Amazing play right there',
      'Did you see that clutch moment',
      'What a fantastic turn of events',
      'That was the highlight of the stream',
    ];

    return mockTexts[Math.floor(Math.random() * mockTexts.length)];
  }

  async transcribeRealtime(audioChunk: Buffer): Promise<string> {
    return this.getMockTranscription();
  }
}
