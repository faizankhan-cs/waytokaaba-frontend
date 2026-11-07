# Waytokaaba — Frontend

Next.js 16 website and admin area for Waytokaaba (Umrah packages and Makkah/Madinah hotels).

The **backend (API)** lives in a separate folder/repository: `..\WayToKaaba` — see its `README.md` for the
full architecture, API reference and deployment guide.

## Run locally

Start the API first (in `..\WayToKaaba`: `docker compose up -d db` then
`dotnet run --project src/Waytokaaba.API --launch-profile http`), then:

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL=http://localhost:5062
npm install
npm run dev                  # http://localhost:3000   (admin: /admin)
```

## Checks & tests

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e             # Playwright; API + site must be running (uses installed Microsoft Edge)
```

## Deploy (Vercel, free Hobby plan)

1. Push this folder to its own GitHub repository.
2. Vercel → **Add New → Project** → import the repository (Next.js is detected automatically).
3. Environment variables:
   - `NEXT_PUBLIC_API_BASE_URL` = your Render API URL, e.g. `https://waytokaaba-api.onrender.com` (not localhost)
   - `NEXT_PUBLIC_SITE_URL` = your Vercel URL, e.g. `https://waytokaaba.vercel.app`
4. Deploy, then add the Vercel URL to the API's `Cors__AllowedOrigins` setting on Render.

`NEXT_PUBLIC_*` values are built into the site — redeploy on Vercel after changing them.
