"""
RAG chain: builds a ChromaDB vector store and conversational retrieval chain.
Uses Google Gemini for both LLM and embeddings.
"""

import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain_core.documents import Document
from config import GOOGLE_API_KEY, CHROMA_PERSIST_DIR

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7,
)

# ---------- Vector Store ----------

COLLECTION_NAME = "fleetmetrics_knowledge"


def build_vectorstore(documents: list[Document]) -> Chroma:
    """Split documents, embed, and persist into ChromaDB."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_documents(documents)

    # Delete existing collection if any, to rebuild fresh
    vectorstore = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=CHROMA_PERSIST_DIR,
    )
    # Clear old data
    try:
        vectorstore.delete_collection()
    except Exception:
        pass

    # Build new collection
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=CHROMA_PERSIST_DIR,
    )
    return vectorstore


def load_vectorstore() -> Chroma | None:
    """Load a persisted ChromaDB collection, or return None."""
    if not os.path.exists(CHROMA_PERSIST_DIR):
        return None
    try:
        vectorstore = Chroma(
            collection_name=COLLECTION_NAME,
            embedding_function=embeddings,
            persist_directory=CHROMA_PERSIST_DIR,
        )
        # Check if collection has data
        if vectorstore._collection.count() == 0:
            return None
        return vectorstore
    except Exception:
        return None


# ---------- RAG Chain ----------

SYSTEM_PROMPT = """\
You are FleetBot, an intelligent AI assistant for the FleetMetrics fleet management platform.
You help managers, dispatchers, safety officers, and finance teams by answering questions
about vehicles, drivers, trips, expenses, maintenance, and how to use the system.

Use the retrieved context below to answer the user's question accurately.
If the context doesn't contain enough information, say so honestly —
do NOT make up data. Be specific and helpful.

Keep answers concise, professional, and friendly.

{context}
"""

CONTEXTUALIZE_PROMPT = """\
Given the chat history and the latest user question, reformulate the question
so it can be understood without the chat history. Do NOT answer the question —
just reformulate it if needed, or return it as-is.
"""


def create_rag_chain(vectorstore: Chroma):
    """Create a conversational RAG chain with chat history support."""
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 6},
    )

    # History-aware retriever
    contextualize_prompt = ChatPromptTemplate.from_messages([
        ("system", CONTEXTUALIZE_PROMPT),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, contextualize_prompt
    )

    # QA chain
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    qa_chain = create_stuff_documents_chain(llm, qa_prompt)

    # Full retrieval chain
    rag_chain = create_retrieval_chain(history_aware_retriever, qa_chain)
    return rag_chain
