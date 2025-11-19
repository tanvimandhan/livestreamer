// src/db/mongoClient.ts
import { MongoClient, Db, Collection } from "mongodb";

export class MongoDBClient {
  private client: MongoClient;
  private db: Db;

  constructor() {
    this.client = new MongoClient(process.env.MONGO_URI || "mongodb://localhost:27017");
    this.db = this.client.db(process.env.MONGO_DB || "streamdb");
  }

  async connect() {
    await this.client.connect();
    console.log("MongoDB connected");
  }

  collection(name: string): Collection {
    return this.db.collection(name);
  }

  async close() {
    await this.client.close();
  }
}
