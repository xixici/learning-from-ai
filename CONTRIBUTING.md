# Contributing to LFAI — Learning From AI

Thank you for your interest in contributing! This document covers everything you need to get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you agree to uphold a respectful and inclusive environment.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **VS Code** ≥ 1.90
- **Git**

### Setup

```bash
git clone https://github.com/xixici/learning-from-ai.git
cd learning-from-ai
npm install
```

### Running Locally

1. Open the project in VS Code:
   ```bash
   code .
   ```
2. Press `F5` to launch the **Extension Development Host** — a new VS Code window with L4AI loaded.
3. Make changes in `src/`, then reload the host window with `Ctrl+R`.

### Building

```bash
# Development build (with source maps)
npm run build

# Production build (minified, no source maps)
npm run package

# Type check only
npm run compile

# Package as installable VSIX
npm run package:vsix
```

---

## Development Workflow

### Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code |
| `dev` | Integration branch for features |
| `feat/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation changes |
| `chore/<name>` | Tooling, deps, CI updates |

### Typical Flow

```bash
git checkout -b feat/anki-export
# ... make changes ...
git commit -m "feat: add Anki .apkg export command"
git push origin feat/anki-export
# Open PR targeting `main`
```

---

## Project Structure

```
src/
├── extension.ts          # Entry point: activate(), deactivate()
├── types.ts              # Shared interfaces (LearningCard, DailyDigest, etc.)
├── collector/
│   ├── gitCollector.ts   # Git diff collection & noise filtering
│   └── selectionCollector.ts  # Active selection capture
├── engine/
│   ├── llmClient.ts      # Dual-channel LLM client & response parser
│   └── prompt.ts         # Extraction prompt engineering
├── storage/
│   └── noteManager.ts    # Markdown save & workspaceState cache
└── ui/
    └── sidebarProvider.ts  # WebviewViewProvider + HTML generation
```

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). Commits are linted in CI.

### Format

```
<type>(<optional-scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | Use for |
|------|---------|
| `feat` | New features |
| `fix` | Bug fixes |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code refactoring |
| `test` | Adding/fixing tests |
| `chore` | Build, CI, tooling changes |
| `perf` | Performance improvements |

### Examples

```bash
feat(engine): add streaming support for vscode.lm responses
fix(collector): handle empty git repo gracefully
docs: add Ollama configuration example to README
chore(ci): add release workflow for marketplace publish
```

---

## Pull Request Process

1. **Fork** the repository and create your branch from `main`.
2. Ensure your code **compiles without errors**: `npm run compile`
3. Ensure your code **builds successfully**: `npm run build`
4. Fill out the **PR template** completely — describe the change, motivation, and testing steps.
5. Link any related issues with `Closes #<issue-number>`.
6. PRs require at least **1 approving review** before merge.
7. All CI checks must pass before merging.

### PR Checklist

Before submitting, verify:
- [ ] Code compiles: `npm run compile`
- [ ] Production build works: `npm run package`
- [ ] VSIX can be generated: `npm run package:vsix`
- [ ] New configuration options are documented in README
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] Commit messages follow Conventional Commits

---

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml). Please include:
- VS Code version
- L4AI extension version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs (Help → Toggle Developer Tools → Console)

---

## Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml). A good feature request includes:
- The problem you're trying to solve
- Your proposed solution
- Why this would benefit other users
- Any alternatives you've considered

---

## Release Process *(Maintainers Only)*

1. Update `CHANGELOG.md` — move items from `[Unreleased]` to the new version section.
2. Bump version in `package.json`.
3. Commit: `chore: release v0.2.0`
4. Tag: `git tag v0.2.0 && git push origin v0.2.0`
5. The [release workflow](.github/workflows/release.yml) automatically builds and publishes the VSIX to GitHub Releases and VS Marketplace.