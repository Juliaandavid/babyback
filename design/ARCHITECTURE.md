# SYSTEM ARCHITECTURE

## 1. System Overview

### Vision
A 360-degree healthcare application focused on pregnancy and childhood tracking, providing scientific explanations and progress monitoring for mothers.

### Core Philosophy: The Two-Sided Architecture
The application is built on a "Database-First" approach where business logic is split into two distinct domains:
1.  **The Graph Side (Primary):** Heavy reliance on PostgreSQL features (Views, Materialized Views, PL/pgSQL Functions) exposed automatically via PostGraphile.
2.  **The Service Side (Secondary):** A Serverless layer that handles complex external integrations, file processing, and logic that cannot live inside the database.

## 2. Technology Stack

*   **Runtime Environment:** Bun
*   **Language:** TypeScript
*   **Web Framework:** Fastify (wrapped for Serverless)
*   **Deployment:** Firebase Functions (Serverless)
*   **API Gateway / GraphQL Engine:** PostGraphile (v4)
*   **Primary Database (Relational):** Supabase (PostgreSQL)
    *   *Usage:* User profiles, pregnancy milestones, health logs, app state.
*   **Static Content Store (NoSQL):** Firebase Firestore
    *   *Usage:* "Scientific View" content, articles, standard development milestones.
*   **Authentication:** PostGraphile Internal JWT System + RLS (Row Level Security).

## 3. Architectural Patterns

### The Graph Side (PostGraphile)
*   **Schema-Driven Development:** The database schema *is* the API.
*   **Security:** Row Level Security (RLS) policies defined in SQL enforce data access.
*   **Logic:**
    *   `Views`: For formatting data for the UI.
    *   `Functions`: For RPC-style actions (mutations).
    *   `Materialized Views`: For complex aggregations.

### The Service Side (Fastify on Firebase Functions)
Follows a **Layered Architecture** with a Provider pattern to abstract external dependencies.

*   **Controllers:** Handle incoming HTTP requests (webhooks, custom endpoints).
*   **Services:** implement business logic that requires coordination between providers or complex calculation.
*   **Providers:** Classes implementing interfaces to interact with external resources.
    *   *Example:* `FirestoreProvider` implements `IContentProvider`.

## 4. Project Structure

```text
/
├── .agent/
│   ├── methodology.md          # AgentsWay operational protocol
│   └── no-hallucination.md     # Engineering protocols for AI
├── design/
│   └── ARCHITECTURE.md         # This documentation
├── package.json                # Project dependencies and scripts (Bun)
├── tsconfig.json               # TypeScript configuration
├── .gitignore
├── db/                         # DATABASE SIDE
│   ├── design/                 # Database schema documentation (eer.puml)
│   ├── migrations/             # SQL migrations
│   ├── schema/                 # SQL reference files (Views/Functions)
│   └── seeds/                  # Development data
└── src/                        # SOURCE CODE
    ├── index.ts                # Firebase Functions entry point
    ├── app.ts                  # Fastify Application setup
    ├── config/                 # Environment configuration
    ├── plugins/                # Fastify plugins
    └── modules/                # Service Modules
        └── [module_name]/      # e.g., 'scientific-content'
            ├── [module].controller.ts
            ├── [module].service.ts
            ├── interfaces/     # Provider Interfaces
            └── providers/      # Implementations
```

## 5. Data Strategy

*   **Relational Data (Supabase):**
    *   Strictly typed.
    *   Foreign key constraints.
    *   Real-time subscriptions via Supabase/PostGraphile.
*   **Scientific Content (Firestore):**
    *   Semi-structured data (Articles, HTML content, media links).
    *   Fetched via the "Service Side" and exposed via custom GraphQL resolvers or REST endpoints if needed.

## 6. Security & Authorization

*   **Authentication:** JWT tokens issued by PostGraphile.
*   **Authorization:**
    *   **Database:** PostgreSQL Roles and RLS policies.
    *   **Service:** Fastify hooks to validate JWTs before processing requests.
