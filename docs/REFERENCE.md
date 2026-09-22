# git-blame-reporter — command reference

[Overview](../README.md) · [Research record](RESEARCH.md)

Describes revision `1375e27edc3f5f910086aa5aa2931582b0e2fdda`. Commands are source-inspected; no execution results are asserted.

## Workflow

Combines porcelain blame output with churn and commit-message patterns, then produces contributor and ownership summaries. Supports author, file, date and top-count filters.

Requires Git and a local repository with the relevant history. Commands are source-inspected, not executed in this review.

```bash
node index.js --file README.md --format json
```

## Commands and controls

| Control | Behavior in the inspected implementation |
| --- | --- |
| `--file PATH` | Limit blame to a file |
| `--author TEXT` | Filter contributor display |
| `--since DATE` | Filter history-derived metrics |
| `--format json` | Emit structured ownership data |

## Interpretation and side effects

Line ownership and commit-message labels are incomplete proxies for knowledge or contribution. The --since filter affects history-derived metrics; do not interpret the whole report as a precise employment or productivity measure.

## Implementation reference

- [package.json](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/package.json)
- [index.js](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/index.js)
- [test/smoke.test.js](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/test/smoke.test.js)
