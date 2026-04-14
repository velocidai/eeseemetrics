# Contributing to Eesee Metrics

Thank you for your interest in contributing. Bug reports, feature ideas, and pull requests are all welcome.

---

## Running Locally

**Prerequisites:** Node.js 18+, Docker, Docker Compose

**1. Clone and configure**

```bash
git clone https://github.com/velocidai/eeseemetrics.git
cd eeseemetrics
cp server/.env.example server/.env
# Edit server/.env — at minimum set BETTER_AUTH_SECRET to any random string
```

**2. Start the infrastructure** (PostgreSQL, ClickHouse, Redis)

```bash
docker compose up -d postgres clickhouse redis
```

**3. Run database migrations**

```bash
cd server && npm install && npm run db:push
```

**4. Start the server**

```bash
cd server && npm run dev
# Runs on http://localhost:3001
```

**5. Start the client** (in a new terminal)

```bash
cd client && npm install && npm run dev
# Runs on http://localhost:3002
```

**6. Start the docs/marketing site** (optional)

```bash
cd docs && npm install && npm run dev
# Runs on http://localhost:3003
```

**Environment variables:** See `server/.env.example` for all available options. Most are optional for local development — you only need the database credentials and `BETTER_AUTH_SECRET`.

**AI features** (reports, anomaly detection) require an `OPENROUTER_API_KEY`. Set `CLOUD=true` to enable billing and tier gating.

---

## Project Structure

```
client/       Next.js frontend (port 3002)
server/       Fastify backend (port 3001)
docs/         Marketing and documentation site (port 3003)
monitor-agent/ Uptime monitoring agent (deploy separately)
```

---

## Code Conventions

- TypeScript strict mode throughout
- React functional components, minimal `useEffect`
- Fastify + Drizzle ORM on the backend, Zod for validation
- Follow existing patterns in the file you're editing
- Keep PRs focused on a single change

---

## Bugs and Ideas

- **Bug?** [Open an issue](https://github.com/velocidai/eeseemetrics/issues) with steps to reproduce
- **Feature idea?** [Start a discussion](https://github.com/velocidai/eeseemetrics/discussions)
- **Question?** Email [hello@eeseemetrics.com](mailto:hello@eeseemetrics.com)

---

Thank you for helping make Eesee Metrics better.

— The Eesee Metrics Team
