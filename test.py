import asyncio
import aiohttp
import uuid
import json

async def main():
    ws_url = "ws://192.168.1.215:8188/ws?clientId=" + str(uuid.uuid4())
    print("Connecting to", ws_url)
    try:
        async with aiohttp.ClientSession() as session:
            async with session.ws_connect(ws_url, timeout=5) as ws:
                print("Connected! Listening for messages...")
                while True:
                    msg = await ws.receive()
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        data = json.loads(msg.data)
                        print("Received:", data)
                    elif msg.type in (aiohttp.WSMsgType.CLOSED, aiohttp.WSMsgType.ERROR):
                        print("Closed or Error:", msg)
                        break
    except Exception as e:
        print("Failed:", e)

asyncio.run(main())


