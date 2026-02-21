# 🤖 FleetMetrics RAG Chatbot

A RAG (Retrieval-Augmented Generation) chatbot for the FleetMetrics fleet management platform, built with **FastAPI**, **LangChain**, **Google Gemini 2.5 Flash**, and **ChromaDB**.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| API Server | FastAPI + Uvicorn |
| LLM | Google Gemini 2.5 Flash |
| Embeddings | Gemini Embedding 001 |
| Vector Store | ChromaDB (persistent) |
| RAG Framework | LangChain |

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

Create `.env.local` in the **parent directory** (or set env vars):

```env
GOOGLE_API_KEY=your-google-api-key
```

### 3. Run the server

```bash
uvicorn main:app --reload
```

Server starts at `http://localhost:8000`.

### 4. Ingest knowledge base

```bash
curl -X POST http://localhost:8000/ingest
```

### 5. Chat

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What vehicle types are supported?", "session_id": "test"}'
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/ingest` | Load knowledge base → ChromaDB |
| `POST` | `/chat` | Send message, get RAG response |
| `DELETE` | `/sessions/{id}` | Clear chat session |

## Architecture

```
User Message → FastAPI → LangChain RAG Chain
                            ├── ChromaDB (vector retrieval)
                            ├── Gemini 2.5 Flash (LLM)
                            └── knowledge_base/*.md (source docs)
```

## Extending Knowledge

Add `.md` files to `knowledge_base/` and re-run `POST /ingest`.

## Project Structure

```
chatbot/
├── main.py              # FastAPI server & endpoints
├── rag_chain.py          # RAG chain, ChromaDB, Gemini config
├── data_loader.py        # Markdown file loader
├── config.py             # Environment configuration
├── requirements.txt      # Python dependencies
└── knowledge_base/       # Source documents for RAG
    ├── fleet_management.md
    ├── faq.md
    └── troubleshooting.md
```

## License

MIT
