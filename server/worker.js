import { Worker } from "bullmq"
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { Document } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CharacterTextSplitter } from '@langchain/textsplitters';
import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
dotenv.config()

// Create a BullMQ worker that listens to 'file-upload-queue'
const worker = new Worker('file-upload-queue', async (job) => {
  console.log('job:', job.data)
  const data = JSON.parse(job.data)

  const loader = new PDFLoader(data.path)
  const docs = await loader.load()

  const rawText = docs.map(doc => doc.pageContent).join('\n');

  const textsplitters = new CharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 0,
  });

  const texts = await textsplitters.splitText(rawText);
  // Log each chunk for debugging
  texts.forEach((chunk, index) => {
    console.log(`Chunk ${index + 1}:\n${chunk}\n`);
  });
  // Convert each chunk into a Langchain Document
  const documents = texts.map((text) => new Document({ pageContent: text }));

  // Create Qdrant client
  const client = new QdrantClient({ url: 'http://localhost:6333' });

  // Initialize OpenAI Embeddings
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    apiKey: process.env.OPENAI_API_KEY,
  })

  // Save embedded documents to Qdrant vector DB
  const vectorStore = await QdrantVectorStore.fromDocuments(
    documents,
    embeddings,
    {
      client,
      collectionName: 'pdf-docs',

    }
  );

}, {
  concurrency: 100,
  connection: {
    host: 'localhost',
    port: '6379',
  },
});