const { ChromaClient } = require('chromadb');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const fs = require('fs');
const path = require('path');

// Initialize ChromaDB client
const chromaClient = new ChromaClient({
  path: 'http://localhost:8000'
});

// Simple embedding function (same as in server.js)
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

async function updateVectorStore() {
  console.log('🔄 Updating vector store with 800 character chunks...');

  try {
    // Get or create collection
    const collectionName = 'odyssey_docs';
    let collection;

    try {
      collection = await chromaClient.getCollection({ 
        name: collectionName,
        embeddingFunction: SimpleEmbeddingFunction
      });
      console.log('✅ Using existing collection:', collectionName);
      
      // Delete existing collection to recreate with new chunk size
      await chromaClient.deleteCollection({ name: collectionName });
      console.log('🗑️ Deleted existing collection');
    } catch (error) {
      console.log('📝 No existing collection found');
    }

    // Create new collection
    collection = await chromaClient.createCollection({ 
      name: collectionName,
      embeddingFunction: SimpleEmbeddingFunction
    });
    console.log('✅ Created new collection:', collectionName);

    // Process documents
    const documentsDir = path.join(__dirname, 'data', 'documents');
    const files = fs.readdirSync(documentsDir);
    
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
      separators: [
        '\n\n',           // Double newlines (paragraphs)
        '\n',             // Single newlines
        '. ',             // Sentences
        '? ',             // Questions
        '! ',             // Exclamations
        ', ',             // Lists
        ' - ',            // Bullet points
        ': ',             // Key-value pairs
        '; ',             // Semicolons
        ' ',              // Words
        ''                // Characters (fallback)
      ],
      keepSeparator: true
    });

    let totalChunks = 0;

    for (const file of files) {
      if (file.endsWith('.txt')) {
        const filePath = path.join(documentsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const docName = file.replace('.txt', '');
        
        console.log(`📄 Processing document: ${docName}`);
        
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

        console.log(`✅ Added ${chunks.length} chunks for ${docName} (avg ${Math.round(chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length)} chars each)`);
        totalChunks += chunks.length;
      }
    }

    console.log(`\n🎉 Vector store update complete!`);
    console.log(`📊 Total chunks created: ${totalChunks}`);
    console.log(`📏 Target chunk size: 800 characters`);
    console.log(`🔄 Chunk overlap: 100 characters`);

  } catch (error) {
    console.error('❌ Error updating vector store:', error);
    throw error;
  }
}

if (require.main === module) {
  updateVectorStore().catch(console.error);
}

module.exports = { updateVectorStore }; 