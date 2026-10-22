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

### Section content and quizzes

From a course editor, use **Edit content** on a section to author Markdown notes,
embed a YouTube or Vimeo video, and build multiple-choice or true/false quizzes.
Notes are stored as Markdown, pasted Markdown is formatted in the editor, and
previews render without raw HTML. Quiz questions are ordered, and saving a quiz
replaces its questions and clears existing attempts; the editor warns and asks
for confirmation when attempts exist.

Instructor API endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/courses/:id/sections/:sectionId` | Read section notes and video |
| `PATCH` | `/api/v1/courses/:id/sections/:sectionId` | Update section title, notes, or video |
| `GET` | `/api/v1/courses/:id/sections/:sectionId/quiz` | Read quiz questions and correct answers |
| `PUT` | `/api/v1/courses/:id/sections/:sectionId/quiz` | Replace quiz and clear previous attempts |
| `DELETE` | `/api/v1/courses/:id/sections/:sectionId/quiz` | Delete quiz and its attempts |

All endpoints require an active instructor or admin; instructors can only
access sections belonging to their own courses. Student-facing quiz APIs must
not expose `correctIndex`.

## Student portal

Students can browse published courses at `/student/courses`, filter the catalog
using URL-backed search/category/price/sort/page controls, enroll in a course,
and study its section content. Course previews expose the outline only; lesson
content and questions are returned only to enrolled students. Quiz attempts are
graded server-side, and only submitted results reveal correct answers.

Progress is tracked per section. A section with a quiz cannot be completed until
the student submits it. Completing all current sections unlocks a downloadable
PDF certificate. Unenrolling permanently clears course progress and quiz
attempts. The `/student/my-learning` page lists enrollment progress and
achievements.

### Assignments

Instructors can create and edit assignments in the course editor, review
submissions, and grade or regrade work with written feedback. Students can
submit a text response, a PDF, DOCX, TXT, PNG, or JPG attachment (up to 4 MB),
and update their work until it is graded. Late submissions are marked
automatically. Submission records and uploaded work are retained if a student
unenrolls; deleting an assignment or course removes its submission records and
attempts to delete associated Cloudinary raw assets.

Set valid Cloudinary credentials to enable attachments. Cloudinary must allow
PDF/raw asset delivery for learners and instructors to open uploaded files.
File URLs are only returned by authenticated APIs to the submitting student or
the course instructor/admin; the exact Cloudinary URL itself is public.

Instructor assignment endpoints require an active instructor/admin and enforce
course ownership:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET`, `POST` | `/api/v1/courses/:id/assignments` | List or create assignments |
| `GET`, `PATCH`, `DELETE` | `/api/v1/courses/:id/assignments/:assignmentId` | Read, edit, or delete an assignment |
| `GET` | `/api/v1/courses/:id/assignments/:assignmentId/submissions` | List submissions and enrollment count |
| `PUT` | `/api/v1/courses/:id/assignments/:assignmentId/submissions/:submissionId/grade` | Grade or regrade a submission |

Student assignment endpoints require an active student enrolled in the
assignment's course:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/assignments?courseId=:id` | List assignments for enrolled courses; optionally filter by course |
| `GET` | `/api/v1/assignments/:assignmentId` | Read an assignment and the student's own submission |
| `PUT` | `/api/v1/assignments/:assignmentId/submission` | Submit or update text and/or a multipart file |

Grading and assignment/course deletion are audit-logged. Students cannot modify
a graded submission, and instructors cannot grade above the assignment's
maximum score.

### Student API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/catalog` | Search/filter published courses with pagination |
| `GET` | `/api/v1/catalog/:id` | Course outline and enrollment state |
| `GET` | `/api/v1/enrollments` | Student enrollments, progress and achievements |
| `POST` | `/api/v1/enrollments` | Enroll using `{ "courseId": "..." }` |
| `DELETE` | `/api/v1/enrollments/:courseId` | Unenroll and clear progress/attempts |
| `GET` | `/api/v1/enrollments/:courseId/certificate` | Download a completion certificate |
| `GET` | `/api/v1/learn/:courseId` | Enrolled course content without pre-attempt answers |
| `PUT` | `/api/v1/learn/:courseId/sections/:sectionId/progress` | Set section completion |
| `PUT` | `/api/v1/learn/:courseId/sections/:sectionId/quiz/attempt` | Submit or replace a quiz attempt |

Course categories are managed as part of course details. Local seeding adds
published catalog examples for trying filters and pagination:

```bash
npx prisma db seed
```
