# Technical Review

## 1. Review summary

Probate Navigator is a useful early prototype, but it is not currently production-ready. The repo contains a promising full-stack TypeScript scaffold with a meaningful probate domain model, but the backend route implementation, authentication model, data ownership model, and evaluation logic need consolidation before further feature development.

The biggest issue is not one isolated bug. It is a mismatch between product ambition and technical wiring:

- The frontend expects a functioning case-management API.
- The schema defines many domain entities.
- The storage layer implements many database methods.
- The route layer only exposes a few stub endpoints.
- Authentication is split between Clerk and legacy Express sessions.
- User IDs are inconsistent between Clerk-style string IDs and integer foreign keys.
- Evaluation logic uses stale answer keys and obsolete IHT205 references.

The right next move is a stabilisation pass, not a feature sprint.

## 2. Current architecture

### Application shape

The project is a single full-stack TypeScript app:

- Frontend: React, Vite, Wouter, TanStack Query, Tailwind, Radix/shadcn-style components.
- Backend: Express, TypeScript, Clerk, Drizzle ORM, Neon Postgres, multer, WebSockets.
- Shared code: schema and evaluation configuration under `shared/`.
- Build: Vite frontend build plus esbuild backend bundle.

### Key files

- `package.json` — scripts and dependencies.
- `server/index.ts` — Express app setup, middleware, route registration, Vite/static serving.
- `server/routes.ts` — API route registration and WebSocket setup.
- `server/clerk.ts` — Clerk auth handling and app user upsert.
- `server/storage.ts` — storage abstraction and Drizzle-backed implementation.
- `server/db.ts` — Neon/Drizzle connection.
- `shared/schema.ts` — database schema and insert schemas.
- `shared/evaluation-config.ts` — landing and detailed evaluation question definitions plus derived flags.
- `client/src/App.tsx` — frontend routing.
- `client/src/hooks/use-auth.ts` — Clerk frontend auth mapping.
- `client/src/lib/queryClient.ts` — API client/query helpers.

## 3. What is good

### 3.1 Sensible full-stack direction

The app structure is appropriate for an early product:

- One repo.
- Shared schema/config between client and server.
- TypeScript throughout.
- Express backend serving both API and frontend.
- Drizzle schema for structured data.
- React Query for server state.

This is a good base for a small team and fast iteration.

### 3.2 Useful domain model

The schema already identifies the right core entities:

- Users.
- Assessment results.
- Probate cases.
- People/executors/applicants/deceased.
- Estate assets.
- Estate liabilities.
- Documents.
- Tasks.
- Deceased-specific form fields.
- Evaluation responses.

This is broadly aligned with the ProbateSwift product concept.

### 3.3 Product flow is visible in the frontend

The frontend already indicates the intended journey:

- Landing/home.
- Auth.
- Dashboard.
- Evaluation.
- People.
- Estate.
- Documents/upload.
- Deceased details.
- Milestones.

This is valuable because contributors can see the intended user experience.

### 3.4 Evaluation configuration has the right concept

The evaluation flow is moving in the right direction: structured questions, conditional display logic, derived flags, and scenario routing.

The concept should be preserved, but the implementation needs cleanup.

## 4. Critical issues

## 4.1 Backend routes are incomplete

`server/routes.ts` currently exposes only a very small subset of what the frontend expects.

Current visible endpoints include:

- `POST /api/session-refresh`
- `GET /api/health`
- `GET /api/assessment` returning `null`
- `GET /api/probate-cases` returning `[]`

Large parts of the frontend expect additional endpoints such as:

- `/api/evaluation/:caseId`
- `/api/executors`
- `/api/executors/:caseId`
- `/api/assets/:caseId`
- `/api/liabilities/:caseId`
- `/api/documents/:caseId`
- `/api/deceased-form-fields/:personId`
- `/api/deceased-form-fields/:personId/complete`
- task/milestone endpoints

These are either missing or not visible in the current route file.

Impact:

- Frontend screens cannot persist data reliably.
- Evaluation auto-save will fail.
- Dashboard states will be misleading.
- Users may appear authenticated but see no data.
- Contributors will chase frontend bugs that are actually missing backend routes.

