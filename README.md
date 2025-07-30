# FGA Docs Visualizer - Project Odyssey Demo

A demonstration of OpenFGA (Fine-Grained Authorization) securing a RAG (Retrieval-Augmented Generation) pipeline in a realistic enterprise environment. This demo showcases how the same question produces different responses based on user authorization levels.

## 🎯 Demo Overview

**Innovate Inc.** has built a single RAG agent to answer questions for all employees, but the data it draws from has complex, overlapping permissions. This demo shows how OpenFGA enforces access control at the document level, ensuring users only see information they're authorized to access.

### Demo Personas

- **Sandra (CEO)**: Access to everything including top-secret architecture and financial documents
- **Raj (Lead Developer)**: Engineering access to technical documents, but no financial data
- **Chloe (Junior Developer)**: Limited access to basic engineering documents
- **Bob (Sales)**: Public access only to API documentation

### Demo Question

Try asking: *"Give me a full summary of Project Odyssey's status, technology, and performance."*

Each persona will receive a different response based on their access level, demonstrating real-time permission enforcement.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Ollama** with Mistral model installed
3. **OpenFGA Playground** account (free at [play.fga.dev](https://play.fga.dev))

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up OpenFGA:**
   - Go to [play.fga.dev](https://play.fga.dev)
   - Create a new store
   - Note your Store ID, Client ID, and Client Secret

3. **Configure environment:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your OpenFGA credentials:
   ```env
   OPENFGA_API_URL=https://play.fga.dev
   OPENFGA_STORE_ID=your_store_id_here
   OPENFGA_CLIENT_ID=your_client_id_here
   OPENFGA_CLIENT_SECRET=your_client_secret_here
   ```

4. **Start Ollama (if not running):**
   ```bash
   ollama serve
   ```

5. **Run the setup script:**
   ```bash
   npm run setup
   ```

6. **Start the server:**
   ```bash
   npm start
   ```

7. **Open the demo:**
   - Navigate to `http://localhost:3000`
   - Select a user persona
   - Ask questions and see how responses vary by access level

## 🏗️ Architecture

### Components

- **OpenFGA**: Authorization engine enforcing document-level permissions
- **ChromaDB**: Vector store for document similarity search
- **Ollama**: Local LLM for generating responses
- **Express.js**: Web server and API endpoints
- **Custom FGA Retriever**: Integrates authorization with document retrieval

### Data Flow

1. User asks a question
2. System identifies user's authorization level via OpenFGA
3. Vector store finds relevant documents
4. FGA Retriever filters documents based on user permissions
5. LLM generates response using only authorized documents
6. Response reflects user's access level

## 📁 Project Structure

```
fga-docs-visualizer/
├── data/documents/          # Sample documents with different sensitivity levels
├── lib/
│   └── FgaRetriever.js     # Custom retriever integrating FGA with vector search
├── public/
│   └── index.html          # Beautiful web interface
├── fga-model.fga           # OpenFGA authorization model
├── setup.js                # Initialization script
├── server.js               # Express server with chat API
└── package.json            # Dependencies and scripts
```

## 🔐 Authorization Model

The OpenFGA model defines a hierarchical permission structure:

- **Organizations** contain projects
- **Projects** contain components and documents
- **Documents** contain chunks (for vector search)
- **Teams** have different access levels
- **Users** inherit permissions through team membership

### Key Features

- **Hierarchical permissions**: Access flows from parent to child objects
- **Team-based access**: Users inherit permissions through team membership
- **Document-level control**: Each document has its own permission rules
- **Real-time enforcement**: Permissions checked on every request

## 🎨 Demo Features

### Web Interface

- **Modern UI**: Beautiful, responsive design with gradient backgrounds
- **User Selection**: Easy switching between different personas
- **Real-time Chat**: Interactive chat interface with loading states
- **Suggested Questions**: Pre-built questions to test different scenarios
- **Access Indicators**: Shows how many documents each user can access

### Technical Features

- **Vector Similarity Search**: Finds relevant documents using semantic search
- **Permission Filtering**: Only returns documents user can access
- **Context-Aware Responses**: LLM responses based on authorized content only
- **Real-time Authorization**: OpenFGA checks on every request

## 🧪 Testing the Demo

### Expected Behaviors

1. **Sandra (CEO)**:
   - Can access all documents including top-secret architecture and financial data
   - Gets comprehensive responses with full project details

2. **Raj (Lead Developer)**:
   - Can access engineering documents and core engine specs
   - No access to financial or top-secret architecture documents
   - Gets technical responses without sensitive business data

3. **Chloe (Junior Developer)**:
   - Limited access to basic engineering documents
   - No access to internal SDK or advanced technical specs
   - Gets simplified technical responses

4. **Bob (Sales)**:
   - Only access to public API documentation
   - Gets basic project overview without technical details
   - No access to internal or confidential information

### Sample Questions to Try

- "Give me a full summary of Project Odyssey's status, technology, and performance."
- "What are the technical specifications of the core engine?"
- "Tell me about the API documentation."
- "What are the financial projections for the project?"
- "What's the current architecture of the system?"

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENFGA_API_URL` | OpenFGA server URL | `https://play.fga.dev` |
| `OPENFGA_STORE_ID` | Your OpenFGA store ID | Required |
| `OPENFGA_CLIENT_ID` | Your OpenFGA client ID | Required |
| `OPENFGA_CLIENT_SECRET` | Your OpenFGA client secret | Required |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model name | `mistral` |
| `CHROMA_PERSIST_DIRECTORY` | Vector store directory | `./chroma_db` |
| `PORT` | Server port | `3000` |

### Customization

- **Add Documents**: Place new `.txt` files in `data/documents/`
- **Modify Permissions**: Edit tuples in `setup.js`
- **Change Model**: Update `fga-model.fga` for different authorization rules
- **Custom Users**: Add new personas in `server.js`

## 🚨 Troubleshooting

### Common Issues

1. **OpenFGA Connection Error**:
   - Verify your credentials in `.env`
   - Check that your store exists at play.fga.dev

2. **Ollama Not Responding**:
   - Ensure Ollama is running: `ollama serve`
   - Check if Mistral model is installed: `ollama list`

3. **Vector Store Errors**:
   - Run `npm run setup` to initialize the vector store
   - Check that documents exist in `data/documents/`

4. **Permission Denied**:
   - Verify the OpenFGA model was created successfully
   - Check that tuples were written in setup

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=* npm start
```

## 📚 Learning Resources

- [OpenFGA Documentation](https://openfga.dev/)
- [OpenFGA Playground](https://play.fga.dev)
- [LangChain Documentation](https://python.langchain.com/)
- [ChromaDB Documentation](https://docs.trychroma.com/)

## 🤝 Contributing

This demo is designed to showcase OpenFGA's capabilities in a realistic enterprise scenario. Feel free to:

- Add more document types and permission scenarios
- Enhance the UI with additional features
- Extend the authorization model for more complex use cases
- Add more sophisticated RAG features

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ to demonstrate the power of Fine-Grained Authorization in modern AI applications.** 