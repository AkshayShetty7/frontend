# Knowledge Hub — Frontend

Minimal black-and-white React frontend for the Kt Knowledge Hub API.

## Run

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/sources`,
`/groups`, `/chat`, `/search` to the FastAPI backend on `http://localhost:8000`
(already allowed by the backend CORS config).

## Pages

- **Library** (`/library`) — upload PDF sources, browse all uploaded sources.
- **Groups** (`/groups`) — create / delete groups.
- **Group detail** (`/groups/:id`) — view sources in a group, add/remove sources.
- **Chat** (`/chat`) — ask questions against a selected group, with citations.
