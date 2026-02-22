from fastapi import FastAPI, WebSocket

app = FastAPI()

clients = []

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    clients.append(ws)

    while True:
        await ws.receive_text()
