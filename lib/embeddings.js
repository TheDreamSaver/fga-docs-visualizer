const { createHash } = require('node:crypto');
// A deterministic lexical demo embedding, shared by indexing and querying.
// Similarity reflects shared words; this is not a semantic embedding model.
const DemoEmbedding = { generate: async texts => texts.map(text => {
  const vector = new Array(384).fill(0);
  for (const token of text.toLowerCase().match(/[a-z0-9]{2,}/g) || []) {
    const hash = createHash('sha256').update(token).digest();
    vector[hash.readUInt16BE(0) % vector.length] += 1;
  }
  const norm = Math.hypot(...vector) || 1;
  return vector.map(value => value / norm);
}) };
module.exports = { DemoEmbedding };
