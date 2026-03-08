# Workforce Management Platform

![CI](https://github.com/al-sarah/workforce-management-platform/actions/workflows/ci.yml/badge.svg)

A full-stack distributed workforce management system built with .NET 10, React, TypeScript, PostgreSQL, MongoDB, RabbitMQ, and Docker.

---

## Architecture
```mermaid
graph TB
    User["👤 User (Browser)"]

    subgraph Frontend["Frontend Container (React + TypeScript)"]
        UI["React SPA (Vite + Ant Design)"]
    end

    subgraph API["API Container (.NET 10)"]
        REST["REST API (ASP.NET Core)"]
        AppLayer["Application Layer (Services)"]
        Repos["Repository Interfaces (Domain-Agnostic)"]
    end

    subgraph Worker1["Worker 1 Container (.NET)"]
        Consumer["MassTransit Consumers (Audit Log Writer)"]
    end

    subgraph Worker2["Worker 2 Container (Node.js)"]
        Cron["node-cron Scheduler (Report Generator)"]
    end

    subgraph Data["Data Layer"]
        PG[("PostgreSQL — Employees, Projects, Tasks")]
        MG[("MongoDB — Leave Requests, Audit Logs, Reports")]
    end

    subgraph Broker["Message Broker"]
        RMQ["RabbitMQ (MassTransit)"]
    end

    User --> UI
    UI -->|HTTP/REST| REST
    REST --> AppLayer
    AppLayer --> Repos
    Repos -->|EF Core| PG
    Repos -->|MongoDB Driver| MG
    AppLayer -->|Publish Events| RMQ
    RMQ -->|Subscribe| Consumer
    Consumer -->|Write Audit Logs| MG
    Cron -->|Query Stats| PG
    Cron -->|Write Reports| MG
```

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Backend API | .NET 10 + ASP.NET Core | Strongly typed, excellent EF Core support, familiar stack |
| Frontend | React 19 + TypeScript + Vite | Fast builds, type safety, component reusability |
| SQL Database | PostgreSQL | Best open-source relational DB, excellent .NET support via Npgsql |
| Document Database | MongoDB | Natural fit for embedded documents (leave approval history) |
| Message Broker | RabbitMQ + MassTransit | Simple setup, MassTransit abstracts broker details cleanly |
| Worker 1 | .NET Worker Service | Shares domain/infrastructure code with API, strong typing |
| Worker 2 | Node.js + node-cron | Lightweight scheduled jobs, excellent MongoDB/PostgreSQL drivers |
| UI Library | Ant Design | Comprehensive component library, professional data grid and forms |
| Infrastructure | Docker + Docker Compose | Single command setup, environment parity |
| CI/CD | GitHub Actions | Native GitHub integration, free for public repos |

---

## Why Two Databases?

**PostgreSQL** stores structured relational data where referential integrity matters:
- Employees belong to departments and hold designations
- Projects have many team members (many-to-many)
- Tasks belong to projects and are assigned to employees

**MongoDB** stores document-oriented data that benefits from embedded structures:
- Leave requests embed their full approval history inside one document — no joins needed to reconstruct the lifecycle
- Audit logs are immutable append-only records
- Summary reports are self-contained computed snapshots

---

## Why .NET for Worker 1 and Node.js for Worker 2?

**Worker 1 (.NET)** handles domain event processing — it shares the same `WFM.Domain` and `WFM.Infrastructure` projects as the API. Using .NET means zero duplication of domain models and MongoDB document types.

**Worker 2 (Node.js)** handles scheduled report aggregation — a simpler task that only needs to query two databases and write a document. Node.js with `node-cron` is lightweight and purpose-built for this kind of scheduled I/O work.

---

## Prerequisites

- Docker Desktop
- Git

---

## Running the Application
```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 2. Copy environment file
cp .env.example .env

# 3. Start everything
docker compose up --build
```

The first build takes 3-5 minutes. Subsequent starts are faster.

---

## Services & Ports

| Service | URL | Notes |
|---|---|---|
| Frontend | http://localhost:3000 | React SPA |
| API | http://localhost:8080 | REST API |
| Swagger | http://localhost:8080/swagger | API documentation |
| Health Check | http://localhost:8080/health | API health status (JSON) |
| RabbitMQ UI | http://localhost:15672 | Login: guest / guest |
| PostgreSQL | localhost:5432 | wfm / changeme |
| MongoDB | localhost:27017 | wfm / changeme |

---

## Environment Variables

All configuration is via environment variables. Copy `.env.example` to `.env`:

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_DB` | wfm | PostgreSQL database name |
| `POSTGRES_USER` | wfm | PostgreSQL username |
| `POSTGRES_PASSWORD` | changeme | PostgreSQL password |
| `POSTGRES_URI` | postgresql://wfm:changeme@postgres:5432/wfm | PostgreSQL connection string (Docker) |
| `MONGO_DATABASE` | wfm | MongoDB database name |
| `MONGO_USER` | wfm | MongoDB username |
| `MONGO_PASSWORD` | changeme | MongoDB password |
| `MONGODB_URI` | mongodb://wfm:changeme@mongo:27017/wfm?authSource=admin | MongoDB connection string (Docker) |
| `RABBITMQ_USER` | guest | RabbitMQ username |
| `RABBITMQ_PASSWORD` | guest | RabbitMQ password |
| `REPORT_INTERVAL_MINUTES` | 5 | How often Worker 2 generates reports |

---

## Seed Data

The application automatically seeds on first startup:
- 8 departments, 13 designations
- 52 employees with skills, avatars, and salary data
- 5 projects with tasks in various workflow states
- 60 leave requests with embedded approval histories

---

## Third-Party Libraries

**Backend**
| Library | Purpose |
|---|---|
| `Npgsql.EntityFrameworkCore.PostgreSQL` | PostgreSQL provider for EF Core |
| `MongoDB.Driver` | Official MongoDB .NET driver |
| `MassTransit.RabbitMQ` | RabbitMQ abstraction with retry, idempotency, consumer patterns |
| `Microsoft.AspNetCore.OpenApi` | OpenAPI support |

**Frontend**
| Library | Purpose |
|---|---|
| `antd` | UI component library — tables, forms, modals, layout |
| `axios` | HTTP client with interceptors |
| `react-router-dom` | Client-side routing |
| `recharts` | Charts for dashboard |
| `dayjs` | Lightweight date formatting |

**Worker 2**
| Library | Purpose |
|---|---|
| `node-cron` | Cron-style job scheduling |
| `mongoose` | MongoDB ODM for Node.js |
| `pg` | PostgreSQL client for Node.js |
| `winston` | Structured JSON logging |

---

## Known Limitations

- No authentication or authorization — all endpoints are public
- Worker 2 report generation requires at least one prior startup of the API to seed data before meaningful reports are generated
- No real-time notifications — leave approval status must be manually refreshed
- Frontend has no automated tests

---

## What I Would Add Given More Time

- JWT authentication with role-based access (Admin, Manager, Employee)
- Real-time notifications via SignalR for leave approvals
- E2E tests with Playwright covering core user flows
- Full-text search across employees and projects using PostgreSQL `tsvector`
- Live deployment on Railway or Render
- API versioning strategy beyond v1 prefix
