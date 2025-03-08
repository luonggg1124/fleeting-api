from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import aioredis
import uvicorn
import json
from typing import Dict

app = FastAPI()


active_connections:Dict[str,WebSocket] = {}