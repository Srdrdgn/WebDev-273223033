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

## Full MCP transcript

```text
CLIENT -> SERVER
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"me","version":"1.0.0"}}}

SERVER -> CLIENT
{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-11-25","capabilities":{"tools":{}},"serverInfo":{"name":"lectures","version":"0.1.0"}}}

CLIENT -> SERVER
{"jsonrpc":"2.0","method":"notifications/initialized"}

CLIENT -> SERVER
{"jsonrpc":"2.0","id":2,"method":"tools/list"}

SERVER -> CLIENT
{"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"find_lecture"},{"name":"list_lectures"}]}}

CLIENT -> SERVER
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"find_lecture","arguments":{"number":5}}}

SERVER -> CLIENT
Lecture 5: What the agent built, part 1. Topics: HTTP, REST vs GraphQL, data modeling, ORM, layers

```

## Description experiment

I changed the `find_lecture` tool description to explicitly tell the agent to use the tool for lecture questions. Gemini still discovered the tool through MCP, but a generic lecture question could take a long time while an explicit tool-directed prompt succeeded. This showed that tool descriptions can guide the agent, while model response time can still vary independently of the MCP server.
