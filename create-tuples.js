const { OpenFgaClient } = require('@openfga/sdk');
require('dotenv').config();

// Initialize OpenFGA client
const fgaClient = new OpenFgaClient({
  apiUrl: process.env.OPENFGA_API_URL || 'https://play.fga.dev',
  storeId: process.env.OPENFGA_STORE_ID,
  authorizationModelId: process.env.OPENFGA_AUTHORIZATION_MODEL_ID,
  // No credentials needed for playground
});

const tuples = [
  // 1. Team Memberships
  { user: 'user:ceo_sandra', relation: 'member', object: 'team:exec' },
  { user: 'user:lead_dev_raj', relation: 'member', object: 'team:engineering' },
  { user: 'user:junior_dev_chloe', relation: 'member', object: 'team:engineering' },
  { user: 'user:sales_bob', relation: 'member', object: 'team:sales' },

  // 2. Project Permissions
  { user: 'user:ceo_sandra', relation: 'admin', object: 'project:odyssey' },
  { user: 'user:lead_dev_raj', relation: 'editor', object: 'project:odyssey' },
  { user: 'user:junior_dev_chloe', relation: 'viewer', object: 'project:odyssey' },
  { user: 'user:sales_bob', relation: 'viewer', object: 'project:odyssey' },

  // 3. Document Permissions
  // Public API docs are public
  { user: 'user:*', relation: 'public', object: 'document:public_api_docs' },
  
  // Engineering team members get access to technical docs
  { user: 'user:lead_dev_raj', relation: 'viewer', object: 'document:internal_sdk' },
  { user: 'user:lead_dev_raj', relation: 'viewer', object: 'document:design_mockups' },
  { user: 'user:lead_dev_raj', relation: 'viewer', object: 'document:core_engine' },
  { user: 'user:lead_dev_raj', relation: 'viewer', object: 'document:architecture_v3' },
  
  { user: 'user:junior_dev_chloe', relation: 'viewer', object: 'document:core_engine' },
  { user: 'user:junior_dev_chloe', relation: 'viewer', object: 'document:architecture_v3' },
  
  // Sales team member gets limited access
  { user: 'user:sales_bob', relation: 'viewer', object: 'document:finance_performance' }
];

async function createTuplesOneByOne() {
  console.log('🚀 Creating tuples one by one...\n');
  console.log('🔧 Configuration:');
  console.log(`   API URL: ${process.env.OPENFGA_API_URL || 'https://play.fga.dev'}`);
  console.log(`   Store ID: ${process.env.OPENFGA_STORE_ID}`);
  console.log(`   Model ID: ${process.env.OPENFGA_AUTHORIZATION_MODEL_ID}`);
  console.log('');
  
  for (let i = 0; i < tuples.length; i++) {
    const tuple = tuples[i];
    console.log(`📝 Creating tuple ${i + 1}/${tuples.length}:`);
    console.log(`   User: ${tuple.user}`);
    console.log(`   Relation: ${tuple.relation}`);
    console.log(`   Object: ${tuple.object}`);
    
    try {
      await fgaClient.write({
        writes: [
          {
            "_description": `Creating tuple: ${tuple.user} ${tuple.relation} ${tuple.object}`,
            "user": tuple.user,
            "relation": tuple.relation,
            "object": tuple.object
          }
        ]
      }, {
        authorization_model_id: process.env.OPENFGA_AUTHORIZATION_MODEL_ID
      });
      console.log('   ✅ Success!\n');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('🎉 Tuple creation complete!');
}

createTuplesOneByOne().catch(console.error); 