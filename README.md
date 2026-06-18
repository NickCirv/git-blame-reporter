<div align="center">

# git-blame-reporter

**Ownership maps, churn kings, and dev accountability — straight from `git blame`**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue?labelColor=0B0A09)](LICENSE)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?labelColor=0B0A09)](package.json)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen?labelColor=0B0A09)](package.json)

</div>

## Install

```bash
npx github:NickCirv/git-blame-reporter
```

## Usage

```bash
# Full blame analysis of the current repo
npx github:NickCirv/git-blame-reporter

# Focus on one contributor, last 6 months
npx github:NickCirv/git-blame-reporter --author "Nick" --since "6 months ago"

# Blame a single file, JSON output
npx github:NickCirv/git-blame-reporter --file src/index.js --format json | jq '.ownership'
```

| Flag | Description |
|------|-------------|
| `--author, -a <name>` | Filter to one contributor (partial match) |
| `--file, -f <path>` | Blame a specific file only |
| `--since, -s <date>` | Limit to commits since date (e.g. `"6 months ago"`) |
| `--top, -t <N>` | Show top N contributors (default: 10) |
| `--format <json\|table>` | Output format (default: `table`) |
| `--version, -v` | Show version |

## What it does

Runs `git blame --line-porcelain` across every tracked text file and produces three reports: **code ownership** (surviving lines + files owned per author), **churn** (deleted-to-added ratio, flags "Ghost Writers"), and **bug fixers** (commits matching fix/revert/hotfix patterns). Each top contributor gets a label — Code Hoarder, Ghost Writer, Immortal, or Firefighter — based on their stats. Works entirely offline against the local git history; no tokens, no network calls.

---
<sub>Zero dependencies · Node 18+ · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
