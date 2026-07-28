# app-fiap-videos-notifier

Async worker service: sends e-mail notifications in response to video processing events.

## Responsibilities

- On `VideoProcessingRequested` — acknowledgement e-mail with status link
- On `VideoProcessingCompleted` — success e-mail with download link
- On `VideoProcessingFailed` — failure e-mail with error details

## Architecture

### Role in the platform

The notifier is an **async worker** for side-effect delivery only. It listens for processing events and sends transactional e-mails — no outbox, no object storage.

```mermaid
graph LR
    RMQ["RabbitMQ"]
    Notifier["Notifier :3002"]
    PG[("fiap_videos_notifier")]
    SMTP["SMTP / MailHog"]

    RMQ -- "Requested / Completed / Failed" --> Notifier
    Notifier --> PG
    Notifier --> SMTP
```

### Notification flow

| Event | E-mail |
|-------|--------|
| `VideoProcessingRequested` | Acknowledgement with status page link |
| `VideoProcessingCompleted` | Success with download link |
| `VideoProcessingFailed` | Failure with error details |

Each handler uses the **inbox** (`processed_events`) so duplicate events do not send duplicate e-mails. Status and download URLs are built from `APP_STATUS_URL`.

### Hexagonal layout

```
src/
├── core/
│   ├── domain/          # Ports, StatusUrlService, envelope validators
│   └── application/     # NotifyProcessing* use cases
└── adapter/
    └── infra/           # Drizzle inbox, RabbitMQ subscribers, Nodemailer, health/metrics
```

Wiring: `src/adapter/infra/http/composition-root.ts`.

### Database (`fiap_videos_notifier`)

| Table | Purpose |
|-------|---------|
| `processed_events` | Inbox deduplication only |

### Messaging

Exchange: `fiap-videos.events` (topic). Queue pattern: `fiap-videos.notifier.{eventType}`.

| Direction | Events |
|-----------|--------|
| Consumes | `VideoProcessingRequested`, `VideoProcessingCompleted`, `VideoProcessingFailed` |
| Publishes | — |

### Dependencies

| Dependency | Usage |
|------------|-------|
| PostgreSQL | Inbox (`processed_events`) |
| RabbitMQ | Event bus |
| SMTP | E-mail delivery (MailHog locally, SES or other in production) |

## Run locally

### Full stack

```bash
cd ../app-fiap-videos-infra/docker
docker compose up --build
```

MailHog UI: http://localhost:8025

### This service only

```bash
docker compose up --build
```

Starts notifier + Postgres (`:5432`) + MailHog (`:8025`). Requires shared RabbitMQ from infra (`docker compose up rabbitmq -d` in `app-fiap-videos-infra/docker`).

### Development server (`yarn start:dev`)

**1. Start infrastructure** (shared Postgres + **single RabbitMQ** + MailHog):

```bash
cd ../app-fiap-videos-infra/docker
docker compose up postgres rabbitmq mailhog -d
```

Or notifier-only Postgres + shared broker:

```bash
cd ../app-fiap-videos-infra/docker && docker compose up rabbitmq mailhog -d
cd ../app-fiap-videos-notifier && docker compose up postgres -d
```

**2. Configure & run:**

```bash
cp .env.example .env
yarn install
yarn db:migrate
yarn start:dev
```

Ensure `.env` uses `localhost:5432` for Postgres, `5673` for RabbitMQ, and `1025` for SMTP. E-mails: http://localhost:8025

`yarn start:dev` runs `prestart:dev`, which starts this service's Postgres container (`fiap_videos_notifier` is created automatically on first boot).

## HTTP (operations)

| Route | Purpose |
|-------|---------|
| `/health/live`, `/health/ready` | Probes |
| `/metrics` | Prometheus |
| `/api/docs` | Ops Swagger |

## Messaging

| Direction | Events |
|-----------|--------|
| Consumes | `VideoProcessingRequested`, `VideoProcessingCompleted`, `VideoProcessingFailed` |

Uses **inbox** for idempotent consumption (no outbox — read-only side effect).

## Environment

See [`.env.example`](./.env.example). Key vars: `DATABASE_URL`, `RABBITMQ_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, `APP_STATUS_URL`.

## Tests & CI

```bash
yarn lint:ci
yarn typecheck
yarn test:unit
yarn test:cov
yarn test:integration       # requires Postgres (see script below)
yarn build
```

Run integration tests with a temporary Postgres container:

```bash
./scripts/run-integration-tests.sh
```

Or with your own database:

```bash
export DATABASE_URL=postgresql://fiap:fiap@localhost:5434/fiap_videos_notifier_test
yarn db:migrate
yarn test:integration
```

> Dev Compose uses Postgres on port `5432`. Integration tests default to port `5434` so they do not clash with a running dev database. See [app-fiap-videos-infra/README-database.md](../app-fiap-videos-infra/README-database.md).

GitHub Actions runs `build`, `lint`, `type-check`, `test-unit`, `test-integration`, `security-audit`, and a `ci-success` gate on every push and pull request to `main`.

## Infrastructure

Local Docker Compose, Prometheus, Grafana, and Kubernetes manifests live in [`app-fiap-videos-infra`](../app-fiap-videos-infra).
