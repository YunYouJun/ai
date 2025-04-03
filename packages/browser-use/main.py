from langchain_openai import ChatOpenAI
from browser_use import Agent
import asyncio
from dotenv import load_dotenv
from pydantic import SecretStr
import os

load_dotenv()

api_key = os.getenv('DEEPSEEK_API_KEY', '')
if not api_key:
	raise ValueError('DEEPSEEK_API_KEY is not set')

# llm=ChatOpenAI(base_url='https://api.deepseek.com/v1', model='deepseek-reasoner', api_key=SecretStr(api_key))
llm=ChatOpenAI(base_url='https://api.deepseek.com/v1', model='deepseek-chat', api_key=SecretStr(api_key))

async def main():
    agent = Agent(
        task="Compare the price of gpt-4o and DeepSeek-V3",
        # llm=ChatOpenAI(model="gpt-4o"),
        llm=llm,
        use_vision=False,
    )
    await agent.run()

asyncio.run(main())
