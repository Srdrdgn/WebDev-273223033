# Usage

## Start the MCP server

Run:

```bash
python3 mcp-server/server.py
```

The server reads JSON-RPC messages from standard input and writes JSON-RPC responses to standard output.

## Available tools

### find_lecture

Find a lecture by its number.

Example:

```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"find_lecture","arguments":{"number":5}}}
```

### list_lectures

List all course lectures.

Example:

```json
{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"list_lectures","arguments":{}}}
```

## Run the checker

```bash
node mcp-server/check.mjs -- python3 mcp-server/server.py
```

The expected result is: 12/12 checks passed.

## Gemini CLI

The MCP server is configured in:

`.gemini/settings.json`

Gemini can discover the server and its two tools with `/mcp`.
