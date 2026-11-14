// Rewrites the telemetry block in README.md from public GitHub data.
// Runs daily from .github/workflows/activity.yml. Locally:
//   GITHUB_TOKEN=$(gh auth token) node tools/activity.mjs
// Only public data is printed. Private work appears in the contribution
// totals, as on GitHub's own profile page, but is never named, whatever
// the token can see.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const login = 'capt1nedev';
const readmePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'README.md');
const START = '<!-- activity:start -->';
const END = '<!-- activity:end -->';

const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('Set GITHUB_TOKEN');

async function api(path, init = {}) {
  const res = await fetch(`https://api.github.com/${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': `${login}-profile-readme`,
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function contributions() {
  const query = `query($login: String!) { user(login: $login) { contributionsCollection {
    contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }`;
  const body = await api('graphql', { method: 'POST', body: JSON.stringify({ query, variables: { login } }) });
  if (body.errors) throw new Error(JSON.stringify(body.errors));
  const calendar = body.data.user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap((w) => w.contributionDays);
  return {
    year: calendar.totalContributions,
    month: days.slice(-30).reduce((sum, d) => sum + d.contributionCount, 0),
    lastActive: days.findLast((d) => d.contributionCount > 0)?.date ?? null,
  };
}

// Pull requests to repositories owned by someone else, newest first.
async function pullRequests() {
  const q = encodeURIComponent(`is:pr is:public author:${login} -user:${login}`);
  const { items } = await api(`search/issues?q=${q}&sort=created&order=desc&per_page=6`);
  return items.map((pr) => ({
    repo: pr.repository_url.replace('https://api.github.com/repos/', ''),
    number: pr.number,
    title: pr.title,
    url: pr.html_url,
    opened: pr.created_at,
    status: pr.pull_request?.merged_at ? 'merged' : pr.state === 'closed' ? 'closed' : pr.draft ? 'draft' : 'open',
  }));
}

async function publicRepos() {
  const all = await api(`users/${login}/repos?type=owner&sort=pushed&per_page=100`);
  const repos = all.filter((r) => !r.private && !r.fork && !r.archived && r.name !== login).slice(0, 6);
  // Newest published release, pre-releases included (docx-repro only has alphas).
  for (const repo of repos) {
    const releases = await api(`repos/${repo.full_name}/releases?per_page=10`);
    repo.release = releases?.find((r) => !r.draft) ?? null;
  }
  return repos;
}

const date = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// Escapes text for a Markdown table cell.
const cell = (s) =>
  String(s ?? '').replace(/[\\`*_[\]|<>]/g, (c) => ({ '<': '&lt;', '>': '&gt;' })[c] ?? `\\${c}`);

const badge = (status) => `<img src="./assets/status/${status}.svg" height="20" alt="${status}" />`;

const snake = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${login}/${login}/output/snake-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/${login}/${login}/output/snake.svg" />
  <img width="100%" alt="A snake eating Justine's GitHub contribution graph" src="https://raw.githubusercontent.com/${login}/${login}/output/snake.svg" />
</picture>`;

const [stats, prs, repos] = await Promise.all([contributions(), pullRequests(), publicRepos()]);

const block = [
  START,
  '<!-- Written by tools/activity.mjs every day. Edits inside this block get overwritten. -->',
  '',
  `<p align="center"><samp><b>${stats.year}</b> contributions in the last year · <b>${stats.month}</b> in the last 30 days · last active <b>${stats.lastActive ? date(stats.lastActive) : 'not yet'}</b></samp></p>`,
  '',
  snake,
  '',
  '**Pull requests to other projects**',
  '',
  ...(prs.length
    ? [
        '| Status | Pull request | Opened |',
        '| :-- | :-- | :-- |',
        ...prs.map((pr) => `| ${badge(pr.status)} | [${pr.repo}#${pr.number}](${pr.url})<br /><sub>${cell(pr.title)}</sub> | ${date(pr.opened)} |`),
      ]
    : ['No public pull requests to other projects yet.']),
  '',
  '**Public repositories**',
  '',
  '| Repository | About | Latest |',
  '| :-- | :-- | :-- |',
  ...repos.map((r) => {
    const latest = [r.release && `[${cell(r.release.tag_name)}](${r.release.html_url})`, r.language, `updated ${date(r.pushed_at)}`];
    return `| [${r.name}](${r.html_url}) | ${cell(r.description)} | ${latest.filter(Boolean).join(' · ')} |`;
  }),
  '',
  '<sub>Refreshed every day from public GitHub data. Private work counts toward the totals but is never named.</sub>',
  END,
].join('\n');

const readme = readFileSync(readmePath, 'utf8');
const start = readme.indexOf(START);
const end = readme.indexOf(END);
if (start < 0 || end < start) throw new Error(`README.md needs ${START} and ${END} markers`);
// Windows checkouts may use CRLF; keep whatever the file already uses.
const eol = readme.includes('\r\n') ? '\r\n' : '\n';
const next = readme.slice(0, start) + block.replaceAll('\n', eol) + readme.slice(end + END.length);

if (next === readme) console.log('Activity unchanged');
else {
  writeFileSync(readmePath, next);
  console.log(`Activity updated: ${stats.year} contributions, ${prs.length} pull requests, ${repos.length} public repos`);
}
