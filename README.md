# app-fiap-videos-notifier

Async worker service: sends e-mail notifications in response to video processing events.

## Responsibilities

- On `VideoProcessingRequested` — acknowledgement e-mail with status link
- On `VideoProcessingCompleted` — success e-mail with download link
- On `VideoProcessingFailed` — failure e-mail with error details

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
yarn build
```

GitHub Actions runs `build`, `lint`, `type-check`, `test-unit`, `security-audit`, and a `ci-success` gate on every push and pull request to `main`.

## Infrastructure

Local Docker Compose, Prometheus, Grafana, and Kubernetes drafts live in [`app-fiap-videos-infra`](../app-fiap-videos-infra).

## Architecture

Hexagonal layout under `src/` — notification use cases in `core/application`, Nodemailer adapter in `adapter/infra`.  
Wiring in `src/adapter/infra/http/composition-root.ts`.
