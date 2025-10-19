DEV CORS FIX:
- We added Next.js rewrites to proxy API requests (http://127.0.0.1:3001) through the web app.
- Frontend now calls same-origin /api/* so the browser doesn't perform cross-origin CORS checks.

How to use:
1) npm install
2) npm run dev
3) All client code should call apiFetch('/auth/login') etc.

If you still make absolute calls (http://127.0.0.1:3001/...),
update those files to use apiFetch or prefix with /api.
