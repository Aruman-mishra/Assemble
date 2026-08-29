# Assemble — Vercel + Turso version

Same product, restructured for Vercel: no Express server, each API route is
its own serverless function under `/api`, and the database is Turso
(cloud-hosted, SQLite-compatible, free tier) instead of a local file —
because Vercel's serverless functions can't write to a persistent disk.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "assemble — vercel version"
git branch -M main
git remote add origin https://github.com/<your-username>/assemble.git
git push -u origin main
```

## 2. Create a free Turso database

1. Go to https://turso.tech → sign up (free, no card).
2. Create a database (any name, e.g. `assemble`).
3. From its dashboard, copy the **Database URL** (starts with `libsql://`)
   and generate an **Auth Token**.

## 3. Import into Vercel

1. Go to https://vercel.com → sign in with GitHub.
2. "Add New Project" → select your `assemble` repo → Import.
3. Before deploying, open **Environment Variables** and add:
   - `JWT_SECRET` — any long random string
   - `TURSO_DATABASE_URL` — from step 2
   - `TURSO_AUTH_TOKEN` — from step 2
   - `GEMINI_API_KEY` — free key from https://aistudio.google.com/app/apikey
4. Click **Deploy**.

Vercel gives you a live URL immediately (e.g. `assemble.vercel.app`).
Tables are created automatically the first time any API route runs.

## Updating later

Any `git push` to `main` auto-redeploys on Vercel — no manual steps needed.

## What's real vs. simulated

Same as before — landing/demo page is a visual simulation, but sign up,
sign in, real AI generation (Gemini), and saving a portfolio are all real
and backed by the Turso database.

## Local testing (optional)

```bash
npm install -g vercel
npm install
vercel dev
```
This runs the same serverless functions locally at `http://localhost:3000`,
reading env vars from a local `.env` file if you create one.
