# Architecture Note

Trace one request through the layers:
1. HTTP Request hits routes/sessions.js
2. Request passes to services/sessions.js
3. Service calls db.js
4. Response returns to client.
