# PDF Summarizer AI

PDF Summarizer AI is a full-stack AI-powered application that allows users to upload PDF documents and interact with them through intelligent summarization and question answering. It uses vector embeddings, a semantic search engine, and modern AI tooling to deliver accurate, context-aware responses based on document content.

---

## Features

- **Upload any PDF and process its content**
- **Chunk text intelligently using Langchain**
- **Convert chunks to vector embeddings using OpenAI**
- **Store and query semantic vectors with Qdrant**
- **Ask questions and receive answers grounded in document context**
- **Seamless API and frontend integration**
- **Containerized deployment via Docker**

---

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind css + clerk authentication services
- **Backend:** Node.js with Express  
- **AI & Embedding:** OpenAI (`text-embedding-3-small`) , (gpt-3.5-turbo) 
- **Chunking:** Langchain  
- **Vector DB:** Qdrant  
- **Containerization:** Docker & Docker Compose

---

## System Architecture

### 1. Langchain for Intelligent Chunking

PDF content is often long and unstructured. Langchain helps split the text into semantically meaningful chunks while maintaining coherence and overlap for context retention. This ensures high-quality embedding and accurate downstream search.

### 2. OpenAI Embedding Models

Each text chunk is converted to a dense vector using OpenAI's `text-embedding-3-small` model. These vectors capture semantic meaning, enabling similarity search when a user asks a question about the document.

### 3. Qdrant Vector Database

Qdrant stores the vector embeddings along with metadata (e.g., chunk ID, page number). During a query, the system retrieves the most relevant vectors by comparing the query embedding to those stored in the collection.

### 4. Express.js API

The backend is built with Express and handles:  
- PDF upload and parsing (`pdf-parse`)  
- Text chunking with Langchain  
- Embedding and storage in Qdrant  
- Query vector generation and retrieval  
- Sending context to OpenAI’s GPT for answer generation

### 5. Dockerized Deployment

The app is containerized with Docker. Docker Compose runs:  
- Qdrant (as a service)  
- The Node.js backend  

Frontend can be run separately or added to the Docker stack.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pdf-summarizer-ai.git
cd PDFsummarizer
```

---

2. Configure Environment Variables
Create a .env file inside the server folder:

```
OPENAI_API_KEY=your_openai_api_key
QDRANT_URL=http://qdrant:6333
```

---

3. Run the Application
Start backend and Qdrant with Docker:

```
docker-compose up --build
```

Start frontend manually:

```
cd client
npm install
npm run dev
```

---

# Folder Structure

```
.
├── client/              # React frontend
├── server/              # Express backend with Langchain, OpenAI, Qdrant
│   ├── index.js
│   ├── worker.js
│   ├── routes/
│   ├── utils/
│   └── .env
├── docker-compose.yml
└── README.md
```

---

# Demo



The video includes:

PDF upload

Chunking and embedding preview

Real-time Q&A on uploaded content

Backend logs showing vector interactions

---

# Real-World Use Cases 

Students & Researchers: Summarize academic papers and books

Legal Professionals: Analyze contracts and case files

Knowledge Workers: Review whitepapers, reports, and manuals efficiently

---
