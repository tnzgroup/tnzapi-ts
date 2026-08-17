# tnzapi-ts demo

A working demo of `tnzapi-ts`, the TypeScript SDK for the TNZ Group REST API v3.00, co-located
here the same way `tnzapi-python`'s `demo/` and `tnzapi-dotnet`'s `TNZAPI.NET.Demo/` are: an
`api/` backend (NestJS) paired with `web/`, the **same** shared React + Vite frontend both
sibling demos use, tracked here as a git submodule.

> ⚠️ This demo is for local development and evaluation only — see the warning banner on its own
> Settings page for why it should never be pointed at a production deployment. `api/` also has no
> request-level authentication of its own and trusts whatever Auth Token it's configured with, so
> never run it anywhere reachable beyond your own machine.

**Implemented:** Health, Auth (session-based token override), Settings (`api-url` /
`allow-insecure-http` / `ssl-verification` all fully working — `tnzapi-ts` has a real
`TNZ_UNSAFE_IGNORE_SSL` knob, unlike `tnzapi-python`'s demo, which has to stub that one out;
`api-url` is scoped per browser session like the token override, so one user's change doesn't
affect another concurrent user of the same demo instance — see Known tradeoffs below for why
`allow-insecure-http`/`ssl-verification` can't be scoped the same way), every messaging channel
(SMS, Email, Fax, TTS, Voice, WhatsApp, RCS, Workflow), Actions
(Abort/Reschedule/Resubmit/Pacing, per-channel), Addressbook (Contact/Group CRUD,
ContactGroups/GroupContacts join endpoints), and OptOut (Create/Detail/Delete/List). WhatsApp and
RCS Received return a documented `501` — this SDK's `Reports` module has no equivalent to those
two, only `SMSReceived`.


## Running it with Docker (recommended)

All commands below assume your terminal's current directory is `demo/` (this folder).

1. Create a file named `.env` in this folder containing your token:

   ```
   TNZ_AUTH_TOKEN=your-token-here
   ```

2. Build and start both containers:

   ```bash
   docker-compose up --build
   ```

   The first run downloads and builds everything (a few minutes). Wait for output like:

   ```
   api-1  | [Nest] ... Nest application successfully started
   web-1  |   VITE v6.x.x  ready in ... ms
   ```

3. Visit `http://localhost:5373`.

Stop with `Ctrl+C`; `docker-compose down` afterward removes the containers (optional). Editing
files under `demo/api/` or `demo/web/` while the containers are running picks up live (Nest's
`--watch`, Vite's dev server) — except `.env` or `package.json` changes, which need
`docker-compose up --build` again.

**Troubleshooting:**
- *"port is already allocated"*: something else on your machine is using `5080` or `5373`. Free
  it, or edit the port numbers in `docker-compose.yml`.
- *Any messaging/addressbook/optout action returns `"Result": "Failed"` with an AuthToken
  message*: expected if `TNZ_AUTH_TOKEN` isn't set to a real token yet.
- *Want to point at something running on your own machine, not TNZ's real API*: inside a
  container, `localhost` means the container itself. Use `http://host.docker.internal:<port>` in
  the Settings page's API URL field instead.

## Running it without Docker

Backend (from the repo root):

```bash
npm run build
cd demo/api
npm install
TNZ_AUTH_TOKEN=your-token npm run start:dev
```

Frontend:

```bash
cd demo/web
npm install
npm run dev
```

Visit `http://localhost:5373` (or pass `-- --port <n>` to run alongside `tnzapi-dotnet`'s or
`tnzapi-python`'s own demo web on the same machine).

## Testing

```bash
cd demo/api && npm test && npm run test:e2e
cd demo/web && npm run test:types && npm test
```

Neither test suite is collected by the main SDK's own `jest.config.js` / `tests/`.

## Known tradeoffs (deliberate, not bugs)

- `demo/api`'s Settings/Auth endpoints have no caller authentication and `api-url` accepts any
  URL with no allowlist — mirrors both sibling demos, gated by the same "local development and
  evaluation only" warning shown in the shared frontend's Settings page.
- `allow-insecure-http` and `ssl-verification` are process-wide, not per-session like `api-url`
  and the token override — `tnzapi-ts`'s `HttpRequest.ts` reads `TNZ_ALLOW_INSECURE_HTTP` and
  `TNZ_UNSAFE_IGNORE_SSL` straight from `process.env` at request time, with no per-client or
  per-request override the way `URL`/`AuthToken` are constructor arguments. Scoping these two the
  same way `api-url` is scoped would require changing the SDK itself, not just this demo.
- WhatsApp and RCS Received report a documented `501` — no equivalent SDK method exists
  (`Reports.SMSReceived` is SMS-only, hardcoded to `/sms/received`).
- Addressbook Contact create/update has no `Notes` field — `IContactFields` on this SDK doesn't
  support it, unlike OptOut's `Notes`, which does work.
- Contact Groups' and Group Contacts' `DELETE` endpoints take a JSON body (`{ContactID,
  GroupID}` / `{GroupID, ContactID}`), not path segments — matches what the shared frontend
  actually calls, which itself doesn't match the Python reference backend's router (a pre-existing
  mismatch in that reference implementation, not something introduced here).

## Project layout

```
demo/
  api/                 NestJS backend (TNZ_AUTH_TOKEN read server-side, never sent to the browser)
  web/                 React + TypeScript + Vite frontend (git submodule)
  docker-compose.yml   Orchestrates both as separate containers
  .env                 Your Auth Token (you create this — not committed)
```
