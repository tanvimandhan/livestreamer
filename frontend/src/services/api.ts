import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });
  }

  async startStream(streamUrl: string, platform: string): Promise<{ streamId: string }> {
    const response = await this.client.post('/streams/start', {
      streamUrl,
      platform,
    });
    return response.data;
  }

  async stopStream(streamId: string): Promise<{ success: boolean }> {
    const response = await this.client.post('/streams/stop', { streamId });
    return response.data;
  }

  async getHighlights(streamId: string): Promise<any[]> {
    const response = await this.client.get(`/streams/${streamId}/highlights`);
    return response.data.highlights;
  }

  async generateReel(
    streamId: string,
    highlights: any[],
    config?: any
  ): Promise<{ reelId: string }> {
    const response = await this.client.post('/reels/generate', {
      streamId,
      highlights,
      config,
    });
    return response.data;
  }

  async getReel(reelId: string): Promise<any> {
    const response = await this.client.get(`/reels/${reelId}`);
    return response.data;
  }
}

export default new ApiClient();
