import asyncio
import services

async def test():
    print("\n🧪 Testing Cerebras...")
    try:
        result = await services.call_cerebras_api("Say hello", "Be brief", 50)
        print(f"✓ Cerebras works: {result[:80]}")
    except Exception as e:
        print(f"✗ Cerebras FAILED: {e}")
    
    print("\n🧪 Testing OpenRouter...")
    try:
        result = await services.call_llama_api("Say hello", "Be brief", 50)
        print(f"✓ OpenRouter works: {result[:80]}")
    except Exception as e:
        print(f"✗ OpenRouter FAILED: {e}")

asyncio.run(test())