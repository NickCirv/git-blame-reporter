# git-blame-reporter — research record

## Revision and scope

- Repository: [NickCirv/git-blame-reporter](https://github.com/NickCirv/git-blame-reporter)
- Commit: `1375e27edc3f5f910086aa5aa2931582b0e2fdda`
- Tree: `af7c9e1a6a69f0ed478bf7cae2de6066b1aa4733`
- Captured: 6 of 6 eligible text files (all eligible text files).
- Recursive tree truncated: `False`.
- Runtime verification: **unverified**; no repository code, installation or test command was executed.

The captured file inventory is broader than the semantic review. Authoring inspected package metadata, entrypoint/argument handling and implementation paths relevant to the claims below, plus test declarations. This is documentation research, not a line-by-line security audit. Generated/binary artifacts, lockfiles and file types outside the acquisition filter were not inspected.

## Claim and evidence

| Claim | Pinned evidence | Status |
| --- | --- | --- |
| Runtime requirement and executable mapping | [package.json](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/package.json) | verified in manifest; installation unverified |
| Summarize current line attribution and selected history signals in a Git repository. | [implementation](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/index.js) | partially verified by static implementation review |
| Operational limits and side effects | [implementation](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/index.js) and source map in [reference](REFERENCE.md) | partially verified; runtime unverified |
| Test command definition | [package.json](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/package.json) | verified as a declaration only |

## Findings carried into the rewrite

Line ownership and commit-message labels are incomplete proxies for knowledge or contribution. The --since filter affects history-derived metrics; do not interpret the whole report as a precise employment or productivity measure.

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

## Documentation inventory and disposition

| Existing document | Disposition |
| --- | --- |
| [README.md](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/README.md) | Rewritten overview; historical copy remains at this pinned URL. |

New supporting documents: `docs/REFERENCE.md` and `docs/RESEARCH.md`. No original source or protected legal/security file was changed.

## Protected-file evidence

- `LICENSE` SHA-256 `68729cab364d82364078b08d8580ccfa51dc69c81a7d64e8d8d47a1da6c9349d`.

## Remaining verification

Clean installation, useful-command execution, malformed input, side-effect boundaries, platform compatibility and end-to-end tests remain unverified. Package-registry availability and live API destinations were not checked. No performance, customer-adoption, compliance or production-readiness claim is made.

## Captured evidence index

- [LICENSE](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/LICENSE) · blob `05b804beeec7d1a6c933d087387ba4adf6463d93`.
- [README.md](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/README.md) · blob `58640b9465f5da8ac86cf1a650021b841206e126`.
- [package.json](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/package.json) · blob `1e838d723fff923bbc2d36505bbb55014f1f26eb`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/.github/workflows/ci.yml) · blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [index.js](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/index.js) · blob `542e3d8bab25500199fe42d88285a583ee8ef8b2`.
- [test/smoke.test.js](https://github.com/NickCirv/git-blame-reporter/blob/1375e27edc3f5f910086aa5aa2931582b0e2fdda/test/smoke.test.js) · blob `ebbccaaf2583b4850575f835313e4b0afd21bff7`.

## Tree files outside the captured text set

These paths were mapped but their contents were not acquired in this research pass:

- `banner.svg`
