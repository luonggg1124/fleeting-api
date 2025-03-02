import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import dotenv from "dotenv";
dotenv.config();
const packageDefinition = protoLoader.loadSync(
  process.env.PROTO_PATH as string
);
const cacheProto: any = grpc.loadPackageDefinition(packageDefinition).cache;

export class CacheClient {
  private client;
  constructor() {
    this.client = new cacheProto.CacheService(
      process.env.CACHE_SERVER_URL,
      grpc.credentials.createInsecure()
    );
  }
  async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetCache({ key: key }, (error: any, response: any) => {
        if (error) return reject(error);
        resolve(response.value ? JSON.parse(response.value) : null);
      });
    });
  }
  async setex(key: string, data: any, ttl: number = 300): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.SetCache(
        { key: key, value: JSON.stringify(data), ttl },
        (error: any, response: any) => {
          if (error) return reject(error);
          resolve();
        }
      );
    });
  }
  async del(key:string): Promise<void>{
    return new Promise((resolve, reject) => {
      this.client.DeleteCache({ key: key }, (error: any) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
}

