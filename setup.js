const fs = require('node:fs');
const path = require('node:path');
const { ChromaClient } = require('chromadb');
const { createFgaClient } = require('./lib/config');
const { model, tuples } = require('./lib/demo-model');
const { DemoEmbedding } = require('./lib/embeddings');

async function setupOpenFGA(env = process.env) {
  const client = createFgaClient(env);
  const storeId = env.OPENFGA_STORE_ID || (await client.createStore({ name: 'Odyssey local demo' })).id;
  const { authorization_model_id: modelId } = await client.writeAuthorizationModel(model, { storeId });
  await client.write({ writes: tuples }, { storeId, authorizationModelId: modelId });
  console.log(`OPENFGA_STORE_ID=${storeId}\nOPENFGA_AUTHORIZATION_MODEL_ID=${modelId}`);
  return { storeId, modelId };
}
function splitText(text) {
  const chunks = [];
  for (let start = 0; start < text.length; start += 680) chunks.push(text.slice(start, start + 800));
  return chunks;
}
async function setupVectorStore(env = process.env) {
  const client = new ChromaClient({ path: env.CHROMA_URL || 'http://127.0.0.1:8000' });
  const collection = await client.getOrCreateCollection({ name: 'odyssey_docs', embeddingFunction: DemoEmbedding });
  for (const file of fs.readdirSync(path.join(__dirname, 'data/documents')).filter(file => file.endsWith('.txt'))) {
    const name = file.slice(0, -4);
    const chunks = splitText(fs.readFileSync(path.join(__dirname, 'data/documents', file), 'utf8'));
    await collection.upsert({ ids: chunks.map((_, index) => `chunk:${name}_${index}`), documents: chunks, metadatas: chunks.map((_, chunk_index) => ({ doc_id: `document:${name}`, source: file, chunk_index })) });
  }
  console.log('Synthetic document chunks indexed.');
}
if (require.main === module) (async () => { await setupOpenFGA(); await setupVectorStore(); })().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { setupOpenFGA, setupVectorStore, splitText };
