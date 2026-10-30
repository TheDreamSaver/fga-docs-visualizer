const assert = require('node:assert/strict');
const { createFgaClient } = require('./lib/config');
async function main() {
  const client = createFgaClient();
  for (const [user, document, allowed] of [
    ['ceo_sandra','architecture_v3',true],['sales_bob','architecture_v3',false],
    ['lead_dev_raj','internal_sdk',true],['junior_dev_chloe','finance_performance',false],
    ['sales_bob','public_api_docs',true],
  ]) assert.equal((await client.check({ user:`user:${user}`, relation:'viewer', object:`document:${document}` })).allowed,allowed,`${user}: ${document}`);
  console.log('Five live OpenFGA permission checks passed.');
}
if(require.main===module) main().catch(error=>{console.error(error.message);process.exitCode=1});
module.exports={main};
