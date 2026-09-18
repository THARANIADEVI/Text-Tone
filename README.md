# Text-to-Speech Application

React + Flask, TTS via [gTTS](https://pypi.org/project/gTTS/) (free, no API key). JWT auth, SQLite-backed per-user speech history and favorites, TXT/PDF/DOCX upload, speed control, optional Mistral-powered AI text enhancement, optional Supabase cloud audio storage.

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

Everything except `/api/health`, `/api/languages`, `/api/voices`, `/api/auth/*` requires
`Authorization: Bearer <token>` (token comes back from register/login).

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | `{ email, password }` -> `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` -> `{ token, user }` |
| GET | `/api/auth/me` | current user from the bearer token |
| POST | `/api/tts` | `{ text, language, voice, speed }` -> `{ audio_url }` |
| GET | `/api/languages` | supported languages |
| GET | `/api/voices?language=en` | voices for a language |
| GET | `/api/history` | caller's last 50 generations |
| DELETE | `/api/history/<id>` | remove one of the caller's entries |
| GET | `/api/favorites?type=voice\|history` | caller's favorited voices/clips |
| POST | `/api/favorites` | `{ favorite_type: "voice", language, voice_id }` or `{ favorite_type: "history", history_id }` |
| DELETE | `/api/favorites/<id>` | remove a favorite |
| POST | `/api/extract-text` | multipart `file` (.txt/.pdf/.docx, max 5MB) -> `{ text }` |
| POST | `/api/enhance-text` | `{ text, action }` (`action` one of `summarize`, `grammar`, `rewrite`, `conversational`) -> `{ text }` |
| GET | `/api/health` | `{ status: "ok" }` |

## Optional features (env-gated, degrade gracefully if unset)

**AI text enhancement** — set `MISTRAL_API_KEY` (get one at https://console.mistral.ai/). Without it,
`/api/enhance-text` returns a clean `503` and the frontend just surfaces the error.

**Cloud audio storage** — set `SUPABASE_URL` and `SUPABASE_KEY` (and optionally `SUPABASE_BUCKET`,
default `audio`) to a project with a public storage bucket. When configured, `/api/tts` uploads the
generated clip to Supabase Storage, deletes the local copy, and returns the public URL instead of a
local `/audio/<file>` path — this is what fixes Render's ephemeral-disk caveat below. Without it,
audio is served from local disk as before.

## Deploy: frontend on Vercel, backend on Render

**Backend (Render)**
1. New Web Service -> point at this repo, root directory `backend`.
2. Render auto-detects `render.yaml` (build: `pip install -r ../requirements.txt`, start: `gunicorn app:app --bind 0.0.0.0:$PORT`).
3. Note the deployed URL, e.g. `https://tts-backend.onrender.com`.
4. Set env var `CORS_ORIGIN` to your Vercel URL once you have it (comma-separate if you need both prod + preview URLs).
5. Set env var `JWT_SECRET` to a long random value (required — the app won't start without it).
6. Optionally set `MISTRAL_API_KEY` and/or `SUPABASE_URL` + `SUPABASE_KEY` for AI enhancement / cloud storage (see above).

**Frontend (Vercel)**
1. New Project -> root directory `frontend` (Vite framework auto-detected).
2. Set env var `VITE_API_BASE_URL` = your Render backend URL (no trailing slash).
3. Deploy. Redeploy after setting/changing the env var (Vite bakes it in at build time).

**Caveat:** Render's free-tier disk is ephemeral — `generated_audio/` and `history.db` reset on redeploy/restart. Configuring Supabase Storage (see above) fixes this for audio; `history.db` still needs swapping for a hosted DB (e.g. Supabase Postgres) for full persistence.

## Project docs

Full spec: `../Python -Text-to-Speech Application.pdf`. This build implements Level 1 (Basic), Level 2
(Intermediate: JWT auth, per-user speech history, favorites, speed control), and most of Level 3
(Advanced): PDF/DOCX/TXT upload, Mistral-powered AI text enhancement, Supabase cloud audio storage.
Not yet done: usage limits, admin dashboard, analytics.
