#!/usr/bin/env node

/**
 * git-blame-reporter
 * Who wrote this mess? Ownership maps, churn kings, and dev accountability reports.
 * Zero dependencies · Node 18+ · MIT
 */

import { execFileSync } from 'node:child_process';
import { extname } from 'node:path';
import { parseArgs } from 'node:util';

// ─── Constants ────────────────────────────────────────────────────────────────

const VERSION = '1.0.0';

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.bmp', '.webp', '.svg',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp4', '.mp3', '.wav', '.ogg', '.webm', '.avi', '.mov',
  '.zip', '.tar', '.gz', '.bz2', '.7z', '.rar',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.pyc', '.pyo', '.class', '.jar',
  '.lock', '.sum',
]);

const BATCH_SIZE = 20;
const MAX_FILE_LINES = 5000;

// ─── CLI Parsing ──────────────────────────────────────────────────────────────

function parseCliArgs() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help:    { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', short: 'v', default: false },
      author:  { type: 'string',  short: 'a' },
      file:    { type: 'string',  short: 'f' },
      since:   { type: 'string',  short: 's' },
      format:  { type: 'string',  default: 'table' },
      top:     { type: 'string',  short: 't', default: '10' },
    },
    allowPositionals: true,
  });
  return { ...values, top: parseInt(values.top, 10) || 10 };
}

// ─── Git Utilities ────────────────────────────────────────────────────────────

function git(...args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 50 * 1024 * 1024,
  });
}

function isGitRepo() {
  try { git('rev-parse', '--git-dir'); return true; } catch { return false; }
}

function getRepoRoot() {
  return git('rev-parse', '--show-toplevel').trim();
}

function getTrackedFiles() {
  const raw = git('ls-files').trim();
  return raw ? raw.split('\n').filter(Boolean) : [];
}

function isBinaryFile(filepath) {
  return BINARY_EXTENSIONS.has(extname(filepath).toLowerCase());
}

function getFileLineCount(filepath) {
  try {
    const content = git('show', `HEAD:${filepath}`);
    return content.split('\n').length;
  } catch { return 0; }
}

// ─── Blame Parsing ────────────────────────────────────────────────────────────

function blameFile(filepath) {
  try {
    const raw = git('blame', '--line-porcelain', '--', filepath);
    const lines = raw.split('\n');
    const entries = [];
    let current = {};

    for (const line of lines) {
      if (line.startsWith('author ')) {
        current.author = normalizeAuthor(line.slice(7).trim());
      } else if (line.startsWith('author-time ')) {
        current.authorTime = parseInt(line.slice(12).trim(), 10);
      } else if (line.startsWith('\t')) {
        if (current.author && current.authorTime !== undefined) {
          entries.push({ author: current.author, authorTime: current.authorTime });
        }
        current = {};
      }
    }
    return entries;
  } catch { return []; }
}

function normalizeAuthor(name) {
  return name.replace(/\s+/g, ' ').trim();
}

// ─── Churn Analysis ───────────────────────────────────────────────────────────

function computeChurn(sinceArg) {
  const churn = new Map();
  try {
    const args = ['log', '--stat', '--format=COMMIT:%an'];
    if (sinceArg) args.push(`--since=${sinceArg}`);
    const raw = git(...args);

    let currentAuthor = null;
    for (const line of raw.split('\n')) {
      if (line.startsWith('COMMIT:')) {
        currentAuthor = normalizeAuthor(line.slice(7).trim());
        if (!churn.has(currentAuthor)) churn.set(currentAuthor, { added: 0, deleted: 0 });
      } else {
        const match = line.match(/(\d+) insertions?\(\+\).*?(\d+) deletions?\(-\)/);
        if (match && currentAuthor) {
          const e = churn.get(currentAuthor);
          e.added += parseInt(match[1], 10);
          e.deleted += parseInt(match[2], 10);
        } else {
          const insMatch = line.match(/(\d+) insertions?\(\+\)/);
          if (insMatch && currentAuthor) churn.get(currentAuthor).added += parseInt(insMatch[1], 10);
          const delMatch = line.match(/(\d+) deletions?\(-\)/);
          if (delMatch && currentAuthor) churn.get(currentAuthor).deleted += parseInt(delMatch[1], 10);
        }
      }
    }
  } catch { /* non-fatal */ }
  return churn;
}

