"""
Data loader: reads local markdown knowledge base files
and converts them into LangChain Documents for ChromaDB.
"""

import os
from pathlib import Path
from langchain_core.documents import Document
from config import KNOWLEDGE_DIR


def load_all_documents() -> list[Document]:
    """Load all markdown files from the knowledge_base directory."""
    knowledge_path = Path(KNOWLEDGE_DIR)
    if not knowledge_path.exists():
        raise FileNotFoundError(f"Knowledge base directory not found: {KNOWLEDGE_DIR}")

    documents = []
    for md_file in knowledge_path.glob("*.md"):
        content = md_file.read_text(encoding="utf-8")
        # Split by sections (## headers) for better chunking
        sections = _split_by_sections(content, md_file.stem)
        documents.extend(sections)

    return documents


def _split_by_sections(content: str, source_name: str) -> list[Document]:
    """Split a markdown file into documents by ## sections."""
    lines = content.split("\n")
    sections = []
    current_section = []
    current_title = source_name

    for line in lines:
        if line.startswith("## ") and current_section:
            # Save the previous section
            text = "\n".join(current_section).strip()
            if text:
                sections.append(Document(
                    page_content=text,
                    metadata={
                        "source": source_name,
                        "section": current_title,
                    }
                ))
            current_section = [line]
            current_title = line.replace("## ", "").strip()
        else:
            current_section.append(line)

    # Don't forget the last section
    if current_section:
        text = "\n".join(current_section).strip()
        if text:
            sections.append(Document(
                page_content=text,
                metadata={
                    "source": source_name,
                    "section": current_title,
                }
            ))

    return sections