Recommendation:

Implement a real route layer before continuing feature work.

## 4.2 Authentication model is mixed

The app uses Clerk as the real auth system, but also configures Express sessions.

Current sources of auth/session truth:

- Clerk frontend via `@clerk/clerk-react`.
- Clerk backend via `@clerk/express` and `getAuth(req)`.
- Express session via `express-session` and `probateswift.sid`.
- Session refresh endpoint touching Express session.

This creates ambiguity. The frontend can be signed into Clerk while the backend or session layer behaves differently.

Impact:

- Persistent auth bugs.
- Users appear logged in on the frontend but unauthorised on API calls.
- Logout behaviour may not clear every state.
- Session cookies may behave differently across local, preview, and production environments.
- Harder debugging for collaborators.

Recommendation:

Use Clerk as the only authentication source of truth for now.

Remove Express session unless there is a specific, documented use case. If sessions are retained for compatibility, they must not be used to determine domain data ownership.

## 4.3 User ID type mismatch

This is a critical data model bug.

The users table uses a string/varchar primary key, which matches Clerk user IDs.

However, many domain tables define `userId` as an integer foreign key referencing `users.id`.

Examples include:

- `assessmentResults.userId`
- `evaluationResponses.userId`
- `probateCases.userId`
- `executors.userId`
- `documents.userId`

This does not align with Clerk IDs such as `user_xxx`.

Impact:

- Inserts can fail.
- Foreign key constraints can fail.
- Queries by authenticated user can return nothing.
- Case ownership cannot be trusted.
- Many symptoms will look like auth bugs even when Clerk itself is working.

Recommendation:

Pick one identity model.

Preferred for this stage:

- Use Clerk user ID as the application user ID everywhere.
- Change all domain `userId` columns to `varchar/text`.
- Ensure all route handlers derive user ID from `requireClerkAuth`.

Alternative:

- Introduce internal numeric `users.internalId`.
- Store Clerk ID as `users.clerkId`.
- Use numeric internal ID everywhere else.

Do not mix both casually.

## 4.4 Frontend contains hardcoded fallback case data

`evaluation-page.tsx` falls back to a hardcoded case if no active case is returned.

This masks the real backend problem.

Impact:

- Users can appear to complete evaluations against a fake case.
- Data may be posted to a case that does not belong to them.
- Bugs become harder to understand.
- Product trust is undermined.

Recommendation:

Remove hardcoded fallback cases. If no case exists, call an authenticated API endpoint to create a draft case or show a clear start-case state.

## 4.5 Evaluation derived flags use stale keys

The current detailed evaluation questions use keys like:

- `deceased_domiciled_uk`
- `deceased_lived_england_wales`
- `deceased_foreign_assets`
- `number_of_applicants`
- `estate_excepted_from_iht`

But `deriveEvaluationFlags()` checks older keys like:

- `q1_executor_named`
- `q2_power_of_attorney`
- `q15_all_executors_applying`
- `q17_gross_value`
- `q19_iht_done`

Impact:

- Derived routing will be wrong.
- Milestones may unlock incorrectly.
- Application readiness may be false/true for the wrong reasons.
- Users may be sent to the wrong next step.

Recommendation:

Rewrite `deriveEvaluationFlags()` to use the current canonical question keys only.

## 4.6 Obsolete IHT205 reference

`deriveEvaluationFlags()` currently sets `iht_form_required = 'IHT205'` as a default.

This is not appropriate for the intended modern ProbateSwift flow and conflicts with the product requirement to avoid obsolete IHT205 references.

Impact:

- User-facing guidance may be wrong.
- Contributors may build more logic around an obsolete concept.
- Product/legal trust risk.

Recommendation:

Replace with modern routing flags:

- `estate_likely_excepted`
- `iht400_required`
- `hmrc_iht_submission_required`
- `probate_online_declaration_possible`
- `needs_specialist_tax_guidance`

## 4.7 Query client endpoint construction is too ad hoc

`queryClient.ts` conditionally appends `caseId` to only certain endpoints.

