# AI-Assisted Development Workflow

This document describes how I used AI tools throughout the development
of the Workforce Management Platform, as required by the assignment.

---

## 1. Tools Used

| Tool | Purpose |
|---|---|
| **Claude (Anthropic)** | Primary tool — architecture planning, code generation, debugging, documentation |
| **GitHub Copilot** | Inline code completions inside Rider while writing boilerplate |

Claude was the primary driver for this project. I used it in a
conversational manner — asking questions, getting code, reviewing it,
then asking follow-up questions when something broke or didn't make sense.

---

## 2. Planning

Before writing any code I used Claude to:

**Understand the assignment requirements** — I uploaded the full
assignment PDF and asked Claude to explain it in plain terms, breaking
down each component and what was expected. This gave me a clear mental
model before diving in.

**Design the architecture** — I asked Claude to recommend a folder
structure for a clean .NET solution with proper layer separation. It
recommended the 4-layer approach (API → Application → Domain →
Infrastructure) and explained why each layer exists and what it should
know about.

**Choose technologies** — I asked Claude to help me choose between
PostgreSQL vs SQL Server, and RabbitMQ vs Kafka. Claude explained the
trade-offs clearly — PostgreSQL for open-source reliability and Npgsql
support, RabbitMQ for simplicity at this scale, and MassTransit as the
abstraction layer so the broker choice isn't hardcoded.

**Prioritise given time constraints** — With only 3-5 days available,
I asked Claude to help me triage what to build first and what to skip.
It recommended focusing on Docker infrastructure first, then the domain
layer, then working outward — which proved to be the right call.

---

## 3. Code Generation

### Primarily AI-Generated
- `docker-compose.yml` and all Dockerfiles — Claude generated these
  with correct health checks, dependency ordering, and multi-stage
  builds. I reviewed every line and understood the purpose of each
  directive before using it.
- EF Core entity configurations — Claude generated the
  `IEntityTypeConfiguration` classes. I reviewed the relationship
  mappings carefully, particularly the many-to-many `ProjectEmployee`
  join table and the cascade delete behaviours.
- MassTransit consumer boilerplate — The consumer pattern in Worker 1
  was entirely new to me. Claude generated the initial structure and
  explained the publish/consume pattern step by step.
- React pages — Claude generated the Ant Design component structure.
  I customised the styling, column definitions, and filter logic.
- Node.js Worker 2 — Claude generated the cron scheduler and
  PostgreSQL query logic. I reviewed the SQL queries carefully.
- GitHub Actions CI pipeline — Claude generated the full workflow
  file. I verified each stage matched the assignment requirements.

### Hand-Written or Heavily Modified
- `Program.cs` — I wrote this manually after understanding the DI
  container pattern, only using Claude to verify the MassTransit
  registration syntax.
- Domain entities — I wrote these myself based on the assignment's
  field specifications, using Claude only to check EF Core navigation
  property conventions.
- Seed data — I wrote the seeder logic myself, using Claude to help
  with the MongoDB document insertion syntax.
- Bug fixes — All bug fixes were hand-written after using Claude to
  diagnose the root cause.

### How I Reviewed Generated Code
I never copy-pasted code without reading it. My review process was:
1. Read every line and understand its purpose
2. Check that namespaces and project references were correct
3. Run a build immediately — don't accumulate errors
4. Ask Claude to explain any line I didn't understand

---

## 4. Debugging and Iteration

### Case 1 — Layer Violation (Domain referencing Infrastructure)
The first significant failure was a build error where
`ILeaveRequestRepository` in the Domain layer was referencing
`LeaveRequestDocument` from the Infrastructure layer — a direct
violation of the dependency rule.

Claude had generated this incorrectly. When I reported the error,
Claude immediately identified the problem and offered two solutions:
move the document models into Domain, or create a proper domain model
and map in the repository. I chose Option 2 (the correct architectural
approach) and Claude generated the fix — a pure `LeaveRequest` domain
entity and mapping logic inside `LeaveRequestRepository`.

This was a good learning moment. The error made the layering rule
concrete rather than abstract.

### Case 2 — libgssapi_krb5 Missing in Docker
After building the Docker images, the API container crashed with:
```
Cannot load library libgssapi_krb5.so.2
```
The Npgsql PostgreSQL driver requires the Kerberos library which
isn't included in the base `aspnet` Docker image.

Claude diagnosed this immediately and provided the fix — adding
`libgssapi-krb5-2` to the `apt-get install` step in the Dockerfile.
This was a purely environmental issue unrelated to application code.

### Case 3 — Health Check Returning Unhealthy
The `/health` endpoint returned unhealthy despite the API functioning
correctly. The third-party health check packages
(`AspNetCore.HealthChecks.NpgSql` etc.) had version conflicts with
.NET 10.

Claude suggested simplifying to the built-in EF Core health check
(`AddDbContextCheck`) and removing the third-party packages. The
system functioned correctly throughout — this was a monitoring issue
not a functionality issue.

---

## 5. Model Behaviour

I used Claude (claude-sonnet-4-6) throughout the project.

**What I observed:**
- Claude was excellent at generating boilerplate-heavy code like EF
  Core configurations, MassTransit consumers, and Docker Compose files
- Claude was honest when it made mistakes — when the layer violation
  occurred it acknowledged the error clearly and offered multiple fix
  options rather than defending the original code
- Claude sometimes generated code that referenced packages not yet
  installed — I learned to always check `.csproj` files after
  receiving generated code
- For complex multi-file changes Claude occasionally lost track of
  namespace consistency — I learned to always do a build after each
  set of changes rather than accumulating multiple files

**GitHub Copilot** was useful for inline completions inside Rider but
less useful for architectural decisions. It completes patterns it has
seen before but doesn't reason about system design.

---

## 6. Reflection

### Where AI Helped Most
- **Scaffolding speed** — What would have taken days of reading
  documentation (MassTransit, MongoDB Driver, Docker multi-stage
  builds) was reduced to hours. AI generated working starting points
  that I could understand and modify.
- **Explaining unfamiliar concepts** — I had no prior experience with
  message brokers. Claude explained the publish/subscribe pattern
  clearly with concrete examples before generating any code.
- **Debugging** — Pasting an error message and getting a diagnosis
  instantly is genuinely useful. Both major Docker issues were resolved
  within minutes.
- **Documentation** — Claude helped structure the README and this
  document, ensuring nothing required by the assignment was missed.

### Where AI Fell Short
- **Correctness across files** — Claude doesn't always maintain
  consistency across multiple files in a session. Namespace mismatches
  and missing using statements were common and required manual fixes.
- **Version awareness** — Claude occasionally suggested packages or
  APIs that were outdated or incompatible with .NET 10. Always verify
  package versions independently.
- **Architecture enforcement** — Claude generated the layer violation
  (Domain referencing Infrastructure) without flagging it as a problem.
  Understanding the architectural rules yourself is essential —
  you cannot rely on AI to enforce them.

### What I Would Do Differently
- **Prompt with constraints upfront** — Stating "the Domain layer must
  have zero references to Infrastructure" at the start would have
  prevented the layer violation entirely.
- **Generate tests alongside code** — I would ask Claude to generate
  unit tests for each service immediately after generating the service
  itself, rather than leaving tests for later.
- **Smaller, more focused prompts** — When I asked for too many files
  at once, consistency suffered. Asking for one file at a time with
  explicit context produced higher quality output.
