# Demo 03 — Scaffolding a Todo API with Copilot Chat 🦺

> **Difficulty:** ⭐⭐⭐
> **GHCP surfaces:** Copilot Chat in IDE for **multi-file scaffolding**;
> `@workspace` retrieval; iterative chat refinement.
> **Stack:** Node.js 20+, TypeScript, Express 4, Vitest
> **Time:** ~30–45 minutes

You'll go from an empty `src/` to a working REST API by **driving Copilot Chat
with progressively richer prompts**. The goal is to learn the *prompting
workflow*, not Express.

**Go deeper:** [WORKSHOP.md](WORKSHOP.md) adds a staged API contract,
validation boundaries, negative cases, build diagnostics, and evidence for
each prompt. This is a starter lab, not a finished API.

---

## What you'll learn
1. How to scaffold multiple files in a single Chat turn ("create file X with…
   and file Y that does…").
2. How to **iteratively refine** generated code through follow-up messages
   instead of starting over.
3. The difference between *open-tab context* and *`@workspace` retrieval*.
4. How to use Chat to write **integration tests** that exercise routes end-to-end.
5. When to switch from Chat back to inline completions (and vice-versa).

## Prerequisites
- Node 20+, npm.
- VS Code with Copilot + Copilot Chat.

## Setup
```bash
git clone https://github.com/xavierxmorris/ghcp-demo-03-todo-api-ts.git
cd ghcp-demo-03-todo-api-ts
npm ci
npm test -- --run # expected to fail: TodoRepo methods are still stubs
```

You'll see a few skeleton files in `src/` and a couple of failing tests in
`tests/`. Copilot is going to fill in the rest.
`npm run dev` uses **tsx watch**, not nodemon; start it after implementing
`src/server.ts`. Use `npm test` only when you intentionally want watch mode.

CI uses the committed lockfile and `npm run check`, a source-only, no-emit
TypeScript check. It does not claim that the unfinished API tests or the
production-build exercise pass. `tsconfig.ci.json` leaves the workshop's
`tsconfig.json` output-layout issue intact. Vitest is on the patched 3.2.7 line;
the four ordinary repository tests still expose the documented missing methods.
When completing the API, add its real test and build commands to the CI gate.

---

## Walkthrough

### Phase A — Scaffold the domain (single prompt, multiple files)

Open Chat and paste this single prompt:

> *"Looking at `src/types.ts` and `src/repo.ts`, finish the in-memory `TodoRepo`
> with the following methods: `list()`, `get(id)`, `create(input)` (auto-assign
> uuid + createdAt), `update(id, patch)`, `remove(id)`. Throw `NotFoundError`
> from `src/errors.ts` when an id doesn't exist. Don't change the `Todo` type."*

1. Copilot will produce a diff for `src/repo.ts` (and maybe `src/errors.ts`).
2. Click **Apply in Editor** for each file.
3. `npm test` — the `TodoRepo` tests should now pass.

🎯 **Lesson:** Naming your prompt's *anchors* (the existing files & types)
keeps Copilot inside your codebase's conventions instead of inventing its own.

### Phase B — Scaffold the HTTP layer (iterative refinement)

In Chat:

> *"Complete `src/routes.ts`, default-exporting an Express `Router` that exposes:
> `GET /todos`, `GET /todos/:id`, `POST /todos`, `PATCH /todos/:id`, `DELETE
> /todos/:id`. Use the `TodoRepo` from `src/repo.ts`. Return 404 for
> NotFoundError, 400 for `ZodError`, 500 otherwise. Use the `validate` helper
> from `src/validate.ts`."*

Apply. Then **without starting a new chat**, follow up:

> *"Now wire `src/routes.ts` into `src/server.ts` with JSON body parsing,
> request logging via a tiny middleware, and a `/healthz` endpoint."*

Then:

> *"Add a graceful shutdown handler that closes the HTTP server on SIGTERM /
> SIGINT and exits with code 0."*

🎯 **Lesson:** Each follow-up turn inherits the prior turn's context. Long
"do everything" prompts produce mush; **incremental prompts** produce code
you can review one diff at a time.

### Phase C — `@workspace` for understanding

Open a new Chat (clear context). Ask:

```
@workspace what HTTP routes does this app expose, and how are errors mapped to status codes?
```

✅ **Expected:** Copilot lists routes from `routes.ts` and the error-mapping
logic, citing files. This is the "give me a tour" prompt for any unfamiliar repo.

### Phase D — Integration tests

Highlight the body of `src/routes.ts`. Ask:

> *"`/tests` write Vitest + supertest integration tests covering happy paths
> and the 404 / 400 cases for every route. Put them in
> `tests/routes.integration.test.ts`."*

Apply, then:

```bash
npm test
```

Expect a few generated tests to be wrong on first pass — that's normal.
Use `/fix` on any reds. Compare what Copilot wrote against what you'd write
yourself.

### Phase E — Switch back to completions for the polish

If Phase B created `src/middleware/logger.ts`, open it; otherwise first ask
Chat to extract the logger there while preserving behavior. Add a comment
at the bottom:

```ts
// Add a `correlationId` to every request (read from x-request-id header
// or generate a uuid v4) and include it in every log line.
```

Tab to accept. **This is the right tool for the job** — small, local code.
Chat would have been overkill.

---

## Try it yourself

1. Ask Chat to add **OpenAPI 3.1** docs generated from your routes.
2. Ask Chat to swap the in-memory repo for **SQLite** (using `better-sqlite3`)
   — *without* touching `routes.ts`. Does it correctly preserve the interface?
3. Ask: *"What's the worst-case latency for `GET /todos` at 1M records?"*
   Then have Chat propose an index or pagination scheme.
4. Use Chat to add **rate limiting** per IP. Then ask it to *write a test that
   proves the limiter works*.

## Talking points
- **Open files matter.** Whichever files are open in your editor weight more in
  the prompt than closed-but-indexed files. Open the file you want Copilot to
  edit and the files that define types it should respect.
- **One responsibility per prompt.** "Build me the whole app" yields generic
  Express code; "create routes.ts implementing X using Y" yields code that
  fits your repo.
- **Chat is collaborative, not transactional.** Reply, refine, push back. The
  conversation history is part of the context window.
- Treat generated tests with the same skepticism as generated production code.

## Starter build caveat

`tsconfig.json` includes `tests/**/*` while setting `rootDir` to `src`.
That creates a separate TypeScript build error even after the repository
methods are implemented. Treat it as a build-configuration exercise: keep
application output compatible with `npm start` (`dist/server.js`), while
keeping tests runnable and type-checked. Do not widen `rootDir` without
checking the emitted entry-point path. See the workshop's build checkpoint.

## Next demo →
[Demo 04 — Copilot CLI Toolkit](https://github.com/xavierxmorris/ghcp-demo-04-copilot-cli-toolkit) — leave
the IDE and drive Copilot from your terminal.