// ─── Bug Fixers ───────────────────────────────────────────────────────────────

function computeBugFixers(sinceArg) {
  const fixers = new Map();
  try {
    const args = ['log', '--format=%an\x1f%s'];
    if (sinceArg) args.push(`--since=${sinceArg}`);
    const raw = git(...args);
    const FIX_PATTERN = /\b(fix|bug|revert|hotfix|patch|repair|resolve|correct)\b/i;

    for (const line of raw.split('\n')) {
      const sep = line.indexOf('\x1f');
      if (sep === -1) continue;
      const author = normalizeAuthor(line.slice(0, sep));
      const subject = line.slice(sep + 1);
      if (FIX_PATTERN.test(subject)) {
        fixers.set(author, (fixers.get(author) || 0) + 1);
      }
    }
  } catch { /* non-fatal */ }
  return fixers;
}

// ─── Labels ───────────────────────────────────────────────────────────────────

function computeLabels(authors, authorFileMap, churn, bugFixers, longevitySum, longevityCount) {
  const labels = [];

  // Code Hoarder: most files owned
  const byFiles = [...authors].sort((a, b) =>
    (authorFileMap.get(b)?.size || 0) - (authorFileMap.get(a)?.size || 0)
  );
  if (byFiles[0] && authorFileMap.get(byFiles[0])?.size > 0) {
    labels.push({ author: byFiles[0], label: 'Code Hoarder', reason: `owns ${authorFileMap.get(byFiles[0]).size} files` });
  }

  // Ghost Writer: highest churn rate
  const churnArr = [...churn.entries()]
    .filter(([a]) => authors.includes(a))
    .map(([a, { added, deleted }]) => ({ author: a, rate: added > 0 ? deleted / added : 0 }))
    .sort((a, b) => b.rate - a.rate);
  if (churnArr[0] && churnArr[0].rate > 0.5) {
    labels.push({ author: churnArr[0].author, label: 'Ghost Writer', reason: `${Math.round(churnArr[0].rate * 100)}% churn rate` });
  }

  // Immortal: oldest average surviving lines
  const byAge = [...authors].sort((a, b) => {
    const avgA = longevityCount.get(a) > 0 ? longevitySum.get(a) / longevityCount.get(a) : 0;
    const avgB = longevityCount.get(b) > 0 ? longevitySum.get(b) / longevityCount.get(b) : 0;
    return avgB - avgA;
  });
  if (byAge.length > 0) {
    const ageDays = longevityCount.get(byAge[0]) > 0
      ? Math.round(longevitySum.get(byAge[0]) / longevityCount.get(byAge[0]) / 86400)
      : 0;
    if (ageDays > 30) {
      labels.push({ author: byAge[0], label: 'Immortal', reason: `avg code age: ${ageDays} days` });
    }
  }

  // Firefighter: most fix commits
  const topFixer = [...bugFixers.entries()]
    .filter(([a]) => authors.includes(a))
    .sort((a, b) => b[1] - a[1])[0];
  if (topFixer) {
    labels.push({ author: topFixer[0], label: 'Firefighter', reason: `${topFixer[1]} fix commits` });
  }

  return labels;
}

// ─── Core Analysis ────────────────────────────────────────────────────────────

