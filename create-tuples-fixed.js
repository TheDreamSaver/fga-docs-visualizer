const { createFgaClient } = require('./lib/config');
const { tuples } = require('./lib/demo-model');
createFgaClient().write({ writes: tuples }).then(() => console.log('Demo tuples created.')).catch(error => { console.error(error.message); process.exitCode = 1; });
