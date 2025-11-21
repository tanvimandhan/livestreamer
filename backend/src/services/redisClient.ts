import { createClient, RedisClientType } from 'redis';

export class RedisClient {
  private client: RedisClientType | null = null;

  async connect(): Promise<void> {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    this.client.on('error', (err) => console.error('Redis error:', err));
    
    await this.client.connect();
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');
    
    if (expirySeconds) {
      await this.client.setEx(key, expirySeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');
    await this.client.del(key);
  }

  async lpush(key: string, value: string): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');
    await this.client.lPush(key, value);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.lRange(key, start, stop);
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');
    await this.client.hSet(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null | undefined> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.hGet(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string | undefined>> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.hGetAll(key);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }
}
