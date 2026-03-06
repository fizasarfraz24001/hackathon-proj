from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from openai import OpenAI
from app.config.settings import settings
from app.utils.mcp_client import mcp_client


class BaseAgent(ABC):
    """Base class for all AI agents in the system"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    async def store_context(self, user_id: str, session_id: str, context_type: str, data: Dict[str, Any]):
        """Store agent context using MCP"""
        from app.utils.mcp_client import MCPContext
        import datetime

        context = MCPContext(
            user_id=user_id,
            session_id=session_id,
            context_type=context_type,
            data=data,
            created_at=datetime.datetime.now().isoformat(),
            updated_at=datetime.datetime.now().isoformat()
        )
        return await mcp_client.store_context(context)

    async def retrieve_context(self, user_id: str, context_type: str) -> Optional[Dict[str, Any]]:
        """Retrieve agent context from MCP"""
        return await mcp_client.retrieve_context(user_id, context_type)

    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process input and return structured output"""
        pass

    def _create_system_prompt(self, purpose: str) -> str:
        """Create a system prompt for the agent"""
        return f"""
        You are an expert AI assistant named {self.name}. {self.description}
        Your purpose is to: {purpose}

        Follow these guidelines:
        1. Always provide structured, actionable output
        2. Be concise but thorough in your analysis
        3. Consider the user's background and goals
        4. Provide evidence-based recommendations
        5. Format your responses as valid JSON according to the specified schema
        """

    async def _call_openai(self, system_prompt: str, user_prompt: str, response_format=None) -> Any:
        """Make a call to OpenAI API"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        params = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.3,
        }

        if response_format:
            params["response_format"] = response_format

        response = self.client.chat.completions.create(**params)
        return response.choices[0].message.content