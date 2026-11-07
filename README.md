# Way To Kaaba — Frontend

Next.js 16 website and admin area for Way To Kaaba Travel & Tours (Umrah packages and Makkah/Madinah hotels).

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

## Preview mode (client review without a backend)

Set `NEXT_PUBLIC_PREVIEW_MODE=true` to run the website **without the API**:

- Hotels and packages come from the bundled sample catalogue `src/lib/preview/catalog.json`, with the same
  search, filters, sorting and pagination rules as the API (`src/lib/preview/catalog.ts`).
- Inquiry forms open **WhatsApp** (+92 344 5010005) with the visitor's details pre-filled instead of saving to a database.
- The admin area (`/admin`) is disabled, and a small "Preview version" banner is shown.

To refresh the sample catalogue from a running local API, export `/api/hotels` and `/api/packages` (with details)
into `src/lib/preview/catalog.json`.

**Switching to the real backend later:** remove `NEXT_PUBLIC_PREVIEW_MODE` (or set it to `false`), set
`NEXT_PUBLIC_API_BASE_URL` to the deployed API, and redeploy. No code changes are needed.

## Checks & tests

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e                  # normal mode: API + site running (uses installed Microsoft Edge)
E2E_PREVIEW=1 npm run test:e2e    # preview mode: site built with NEXT_PUBLIC_PREVIEW_MODE=true, no API
```

## Deploy (Vercel, free Hobby plan)

1. Vercel → **Add New → Project** → import the `waytokaaba-frontend` GitHub repository (Next.js is detected automatically).
2. Environment variables:
   - **Client preview (no backend yet):**
     - `NEXT_PUBLIC_PREVIEW_MODE` = `true`
     - `NEXT_PUBLIC_SITE_URL` = your Vercel URL, e.g. `https://waytokaaba.vercel.app`
   - **Production (with backend):**
     - `NEXT_PUBLIC_API_BASE_URL` = your API URL, e.g. `https://waytokaaba-api.onrender.com` (not localhost)
     - `NEXT_PUBLIC_SITE_URL` = your Vercel URL
     - and add the Vercel URL to the API's `Cors__AllowedOrigins` setting.
3. Deploy.

`NEXT_PUBLIC_*` values are built into the site — **redeploy** on Vercel after changing them.
