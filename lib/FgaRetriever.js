const { BaseRetriever } = require('langchain/schema/retriever');
const { ChromaClient } = require('chromadb');

class FgaRetriever extends BaseRetriever {
  constructor(vectorStore, fgaClient, userId) {
    super();
    this.vectorStore = vectorStore;
    this.fgaClient = fgaClient;
    this.userId = userId;
  }

  async _getRelevantDocuments(query, runManager) {
    console.log(`\n--> FGA Check for: ${this.userId}`);
    
    try {
      // 1. Get all authorized document IDs from FGA
      const response = await this.fgaClient.listObjects({
        user: this.userId,
        relation: 'viewer',
        type: 'document'
      });
      
      const authorizedDocumentIds = response.objects.map(obj => {
        // Extract document name from the object ID (e.g., "document:core_engine" -> "core_engine")
        const parts = obj.split(':');
        return parts.length > 1 ? parts[1] : obj;
      }).filter(id => id && id !== 'undefined');
      
      console.log(`--> Authorized for ${authorizedDocumentIds.length} documents:`, authorizedDocumentIds);

      if (authorizedDocumentIds.length === 0) {
        console.log('--> No authorized documents found.');
        return [];
      }

      // 2. Query vector store and filter by authorized documents
      console.log('--> Querying vector store with document filter...');
      
      // Check if vectorStore is available
      if (!this.vectorStore) {
        console.error('--> Vector store is not available');
        return [];
      }
      
      // Get all results from vector store
      const results = await this.vectorStore.similaritySearch(query, 20);
      
      // Filter results based on authorized documents
      const authorizedDocs = results.filter(doc => {
        const docId = doc.metadata?.doc_id;
        if (!docId) return false;
        
        // Extract document name from doc_id (e.g., "document:core_engine" -> "core_engine")
        const documentName = docId.replace('document:', '');
        
        // Check if this document is in the authorized list
        return authorizedDocumentIds.includes(documentName);
      });

      console.log(`--> Retrieved ${authorizedDocs.length} relevant and authorized documents.`);
      return authorizedDocs;

    } catch (error) {
      console.error('--> Error in FGA retrieval:', error);
      return [];
    }
  }
}

module.exports = FgaRetriever; 