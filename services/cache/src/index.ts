import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import dotenv from "dotenv";
import Redis from "ioredis";
dotenv.config();
const redis = new Redis(process.env.REDIS_URL as string);
const PORT = process.env.PORT;
const PROTO_PATH = process.env.PROTO_RUN === "docker"
? "/app/proto/cache.proto"
: "../../proto/cache.proto";
const packageDefinition = protoLoader.loadSync(
  PROTO_PATH as string
);
const cacheProto: any = grpc.loadPackageDefinition(packageDefinition).cache;

const cacheService = {
  Get: async (call: any, callback: any) => {
    const value = await redis.get(call.request.key);
    console.log("GetCache:" +call.request.key);
    callback(null, { value: value || "" });
  },
  Set: async (call: any, callback: any) => {
    await redis.set(call.request.key,call.request.value);
    console.log("SetCache:"+call.request.key);

    callback(null, { message: "Cached successfully" });
  },
  SetEX: async (call: any, callback: any) => {
    await redis.setex(
      call.request.key,
      call.request.ttl || 300,
      call.request.value
    );
    console.log("SetEXCache:"+call.request.key);

    callback(null, { message: "Cached successfully" });
  },
  GetTTL :async(call:any, callback:any) => {
    const value = await redis.ttl(call.request.key);
    console.log("GetTTL:"+call.request.key);
    callback(null, { ttl: value || "" });
  },
  Incr:async(call:any, callback:any) => {
    await redis.incr(call.request.key);
    console.log("Incr:"+call.request.key);
    callback(null, { message: "Cached successfully" });
  },
  Delete: async (call: any, callback: any) => {
    await redis.del(call.request.key);
    console.log("DeleteCache:"+call.request.key);
    
    callback(null, { message: "Cache deleted" });
  },
};

const server = new grpc.Server();
server.addService(cacheProto.CacheService.service, cacheService);
server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log(`🚀 Cache Service running on gRPC port ${PORT}`);
  }
);
