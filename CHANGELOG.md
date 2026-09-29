# Update – Vercel build fix

## Fixed

- Fixed the TypeScript build failure in `app/api/document/route.ts` caused by the `Buffer<ArrayBufferLike>` returned by `docx` being passed directly to `NextResponse`.
- The DOCX buffer is now copied into a standard `ArrayBuffer` before being returned by the Route Handler.
- This is compatible with the newer Next.js / TypeScript `BodyInit` typings used by Vercel.

## Deployment

Replace the existing GitHub project files with this package, commit, and push. Vercel should then rebuild the project.
