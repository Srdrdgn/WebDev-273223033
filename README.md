# WebDev MCP Server

A minimal MCP server for the WebDev course lectures.

## Run

```bash
python3 mcp-server/server.py
```

## Supported tools

- `find_lecture` — returns the title and topics of a lecture by number.
- `list_lectures` — lists all lectures.

## MCP transcript

The server accepts JSON-RPC messages through stdin and writes JSON-RPC responses to stdout.

Example:

CLIENT -> SERVER

```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"find_lecture","arguments":{"number":5}}}
```

SERVER -> CLIENT

```text
Lecture 5: What the agent built, part 1. Topics: HTTP, REST vs GraphQL, data modeling, ORM, layers
```

The complete transcript is stored in `transcript.txt`.

## Testing

Run the course checker with:

```bash
node mcp-server/check.mjs -- python3 mcp-server/server.py
```
