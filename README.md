# CreditReady.AI 💳

### AI-Powered Financial Readiness Assistant

CreditReady.AI is an AI-powered financial education project designed to help users understand their financial activity, explore financial concepts, and gain insights into their income, expenses, and cash flow.

The project combines a React-based frontend with a Python backend, a local language model, and a vector database to support conversational financial assistance grounded in supplied transaction data and reference documents.

> **Project status:** Prototype / In Development

## ✨ Features

- **AI Financial Assistant** — Ask questions about financial concepts and receive conversational explanations.
- **Transaction Insights** — Analyze supplied transaction records, including income, expenses, net cash flow, and spending categories.
- **Financial Readiness Support** — Explore financial information and applicant context to better understand financial readiness.
- **Knowledge-Based Responses** — Retrieve relevant reference material from a local ChromaDB knowledge base.
- **Local AI Inference** — Use Ollama to run language and embedding models locally.
- **Interactive Dashboard** — View transaction information and financial visualizations through a React frontend.
- **FastAPI Backend** — Process chat requests and return structured responses to the frontend.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Frontend development |
| Vite | Frontend development server and build tool |
| Tailwind CSS | Frontend styling |
| Recharts | Data visualization |
| Lucide React | Icons |
| Python | Backend development |
| FastAPI | REST API |
| Pydantic | Request and response validation |
| Ollama | Local language model inference |
| Gemma 3 (`gemma3:1b`) | Chat response generation |
| `nomic-embed-text` | Text embeddings |
| ChromaDB | Vector storage and knowledge retrieval |

## 📁 Project Structure

```text
CreditReady-Frontend/
│
├── creditready-backend/
│   ├── documents/
│   │   └── credit_basics.txt
│   ├── chroma_db/           # Generated locally
│   ├── ingest.py            # Knowledge ingestion script
│   └── main.py              # FastAPI application
│
├── creditready-frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── TransactionInsights.tsx
│   │   ├── data/
│   │   │   └── transactions.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- [Git](https://git-scm.com/)
- [Python](https://www.python.org/)
- [Node.js and npm](https://nodejs.org/)
- [Ollama](https://ollama.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/itsamanbarnwal/CreditReady.AI.git
cd CreditReady.AI
```

### 2. Set Up Ollama

Start Ollama and download the models used by the backend:

```bash
ollama pull gemma3:1b
ollama pull nomic-embed-text
```

Make sure Ollama is running before testing AI chat functionality.

### 3. Set Up the Backend

Open a terminal in the project directory:

```bash
cd creditready-backend
python3 -m venv .venv
source .venv/bin/activate
```

On Windows, activate the environment using:

```powershell
.venv\Scripts\activate
```

Install the backend dependencies:

```bash
python -m pip install fastapi "uvicorn[standard]" chromadb ollama pydantic huggingface_hub
```

Start the backend:

```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend API will be available at:

- **API:** http://127.0.0.1:8000
- **Health check:** http://127.0.0.1:8000/health
- **Interactive API documentation:** http://127.0.0.1:8000/docs

If you need to populate the local knowledge database, run the project's ingestion script from the backend directory:

```bash
python ingest.py
```

### 4. Set Up the Frontend

Open a separate terminal:

```bash
cd creditready-frontend
npm install
npm run dev
```

Open the local URL printed by Vite, typically:

http://localhost:5173

Keep both the frontend development server and the backend server running while using the application.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Check backend status |
| `GET` | `/health` | Check API health and knowledge-base chunk count |
| `POST` | `/chat` | Submit a chat request and receive an AI-generated reply |

### Example Chat Request

```json
{
  "message": "Explain my income and expenses.",
  "applicant_context": "",
  "system_instruction": "",
  "transactions": []
}
```

### Example Response

```json
{
  "reply": "Income represents money received, while expenses represent money spent..."
}
```

The response text depends on the request, supplied records, retrieved reference material, and AI model output.

## 🧠 How It Works

1. The user submits a question through the React frontend.
2. The frontend sends the message and relevant applicant or transaction information to the FastAPI backend.
3. The backend retrieves relevant reference material from ChromaDB when available.
4. Python calculates transaction summaries, including total credits, total debits, net cash flow, and debit spending by category.
5. Ollama generates a response using the available context and instructions.
6. The backend returns the reply to the frontend.

## 🔒 Privacy and Financial Disclaimer

- This project is intended for financial education and experimentation.
- The included transaction records are sample data and should not be treated as verified real-world financial records.
- Avoid committing passwords, API keys, personal financial records, or other sensitive information to GitHub.
- Local AI inference does not by itself guarantee that all application data stays local; review any external services or integrations used by the application.
- AI-generated responses may be inaccurate and should be independently checked.
- CreditReady.AI is not a bank, lender, or credit bureau and does not make official lending decisions.

## 🛣️ Future Improvements

Potential areas for further development include:

- Secure user authentication and profile management.
- Transaction import and validation.
- More detailed income and expense analytics.
- Improved financial readiness indicators.
- Better retrieval quality and source references.
- Automated testing and deployment.
- Secure database integration and production configuration.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Commit your changes with a descriptive message.
5. Open a pull request.

## 📄 License

No license has been specified yet. Add a `LICENSE` file before granting others explicit permission to reuse, modify, or distribute this project's code.

---

**Built as an AI-powered financial education project.**

[GitHub Repository](https://github.com/itsamanbarnwal/CreditReady.AI)
