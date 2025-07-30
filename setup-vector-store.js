const { ChromaClient } = require('chromadb');
const fs = require('fs');
const path = require('path');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const crypto = require('crypto');
require('dotenv').config();

// Simple hash-based embedding function for testing
class SimpleEmbeddingFunction {
  generate(texts) {
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
}

// Initialize ChromaDB client
const chromaClient = new ChromaClient();

async function setupVectorStore() {
  console.log('Setting up vector store...');

  try {
    // Create or get collection with simple embedding function
    const collectionName = 'odyssey_docs';
    let collection;

    try {
      collection = await chromaClient.getCollection({ 
        name: collectionName,
        embeddingFunction: new SimpleEmbeddingFunction()
      });
      console.log('✅ Using existing collection:', collectionName);
    } catch (error) {
      collection = await chromaClient.createCollection({ 
        name: collectionName,
        embeddingFunction: new SimpleEmbeddingFunction()
      });
      console.log('✅ Created new collection:', collectionName);
    }

    // Process documents
    const documentsDir = path.join(__dirname, 'data', 'documents');
    const files = fs.readdirSync(documentsDir);
    
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    for (const file of files) {
      if (file.endsWith('.txt')) {
        const filePath = path.join(documentsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const docName = file.replace('.txt', '');
        
        console.log(`Processing document: ${docName}`);
        
        // Split content into chunks
        const chunks = await textSplitter.splitText(content);
        
        // Add chunks to vector store
        const documents = chunks.map((chunk, index) => ({
          id: `chunk:${docName}_${index}`,
          text: chunk,
          metadata: {
            doc_id: `document:${docName}`,
            source: file,
            chunk_index: index
          }
        }));

        // Add to collection
        await collection.add({
          ids: documents.map(d => d.id),
          documents: documents.map(d => d.text),
          metadatas: documents.map(d => d.metadata)
        });

        console.log(`✅ Added ${chunks.length} chunks for ${docName}`);
      }
    }

    console.log('✅ Vector store setup complete');

  } catch (error) {
    console.error('❌ Error setting up vector store:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Setting up Vector Store for FGA Docs Visualizer...');
  
  try {
    // Setup vector store
    await setupVectorStore();
    
    console.log('✅ Setup complete!');
    console.log('🎯 You can now run the server with: npm start');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupVectorStore }; 