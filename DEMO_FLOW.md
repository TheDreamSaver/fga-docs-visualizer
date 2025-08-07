# 🎯 FGA Document Visualizer - Demo Flow (5-7 minutes)

## 📋 **Demo Overview**
Showcase how Fine-Grained Authorization (FGA) controls document access in a real-world RAG system, demonstrating different user personas and their access levels.

---

## 🚀 **Demo Flow**

### **1. Introduction (30 seconds)**
- **"Welcome to our FGA-powered Document Visualizer"**
- **Problem**: Organizations have sensitive documents that need role-based access
- **Solution**: OpenFGA + RAG system that enforces document-level permissions
- **Demo Goal**: Show how 4 different employees see different information for the same questions

### **2. System Architecture Overview (45 seconds)**
- **Navigate to `/chunks` page**
- **Explain the components**:
  - **Couchbase Capella**: Vector database storing document chunks
  - **OpenFGA**: Authorization system controlling access
  - **LangChain**: RAG framework for retrieval and generation
  - **6 Documents**: Architecture, Core Engine, Design, Finance, Internal SDK, Public API

### **3. User Personas Setup (30 seconds)**
- **Navigate to main demo page (`/`)**
- **Introduce the 4 employees**:
  - **Sandra (CEO)**: Full access to all documents
  - **Raj (Lead Developer)**: Access to technical docs + internal SDK
  - **Chloe (Junior Developer)**: Access to public API docs only + Core Engine
  - **Bob (Sales)**: Access to public API docs only

### **4. Core Demo - Same Question, Different Answers (3 minutes)**

#### **Question 1: "What are the API endpoints?" (90 seconds)**
- **Ask as Bob (Sales)** → Shows only public API endpoints
- **Ask as Raj (Lead Dev)** → Shows public + internal API endpoints
- **Ask as Sandra (CEO)** → Shows all endpoints
- **Key Point**: Same question, different access levels = different answers

#### **Question 2: "Give me a full summary of Project Odyssey" (90 seconds)**
- **Ask as Chloe (Junior Dev)** → Limited to public information
- **Ask as Raj (Lead Dev)** → Technical details + internal architecture
- **Ask as Sandra (CEO)** → Complete picture including financial performance
- **Key Point**: Role-based information filtering in action

### **5. Compare Page Demo (1 minute)**
- **Navigate to `/compare` page**
- **Show side-by-side comparison**:
  - Ask: "What are the API endpoints?"
  - See all 4 responses simultaneously
  - **Highlight**: Bob and Chloe see only public endpoints
  - **Highlight**: Raj and Sandra see internal endpoints too
- **Toggle FGA on/off** to show the difference

### **6. Technical Deep Dive (1 minute)**
- **Navigate back to `/chunks`**
- **Show document filtering**:
  - Demonstrate the 6 unique documents with chunk counts
  - Use "Clear All" then select specific documents (e.g., only internal_sdk and public_api_docs)
  - Show how statistics update dynamically
- **Explain the architecture**:
  - How documents are split into searchable chunks
  - How FGA filters chunks based on user permissions
  - How vector similarity + authorization work together

### **7. Real-World Impact (30 seconds)**
- **Business Value**:
  - **Security**: Sensitive data stays protected
  - **Compliance**: Role-based access control
  - **User Experience**: Seamless, contextual responses
  - **Scalability**: Works with any document set

---

## 🎭 **Demo Script**

### **Opening (30s)**
> "Today I'm going to show you how we've built a document Q&A system that respects fine-grained authorization. Imagine you're a company with sensitive documents - architecture plans, internal APIs, financial data. You want employees to ask questions and get answers, but only see what they're authorized to see."

### **Architecture (45s)**
> "Our system uses Couchbase Capella for vector storage, OpenFGA for authorization, and LangChain for the RAG pipeline. We have 6 documents covering everything from public APIs to internal architecture. Let me show you how the chunks are stored..."

### **User Demo (3m)**
> "We have 4 employees with different access levels. Let's see what happens when they all ask the same question: 'What are the API endpoints?'"

> "Bob from Sales gets only public endpoints - perfect for customer-facing information. Raj, our lead developer, sees both public and internal endpoints - he needs access to our internal APIs. Sandra, as CEO, sees everything."

> "Now let's ask about Project Odyssey's status. Chloe, our junior developer, gets a technical overview. Raj gets deeper technical details plus internal architecture. Sandra gets the complete picture including financial performance."

### **Compare Demo (1m)**
> "Our compare page shows all responses side-by-side. Notice how the same question produces different answers based on authorization. And here's the FGA toggle - when disabled, everyone sees everything. When enabled, authorization kicks in."

### **Technical Deep Dive (1m)**
> "Let me show you how the system works under the hood. Here we can see all 6 documents with their chunk counts. Watch what happens when I filter to show only internal SDK and public API documents - the statistics update in real-time."

> "Behind the scenes, documents are chunked and stored in ChromaDB. When a question is asked, we find relevant chunks, then filter them through OpenFGA based on user permissions. This filtering happens at the chunk level, ensuring users only see what they're authorized to see."

### **Closing (30s)**
> "This system provides secure, compliant document access. Employees get contextual answers while sensitive data stays protected. It's RAG with enterprise-grade security."

---

## 🎯 **Key Demo Points**

### **Technical Highlights**
- ✅ **Vector Search**: Semantic document retrieval
- ✅ **FGA Integration**: Real-time authorization filtering
- ✅ **Role-Based Access**: Different views per user persona
- ✅ **RAG Pipeline**: Retrieval + Generation with security
- ✅ **Document Filtering**: Interactive chunk exploration by document type

### **Business Value**
- ✅ **Security**: Sensitive data protection
- ✅ **Compliance**: Audit trail and access control
- ✅ **User Experience**: Seamless, contextual responses
- ✅ **Scalability**: Works with any document set

### **Demo Tips**
- 🎯 **Keep it conversational** - explain as you go
- 🎯 **Show the contrast** - emphasize different responses
- 🎯 **Use the FGA toggle** - demonstrate the difference
- 🎯 **Show document filtering** - interactive chunk exploration
- 🎯 **Highlight real-world value** - security + usability

---

## 📱 **Demo Navigation Path**
1. **Start**: `/chunks` (show architecture)
2. **Main Demo**: `/` (user personas)
3. **Compare**: `/compare` (side-by-side)
4. **Back to Chunks**: `/chunks` (technical deep dive)
5. **End**: Main demo (real-world impact)

---

## 🎪 **Demo Variations**

### **Quick Demo (3 minutes)**
- Skip architecture overview
- Focus on 2-3 key questions
- Emphasize business value

### **Technical Demo (7 minutes)**
- Add FGA model explanation
- Deep dive into document chunking process with filtering
- Demonstrate vector search mechanics
- Show chunk-level authorization in detail

### **Executive Demo (5 minutes)**
- Focus on business outcomes
- Emphasize security and compliance
- Show ROI and scalability

---

*This demo flow showcases the power of combining RAG with fine-grained authorization, demonstrating both technical sophistication and practical business value.* 