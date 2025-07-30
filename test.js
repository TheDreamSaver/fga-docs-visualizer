const { OpenFgaClient } = require('@openfga/sdk');
const { ChromaClient } = require('chromadb');
require('dotenv').config();

// Initialize clients
const fgaClient = new OpenFgaClient({
  apiUrl: process.env.OPENFGA_API_URL || 'https://play.fga.dev',
  storeId: process.env.OPENFGA_STORE_ID,
  authorizationModelId: process.env.OPENFGA_AUTHORIZATION_MODEL_ID,
  // No credentials needed for playground
});

const chromaClient = new ChromaClient({
  path: process.env.CHROMA_PERSIST_DIRECTORY || './chroma_db'
});

async function testOpenFGA() {
  console.log('🧪 Testing OpenFGA connection...');
  
  try {
    // Test basic connection
    const response = await fgaClient.readAuthorizationModels();
    console.log('✅ OpenFGA connection successful');
    console.log(`📝 Found ${response.authorization_models.length} authorization models`);
    
    // Test a simple check
    const checkResult = await fgaClient.check({
      user: 'user:ceo_sandra',
      relation: 'viewer',
      object: 'document:public_api_docs'
    });
    
    console.log(`🔍 Test check result: ${checkResult.allowed}`);
    
  } catch (error) {
    console.error('❌ OpenFGA test failed:', error.message);
    return false;
  }
  
  return true;
}

async function testChromaDB() {
  console.log('\n🧪 Testing ChromaDB connection...');
  
  try {
    // Test collection access
    const collection = await chromaClient.getCollection({ name: 'odyssey_docs' });
    console.log('✅ ChromaDB connection successful');
    
    // Test query
    const results = await collection.query({
      queryTexts: ['Project Odyssey'],
      nResults: 1
    });
    
    console.log(`📊 Found ${results.documents[0].length} documents in vector store`);
    
  } catch (error) {
    console.error('❌ ChromaDB test failed:', error.message);
    return false;
  }
  
  return true;
}

async function testPermissions() {
  console.log('\n🧪 Testing permission scenarios...');
  
  const testCases = [
    {
      user: 'user:ceo_sandra',
      object: 'document:architecture_v3',
      expected: true,
      description: 'CEO accessing top-secret architecture'
    },
    {
      user: 'user:sales_bob',
      object: 'document:architecture_v3',
      expected: false,
      description: 'Sales accessing top-secret architecture'
    },
    {
      user: 'user:lead_dev_raj',
      object: 'document:internal_sdk',
      expected: true,
      description: 'Lead dev accessing internal SDK'
    },
    {
      user: 'user:junior_dev_chloe',
      object: 'document:finance_performance',
      expected: false,
      description: 'Junior dev accessing financial data'
    }
  ];
  
  let passed = 0;
  
  for (const testCase of testCases) {
    try {
      const result = await fgaClient.check({
        user: testCase.user,
        relation: 'viewer',
        object: testCase.object
      });
      
      const success = result.allowed === testCase.expected;
      console.log(`${success ? '✅' : '❌'} ${testCase.description}: ${result.allowed} (expected: ${testCase.expected})`);
      
      if (success) passed++;
      
    } catch (error) {
      console.log(`❌ ${testCase.description}: Error - ${error.message}`);
    }
  }
  
  console.log(`\n📊 Permission tests: ${passed}/${testCases.length} passed`);
  return passed === testCases.length;
}

async function main() {
  console.log('🚀 Starting FGA Docs Visualizer Tests...\n');
  
  const fgaOk = await testOpenFGA();
  const chromaOk = await testChromaDB();
  const permissionsOk = await testPermissions();
  
  console.log('\n📋 Test Summary:');
  console.log(`OpenFGA: ${fgaOk ? '✅' : '❌'}`);
  console.log(`ChromaDB: ${chromaOk ? '✅' : '❌'}`);
  console.log(`Permissions: ${permissionsOk ? '✅' : '❌'}`);
  
  if (fgaOk && chromaOk && permissionsOk) {
    console.log('\n🎉 All tests passed! The demo is ready to run.');
    console.log('💡 Run "npm start" to start the server.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your configuration.');
    console.log('📖 See README.md for troubleshooting steps.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testOpenFGA, testChromaDB, testPermissions }; 