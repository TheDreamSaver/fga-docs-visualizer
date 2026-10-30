class FgaRetriever {
  constructor(vectorStore, fgaClient, userId, fgaEnabled = true) {
    Object.assign(this, { vectorStore, fgaClient, userId, fgaEnabled });
  }
  async getRelevantDocuments(query) {
    if (!this.vectorStore) throw new Error('Vector store is unavailable.');
    const results = await this.vectorStore.similaritySearch(query, 100);
    if (!this.fgaEnabled) return results;
    // Errors propagate: an unavailable authorization service must stop generation.
    const response = await this.fgaClient.listObjects({ user: this.userId, relation: 'viewer', type: 'document' });
    const allowed = new Set(response.objects || []);
    return results.filter(doc => typeof doc.metadata?.doc_id === 'string' && allowed.has(doc.metadata.doc_id));
  }
}
module.exports = FgaRetriever;
