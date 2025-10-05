"""
This file centralizes all external API communication.
It contains functions for making both streaming and non-streaming calls
to the Cerebras and Llama APIs.
"""
import httpx
import json
from typing import AsyncGenerator
from fastapi import HTTPException
import config

print("\n" + "="*60)
print("🔑 API CONFIGURATION CHECK")
print("="*60)
print(f"Cerebras Key: {'✓ SET (' + config.CEREBRAS_API_KEY[:10] + '...)' if config.CEREBRAS_API_KEY else '✗ MISSING'}")
print(f"OpenRouter Key: {'✓ SET (' + config.OPENROUTER_API_KEY[:10] + '...)' if config.OPENROUTER_API_KEY else '✗ MISSING'}")
print(f"Cerebras URL: {config.CEREBRAS_API_URL}")
print(f"OpenRouter URL: {config.OPENROUTER_API_URL}")
print("="*60 + "\n")

# ==================== STREAMING FUNCTIONS ====================
async def call_cerebras_stream(prompt: str, system_prompt: str, max_tokens: int = 1000) -> AsyncGenerator[str, None]:
    """Stream Cerebras AI responses chunk by chunk"""
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            async with client.stream(
                "POST",
                config.CEREBRAS_API_URL,
                headers={
                    "Authorization": f"Bearer {config.CEREBRAS_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-4-scout-17b-16e-instruct",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": max_tokens,
                    "stream": True
                }
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            if "choices" in chunk and len(chunk["choices"]) > 0:
                                delta = chunk["choices"][0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            raise Exception(f"Cerebras streaming error: {str(e)}")

async def call_llama_stream(prompt: str, system_prompt: str, max_tokens: int = 1500) -> AsyncGenerator[str, None]:
    """Stream OpenRouter API responses chunk by chunk"""
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            async with client.stream(
                "POST",
                config.OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {config.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",  
                    "X-Title": "LinkedIn Profile Analyzer"
                },
                json={
                    "model": "meta-llama/llama-3.3-8b-instruct:free", 
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": max_tokens,
                    "stream": True
                }
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            if "choices" in chunk and len(chunk["choices"]) > 0:
                                delta = chunk["choices"][0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            raise Exception(f"OpenRouter streaming error: {str(e)}")

# ==================== NON-STREAMING FUNCTIONS ====================
async def call_cerebras_api(prompt: str, system_prompt: str, max_tokens: int = 1000) -> str:
    """Non-streaming Cerebras call"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                config.CEREBRAS_API_URL,
                headers={
                    "Authorization": f"Bearer {config.CEREBRAS_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-4-scout-17b-16e-instruct",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": max_tokens
                }
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cerebras API error: {str(e)}")

async def call_llama_api(prompt: str, system_prompt: str, max_tokens: int = 1500) -> str:
    """Non-streaming OpenRouter call"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                config.OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {config.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "LinkedIn Profile Analyzer"
                },
                json={
                    "model": "meta-llama/llama-3.3-8b-instruct:free",  
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": max_tokens
                }
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OpenRouter API error: {str(e)}")