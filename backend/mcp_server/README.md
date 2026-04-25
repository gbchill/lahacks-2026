# Orision MCP Server

Exposes Orision document understanding tools via the Model Context Protocol.

## Tools

- **explain_government_letter** — Explain a US government letter in plain English + Simplified Chinese
- **search_family_documents** — Semantic search across a user's past government documents

## Connect from Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "orision": {
      "url": "http://localhost:8000/mcp/sse"
    }
  }
}
```

## Running

The MCP server is mounted at `/mcp` inside the FastAPI app. Start the backend:

```bash
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000
```

The SSE endpoint is at `http://localhost:8000/mcp/sse`.
