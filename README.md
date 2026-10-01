# Instagram-like application

This project contains a React/Vite frontend and an Express/MongoDB backend.

## Run the application

1. Install dependencies from the project root:

   ```powershell
   npm.cmd install
   npm.cmd install --prefix frontend
   npm.cmd install --prefix backend
   ```

2. Configure `backend/.env` with a reachable MongoDB connection and a private JWT secret. Keep that file private; do not commit it.

3. Start both servers together:

   ```powershell
   npm.cmd run dev
   ```

Open [http://localhost:5173](http://localhost:5173). Vite forwards `/api` requests to the backend at `http://localhost:5000`. To build the frontend for production, run `npm.cmd run build`.

The frontend supports account registration/login, a searchable post feed, creating posts with public image URLs, likes, comments, profile editing, and logout. Register a user and share a first post to populate the feed. Profile and post photo inputs currently accept public image URLs (the backend does not implement file uploads).

## Project layout

- `frontend/` — React application, responsive UI, and Vite API proxy.
- `backend/` — Express REST API, Mongoose models, authentication, and business logic. See [backend/README.md](./backend/README.md) for endpoint examples.
