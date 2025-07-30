# FGA Docs Visualizer - Project Setup Guide

## 🚀 Quick Start

This guide will help you set up and run the FGA Docs Visualizer project, which demonstrates OpenFGA authorization with a RAG chatbot using ChromaDB vector store.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher) - for ChromaDB
- **Git** - for cloning the repository

## 🛠️ Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/TheDreamSaver/fga-docs-visualizer.git
cd fga-docs-visualizer
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install chromadb
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

**Required Environment Variables:**

```env
# OpenFGA Configuration
OPENFGA_API_URL=https://play.fga.dev
OPENFGA_STORE_ID=your_store_id_here
OPENFGA_AUTHORIZATION_MODEL_ID=your_model_id_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Ollama Configuration (for local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Vector Store Configuration
CHROMA_PERSIST_DIRECTORY=./chroma_db

# Server Configuration
PORT=3000
```

### 4. Set Up OpenFGA

#### Option A: Using playground.fga.dev (Recommended)

1. Go to [playground.fga.dev](https://playground.fga.dev)
2. Create a new store
3. Copy the store ID, authorization model ID, client ID, and client secret
4. Update your `.env` file with these values

#### Option B: Using Docker

```bash
docker run -p 8080:8080 openfga/openfga run
```

### 5. Initialize the Project

```bash
# Run the setup script to initialize everything
npm run setup
```

This script will:
- Set up OpenFGA authorization model
- Create authorization tuples
- Initialize ChromaDB vector store
- Process and index documents

### 6. Start Ollama (Optional)

If you want to use local LLM instead of OpenAI:

```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull the model
ollama pull mistral
```

### 7. Start the Application

```bash
npm start
```

The application will be available at:
- **Main Demo**: http://localhost:3000
- **Chunks Visualizer**: http://localhost:3000/chunks

## 🏗️ Project Structure

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
├── setup-vector-store.js   # Vector store setup script
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

### User Roles

1. **Sandra (CEO)** - Full access to all documents
2. **Raj (Lead Developer)** - Access to engineering documents
3. **Chloe (Junior Developer)** - Limited access to core engine only
4. **Bob (Sales)** - Public documents only

## 📚 Available Documents

The demo includes sample documents with different sensitivity levels:

- `architecture_v3.txt` - TOP SECRET (Executive access only)
- `finance_performance.txt` - CONFIDENTIAL (Executive access only)
- `internal_sdk.txt` - Internal (Engineering team access)
- `design_mockups.txt` - Internal (Engineering team access)
- `core_engine.txt` - Internal (All engineering access)
- `public_api_docs.txt` - Public (Everyone can access)

## 🧪 Testing the Application

1. **Start the server**: `npm start`
2. **Open the demo**: http://localhost:3000
3. **Select a user persona** from the sidebar
4. **Ask questions** about Project Odyssey
5. **Observe different responses** based on user permissions

### Example Questions to Test:

- "What is Project Odyssey?"
- "Tell me about the architecture"
- "What are the financial projections?"
- "How does the core engine work?"
- "What are the API endpoints?"

## 🔧 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **OpenFGA connection errors**
   - Verify your OpenFGA credentials in `.env`
   - Check if playground.fga.dev is accessible

3. **ChromaDB initialization errors**
   ```bash
   rm -rf chroma_db/
   npm run setup
   ```

4. **Missing dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

### Debug Mode

Enable debug logging by setting:
```bash
export DEBUG=*
npm start
```

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

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are installed
4. Verify your environment configuration

For additional help, please open an issue on GitHub. 