async function analyzeRepo(opts) {
  const { author, file, since, top } = opts;

  if (!isGitRepo()) {
    console.error('Not a git repository. Run this from inside a git repo.');
    process.exit(1);
  }

  const root = getRepoRoot();
  process.chdir(root);

  // Collect files
  let files = getTrackedFiles();

  if (file) {
    files = [file];
  } else {
    files = files.filter(f => {
      if (isBinaryFile(f)) return false;
      const count = getFileLineCount(f);
      return count > 0 && count <= MAX_FILE_LINES;
    });
  }

  if (files.length === 0) {
    console.error('No trackable files found in this repository.');
    process.exit(1);
  }

  const blameEntries = [];
  const authorFileMap = new Map();

  process.stderr.write(`Analyzing ${files.length} files...\r`);

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    for (const f of batch) {
      const entries = blameFile(f);
      blameEntries.push(...entries);

      // File ownership: majority author (>=50%)
      const lineCounts = new Map();
      for (const e of entries) {
        lineCounts.set(e.author, (lineCounts.get(e.author) || 0) + 1);
      }
      const total = entries.length;
      for (const [auth, count] of lineCounts) {
        if (count / total >= 0.5) {
          if (!authorFileMap.has(auth)) authorFileMap.set(auth, new Set());
          authorFileMap.get(auth).add(f);
        }
      }
    }
  }

  process.stderr.write(' '.repeat(60) + '\r');

  // Aggregate per-author stats
  const survivingLines = new Map();
  const longevitySum = new Map();
  const longevityCount = new Map();
  const now = Math.floor(Date.now() / 1000);

  for (const { author: auth, authorTime } of blameEntries) {
    survivingLines.set(auth, (survivingLines.get(auth) || 0) + 1);
    longevitySum.set(auth, (longevitySum.get(auth) || 0) + (now - authorTime));
    longevityCount.set(auth, (longevityCount.get(auth) || 0) + 1);
  }

  const totalLines = [...survivingLines.values()].reduce((a, b) => a + b, 0);

  const churn = computeChurn(since);
  const bugFixers = computeBugFixers(since);

  // Filter + sort authors
  let authors = [...survivingLines.keys()];
  if (author) {
    const lc = author.toLowerCase();
    authors = authors.filter(a => a.toLowerCase().includes(lc));
  }
  authors.sort((a, b) => (survivingLines.get(b) || 0) - (survivingLines.get(a) || 0));
  const topAuthors = authors.slice(0, top);

  const labels = computeLabels(topAuthors, authorFileMap, churn, bugFixers, longevitySum, longevityCount);

  return {
    meta: {
      filesAnalyzed: files.length,
      totalSurvivingLines: totalLines,
      generatedAt: new Date().toISOString(),
      repo: root,
    },
    ownership: topAuthors.map(auth => {
      const lines = survivingLines.get(auth) || 0;
      const pct = totalLines > 0 ? Math.round((lines / totalLines) * 100) : 0;
      const filesOwned = authorFileMap.get(auth)?.size || 0;
      const avgAgeDays = longevityCount.get(auth) > 0
        ? Math.round(longevitySum.get(auth) / longevityCount.get(auth) / 86400)
        : 0;
      return { author: auth, lines, percent: pct, filesOwned, avgAgeDays };
    }),
    churn: [...churn.entries()]
      .filter(([a]) => !author || a.toLowerCase().includes(author.toLowerCase()))
      .map(([auth, { added, deleted }]) => ({
        author: auth,
        linesAdded: added,
        linesDeleted: deleted,
        churnRate: added > 0 ? Math.round((deleted / added) * 100) : 0,
      }))
      .sort((a, b) => b.churnRate - a.churnRate)
      .slice(0, top),
    bugFixers: [...bugFixers.entries()]
      .filter(([a]) => !author || a.toLowerCase().includes(author.toLowerCase()))
      .map(([auth, count]) => ({ author: auth, fixCommits: count }))
      .sort((a, b) => b.fixCommits - a.fixCommits)
      .slice(0, top),
    labels,
  };
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function bar(pct, width = 20) {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function pad(str, len) {
  const s = String(str);
  return s.length >= len ? s.slice(0, len) : s + ' '.repeat(len - s.length);
}

function renderTable(result) {
  const { meta, ownership, churn, bugFixers, labels } = result;
  const SEP = '━'.repeat(60);
  const out = [];

  out.push('');
  out.push(`git-blame-reporter · ${meta.filesAnalyzed} files analyzed · ${meta.totalSurvivingLines.toLocaleString()} surviving lines`);
  out.push(SEP);

  // Ownership
  out.push('');
  out.push('👑  Code Ownership');
  out.push('');
  for (const row of ownership) {
    const name = pad(row.author, 20);
    const pctStr = pad(`${row.percent}%`, 5);
    const b = bar(row.percent);
    const files = row.filesOwned > 0 ? `  (${row.filesOwned} files owned)` : '';
    const age = row.avgAgeDays > 0 ? `  avg age: ${row.avgAgeDays}d` : '';
    out.push(`  ${name} ${pctStr}  ${b}${files}${age}`);
  }

  // Churn
  if (churn.length > 0) {
    out.push('');
    out.push('🔥  Churn Kings (deleted / added ratio)');
    out.push('');
    for (const row of churn) {
      const name = pad(row.author, 20);
      const rate = pad(`${row.churnRate}%`, 6);
      const ghostTag = labels.find(l => l.author === row.author && l.label === 'Ghost Writer') ? '  "Ghost Writer"' : '';
      out.push(`  ${name} ${rate} churn${ghostTag}`);
    }
  }

  // Bug Fixers
  if (bugFixers.length > 0) {
    out.push('');
    out.push('🚒  Firefighters (fix/bug/revert commits)');
    out.push('');
    for (const row of bugFixers) {
      out.push(`  ${pad(row.author, 20)} ${row.fixCommits} fix commits`);
    }
  }

  // Labels
  if (labels.length > 0) {
    out.push('');
    out.push('🎖   Dev Labels');
    out.push('');
    for (const l of labels) {
      out.push(`  ${pad(l.author, 20)} → ${l.label}  (${l.reason})`);
    }
  }

  out.push('');
  out.push(SEP);
  out.push('');

  return out.join('\n');
}

function renderHelp() {
  return `
git-blame-reporter v${VERSION}
Who wrote this mess? Ownership maps, churn kings, and dev accountability.

Usage:
  npx git-blame-reporter [options]
  blame-report [options]

Options:
  --author, -a <name>       Focus on one contributor (partial match)
  --file, -f <path>         Blame a specific file only
  --since, -s <date>        Limit to commits since date (e.g. "6 months ago")
  --top, -t <N>             Show top N contributors (default: 10)
  --format <json|table>     Output format (default: table)
  --help, -h                Show this help
  --version, -v             Show version

Examples:
  npx git-blame-reporter
  npx git-blame-reporter --author "Nick"
  npx git-blame-reporter --since "6 months ago" --top 5
  npx git-blame-reporter --file src/index.js
  npx git-blame-reporter --format json | jq '.ownership'

Labels assigned:
  Code Hoarder   → owns 50%+ of the most files
  Ghost Writer   → highest code churn rate (wrote it, it got deleted)
  Immortal       → oldest average surviving line age
  Firefighter    → most commits with fix/bug/revert messages

Zero dependencies · Node 18+ · MIT · https://github.com/NickCirv/git-blame-reporter
`.trim();
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

async function main() {
  const opts = parseCliArgs();

  if (opts.help) { console.log(renderHelp()); process.exit(0); }
  if (opts.version) { console.log(`git-blame-reporter v${VERSION}`); process.exit(0); }

  if (!['json', 'table'].includes(opts.format)) {
    console.error(`Invalid format "${opts.format}". Use: json | table`);
    process.exit(1);
  }

  try {
    const result = await analyzeRepo(opts);
    if (opts.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(renderTable(result));
    }
  } catch (err) {
    console.error(`Analysis failed: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
