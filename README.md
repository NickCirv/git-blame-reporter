![git-blame-reporter — Nicholas Ashkar repository collection](assets/nicholas-ashkar/banner.png)

# git-blame-reporter

Summarize current line attribution and selected history signals in a Git repository.


<a id="usage"></a>

## What it does

Combines porcelain blame output with churn and commit-message patterns, then produces contributor and ownership summaries. Supports author, file, date and top-count filters. See the pinned [implementation](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/index.js).


<a id="install"></a>

## Quickstart

Node requirement from the inspected manifest: **`>=20`**. Requires Git and a local repository with the relevant history. Commands are source-inspected, not executed in this review.

The following example is **source-inspected, not executed**. It uses a pinned checkout; npm package publication is not assumed. Replace project paths or provide the stated input fixtures before running it.

```bash
git clone https://github.com/NickCirv/git-blame-reporter.git
cd git-blame-reporter
git checkout 1375e27edc3f5f910086aa5aa2931582b0e2fdda
npm install --ignore-scripts
node index.js --file README.md --format json
```

Dependencies are installed with lifecycle scripts disabled in this recipe. Read the package scripts before enabling any lifecycle step required by your environment.

## Usage and reference

`git-blame-reporter` | `blame-report` are the executable names declared by the package. [Command reference](docs/REFERENCE.md) covers source-backed options and entry points.

| Control | Behavior in the inspected implementation |
| --- | --- |
| `--file PATH` | Limit blame to a file |
| `--author TEXT` | Filter contributor display |
| `--since DATE` | Filter history-derived metrics |
| `--format json` | Emit structured ownership data |

## Limits and operational notes

Line ownership and commit-message labels are incomplete proxies for knowledge or contribution. The --since filter affects history-derived metrics; do not interpret the whole report as a precise employment or productivity measure.

## Development

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

| Script | Declared command |
| --- | --- |
| `test` | `node --test` |

Work from the pinned source, keep changes focused, and reproduce the affected behavior with a small fixture before proposing a change. Existing contribution and security policies remain authoritative where present.

## Research and status

[Research record](docs/RESEARCH.md) identifies the inspected revision, source evidence, documentation disposition and verification gaps. Static inspection supports the descriptions here; runtime behavior, dependency installation and current hosted services remain unverified.

## License and author

[License](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/LICENSE)

[Nicholas Ashkar](https://nicholashkar.com) · Applied AI, systems and consulting.
