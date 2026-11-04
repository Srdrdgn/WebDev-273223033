# Study Groups

## Architecture note
Trace one request through the layers:
1. HTTP Request hits `routes/sessions.js` (Authentication check).
2. Request passes to `services/sessions.js` (Business logic, conflict & ownership check).
3. Service calls `db.js` to query/mutate PostgreSQL database.
4. Response returns through layers back to the client.

## Project option
Study groups.

## Goals
- A student signs in, browses available study groups, and joins a group that has open slots.
- A group creator schedules a session, sets a maximum member limit, and views the roster of joined students.

## Non-goals
- No payments or premium memberships: every study group is completely free to join.
- No real-time chat messaging: members communicate via external links or notes.
- No mobile native app: one responsive web UI that works on phone and desktop screens.

## Constraints
- Node.js with Express, PostgreSQL database, plain HTML and vanilla JavaScript in the UI.
- Passwords are stored securely using strong hashing, never as readable plain text.

## The model feature
- Model: Gemini 2.5 Flash, text modality, called from `services/summary.js` and nowhere else.
- Input: The raw discussion notes or topic description pasted by a group creator.
- Output: A concise 3-bullet summary of key topics and goals for the study session.
- When it fails: If the model is slow, rate-limited, or returns an error, the app catches the exception, logs a warning, and falls back to displaying the raw notes directly without crashing.

## Auth
- Local: Email and password authentication with hashed passwords stored in PostgreSQL.
- Provider: Google OAuth login for social authentication.
- Linking: Accounts with the same verified email address are automatically linked to a single user profile.

## MCP tools
| Tool | What it does | Who may call it |
| --- | --- | --- |
| `list_study_groups` | Returns a list of all active study groups with open slots | Authenticated student |
| `join_study_group` | Registers the current user into a specified study group | Authenticated student |
| `get_group_roster` | Retrieves the list of members enrolled in a specific group | Group organizer or admin |

## UI
- Stack: Server-rendered HTML with Express, Tailwind CSS via CDN, and vanilla JavaScript for interactivity.
- Screens:
  1. `/login` — Sign-in and authentication page.
  2. `/groups` — List of all available study groups with filtering options.
  3. `/groups/new` — Form for creating a new study group.
  4. `/groups/:id` — Detailed view of a specific group, its members, and notes.

## Architecture
- Request flow: HTTP route handler in `routes/groups.js` reads request, calls service function in `services/groups.js`, which queries data layer in `db/groups.js`.
- Deviation: Simple validation logic is occasionally handled directly in the route handler for lightweight form inputs.

## Acceptance criteria
- [AC-1] A member who signs up for a study group with no free places sees "This group is full", and no new row appears in `group_members`.
- [AC-2] A visitor opening `/groups` without signing in is automatically redirected to `/login`.
- [AC-3] An organizer creating a new study group sees it immediately appear in the `/groups` list.
- [AC-4] A student joining a group successfully increments the member count shown on the page.
- [AC-5] Entering incorrect login credentials displays an invalid email or password error message.
- [AC-6] Clicking the leave button on an enrolled group removes the user from the roster table.
- [AC-7] Uploading study notes correctly triggers the Gemini model feature fallback/summary mechanism.
- [AC-8] An unauthenticated request to the MCP tool `join_study_group` is rejected with an authorization error.

### Slice 1: sign-in and the study groups list
- [AC-9] A visitor who opens `/groups` without signing in lands on `/login` instead.
- [AC-10] After signing in with a seeded account, `/groups` shows the seeded study groups with their titles and available slots.
- [AC-11] Deleting one group row in the database and reloading `/groups` removes that group from the screen.

### Slice 2: schedule a study session and prevent conflicts
- [AC-12] A study session requires a valid start time and end time within an existing group.
- [AC-13] Scheduling a second session for the same study group at an overlapping time is refused with `409 Conflict` and names the conflicting session.
- [AC-14] Only the creator of the study group can reschedule or cancel a session; another signed-in user receives `403 Forbidden`, and an unauthenticated user receives `401 Unauthorized`.

## Traceability
| Criterion | Test |
| --- | --- |
| AC-1 | test('AC-1 full group rejection') |
| AC-9 | test('AC-9 visitor redirected to login') |
| AC-10 | test('AC-10 seeded groups shown on list') |
| AC-11 | test('AC-11 deleted group removed from screen') |
| AC-12 | test('AC-12 valid session requirements') |
| AC-13 | test('AC-13 overlapping session refused with 409') |
| AC-14 | test('AC-14 authorization for session management 401/403') |

## Spec vs result
- The agent successfully built the local authentication and the study group list screen.
- Minor adjustments were made to the fallback handling logic for the model feature during testing.

## Architecture
One request, `POST /api/groups/:groupId/sessions`, through every layer:
1. `routes/sessions.js` checks authentication (401 if missing) and calls `createSession`.
2. `services/sessions.js` holds the overlap rule and throws `SessionConflictError` (mapped to 409) or `NotOwnerError` (mapped to 403).
3. `db.js` handles PostgreSQL interactions.
4. Back out: in the browser, `public/js/app.js` handles loading, empty, and error states when API calls fail.
Where this codebase does not match its own layering: Simple query wrappers are sometimes placed directly inside service methods to keep pagination lightweight.