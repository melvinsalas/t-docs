# PDF Manager Worker

This repository contains a Cloudflare Worker that manages PDF documents. The project stores uploaded files in R2, keeps searchable metadata in D1, and exposes a small HTTP API consumed by a static frontend.

## Features
- Upload PDFs alongside metadata such as year, description, and tags.
- List documents with optional filters and cursor-based pagination.
- Fetch metadata for a single document and stream the file directly from R2.
- Update or delete existing entries while keeping tag indexes in sync.
- Includes a minimal static UI under `public/` for quick testing.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) ≥ 18
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) ≥ 3
- An R2 bucket and D1 database provisioned in your Cloudflare account

### Clone and dependencies
```bash
git clone <your-fork-url>
cd t-docs
npm install
```

## Local Development

### 1. Configure Wrangler
Update `wrangler.toml` with your own bucket IDs, D1 database IDs, and KV namespace if you plan to use it. For quick local testing you can keep the defaults, but remember to replace placeholder IDs before deploying.

### 2. Prepare the database
```bash
# create the database (only once)
wrangler d1 create pdfmeta

# apply migrations locally
wrangler d1 migrations apply pdfmeta --local
```

### 3. Run the worker
```bash
npx wrangler dev
```
This command starts the Worker in local mode and exposes the API at `http://127.0.0.1:8787` by default.

### 4. Serve the static frontend (optional)
```bash
npx serve public -l 8080
```
Open `http://localhost:8080` to interact with the upload form and document list. Adjust `ALLOWED_ORIGINS` in `src/config.ts` so the browser can reach the worker without CORS issues.

## Deployment

Once your configuration matches production resources, deploy with:
```bash
wrangler deploy
```

## Contributing

We welcome improvements and bug fixes! To keep the project healthy:
1. **Discuss first** – If you plan large changes, open an issue to share the proposal.
2. **Follow the style** – TypeScript source lives under `src/` and is organised by feature. New modules should include succinct comments so other maintainers understand intent quickly.
3. **Add tests or manual steps** – Document how you verified the behaviour (local dev server, migrated database, etc.).
4. **Keep commits focused** – One logical change per commit helps reviewers. Reference related issues in your commit messages when relevant.
5. **Lint and type-check** – Run your preferred tooling before submitting a PR to catch regressions early.

Thank you for contributing to PDF Manager Worker!
