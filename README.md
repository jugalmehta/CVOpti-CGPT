# Resume Tailor AI

Next.js Resume Tailor AI with sequential recruiter/ATS workflow and review-before-download screen.

## GitHub / Vercel deployment

**Important:** these files are already flattened for a GitHub repository root. `package.json`, `app/`, and `vercel.json` must be in the repository root.

1. Replace the contents of your GitHub repository with the contents of this folder.
2. In Vercel, open **Project Settings → Build and Deployment**.
3. Set **Framework Preset** to `Next.js`.
4. Set **Root Directory** to `.` (the repository root), unless your repository intentionally places this project in a subfolder.
5. Leave Output Directory blank/default for Next.js.
6. Redeploy using **Redeploy** with the latest commit.

If your repository contains a folder such as `resume-tailor/` containing `app/` and `package.json`, either move those contents to the repository root or set Vercel Root Directory to `resume-tailor`.

## Environment variables

Configure the AI provider variables required by `app/api/tailor/route.ts` in Vercel Project Settings → Environment Variables.

## Routes

- `/` — Resume Tailor interface
- `/api/tailor` — AI tailoring workflow
- `/api/document` — DOCX generation
