---
theme: seriph
layout: cover
highlighter: shiki
title: The Hands-Off Maintainer
---

# The Hands-Off Maintainer

Seamless NPM Releases with OIDC & Release Please

---
layout: center
---

# The Problem

- Forgotten changelogs
- Long-lived npm access tokens stored in CI
- Manual version bumps
- _"I'll publish it after lunch"_ (spoiler: you don't)

---
layout: section
---

# Part 1

Getting Versioning Right with Release Please

---

# Conventional Commits

Stop writing `fixes some bugs in some files`

```bash
chore: update github actions
feat: add feature to handle user authentication
fix: resolve bug in authentication flow
```

Breaking changes get a footer:

```bash
feat: redesign authentication API

BREAKING CHANGE: removed legacy callback support
```

---

# Squash and Merge

<br>

One PR → one commit → one clean conventional message

<br>

- Keeps git history readable
- Gives Release Please exactly one signal per feature/fix
- Forces a deliberate commit message at PR close time

---
layout: two-cols
layoutClass: gap-8
---

# Release Please Action

- GitHub Action or CLI
- No extra npm dependencies in your project
- Reads conventional commits → opens a **Release PR**
- Release PR = updated version + generated changelog
- On merge → GitHub Release is created automatically
- Not Node.js-only — any language or package manager

::right::

```yaml
- uses: googleapis/release-please-action@v4
  id: release
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    release-type: node
```

<br>

> Enable **"Allow GitHub Actions to create and approve pull requests"** in repo settings

---

# Retrofitting Existing Projects

No need to rewrite commit history — just drop in a manifest file:

```json
// .release-please-manifest.json
{ ".": "1.4.2" }
```

<br>

**Then:**
1. Close the first auto-generated PR manually
2. Start committing with conventional messages
3. Let Release Please handle the rest

---
class: text-sm
---

# Publish Workflow — Release Please Job

```yaml
name: Publish
on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      release_created: ${{ steps.release.outputs.release_created }}
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          release-type: node
```

---
layout: section
---

# Part 2

Secure Publishing with npm Trusted Publishing

---

# What is npm Trusted Publishing?

OIDC-based, passwordless authentication for npm

<br>

- **No** long-lived tokens stored in GitHub
- **No** 2FA prompts in CI/CD
- Works with GitHub Actions, GitLab CI/CD, CircleCI
- npm can verify the package came from your repo — **provenance**

<br>

> Tip: enable _"Require 2FA and disallow tokens"_ on npm for maximum security

---
layout: two-cols
layoutClass: gap-8
---

# Old Way

<br>

- Long-lived token stored in GitHub Secrets
- Token expires or leaks → outage
- Any maintainer can publish from their laptop
- No provenance — users must trust you blindly

::right::

# Trusted Publishing

<br>

- No stored secret, nothing to rotate
- Short-lived OIDC token, scoped to one workflow
- Publish only from CI — never from a laptop
- Verified provenance on npm

---

# Setting Up npm Trusted Publishing

npmjs.com → your package → **Settings → Trusted Publishers**

<br>

**Add a Trusted Publisher → GitHub Actions**

| Field | Value |
|---|---|
| Repository owner | `saintedlama` |
| Repository name | `passport-local-mongoose` |
| Workflow filename | `publish.yml` |

<br>

GitHub gets a short-lived OIDC token scoped to that exact repo and workflow.

---
class: text-sm
---

# Publish Workflow — npm Job

```yaml
publish:
  needs: release-please
  runs-on: ubuntu-latest
  if: ${{ needs.release-please.outputs.release_created }}
  permissions:
    id-token: write   # required for OIDC token
    contents: read
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 24
        registry-url: https://registry.npmjs.org
    - run: npm ci
    - run: npm publish --provenance --access public
```

---
layout: center
---

# The Full Picture

```
feat: add user auth support
  ↓  squash & merge
Release Please PR opens
  ↓  merge from your phone
GitHub Release created
  ↓  workflow triggers
npm publish --provenance
```

No tokens. No secrets. No stress.

---
layout: center
---

# Takeaways

<br>

**Conventional Commits** → structured release history, for free

**Release Please** → automated versioning and changelogs

**npm Trusted Publishing** → passwordless, provenance-backed publishing

<br>

_Merge a PR from your phone. Package ships to npm. Go to sleep._

---
layout: center
class: text-center
---

# Thank You

<br>

Questions?
