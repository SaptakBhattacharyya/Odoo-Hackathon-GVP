import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env.local from the parent Next.js project
env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(dotenv_path=env_path)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

CHROMA_PERSIST_DIR = str(Path(__file__).resolve().parent / "chroma_db")
KNOWLEDGE_DIR = str(Path(__file__).resolve().parent / "knowledge_base")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY must be set in .env.local")
