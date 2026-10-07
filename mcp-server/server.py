import sys
import json
from pathlib import Path


lectures_path = Path(__file__).parent / "lectures.json"

with open(lectures_path, "r", encoding="utf-8") as file:
    lectures = json.load(file)


tools = [
    {
        "name": "find_lecture",
        "description": "Return the title and topics of one course lecture by its number, 1 to 10. Use it when asked what a lecture covers.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "number": {
                    "type": "integer",
                    "description": "Lecture number, 1 to 10"
                }
            },
            "required": ["number"]
        }
    },
    {
        "name": "list_lectures",
        "description": "List the number and title of every course lecture. Use it when asked what the course covers.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    }
]


for line in sys.stdin:
    line = line.rstrip("\n")

    print("got: " + line, file=sys.stderr)

    msg = json.loads(line)

    if msg["method"] == "initialize":

        response = {
            "jsonrpc": "2.0",
            "id": msg["id"],
            "result": {
                "protocolVersion": msg["params"]["protocolVersion"],
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "lectures",
                    "version": "0.1.0"
                }
            }
        }

        print(json.dumps(response), flush=True)

    elif msg["method"] == "notifications/initialized":

        pass

    elif msg["method"] == "tools/list":

        response = {
            "jsonrpc": "2.0",
            "id": msg["id"],
            "result": {
                "tools": tools
            }
        }

        print(json.dumps(response), flush=True)

    elif msg["method"] == "tools/call":

        name = msg["params"]["name"]
        arguments = msg["params"].get("arguments", {})

        if name == "find_lecture":

            number = arguments["number"]

            lecture = next(
                (
                    lecture
                    for lecture in lectures
                    if lecture["number"] == number
                ),
                None
            )

            if lecture is None:

                response = {
                    "jsonrpc": "2.0",
                    "id": msg["id"],
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": f"There is no lecture {number}. The course has lectures 1 to 10."
                            }
                        ],
                        "isError": True
                    }
                }

            else:

                response = {
                    "jsonrpc": "2.0",
                    "id": msg["id"],
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    f"Lecture {lecture['number']}: "
                                    f"{lecture['title']}. "
                                    f"Topics: {lecture['topics']}"
                                )
                            }
                        ],
                        "isError": False
                    }
                }

            print(json.dumps(response), flush=True)

        elif name == "list_lectures":

            text = "\n".join(
                f"{lecture['number']}. {lecture['title']}"
                for lecture in lectures
            )

            response = {
                "jsonrpc": "2.0",
                "id": msg["id"],
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": text
                        }
                    ],
                    "isError": False
                }
            }

            print(json.dumps(response), flush=True)

        else:

            response = {
                "jsonrpc": "2.0",
                "id": msg["id"],
                "error": {
                    "code": -32602,
                    "message": f"Unknown tool: {name}"
                }
            }

            print(json.dumps(response), flush=True)

    elif "id" in msg:

        response = {
            "jsonrpc": "2.0",
            "id": msg["id"],
            "error": {
                "code": -32601,
                "message": f"Unknown method: {msg['method']}"
            }
        }

        print(json.dumps(response), flush=True)