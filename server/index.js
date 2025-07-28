import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config()

// Initialize OpenAI client using API key from .env
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set up BullMQ job queue for handling uploads
const queue = new Queue('file-upload-queue', {
  connection: {
    host: 'localhost',
    port: '6379',
  },
});

// Configure storage for uploaded files using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Create multer instance with storage config
const upload = multer({ storage: storage });

// Initialize Express app
const app = express();

//Enable cors for all requests 
app.use(cors());

// Health check route
app.get('/', (req, res) => {
  return res.json({ status: 'All Good!' });
});

// Route to handle PDF uploads
app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {

  // Add uploaded file info to the queue
  await queue.add(
    'file-ready',
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  return res.json({ message: 'uploaded' });
});

// Chat route to respond to user queries using context from uploaded PDFs
app.get('/chat', async (req, res) => {
  const userQuery = req.query.message;

  // Initialize OpenAI embeddings
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Connect to existing Qdrant collection of embedded documents
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: 'http://localhost:6333',
      collectionName: 'pdf-docs',
    }
  );

  // Set up retriever to get top 2 relevant documents
  const ret = vectorStore.asRetriever({
    k: 2,
  });
  const result = await ret.invoke(userQuery);

  // Construct system prompt with retrieved context
  const SYSTEM_PROMPT = `
  You are helfull AI Assistant who answeres the user query based on the available context from PDF File.
  Context:
  ${JSON.stringify(result)}
  `;

  // Use OpenAI chat API to generate answer
  const chatResult = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userQuery },
    ],
  });

  // Send the response and supporting documents back to client
  return res.json({
    message: chatResult.choices[0].message.content,
    docs: result,
  });

});

// Start the server on port 8000
app.listen(8000, () => console.log(`Server started on PORT:${8000}`));