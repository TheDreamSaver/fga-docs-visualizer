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
    
    // Check if user has access to any relevant documents
    if (relevantDocs.length === 0) {
      const noAccessResponse = `I don't have access to the information you're asking about. Based on your current permissions, this information is not available to you. Please contact your administrator if you believe you should have access to this information.`;
      
      return res.json({
        response: noAccessResponse,
        user: user,
        documentsAccessed: 0,
        accessDenied: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Count unique documents accessed (not chunks)
    const uniqueDocuments = new Set();
    const documentNames = [];
    relevantDocs.forEach(doc => {
      if (doc.metadata && doc.metadata.doc_id) {
        uniqueDocuments.add(doc.metadata.doc_id);
        // Extract document name from doc_id (e.g., "document:core_engine" -> "core_engine")
        const docName = doc.metadata.doc_id.replace('document:', '');
        if (!documentNames.includes(docName)) {
          documentNames.push(docName);
        }
      }
    });
    const documentsAccessed = uniqueDocuments.size;
    
    // Create context from documents
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
    
    // Create improved prompt for role-specific responses
    const userRole = user.name.toLowerCase();
    let roleInstructions = '';
    
    if (userRole.includes('ceo') || userRole.includes('sandra')) {
      roleInstructions = 'Provide a BRIEF executive summary (1-2 sentences) focusing on business impact, key decisions, and strategic implications. Use business terminology.';
    } else if (userRole.includes('developer') || userRole.includes('engineer') || userRole.includes('raj') || userRole.includes('chloe')) {
      roleInstructions = 'Provide TECHNICAL DETAILS and implementation specifics. Include technical architecture, code considerations, and engineering challenges. Be thorough but concise (3-4 sentences).';
    } else if (userRole.includes('sales') || userRole.includes('bob')) {
      roleInstructions = 'EXPLAIN IN SIMPLE TERMS that a non-technical person can understand. Avoid technical jargon. If you must use technical terms, explain them briefly. Focus on benefits and value proposition (2-3 sentences).';
    } else {
      roleInstructions = 'Provide a balanced response that is informative but accessible (2-3 sentences).';
    }
    
    const prompt = `You are an AI assistant for Project Odyssey at Innovate Inc. You have access to the following information based on the user's permissions:

${context}

User Question: ${message}

Instructions:
1. ${roleInstructions}
2. Only use information from the provided context
3. If the context doesn't contain enough information to answer the question, say "I don't have enough information to answer that question completely."
4. Be professional but conversational
5. Don't mention that you're an AI assistant or reference the context directly`;

    // Generate response using OpenAI
    const response = await llm.invoke(prompt);
    
    console.log(`Response generated for ${user.name}`);
    
    res.json({
      response: response.content,
      user: user,
      documentsAccessed: documentsAccessed,
      documentNames: documentNames,
      accessDenied: false,
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