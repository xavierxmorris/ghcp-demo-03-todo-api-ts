# Workshop: build an API in reviewable slices

**Audience:** developers comfortable with JavaScript. **Time:** 60-75 minutes.
**Outcome:** a repository layer, an HTTP layer, and independent evidence that
their contracts agree. The starter intentionally does not implement them.

## 1. Read the anchors - 8 minutes

Use the [README setup](README.md#setup), then inspect:

| File | Existing contract | Leave unchanged unless explicitly agreed |
| --- | --- | --- |
| [src/types.ts](src/types.ts) | `Todo`, create input, update patch | Field names and types |
| [src/repo.ts](src/repo.ts) | In-memory `Map` and empty class | Storage remains in-memory |
| [src/errors.ts](src/errors.ts) | `NotFoundError` | One recognizable missing-item error |
| [src/validate.ts](src/validate.ts) | Zod schemas and `validate` middleware | Existing schema behavior |
| [src/routes.ts](src/routes.ts) | Default-exported router stub | HTTP boundary |
| [src/server.ts](src/server.ts) | App and startup stub | Importing for tests must not start a listener |
| [tests/repo.test.ts](tests/repo.test.ts) | Four domain tests | Independent expected results |

The manifest uses **Express 4**, **Zod 3**, **Vitest 1**, and TypeScript 5
version ranges, with **Node 20+** in the original lab. Record resolved versions
with `npm ls --depth=0`; do not mix current Express 5 examples into this exercise
or upgrade the stack just to follow a tutorial.

```powershell
npm test -- --run
```

Missing repository methods are an expected starter failure. A missing package
or an incompatible runtime is a different problem and must be resolved first.

## 2. Complete the domain, not the whole app - 12 minutes

```text
Read src/types.ts, src/errors.ts, src/repo.ts, and tests/repo.test.ts.
Implement list/get/create/update/remove. Preserve the types. Create an ID and
ISO createdAt, default done to false, and throw NotFoundError for a missing
get/update/remove. Do not add HTTP code, persistence, or dependencies.
```

Inspect the diff and extend the tests before starting the router:

| Case | Expected property | Typical mistake |
| --- | --- | --- |
| Fresh repository | Empty list | State leaking between tests |
| Create with `done: true` | Value stays true | Ignoring an optional input |
| Update true to false | Value becomes false | Using `patch.done || previous.done` |
| Change title only | `done`, `id`, and `createdAt` preserved | Rebuilding unrelated fields |
| Remove then get | `NotFoundError` | Returning undefined as success |
| Create two items | Distinct IDs | Using a fixed sample ID |

```powershell
npm test -- --run tests\repo.test.ts
```

**Checkpoint:** a reviewer can understand the repository without reading
Express code. UUID and timestamp tests check properties, not a hard-coded clock.

## 3. Agree the HTTP contract - 15 minutes

These are **workshop acceptance targets**, not endpoints already implemented
by the empty starter:

| Method/path | Successful response | Negative case |
| --- | --- | --- |
| `GET /todos` | 200, array | Fresh store returns `[]` |
| `GET /todos/:id` | 200, todo | Unknown ID returns 404 |
| `POST /todos` | 201, created todo | Invalid body returns 400 |
| `PATCH /todos/:id` | 200, updated todo | Invalid patch 400; valid patch for unknown ID 404 |
| `DELETE /todos/:id` | 204, no body | Unknown ID returns 404 |
| `GET /healthz` | 200, simple health response | Must not mutate the store |

```text
Implement the table using the existing TodoRepo and validate middleware.
Use a default-exported router, then wire JSON parsing, routes, and a final
four-argument error handler into the app. NotFoundError maps to 404 and
ZodError to 400. Handle malformed JSON as a client error. Unexpected failures
must not leak stack traces to clients. Keep this on Express 4.
```

Express 4 does not automatically forward rejected async-handler promises in
the way Express 5 does. Keep the synchronous in-memory path simple; if you
introduce async code, explicitly propagate its errors.

Make test state isolation deliberate: a fresh repository/app per test is
preferable to depending on test order. Do not start a network listener merely
because a test imports the app.

## 4. Test validation rather than imagine it - 12 minutes

Ask Copilot to add `tests/routes.integration.test.ts` using the already
declared Supertest and Vitest dependencies. Read the schemas yourself:

| Body | Shipped schema behavior | Lesson |
| --- | --- | --- |
| Create with no `title` | Invalid | Required input |
| Empty title | Invalid | Minimum length 1 |
| 280-character title | Valid | Inclusive upper boundary |
| 281-character title | Invalid | One beyond the boundary |
| `done: "false"` | Invalid | A string is not a boolean |
| Whitespace-only title | Accepted by the current length-only rule | Trimming would be a separate policy change |
| Empty patch `{}` | Accepted by the current all-optional schema | Rejecting no-op patches requires an explicit decision |
| Unknown object property | Stripped by the current Zod object schema | Do not assume strict rejection |

Choose how to represent errors consistently, then assert that contract.
Do not let each generated test invent its own response envelope.

```powershell
npm test -- --run tests\repo.test.ts tests\routes.integration.test.ts
```

**Checkpoint:** false-to-true and true-to-false both work; malformed JSON,
schema-invalid JSON, and an unknown ID are different exercised paths.

## 5. Make the build and startup agree - 10 minutes

Run `npm run build`. The starter has a configuration mismatch independent
of your API: `rootDir: "src"` conflicts with including `tests/**/*`.

```text
Resolve the build boundary without changing the API or dependencies.
Keep the production entry point at dist/server.js because npm start uses it.
Keep tests included in an appropriate type-check configuration and runnable
with Vitest. Explain the generated output path before changing tsconfig.
```

One reasonable design is a source-only production build and a separate
no-emit test type-check configuration. This is a learner implementation task,
not a configuration already supplied by the starter.

After building, start the app in a separate terminal with `npm start`.
Record the actual listening URL and check `/healthz` there. Exercise one
create/update/delete flow without inventing IDs; use the ID returned by POST.
Stop that terminal's server with Ctrl+C. Check that tests still exit without
hanging on a leftover listener.

## 6. Failure drill and handoff - 8 minutes

Temporarily introduce the truthiness bug for `done` on your exercise branch.
The true-to-false test must fail. Undo only that deliberate edit and rerun it.
If it stays green throughout, the test is not checking the intended behavior.

Keep the API table, relevant prompts, focused diffs, test output, emitted
entry-point path, and HTTP observations. A generated route list is not proof
that those routes are wired into the running server.

For a stretch exercise, specify pagination before coding: maximum page size,
stable ordering, empty-page behavior, and a test that bounds the returned list.
Do not add a database, authentication, or rate limiter incidentally.

## Troubleshooting

| Symptom | Check first |
| --- | --- |
| `npm test` never exits | Use `-- --run`; inspect accidentally opened listeners |
| `rootDir` error | Build/test source boundaries, not route logic |
| `npm start` cannot find a file | Compare package script and actual emitted directory |
| Valid PATCH becomes 400 | Check optional fields and boolean types |
| Async error bypasses handler | Confirm Express major version and error forwarding |
| A generated helper is missing | Ask for the named file explicitly; do not assume a previous prompt created it |

## Current sources

Checked **2026-09-07**:
[Express 4 API](https://expressjs.com/en/4x/api.html) and
[Express error handling](https://expressjs.com/en/guide/error-handling/).
The rolling guide describes newer Express behavior; the **4.x** API and this
repository's dependency major govern this lab.

Next: [Demo 04](https://github.com/xavierxmorris/ghcp-demo-04-copilot-cli-toolkit)
adds command permissions and filesystem evidence to the same workflow.
