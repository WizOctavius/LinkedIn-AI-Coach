"""
This file handles configuration management.
It loads environment variables and sets up API constants.
"""
import os
from dotenv import load_dotenv


load_dotenv()


CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"