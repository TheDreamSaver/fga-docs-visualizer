const { OpenFgaClient } = require('@openfga/sdk');
const { ChromaClient } = require('chromadb');
const fs = require('fs');
const path = require('path');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
require('dotenv').config();

// Initialize OpenFGA client
const fgaClient = new OpenFgaClient({
  apiUrl: process.env.OPENFGA_API_URL || 'https://play.fga.dev',
  storeId: process.env.OPENFGA_STORE_ID,
  authorizationModelId: process.env.OPENFGA_AUTHORIZATION_MODEL_ID,
  // No credentials needed for playground
});

// Initialize ChromaDB client
const chromaClient = new ChromaClient({
  path: process.env.CHROMA_PERSIST_DIRECTORY || './chroma_db'
});

async function setupOpenFGA() {
  console.log('Setting up OpenFGA model and tuples...');

  try {
    // Simplified OpenFGA model for the demo
    const { authorization_model } = await fgaClient.writeAuthorizationModel({
      schema_version: '1.1',
      type_definitions: [
        {
          type: 'user'
        },
        {
          type: 'team',
          relations: {
            member: {
              union: {
                users: {
                  type: 'user'
                }
              }
            }
          }
        },
        {
          type: 'project',
          relations: {
            admin: {
              union: {
                users: {
                  type: 'user'
                }
              }
            },
            editor: {
              union: {
                users: {
                  type: 'user'
                },
                computed_userset: {
                  relation: 'admin'
                }
              }
            },
            viewer: {
              union: {
                users: {
                  type: 'user'
                },
                computed_userset: {
                  relation: 'editor'
                }
              }
            }
          }
        },
        {
          type: 'document',
          relations: {
            parent_project: {
              union: {
                users: {
                  type: 'project'
                }
              }
            },
            admin: {
              union: {
                users: {
                  type: 'user'
                },
                computed_userset: {
                  relation: 'admin',
                  object: {
                    type: 'project'
                  }
                }
              }
            },
            editor: {
              union: {
                users: {
                  type: 'user'
                },
                computed_userset: {
                  relation: 'editor',
                  object: {
                    type: 'project'
                  }
                },
                computed_userset: {
                  relation: 'admin'
                }
              }
            },
            viewer: {
              union: {
                users: {
                  type: 'user'
                },
                computed_userset: {
                  relation: 'viewer',
                  object: {
                    type: 'project'
                  }
                },
                computed_userset: {
                  relation: 'editor'
                },
                computed_userset: {
                  relation: 'public'
                }
              }
            },
            public: {
              union: {
                users: {
                  type: 'user'
                }
              }
            }
          }
        }
      ]
    });

    console.log('✅ Authorization model created:', authorization_model.id);

    // Create tuples for the demo scenario
    const tuples = [
      // 1. Team Memberships
      { user: 'user:ceo_sandra', relation: 'member', object: 'team:exec' },
      { user: 'user:lead_dev_raj', relation: 'member', object: 'team:engineering' },
      { user: 'user:junior_dev_chloe', relation: 'member', object: 'team:engineering' },
      { user: 'user:sales_bob', relation: 'member', object: 'team:sales' },

      // 2. Project Permissions (only for CEO)
      { user: 'team:exec', relation: 'admin', object: 'project:odyssey' },

      // 3. Document Parent Relationships
      { user: 'project:odyssey', relation: 'parent_project', object: 'document:public_api_docs' },
      { user: 'project:odyssey', relation: 'parent_project', object: 'document:architecture_v3' },
      { user: 'project:odyssey', relation: 'parent_project', object: 'document:internal_sdk' },
      { user: 'project:odyssey', relation: 'parent_project', object: 'document:finance_performance' },
      { user: 'project:odyssey', relation: 'parent_project', object: 'document:design_mockups' },
      { user: 'project:odyssey', relation: 'parent_project', object: 'document:core_engine' },

      // 4. Document Permissions (granular access)
      // Lead Dev gets specific engineering docs
      { user: 'user:lead_dev_raj', relation: 'viewer', object: 'document:internal_sdk' },
      { user: 'user:lead_dev_raj', relation: 'viewer', object: 'document:design_mockups' },
      { user: 'user:lead_dev_raj', relation: 'viewer', object: 'document:core_engine' },
      
      // Junior Dev gets limited access
      { user: 'user:junior_dev_chloe', relation: 'viewer', object: 'document:core_engine' },
      
      // Public document
      { user: 'user:*', relation: 'public', object: 'document:public_api_docs' }
    ];

    // Write tuples in batches
    const batchSize = 10;
    for (let i = 0; i < tuples.length; i += batchSize) {
      const batch = tuples.slice(i, i + batchSize);
      await fgaClient.write({
        writes: {
          tuple_keys: batch.map(tuple => ({
            user: tuple.user,
            relation: tuple.relation,
            object: tuple.object
          }))
        }
      });
    }

    console.log('✅ Tuples created successfully');
    return authorization_model.id;

  } catch (error) {
    console.error('❌ Error setting up OpenFGA:', error);
    throw error;
  }
}

async function setupVectorStore() {
  console.log('Setting up vector store...');

  try {
    // Create or get collection
    const collectionName = 'odyssey_docs';
    let collection;

    try {
      collection = await chromaClient.getCollection({ name: collectionName });
      console.log('✅ Using existing collection:', collectionName);
    } catch (error) {
      collection = await chromaClient.createCollection({ name: collectionName });
      console.log('✅ Created new collection:', collectionName);
    }

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

    for (const file of files) {
      if (file.endsWith('.txt')) {
        const filePath = path.join(documentsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const docName = file.replace('.txt', '');
        
        console.log(`Processing document: ${docName}`);
        
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

        console.log(`✅ Added ${chunks.length} chunks for ${docName}`);
      }
    }

    console.log('✅ Vector store setup complete');

  } catch (error) {
    console.error('❌ Error setting up vector store:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Setting up FGA Docs Visualizer...');
  
  try {
    // Setup OpenFGA
    const modelId = await setupOpenFGA();
    
    // Setup vector store
    await setupVectorStore();
    
    console.log('✅ Setup complete!');
    console.log(`📝 Authorization Model ID: ${modelId}`);
    console.log('🎯 You can now run the server with: npm start');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupOpenFGA, setupVectorStore }; 