# ScholarFlow
AI-assisted Learning Management System: Next.js 14, Prisma, PostgreSQL.

## Tech Stack
Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL (Supabase), NextAuth.js

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in values
3. `npx prisma migrate dev`
4. `npm run dev`

## Authentication

Register students and instructors at `/register`, or sign in at `/login`.
Admin accounts cannot be self-registered.

For local development only, seed one account for each role with:

```bash
npx prisma db seed
```

The seed accounts are `admin@scholarflow.dev`, `instructor@scholarflow.dev`,
and `student@scholarflow.dev`. Each uses the development password
`Password123`. Do not seed these predictable credentials into a production
database; change or remove them before deploying.

Protected portal routes are under `/student`, `/instructor`, and `/admin`.
Server layouts and API handlers also check the current database role and
account status.

## Instructor courses

Instructors can manage courses at `/instructor/courses`; admins can manage all
courses from the same page. Add sections before publishing. The local seed also
creates a published sample course with four sections.

Course thumbnail uploads require valid `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` values in `.env`. Images are
limited to JPG, PNG, or WebP files up to 2 MB. Course editing works without
Cloudinary, but thumbnail uploads return a configuration error until those
credentials are set.
