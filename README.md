# Lekha Library

A Notion-style BHMS material library built with React and Vite.

The app includes:

- Login screen for the private library.
- Dashboard with subject counts and the July 2026 exam timetable.
- Subject workspaces with folders, file upload, open, download, rename, and delete actions.
- Materials workspace for random study files.
- Firebase Firestore for folder/file records.
- Supabase Storage for uploaded files.

## Local Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment Variables

Create `.env.local` locally and add:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_STORAGE_BUCKET=lekha-library-files
```

For hosting, add the same variables in the hosting provider dashboard.

## Deployment

Recommended free path:

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables in Vercel.
4. Set the custom subdomain in Vercel Domains.
5. Add the DNS record shown by Vercel in your domain provider.
