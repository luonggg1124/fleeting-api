import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import dotenv from "dotenv";
import { redis } from "@packages/cache-client";
import { ExpireRequest, Request, SetEXRequest, SetRequest } from "./interfaces/request";

dotenv.config();

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
    const value = await redis.get((call.request as Request).key);
    console.log("GetCache:" +call.request.key);
    callback(null, { value: value || "" });
  },
  Set: async (call: any, callback: any) => {
    const request = call.request as SetRequest;
    await redis.set(request.key,request.value);
    console.log("SetCache:"+call.request.key);

    callback(null, {success: true});
  },
  SetEX: async (call: any, callback: any) => {
    const request = call.request as SetEXRequest;
    await redis.setex(
      request.key,
      request.ttl || 300,
      request.value
    );
    console.log("SetEXCache:"+request.key);

    callback(null, { success: true });
  },
  GetTTL :async(call:any, callback:any) => {
    const request = call.request as SetRequest;
    const value = await redis.ttl(request.key);
    console.log("GetTTL:"+request.key);
    callback(null, { ttl: value || "" });
  },
  Incr:async(call:any, callback:any) => {
    const request = call.request as SetRequest;
    await redis.incr(request.key);
    console.log("Incr:"+request.key);
    callback(null, {success: true });
  },
  Delete: async (call: any, callback: any) => {
    const request = call.request as SetRequest;
    await redis.del(request.key);
    console.log("DeleteCache:"+request.key);
    
    callback(null, { success: true});
  },
  Expire: async (call:any,callback:any) => {
    const request = call.request as ExpireRequest;
    switch(request.mode){
      case "NX": 
      await redis.expire(request.key,request.ttl,request.mode,request.callback);
      break;
      case "XX":
        await redis.expire(request.key,request.ttl,request.mode,request.callback);
        break;
      case "GT":
        await redis.expire(request.key,request.ttl,request.mode,request.callback);
        break;
      case "LT": 
      await redis.expire(request.key,request.ttl,request.mode,request.callback);
      break;
      default: 
      await redis.expire(request.key,request.ttl,request.callback);
    }
    console.log("Expire:"+request.key);
    
    callback(null, { success: true });
  }
  
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
