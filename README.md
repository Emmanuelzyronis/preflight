# Preflight

Preflight is a pre-signature privacy simulator for STRK20 on Starknet — before you sign a transaction touching the shielded pool, it shows what stays publicly visible, your anonymity-set size, and amount/timing correlation risk.

Built for the **STRK20 Private Sprint hackathon**, Preflight addresses **IDEA-25 — Transaction privacy simulator**. It is a privacy-analysis tool, not a mixer: it does not move funds, execute swaps, or provide privacy by itself.

> **Status: Day 3 -- chain indexer online, scanning STRK20 pool events.**

The API and SDK hook now expose read-only simulation boundaries. Signing, broadcasting, proving, and wallet/viewing-key handling remain intentionally out of scope.

## Repository structure

```text
preflight-strk20/
├── README.md
├── LICENSE
├── .env.example
├── .gitignore
├── package.json
├── docker-compose.yml
├── tsconfig.base.json
├── .github/workflows/ci.yml
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ReportCard.tsx
│   │   │   │   ├── DiffView.tsx
│   │   │   │   ├── RiskBadge.tsx
│   │   │   │   └── ConnectWallet.tsx
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx
│   │   │   │   └── Report.tsx
│   │   │   ├── lib/
│   │   │   │   └── api-client.ts
│   │   │   ├── App.tsx
│   │   │   ├── index.css
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── routes/
│       │   │   ├── simulate.ts
│       │   │   ├── report.ts
│       │   │   └── health.ts
│       │   ├── calldata/
│       │   ├── indexer/
│       │   │   ├── db.ts
│       │   │   ├── queries.ts
│       │   │   ├── scanner.ts
│       │   │   ├── schema.sql
│       │   │   └── sync.ts
│       │   └── server.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── scoring/
│   │   ├── src/index.ts
│   │   ├── test/placeholder.test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── sdk-hook/
│   │   ├── src/index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared-types/
│       ├── src/index.ts
│       ├── package.json
│       └── tsconfig.json
├── scripts/
│   └── demo-wallet/.gitkeep
└── test/
```

## Getting started

Requirements: Node.js 22 and npm 9 or newer.
The Privacy SDK is published on GitHub Packages. Configure the `@starkware-libs` npm scope and a read-packages token before installing; never put that token in `.env` or commit it to this repository.

Start Postgres for the indexer with `docker compose up -d`, then configure `DATABASE_URL`, `RPC_URL`, and `STRK20_POOL_ADDRESS` from `.env.example`.

The API applies `apps/api/src/indexer/schema.sql` automatically on boot. To apply it manually:

```bash
psql "$DATABASE_URL" -f apps/api/src/indexer/schema.sql
```

```bash
npm install
npm run dev
```

The empty Vite application is served at `http://localhost:5173`. The Fastify API is served at `http://localhost:3001`; `GET /health` returns:

```json
{"status":"ok"}
```

## Checks

```bash
npm run typecheck
npm run lint
npm test
```

## Known Vulnerabilities

`npm audit` currently reports 8 findings, all transitive through development and test tooling. `starknet-devnet` includes a `decompress` dependency with no upstream fix available, while the Vite/esbuild development-server issue requires a breaking major-version upgrade. None of these findings are in the runtime path shipped to users. Revisit this inventory after the sprint deadline.

## License

MIT
