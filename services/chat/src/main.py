from fastapi import FastAPI#, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import JSONResponse
# from motor.motor_asyncio import AsyncIOMotorClient
#import asyncio
#import aioredis
#import uvicorn
# import json
from configs.mongo import init_collections
# from typing import Dict
import os
port = os.getenv("PORT",4003)
app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await init_collections()

# active_connections:Dict[str,WebSocket] = {}

@app.get("/")
async def hello_world():
    data = {"message": "Chat service is running on port "+port}
    return JSONResponse(content=data, status_code=200)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)