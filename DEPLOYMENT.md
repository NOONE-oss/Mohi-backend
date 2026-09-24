# Getting this live — fast path

The frontend now lives inside the backend (`public/index.html`), so this is
**one app, one deploy, one URL** — no separate frontend host, no CORS setup.
A `render.yaml` blueprint is included that provisions the database and the
app together, with the database connection and a secret key wired up
automatically. This is the fastest real path I can hand you without an
account of my own.

## Do this now (roughly 15 minutes, most of it waiting on Render)

**1. Get the code onto GitHub** (2 min if you already have an account):
   - Go to github.com → **New repository** → name it anything (e.g. `mohi-results`) → Create.
   - On the new repo's page, use **"Add file" → "Upload files"**, drag in
     everything from the unzipped `mohi-backend` folder, commit.
   - No git command line needed — the web upload works fine for this.

**2. Deploy on Render** (5 min setup + a few min build time):
   - Go to [render.com](https://render.com) → sign up/log in (GitHub login is fastest).
   - **New +** → **Blueprint** → connect the GitHub repo you just made.
   - Render reads `render.yaml` automatically and shows you: one **Web Service**
     and one **PostgreSQL database**, both pre-configured. Click **Apply**.
   - Wait for both to go green ("Live" / "Available"). Render gives you a URL
     like `https://mohi-results-xyz.onrender.com` — **that's your site.**

**3. That's it — the database sets itself up.** The app checks for its
   database tables on every startup and creates + seeds them automatically
   if they're missing (see `src/lib/autoMigrate.js`) — no Shell tab, no
   manual commands. This matters because **Render's free plan doesn't
   include Shell access at all** (it's a paid-plan feature), so this is the
   only way a free-tier deploy can work. It only ever seeds an empty
   database — once real data exists, every future restart or redeploy
   leaves it untouched.

**4. Open it**: `https://mohi-results-xyz.onrender.com` in Chrome. Log in as
   admin, start entering real classes/teachers/students, and you're usable
   today. Add the custom domain (`results.mohiafrica.org`) whenever whoever
   manages that DNS is available — it's a five-minute change you can do
   *after* today's deadline, it doesn't block going live right now.

## Demo logins (delete/change these once real data is in)

- IT support: `it@mohi.org` / `IT@2026` (picks a center after login)
- School admin: `admin@ndovoini.mohiafrica.org` / `Admin@2026`
- Teacher (Junior): `ndov.jss@mohiafrica.org` / `Teacher@2026`
- Student: `MOHI-0101` / `Student@2026` (forces a password reset)

## If something doesn't come up green on Render

- **Web service fails to build**: open its **Logs** tab, the error is almost
  always a missing env var — check `DATABASE_URL` and `JWT_SECRET` both show
  under its **Environment** tab (the blueprint should have added them
  automatically).
- **A specific action (e.g. "add a center") returns 500 / 502, especially
  after you've updated the code once already**: your database still has an
  older version of the schema — reapplying `db/schema.sql` only *creates*
  tables, it doesn't update ones that already exist with a different shape.
  Since Shell access isn't available on the free plan, fix this from
  Render's dashboard instead (no commands needed):
  1. Open your **PostgreSQL database** in Render (not the web service).
  2. **Settings** → scroll down → **Delete Database**, confirm.
  3. **New + → PostgreSQL**, same name as before, create it.
  4. On the **web service** → **Environment** tab, update `DATABASE_URL` to
     the new database's Internal Database URL, save.
  5. The web service restarts automatically and — since the new database is
     empty — sets itself up from scratch on that restart (see step 3 above).
  **This deletes all data**, so only do this when starting over or before
  real students/results are entered. If you have real data and need a
  schema change without losing it, ask me for a migration instead.
- **Free tier sleeps** after inactivity and takes ~30-60s to wake on the next
  visit — expected on the free plan, not a bug. Upgrade the web service's
  plan (a few dollars/month) once this is being used for real, to remove that.
- **One request failing shouldn't affect anyone else** — every route is
  wrapped so a database/runtime error returns a normal error response
  instead of crashing the whole app. If you ever see the *entire* site go
  down (not just one action failing), that's a different, more serious
  problem — check the Logs tab and get in touch.
- **`db/reset.sql` and `npm run seed` still exist** as standalone scripts for
  anyone who *does* have Shell access (a paid plan) or is running this
  locally — they're just no longer required for a free-tier Render deploy.

## What NOT to worry about today

- Custom domain, CORS tightening, rate limiting — none of these block going
  live, they're all polish for once today's deadline has passed.
- The CSV bulk-upload screens from the earlier prototype aren't wired up in
  this version yet — add classes/teachers/students one at a time through the
  app for now; bulk upload can come later.

## How people should find it (not Google)

`public/index.html`'s `<head>` already has
`<meta name="robots" content="noindex, nofollow">`, and `public/robots.txt`
tells crawlers to skip the whole site — both deploy automatically as part of
this same app. Share the Render URL (or the custom domain once it's ready)
directly with centers/parents/teachers — via `portal.mohiafrica.org`, SMS, or
printed on the report card — rather than relying on search.
