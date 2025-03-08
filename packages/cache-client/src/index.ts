import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();
const PROTO_PATH =
  process.env.PROTO_RUN === "docker"
    ? "/app/proto/cache.proto"
    : "../../proto/cache.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
interface CacheProto extends grpc.ServiceDefinition {
  Get: grpc.MethodDefinition<{ key: string }, { value: string }>;
  Set: grpc.MethodDefinition<{ key: string; value: string }, {}>;
  SetEX: grpc.MethodDefinition<{ key: string; value: string; ttl: number }, {}>;
  Delete: grpc.MethodDefinition<{ key: string }, {}>;
  Incr: grpc.MethodDefinition<{ key: string }, {}>;
}
const cacheProto: any = grpc.loadPackageDefinition(
  packageDefinition
).cache;
export * from "./redis";
export class CacheClient {
  private client: InstanceType<typeof cacheProto.cache.CacheService>;
  constructor() {
    this.client = new cacheProto.CacheService(
      process.env.CACHE_SERVER_URL === 'docker' ?'cache-service:50051' : 'localhost:50051',
      grpc.credentials.createInsecure()
    );
  }
  async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.Get({  key }, (error: any, response: any) => {
        if (error) return reject(error);
        resolve(response.value ? JSON.parse(response.value) : null);
      });
    });
  }
  async set(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.Set(
        {  key, value: JSON.stringify(data) },
        (error: any) => {
          if (error) return reject(error);
          resolve();
        }
      );
    });
  }
  async setex(key: string, data: any, ttl: number = 300): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.SetEX(
        {  key, value: JSON.stringify(data), ttl },
        (error: any, _: any) => {
          if (error) return reject(error);
          resolve();
        }
      );
    });
  }
  async ttl(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetTTL({  key }, (error: any, response: any) => {
        if (error) return reject(error);
        resolve(response.value);
      });
    });
  }
  async del(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.Delete({  key }, (error: any) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
  async incr(key: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.client.Incr({  key }, (error: any, response: any) => {
        if (error) return reject(error);
        resolve(response.value);
      });
    });
  }
  async expire (key:string,ttl:number,mode?: "NX"|"XX"|"GT"|"LT",callback?: any):Promise<void>{
    return new Promise((resolve, reject) => {
      this.client.Expire({  key, ttl, mode,callback }, (error: any) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
}
