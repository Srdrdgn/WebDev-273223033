# Readiness

## Live Deployment
- **Live URL:** https://webdev-273223033.onrender.com
- **Health endpoint:** https://webdev-273223033.onrender.com/health

## Smoke Test
1. `curl -s -i https://webdev-273223033.onrender.com/health` returns `200 OK` with `{"status":"ok","db":"ok"}`.
2. Sign-in, creating a study session, and viewing the schedule work against the live Neon PostgreSQL database.
3. `GET /nonexistent` returns `404` with a single-line JSON error and no stack trace.

## Checklist
- [x] Required environment variables validated at startup (`src/config.js`)
- [x] No secrets committed to repository or git history
- [x] `/health` checks database connectivity (`SELECT 1`) and returns `200` / `503`
- [x] Error handler logs full error on server and returns single-sentence message to client
- [x] `Dockerfile` and `.dockerignore` build and run cleanly
- [x] Coverage gate enforces 100% on `services/**` and >= 80% on `src/**`
- [x] Live deployment verified on Render + Neon