This creates hidden coupling between endpoint naming and frontend query-key structure.

Impact:

- Easy to call the wrong URL.
- Hard to reason about API contracts.
- Contributors may not know whether query keys should be `['/api/assets', caseId]` or `['/api/assets/123']`.

Recommendation:

Use explicit API functions or a small API client module per resource.

Example:

- `getCurrentCase()`
- `getEvaluation(caseId)`
- `saveEvaluation(caseId, data)`
- `getPeople(caseId)`
- `createPerson(caseId, data)`

## 4.8 File upload is prototype-grade only

Current upload handling uses local disk via multer.

Impact:

- Not suitable for production probate documents.
- No durable cloud object storage.
- No clear access-control model.
- No virus scanning or quarantine flow.
- No retention/deletion policy.
- Risk with sensitive documents.

Recommendation:

For productisation, move uploads to private object storage with database metadata and strict case/user access checks.

## 4.9 WebSocket layer is currently unused/echo-only

The WebSocket server echoes messages and broadcasts generically.

Impact:

- Adds complexity without product value yet.
- Creates another surface to secure.

Recommendation:

Remove or park WebSockets until a specific real-time feature exists, such as document-processing status updates.

## 4.10 Error handling and validation need tightening

Some pieces are in place, but the app needs consistent route-level validation.

Recommendations:

- Validate all request bodies with Zod.
- Return consistent error shapes.
- Avoid leaking stack traces in production.
- Add ownership checks before every read/write.
- Add route-level tests for auth and ownership.

## 5. Recommended target architecture

## 5.1 Auth and identity

Target flow:

1. User authenticates with Clerk.
2. Frontend waits for Clerk to load.
3. API call reaches Express.
4. `requireClerkAuth` validates Clerk session/token.
5. Server upserts `users.id = Clerk user ID`.
6. All domain queries are scoped by that Clerk user ID.

No route should trust a user ID sent from the client.

## 5.2 API shape

Recommended endpoints:

### Auth/user

- `GET /api/auth/user`

### Cases

- `GET /api/probate-cases/current`
- `POST /api/probate-cases/start`
- `GET /api/probate-cases/:caseId`
- `PATCH /api/probate-cases/:caseId`

### Assessment

- `GET /api/assessment/current`
- `POST /api/assessment`
- `PATCH /api/assessment/:assessmentId`

### Evaluation

- `GET /api/evaluation/:caseId`
- `POST /api/evaluation/:caseId`
- `PATCH /api/evaluation/:caseId`

### People

- `GET /api/cases/:caseId/people`
- `POST /api/cases/:caseId/people`
- `PATCH /api/cases/:caseId/people/:personId`
- `DELETE /api/cases/:caseId/people/:personId`

### Deceased details

- `GET /api/people/:personId/deceased-form-fields`
- `PUT /api/people/:personId/deceased-form-fields`
- `GET /api/people/:personId/deceased-form-fields/completion`

### Estate

- `GET /api/cases/:caseId/assets`
- `POST /api/cases/:caseId/assets`
- `PATCH /api/cases/:caseId/assets/:assetId`
- `DELETE /api/cases/:caseId/assets/:assetId`
- `GET /api/cases/:caseId/liabilities`
- `POST /api/cases/:caseId/liabilities`
- `PATCH /api/cases/:caseId/liabilities/:liabilityId`
- `DELETE /api/cases/:caseId/liabilities/:liabilityId`

### Documents

- `GET /api/cases/:caseId/documents`
- `POST /api/cases/:caseId/documents/upload`
- `PATCH /api/cases/:caseId/documents/:documentId`
- `DELETE /api/cases/:caseId/documents/:documentId`

### Tasks/milestones

- `GET /api/cases/:caseId/tasks`
- `POST /api/cases/:caseId/tasks/generate`
- `PATCH /api/cases/:caseId/tasks/:taskId`

## 5.3 Storage/service split

Current `storage.ts` is doing a lot. It can work for now, but as the app grows, use this split:

- routes: HTTP/auth/validation.
- services: business logic, routing, task generation.
- storage/repositories: database access only.
- shared config: pure domain config and types.

