from pathlib import Path

import chromadb
import ollama


# Project paths
BASE_DIR = Path(__file__).resolve().parent
DOCUMENTS_DIR = BASE_DIR / "documents"
DB_DIR = BASE_DIR / "chroma_db"

# Initialize ChromaDB
client = chromadb.PersistentClient(path=str(DB_DIR))

collection = client.get_or_create_collection(
    name="credit_knowledge"
)


def split_into_chunks(text: str) -> list[str]:
    """Split text into paragraph-based chunks."""
    paragraphs = [
        paragraph.strip()
        for paragraph in text.split("\n\n")
        if paragraph.strip()
    ]

    return paragraphs


def create_embedding(text: str) -> list[float]:
    """Generate an embedding using the local Ollama model."""
    response = ollama.embed(
        model="nomic-embed-text",
        input=text,
    )

    return response["embeddings"][0]


def ingest_documents():
    """Read documents and save their embeddings to ChromaDB."""
    if not DOCUMENTS_DIR.exists():
        print("Error: The documents folder does not exist.")
        return

    files = list(DOCUMENTS_DIR.glob("*.txt"))

    if not files:
        print("No .txt documents found in the documents folder.")
        return

    documents = []
    ids = []

    for file_path in files:
        text = file_path.read_text(encoding="utf-8")
        chunks = split_into_chunks(text)

        for index, chunk in enumerate(chunks):
            documents.append(chunk)
            ids.append(f"{file_path.stem}_{index}")

    if not documents:
        print("No text chunks were found.")
        return

    embeddings = []

    for index, document in enumerate(documents, start=1):
        print(f"Embedding chunk {index}/{len(documents)}...")
        embeddings.append(create_embedding(document))

    # Upsert makes rerunning ingestion safe for existing IDs.
    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
    )

    print("\nIngestion complete!")
    print(f"Documents processed: {len(files)}")
    print(f"Text chunks stored: {len(documents)}")
    print(f"ChromaDB location: {DB_DIR}")


if __name__ == "__main__":
    ingest_documents()