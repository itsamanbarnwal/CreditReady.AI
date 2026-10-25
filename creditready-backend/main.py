import json
from typing import Any
from pathlib import Path
import chromadb
from huggingface_hub import User
import ollama
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="CreditReady AI Backend")

BASE_DIR = Path(__file__).resolve().parent
DB_DIR = BASE_DIR / "chroma_db"

# Connect to the existing ChromaDB database.
chroma_client = chromadb.PersistentClient(path=str(DB_DIR))

collection = chroma_client.get_or_create_collection(
    name="credit_knowledge"
)

# Allow requests from the local React development server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    applicant_context: str = ""
    system_instruction: str = ""
    transactions: list[dict[str, Any]] = Field(default_factory=list)


@app.get("/")
def home():
    return {"status": "CreditReady AI backend is running"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "knowledge_chunks": collection.count(),
    }


def retrieve_context(question: str) -> str:
    """Find the document chunks most relevant to the question."""

    if collection.count() == 0:
        return ""

    # Embed the user's question using the same model used for documents.
    embedding_response = ollama.embed(
        model="nomic-embed-text",
        input=question,
    )

    question_embedding = embedding_response["embeddings"][0]

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=min(3, collection.count()),
        include=["documents", "distances"],
    )

    documents = results.get("documents") or [[]]
    chunks = documents[0] if documents else []

    return "\n\n".join(chunks)


class ChatResponse(BaseModel):
    reply: str

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    question = request.message.strip()
    transaction_context = ""

    if request.transactions:
        transaction_context = (
            "\n\nTransaction data supplied by the frontend:\n"
            + str(request.transactions)
        )

    if request.applicant_context:
        transaction_context += (
            "\n\nApplicant context:\n"
            + request.applicant_context
        )

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter a message.",
        )

    try:
        context = retrieve_context(question)
        transactions = request.transactions

        # Calculate figures from the supplied records in Python.
        def amount_of(tx):
            value = tx.get("amount", 0)
            if isinstance(value, (int, float)) and not isinstance(value, bool):
                return float(value)
            return 0.0

        credits = [
            tx for tx in transactions
            if tx.get("type") == "Credit"
        ]
        debits = [
            tx for tx in transactions
            if tx.get("type") == "Debit"
        ]

        total_credits = sum(amount_of(tx) for tx in credits)
        total_debits = sum(amount_of(tx) for tx in debits)

        largest_debit = (
            max(debits, key=amount_of)
            if debits else None
        )

        category_totals = {}
        for tx in debits:
            category = str(tx.get("category", "Uncategorized"))
            category_totals[category] = (
                category_totals.get(category, 0) + amount_of(tx)
            )

        transaction_summary = {
            "record_count": len(transactions),
            "total_credits": total_credits,
            "total_debits": total_debits,
            "net_cash_flow": total_credits - total_debits,
            "largest_debit": (
                {
                    "description": largest_debit.get("description"),
                    "category": largest_debit.get("category"),
                    "amount": amount_of(largest_debit),
                    "date": largest_debit.get("date"),
                }
                if largest_debit else None
            ),
            "debit_totals_by_category": category_totals,
        }

        prompt = f"""
User question:
{question}

Applicant context:
{request.applicant_context or "No applicant-specific context provided."}

Transaction records supplied by the frontend:
{json.dumps(transactions, ensure_ascii=False, indent=2)}

Summary calculated from the supplied records by Python:
{json.dumps(transaction_summary, ensure_ascii=False, indent=2)}

Knowledge-base reference material:
{context or "No reference material was retrieved."}

Additional frontend instructions:
{request.system_instruction or "None provided."}

Answering rules:
- Answer general financial education questions using your general knowledge.
- Use the supplied transaction records for transaction-specific questions.
- Use the Python-calculated summary for totals and largest-debit questions.
- State that transaction records are sample data unless verified otherwise.
- Do not invent transactions, applicant details, statistics, or sources.
- If the available information does not establish a requested fact,
  explain that it cannot be verified from the supplied information.
- Do not claim the reference documents contain information they do not contain.
- Explain financial concepts clearly and professionally.
- Do not make official lending decisions.
"""

        response = ollama.chat(
            model="gemma3:1b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are CreditReady AI, a helpful financial "
                        "assistant. Answer general questions when possible. "
                        "For record-specific answers, use only the supplied "
                        "records and calculated summary. Do not fabricate "
                        "facts, financial records, or citations."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )

        return ChatResponse(
    reply=response["message"]["content"]
)

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Chat processing failed: {error}",
        ) from error
