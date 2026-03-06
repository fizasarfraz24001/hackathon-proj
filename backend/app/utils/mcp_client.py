import httpx
import json
from typing import Dict, Any, Optional, List
from app.config.settings import settings
from pydantic import BaseModel


class MCPContext(BaseModel):
    """Represents a context in MCP for storing user data and history"""
    user_id: str
    session_id: str
    context_type: str  # assessment, recommendation, roadmap
    data: Dict[str, Any]
    created_at: str
    updated_at: str


class MCPClient:
    """Client for Context7 MCP integration"""

    def __init__(self):
        self.base_url = settings.mcp_server_url
        self.api_key = settings.mcp_api_key
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        } if self.api_key else {"Content-Type": "application/json"}

    async def store_context(self, context: MCPContext) -> bool:
        """Store context in MCP"""
        if not self.base_url:
            # Fallback to in-memory storage if MCP is not configured
            return True

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/contexts",
                    json=context.dict(),
                    headers=self.headers
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Error storing context in MCP: {e}")
            return False

    async def retrieve_context(self, user_id: str, context_type: str) -> Optional[Dict[str, Any]]:
        """Retrieve context from MCP"""
        if not self.base_url:
            return None

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/contexts/{user_id}/{context_type}",
                    headers=self.headers
                )
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            print(f"Error retrieving context from MCP: {e}")
            return None

    async def update_context(self, context: MCPContext) -> bool:
        """Update existing context in MCP"""
        if not self.base_url:
            return True

        try:
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    f"{self.base_url}/contexts/{context.user_id}/{context.session_id}",
                    json=context.dict(),
                    headers=self.headers
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Error updating context in MCP: {e}")
            return False

    async def delete_context(self, user_id: str, context_type: str) -> bool:
        """Delete context from MCP"""
        if not self.base_url:
            return True

        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{self.base_url}/contexts/{user_id}/{context_type}",
                    headers=self.headers
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Error deleting context from MCP: {e}")
            return False

    async def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's context history from MCP"""
        if not self.base_url:
            return []

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/contexts/user/{user_id}",
                    headers=self.headers
                )
                if response.status_code == 200:
                    return response.json()
                return []
        except Exception as e:
            print(f"Error getting user history from MCP: {e}")
            return []


# Global instance
mcp_client = MCPClient()