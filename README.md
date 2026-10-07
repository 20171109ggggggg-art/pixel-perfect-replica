# Pixel Perfect Replica

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b9288ef7-bd49-40c4-9e58-8e865791f59c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Backend (Supabase)

This app uses its own Supabase project (`wfvgegmuuvhhywmesiqj`), not Lovable Cloud.
The client in `src/integrations/supabase/client.ts` reads two build-time env vars:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://wfvgegmuuvhhywmesiqj.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` (browser-safe, RLS-gated) |

They are in `.env` for local dev and the Lovable preview. On Vercel, add both under
Project Settings → Environment Variables, then redeploy (Vite inlines them at build time).
