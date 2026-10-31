# FGA Docs Visualizer

A local demonstration of authorization in a retrieval-augmented chatbot. Synthetic “Project Odyssey” documents have different access rules for an executive, lead developer, junior developer and sales persona. OpenFGA filters document excerpts before they reach the model.

The application includes a chat UI, a raw chunk visualizer and a persona comparison page. These are teaching tools for synthetic data. The server requires explicit local-demo mode, binds to loopback and refuses production mode.

## Run locally

Requires Node.js 22+ and Docker (or local OpenFGA and ChromaDB servers).

```sh
npm ci
cp env.example .env
docker compose up -d
npm run setup
```

Copy the printed `OPENFGA_STORE_ID` and `OPENFGA_AUTHORIZATION_MODEL_ID` into `.env`. Set your own server-only `OPENAI_API_KEY` to enable generated answers, then run:

```sh
npm start
```

Open http://127.0.0.1:3002. The chunk visualizer is at `/chunks` and the persona comparison is at `/compare`. Setup writes a model and synthetic relationship tuples to OpenFGA and indexes the sample documents into ChromaDB. For a fresh store, leave the store/model IDs empty before setup. Reusing a store that already has these tuples requires deliberate administrative handling of existing tuples.

`compose.yaml` exposes both backing services on loopback only. If you already run the SmartSpend demo’s OpenFGA instance on port 8081, reuse it rather than starting a second service on that port.

## Authorization behavior

- Each persona maps to a predefined synthetic FGA user ID. Persona selection is not real-user authentication.
- The retriever uses `ListObjects` to filter excerpts before generation. Missing document metadata never grants access.
- Retrieval or authorization failures stop generation. An empty authorized set makes no model call.
- The authorization-off comparison is disabled by default. Set `ALLOW_INSECURE_COMPARISON=true` only to demonstrate the contrast locally with synthetic documents.
- The raw chunk endpoint intentionally shows every synthetic chunk in this loopback-only visualizer. It is not an authorized document API for real users.
- No service credential is embedded in the source. A hosted FGA service can be configured with the server-only client credentials in `env.example`.

## Retrieval and generation

Indexing and querying share a deterministic, normalized bag-of-words hash embedding. This makes lexical overlap visible without another API key. It is a teaching embedding, not a semantic model or a retrieval-quality benchmark. Re-run setup to reindex an older collection created with the previous hash-per-string implementation.

Generated answers use OpenAI through the server. `OPENAI_MODEL` defaults to the existing `gpt-3.5-turbo`; choose a model available to your project. Missing model credentials produce an explicit configuration response. Ollama settings were removed because there was no functioning Ollama implementation.

## Checks

```sh
npm test
npm run test:integration
npm audit
```

`npm test` exercises local API and retriever behavior with injected services; it makes no paid API calls. `test:integration` needs the configured local FGA model and checks the synthetic users’ real permissions. Model setup was also checked against OpenFGA 1.22.1.

See [SECURITY.md](SECURITY.md) for credential handling and the history-cleanup notice.

## License

[MIT](LICENSE). Built by Ashish Jha and contributors. Sample companies, personas and document contents are fictional.
