# Copilot Coding Agent Instructions

## Repository Role

`al-folio` is a **starter kit** for the v1 pluginized architecture.

- Runtime/theme internals are gem-owned (`al_folio_core`, `al_folio_distill`, `al_cookie`, other `al-*` plugins).
- This repo owns starter wiring, sample content, docs, integration tests, and visual regression tests.

## Ownership Boundaries

Follow [`BOUNDARIES.md`](../BOUNDARIES.md) strictly.

- Starter (`al-folio`):
  - integration tests
  - visual regression tests
  - docs and starter config
- Gem repos:
  - component/unit correctness tests
  - runtime asset packaging/contract tests
  - feature-specific logic

Do not reintroduce gem-owned component runtime files into this starter unless intentionally overriding behavior.

## Core Stack

- Jekyll (Ruby)
- Node only for tooling (`prettier`, Playwright test runtime)
- No starter-local Tailwind build pipeline in v1

## Starter Layout (high-signal paths)

- `_config.yml` - starter wiring, plugin list, feature flags
- `_data/`, `_pages/`, `_posts/`, `_projects/`, `_news/` - starter content
- `assets/` - starter-owned content assets
- `test/visual/` - visual parity suite (Playwright)
- `test/integration_*.sh` - cross-gem integration checks
- `test/style_contract.js` - starter contract checks only
- `.github/workflows/` - CI for starter integration and visual checks

## Local Validation

Common checks for starter changes:

```bash
npm ci
npm run lint:prettier
npm run lint:style-contract
./bin/setup-python-deps
bundle exec jekyll build
bash test/integration_comments.sh
bash test/integration_plugin_toggles.sh
bash test/integration_distill.sh
bash test/integration_bootstrap_compat.sh
bash test/integration_upgrade_cli.sh
```

Visual checks:

```bash
npx playwright install chromium webkit
npm run test:visual
```

## CI Expectations

When editing starter behavior, keep these workflows aligned:

- `unit-tests.yml` (integration + starter contract lint)
- `visual-regression.yml` (visual parity)
- `upgrade-check.yml` (upgrade audit contract)
- `deploy.yml` (starter deploy build)

Do not add no-op npm build scripts back into `package.json`.

## Upgrade and Migration

Use upgrade CLI for migration checks:

```bash
bundle exec al-folio upgrade audit
bundle exec al-folio upgrade apply --safe
bundle exec al-folio upgrade report
```

Generated report path: `al-folio-upgrade-report.md`.

## Editing Guidance

- Prefer starter wiring/config/content changes in this repo.
- For runtime/layout/style/pipeline fixes, route to the owning gem repo.
- Keep docs consistent with thin-starter architecture.
