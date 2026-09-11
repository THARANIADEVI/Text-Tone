# Text-to-Speech Application

React + Flask, TTS via [gTTS](https://pypi.org/project/gTTS/) (free, no API key). SQLite-backed speech history, TXT upload, speed control.

## Local dev

Backend:
```
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r ../requirements.txt
python app.py            # http://localhost:5000
```

Frontend:
```
cd frontend
npm install
npm run dev               # http://localhost:5173, proxies /api and /audio to :5000
```

## API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/tts` | `{ text, language, voice, speed }` -> `{ audio_url }` |
| GET | `/api/languages` | supported languages |
| GET | `/api/voices?language=en` | voices for a language |
| GET | `/api/history` | last 50 generations |
| DELETE | `/api/history/<id>` | remove one entry |
| GET | `/api/health` | `{ status: "ok" }` |

## Deploy: frontend on Vercel, backend on Render

**Backend (Render)**
1. New Web Service -> point at this repo, root directory `backend`.
2. Render auto-detects `render.yaml` (build: `pip install -r ../requirements.txt`, start: `gunicorn app:app --bind 0.0.0.0:$PORT`).
3. Note the deployed URL, e.g. `https://tts-backend.onrender.com`.
4. Set env var `CORS_ORIGIN` to your Vercel URL once you have it (comma-separate if you need both prod + preview URLs).

**Frontend (Vercel)**
1. New Project -> root directory `frontend` (Vite framework auto-detected).
2. Set env var `VITE_API_BASE_URL` = your Render backend URL (no trailing slash).
3. Deploy. Redeploy after setting/changing the env var (Vite bakes it in at build time).

**Caveat:** Render's free-tier disk is ephemeral — `generated_audio/` and `history.db` reset on redeploy/restart. Fine for a demo; swap in cloud storage + a hosted DB (see doc section 17/25 "Advanced") for persistence.

## Project docs

Full spec: `../Python -Text-to-Speech Application.pdf`. This build implements Level 1 (Basic) plus opted-in MVP extras: speed control, TXT file upload, SQLite speech history — no auth/favorites yet.