Suggested modules:

- `server/services/case-service.ts`
- `server/services/evaluation-service.ts`
- `server/services/task-service.ts`
- `server/services/document-service.ts`
- `server/repositories/*`

## 6. Database cleanup recommendations

### Required schema cleanup

- Convert all domain `userId` columns to match the chosen user identity type.
- Use `jsonb` rather than JSON strings for assessment data and dependencies where possible.
- Add indexes for common lookups:
  - cases by user/status.
  - people by case.
  - documents by case/type/status.
  - tasks by case/status/order.
  - evaluation by case.
- Add uniqueness where needed:
  - one active draft case per user, if that is the product rule.
  - one evaluation response per case.
  - one deceased form field record per deceased person.

### Naming cleanup

The `executors` variable maps to the `people` table. This is confusing.

Recommendation:

- Rename `executors` to `people` in code.
- Keep roles as boolean fields or use a role enum/multi-role model.

## 7. Product logic cleanup recommendations

### Evaluation

Create a canonical evaluation model:

- Stable question keys.
- Stable derived flags.
- Explicit out-of-scope blockers.
- No obsolete IHT205 terminology.
- Tests for routing outcomes.

### Required derived flags

At minimum:

- `jurisdiction_supported`
- `has_will`
- `probate_type`
- `eligible_to_apply`
- `application_blocked`
- `blocker_reason`
- `estate_likely_excepted`
- `iht400_required`
- `needs_estate_detail_capture`
- `needs_will_upload`
- `needs_death_certificate`
- `needs_non_applying_executor_info`
- `needs_two_applicants`
- `needs_specialist_advice`
- `application_ready`
- `missing_requirements`

## 8. Security and privacy checklist

Before any productised release:

- All API routes authenticated unless intentionally public.
- All case data scoped to authenticated owner.
- No client-supplied `userId` trusted.
- Private document storage.
- File type and file size validation.
- Upload malware scanning/quarantine plan.
- Rate limits on sensitive endpoints.
- CORS restricted to known domains.
- Secure cookies only in production.
- Secrets only in environment variables.
- No development fallback secrets in production.
- Audit logging for document upload/delete and key case changes.
- Data deletion/export plan.
- Privacy policy aligned with actual data handling.

## 9. Testing recommendations

The project needs tests around the riskiest logic.

### Unit tests

- `deriveLandingPageResult()`.
- `deriveEvaluationFlags()`.
- milestone unlock logic.
- deceased form completion logic.
- task generation logic.

### API tests

- unauthenticated requests return 401.
- user cannot access another user's case.
- authenticated user can create/resume current case.
- evaluation save/load works.
- people/assets/documents are scoped to case owner.

### Integration tests

- new user creates case and completes evaluation.
- user resumes an existing case.
- out-of-scope case shows blocker.
- excepted estate route generates the right tasks.

## 10. Suggested immediate engineering sequence

1. Fix user identity type mismatch.
2. Remove or neutralise Express sessions.
3. Implement authenticated current-case API.
4. Remove hardcoded fallback case IDs.
5. Implement evaluation API.
6. Rewrite derived evaluation flags using current keys.
7. Remove IHT205 references.
8. Implement people/deceased details API.
9. Implement estate API.
10. Implement documents API.
11. Implement task/milestone generation.
12. Add route and logic tests.

## 11. Contributor guidance

For anyone joining the repo:

- Do not assume the current UI is backed by working APIs.
- Do not add new frontend flows until the auth/case lifecycle is stable.
- Do not introduce new question keys without updating derived logic and tests.
- Do not trust client-provided user IDs.
- Do not build around IHT205.
- Treat document handling as sensitive from day one.
- Prefer small, reviewable PRs.
- Update docs when changing product logic.

## 12. Bottom line

The prototype has useful product scaffolding, but it currently needs a foundation repair. The highest-value work is to make authenticated case ownership reliable, wire the missing backend routes, and consolidate the evaluation logic.

Once that is done, the app can become a credible productisation candidate. Until then, most feature work will compound instability.
