# Preflight

Preflight is a pre-signature privacy simulator for STRK20 on Starknet — before you sign a transaction touching the shielded pool, it shows what stays publicly visible, your anonymity-set size, and amount/timing correlation risk.

Built for the **STRK20 Private Sprint hackathon**, Preflight addresses **IDEA-25 — Transaction privacy simulator**. It is a privacy-analysis tool, not a mixer: it does not move funds, execute swaps, or provide privacy by itself.

> **Status: Day 1 — scaffold only**

There is no STRK20, Starknet, calldata, indexing, or scoring logic in this version. The repository currently provides only the typed application and package boundaries that later development days will fill in.

## Repository structure

```text
preflight-strk20/
├── README.md
├── LICENSE
├── .env.example
├── .gitignore
├── package.json
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
│       │   ├── calldata/.gitkeep
│       │   ├── indexer/.gitkeep
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

## License

MIT
