import json
from typing import Set, Dict
from fastapi import WebSocket

from app.models.schemas import WebSocketMessage


class ConnectionManager:
    """
    Manages WebSocket connections and broadcasts messages to connected clients.
    """

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"✓ Client connected. Active connections: {len(self.active_connections)}")

    async def disconnect(self, websocket: WebSocket):
        """Remove a disconnected WebSocket"""
        self.active_connections.discard(websocket)
        print(f"✗ Client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: WebSocketMessage):
        """Send a message to all connected clients"""
        disconnected_clients = set()

        for connection in self.active_connections:
            try:
                await connection.send_json(message.model_dump())
            except Exception as e:
                print(f"Error sending to client: {e}")
                disconnected_clients.add(connection)

        # Clean up disconnected clients
        for conn in disconnected_clients:
            await self.disconnect(conn)

    async def broadcast_dict(self, data: Dict):
        """Send a dictionary as JSON to all clients"""
        disconnected_clients = set()

        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception as e:
                print(f"Error sending to client: {e}")
                disconnected_clients.add(connection)

        # Clean up disconnected clients
        for conn in disconnected_clients:
            await self.disconnect(conn)

    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections)
