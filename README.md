# FGA Docs Visualizer

A demonstration of OpenFGA-secured RAG (Retrieval-Augmented Generation) chatbot that shows how to implement document-level authorization with vector search.

## 🎯 Overview

This project demonstrates how to build a secure RAG chatbot that respects document-level permissions using OpenFGA (Open Fine-Grained Authorization). Users get different responses based on their authorization level, ensuring sensitive information is properly protected.

## 🚀 Quick Start

For detailed setup instructions, see **[SETUP.md](./SETUP.md)**.

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/TheDreamSaver/fga-docs-visualizer.git
cd fga-docs-visualizer

# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your configuration

# Initialize the project
npm run setup

# Start the application
npm start
```

Visit http://localhost:3000 to access the demo.

## 🏗️ Architecture

### Components

- **OpenFGA**: Authorization engine enforcing document-level permissions
- **ChromaDB**: Vector store for document similarity search
- **Express.js**: Web server and API endpoints
- **Custom FGA Retriever**: Integrates authorization with document retrieval

### Data Flow

1. User asks a question
2. System identifies user's authorization level via OpenFGA
3. Vector store finds relevant documents
4. FGA Retriever filters documents based on user permissions
5. LLM generates response using only authorized documents
6. Response reflects user's access level

## 🔐 Authorization Model

The OpenFGA model defines a hierarchical permission structure:

- **Organizations** contain projects
- **Projects** contain components and documents
- **Documents** contain chunks (for vector search)
- **Teams** have different access levels
- **Users** inherit permissions through team membership

### User Roles

1. **Sandra (CEO)** - Full access to all documents
2. **Raj (Lead Developer)** - Access to engineering documents
3. **Chloe (Junior Developer)** - Limited access to core engine only
4. **Bob (Sales)** - Public documents only

## 📚 Available Documents

- `architecture_v3.txt` - TOP SECRET (Executive access only)
- `finance_performance.txt` - CONFIDENTIAL (Executive access only)
- `internal_sdk.txt` - Internal (Engineering team access)
- `design_mockups.txt` - Internal (Engineering team access)
- `core_engine.txt` - Internal (All engineering access)
- `public_api_docs.txt` - Public (Everyone can access)

## 🧪 Testing

1. Start the server: `npm start`
2. Open http://localhost:3000
3. Select a user persona from the sidebar
4. Ask questions about Project Odyssey
5. Observe different responses based on user permissions

### Example Questions

- "What is Project Odyssey?"
- "Tell me about the architecture"
- "What are the financial projections?"
- "How does the core engine work?"

## 📁 Project Structure

```
fga-docs-visualizer/
├── data/documents/          # Sample documents with different sensitivity levels
├── lib/
│   └── FgaRetriever.js     # Custom retriever integrating FGA with vector search
├── public/
│   ├── index.html          # Main demo interface
│   └── chunks.html         # Chunks visualizer
├── fga-model.fga           # OpenFGA authorization model
├── create-tuples-fixed.js  # Script to create authorization tuples
├── setup.js                # Main initialization script
├── test.js                 # Testing utilities
├── server.js               # Express server with chat API
├── SETUP.md                # Comprehensive setup guide
└── package.json            # Dependencies and scripts
```

## 🔧 Scripts

- `npm start` - Start the application
- `npm run setup` - Initialize OpenFGA and vector store
- `npm test` - Run tests
- `npm run dev` - Start in development mode

## 📖 API Endpoints

- `GET /` - Main demo interface
- `GET /chunks` - Chunks visualizer
- `POST /api/chat` - Chat endpoint
- `GET /api/users` - Available users
- `GET /api/chunks` - Vector store chunks
- `GET /api/health` - Health check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For detailed setup instructions and troubleshooting, see **[SETUP.md](./SETUP.md)**.

If you encounter issues:
1. Check the troubleshooting section in SETUP.md
2. Review console logs for error messages
3. Ensure all prerequisites are installed
4. Open an issue on GitHub 