"""
FastAPI server for the FleetMetrics RAG Chatbot.
Uses ChromaDB as the vector store with local knowledge base files.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage

from data_loader import load_all_documents
from rag_chain import build_vectorstore, load_vectorstore, create_rag_chain

app = FastAPI(title="FleetMetrics Chatbot API", version="1.0.0")

# CORS — allow the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage for chat history
chat_sessions: dict[str, list] = {}

# Cached chain
_rag_chain = None


def get_rag_chain():
    global _rag_chain
    if _rag_chain is not None:
        return _rag_chain

    vectorstore = load_vectorstore()
    if vectorstore is None:
        return None

    _rag_chain = create_rag_chain(vectorstore)
    return _rag_chain


# ---------- Models ----------

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"


class ChatResponse(BaseModel):
    response: str
    sources: list[str] = []


class IngestResponse(BaseModel):
    status: str
    document_count: int


# ---------- Endpoints ----------

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/ingest", response_model=IngestResponse)
async def ingest_data():
    """Load knowledge base files and build/rebuild the ChromaDB vector store."""
    global _rag_chain
    try:
        documents = load_all_documents()
        if not documents:
            raise HTTPException(status_code=404, detail="No knowledge base files found")

        vectorstore = build_vectorstore(documents)
        _rag_chain = create_rag_chain(vectorstore)

        return IngestResponse(status="success", document_count=len(documents))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message and get a RAG-powered response."""
    chain = get_rag_chain()
    if chain is None:
        raise HTTPException(
            status_code=400,
            detail="Vector store not initialized. Call POST /ingest first."
        )

    # Get or create session history
    if request.session_id not in chat_sessions:
        chat_sessions[request.session_id] = []
    history = chat_sessions[request.session_id]

    try:
        result = chain.invoke({
            "input": request.message,
            "chat_history": history,
        })

        answer = result.get("answer", "Sorry, I couldn't generate a response.")

        # Extract source info
        sources = []
        for doc in result.get("context", []):
            src = doc.metadata.get("source", "unknown")
            section = doc.metadata.get("section", "")
            label = f"{src}: {section}" if section else src
            sources.append(label)
        sources = list(set(sources))

        # Update chat history (keep last 20 messages)
        history.append(HumanMessage(content=request.message))
        history.append(AIMessage(content=answer))
        if len(history) > 20:
            history[:] = history[-20:]

        return ChatResponse(response=answer, sources=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/sessions/{session_id}")
async def clear_session(session_id: str):
    """Clear chat history for a session."""
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    return {"status": "cleared"}
