const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenFgaClient } = require('@openfga/sdk');
const { ChromaClient } = require('chromadb');
const { ChatOpenAI } = require('@langchain/openai');
const FgaRetriever = require('./lib/FgaRetriever');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize OpenFGA client
const fgaClient = new OpenFgaClient({
  apiUrl: process.env.OPENFGA_API_URL || 'https://play.fga.dev',
  storeId: process.env.OPENFGA_STORE_ID,
  authorizationModelId: process.env.OPENFGA_AUTHORIZATION_MODEL_ID,
  // No credentials needed for playground
});

// Initialize ChromaDB client
const chromaClient = new ChromaClient({
  path: 'http://localhost:8000'
});

// Initialize OpenAI LLM
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY || 'REDACTED_OPENAI_API_KEY',
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7
});

// Simple embedding function (shared between vector store and chunks endpoint)
const SimpleEmbeddingFunction = {
  generate: (texts) => {
    const crypto = require('crypto');
    return texts.map(text => {
      // Create a simple hash-based embedding (not for production use)
      const hash = crypto.createHash('sha256').update(text).digest();
      const embedding = new Array(384).fill(0);
      
      // Use hash bytes to create a simple embedding
      for (let i = 0; i < Math.min(hash.length, embedding.length); i++) {
        embedding[i] = (hash[i] - 128) / 128; // Normalize to [-1, 1]
      }
      
      return embedding;
    });
  }
};

// Available users for the demo
const DEMO_USERS = {
  'ceo_sandra': {
    name: 'Sandra (CEO)',
    description: 'CEO with access to everything',
    userId: 'user:ceo_sandra'
  },
  'lead_dev_raj': {
    name: 'Raj (Lead Developer)',
    description: 'Lead developer with engineering access',
    userId: 'user:lead_dev_raj'
  },
  'junior_dev_chloe': {
    name: 'Chloe (Junior Developer)',
    description: 'Junior developer with limited access',
    userId: 'user:junior_dev_chloe'
  },
  'sales_bob': {
    name: 'Bob (Sales)',
    description: 'Sales team with public access only',
    userId: 'user:sales_bob'
  }
};

// Vector store instance
let vectorStore = null;

// Initialize vector store
async function initializeVectorStore() {
  try {
    const collection = await chromaClient.getCollection({ 
      name: 'odyssey_docs',
      embeddingFunction: SimpleEmbeddingFunction
    });
    
    vectorStore = {
      similaritySearch: async (query, k) => {
        const results = await collection.query({
          queryTexts: [query],
          nResults: k
        });
        
        return results.documents[0].map((doc, index) => ({
          pageContent: doc,
          metadata: results.metadatas[0][index]
        }));
      }
    };
    console.log('✅ Vector store initialized');
  } catch (error) {
    console.error('❌ Error initializing vector store:', error);
  }
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required' });
    }

    const user = DEMO_USERS[userId];
    if (!user) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    console.log(`\n=== Chat Request ===`);
    console.log(`User: ${user.name} (${user.userId})`);
    console.log(`Message: ${message}`);

    // Create FGA retriever for the user
    const retriever = new FgaRetriever(vectorStore, fgaClient, user.userId);
    
    // Get relevant documents
    const relevantDocs = await retriever.getRelevantDocuments(message);
    
    // Create context from documents
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
    
    // Create prompt with context
    const prompt = `You are an AI assistant for Project Odyssey at Innovate Inc. You have access to the following information based on the user's permissions:

${context}

User Question: ${message}

Please provide a comprehensive answer based on the information you have access to. If you don't have access to certain information, simply state that it's not available to you. Be helpful and professional in your response.`;

    // Generate response using OpenAI
    const response = await llm.invoke(prompt);
    
    console.log(`Response generated for ${user.name}`);
    
    res.json({
      response: response.content,
      user: user,
      documentsAccessed: relevantDocs.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available users
app.get('/api/users', (req, res) => {
  res.json(DEMO_USERS);
});

// Get ChromaDB chunks for visualization
app.get('/api/chunks', async (req, res) => {
  try {
    if (!vectorStore) {
      return res.status(500).json({ error: 'Vector store not initialized' });
    }

    const collection = await chromaClient.getCollection({ 
      name: 'odyssey_docs',
      embeddingFunction: SimpleEmbeddingFunction
    });

    // Get all chunks
    const results = await collection.get({
      limit: 100
    });

    // Handle the response structure correctly
    const ids = results.ids || [];
    const documents = results.documents || [];
    const metadatas = results.metadatas || [];
    const embeddings = results.embeddings || [];

    const chunks = ids.map((id, index) => {
      const metadata = metadatas[index] || {};
      
      // Ensure chunk_index is properly extracted
      const chunkIndex = metadata.chunk_index !== undefined ? metadata.chunk_index : 'Unknown';
      
      return {
        id: id,
        content: documents[index] || '',
        metadata: {
          ...metadata,
          chunk_index: chunkIndex
        },
        embedding: embeddings[index] ? embeddings[index].slice(0, 10) : null // Show first 10 dimensions
      };
    });

    res.json({
      totalChunks: chunks.length,
      chunks: chunks
    });

  } catch (error) {
    console.error('Error fetching chunks:', error);
    res.status(500).json({ error: 'Failed to fetch chunks' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    vectorStore: vectorStore ? 'initialized' : 'not initialized'
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the chunks visualization page
app.get('/chunks', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chunks.html'));
});

// Initialize and start server
async function startServer() {
  try {
    await initializeVectorStore();
    
    app.listen(PORT, () => {
      console.log(`🚀 FGA Docs Visualizer server running on port ${PORT}`);
      console.log(`📱 Open http://localhost:${PORT} to access the demo`);
      console.log(`🔐 Using OpenFGA for authorization`);
      console.log(`🤖 Using Ollama for LLM responses`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 