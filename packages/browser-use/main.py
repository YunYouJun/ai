"""
Browser-use agent powered by DeepSeek LLM.

This script launches a browser automation agent that uses DeepSeek's chat model
to perform web browsing tasks via the browser-use library.

Requirements:
    - DEEPSEEK_API_KEY must be set in a `.env` file (see `.env.example`)

Usage:
    python main.py
"""

import asyncio
import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from pydantic import SecretStr

from browser_use import Agent

load_dotenv()


def create_llm() -> ChatOpenAI:
    """Create and configure the DeepSeek ChatOpenAI instance.

    Returns:
        ChatOpenAI: Configured LLM client pointing to the DeepSeek API.

    Raises:
        ValueError: If DEEPSEEK_API_KEY environment variable is not set.
    """
    api_key = os.getenv('DEEPSEEK_API_KEY', '')
    if not api_key:
        raise ValueError('DEEPSEEK_API_KEY is not set')
    return ChatOpenAI(
        base_url='https://api.deepseek.com/v1',
        model='deepseek-chat',
        api_key=SecretStr(api_key),
    )


async def main() -> None:
    """Run the browser-use agent with a sample comparison task."""
    llm = create_llm()
    agent = Agent(
        task='Compare the price of gpt-4o and DeepSeek-V3',
        llm=llm,
        use_vision=False,
    )
    await agent.run()


if __name__ == '__main__':
    asyncio.run(main())
