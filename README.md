<p align="center">
  <img src="client/src/app/icon.svg" height="60" alt="Eesee Metrics">
  <h3 align="center">Eesee Metrics</h3>
  <p align="center">Privacy-first web analytics with AI insights, anomaly detection, and MCP.</p>
</p>

<p align="center">
    <a href="https://eeseemetrics.com" target="_blank">Website</a> ·
    <a href="https://app.eeseemetrics.com" target="_blank">Cloud</a> ·
    <a href="https://eeseemetrics.com/docs" target="_blank">Docs</a> ·
    <a href="https://github.com/velocidai/eeseemetrics/blob/main/CONTRIBUTE.md" target="_blank">Contributing</a>
</p>

**Eesee Metrics** is a privacy-first web analytics platform with built-in AI reports, anomaly detection, and MCP server support. Track sessions, funnels, retention, and errors — no cookies, no consent banners, no GDPR headaches.

<hr>

## Getting Started

**Cloud (hosted)** — 7-day free trial at [eeseemetrics.com](https://eeseemetrics.com). No setup required.

**Self-hosted** — run on your own infrastructure with Docker:

```bash
git clone https://github.com/velocidai/eeseemetrics.git
cd eeseemetrics
cp server/.env.example server/.env
# Edit server/.env with your config
docker compose -f docker-compose.cloud.yml up -d
```

See the [self-hosting docs](https://eeseemetrics.com/docs/self-hosting) for full configuration details.

<hr>

## Features

**Analytics**
- Sessions, pageviews, bounce rate, session duration — real-time
- Session replays
- Goals, funnels, user journeys, retention cohorts
- User profiles and identification
- Web vitals and JavaScript error tracking
- Google Search Console integration
- Country → region → city with map visualisation
- Advanced filtering across 15+ dimensions
- Custom events with JSON properties
- Public dashboards and private sharing links

**AI & Automation**
- **AI reports** — weekly/monthly/quarterly/yearly plain-English summaries per site
- **Anomaly detection** — automatic alerts when traffic or conversions move unexpectedly
- **MCP server** — connect Claude, Cursor, or any MCP-compatible AI to your analytics data (21 tools)

**Uptime Monitoring**
- HTTP and TCP monitors with multi-region support
- Incident tracking, status pages, email/Slack/Discord alerts

<hr>

## Comparison

| Feature | Eesee Metrics | GA4 | Plausible | Umami |
| ------- | :-----------: | :-: | :-------: | :---: |
| Privacy-first / Cookieless | ✅ | ❌ | ✅ | ✅ |
| Open source | ✅ | ❌ | ✅ | ✅ |
| Self-hostable | ✅ | ❌ | ✅ | ✅ |
| AI reports | ✅ | ❌ | ❌ | ❌ |
| Anomaly detection | ✅ | ❌ | ❌ | ❌ |
| MCP server | ✅ | ❌ | ❌ | ❌ |
| Session replays | ✅ | ❌ | ❌ | ❌ |
| Funnels | ✅ | ✅ | ✅ | ❌ |
| Retention analysis | ✅ | ✅ | ❌ | ❌ |
| Error tracking | ✅ | ❌ | ❌ | ❌ |
| Uptime monitoring | ✅ | ❌ | ❌ | ❌ |

<hr>

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Shadcn UI, TanStack Query
- **Backend**: Fastify, Drizzle ORM (PostgreSQL), ClickHouse
- **Queue**: BullMQ + Redis
- **AI**: OpenRouter (configurable model and provider)
- **Protocol**: MCP (Model Context Protocol)

<hr>

## License

AGPL-3.0 — see [LICENSE](LICENSE) for details.

The AGPL license means you can self-host and modify Eesee Metrics freely. If you run a modified version as a network service, you must make your source changes available under the same license.
