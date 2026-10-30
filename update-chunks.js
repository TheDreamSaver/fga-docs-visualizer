const { setupVectorStore } = require('./setup');
setupVectorStore().catch(error => { console.error(error.message); process.exitCode = 1; });
