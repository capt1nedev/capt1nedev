// Regenerates every image in assets/ from content.mjs: `npm run build`.
// Animations use SMIL, which still plays when GitHub shows an SVG as an <img>.
// Every animated element's resting attributes show the finished state, so
// renderers that skip animation still show a complete picture.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fonts, measure, text, runs, wrap } from './lib/type.mjs';
import { C, doc, chip, chipRow, pulseDot, arrowRight, arrowUpRight, dotPattern, n } from './lib/svg.mjs';
import { profile, featured, projects, docxRepro, terminal } from './content.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function save(file, svg) {
  const path = join(root, 'assets', file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, svg);
  console.log(`${file.padEnd(28)} ${(svg.length / 1024).toFixed(1)} KB`);
}

const ease = (segments) => Array(segments).fill('.45 0 .55 1').join(';');
const host = (url) => new URL(url).host;

// keyTimes for discrete SMIL animations must be increasing and within [0, 1].
function keyTimes(times, total) {
  let last = -1;
  return times
    .map((t) => {
      let k = Math.min(1, Math.max(0, t / total));
      if (k <= last) k = last + 0.0001;
      last = k;
      return k.toFixed(4);
    })
    .join(';');
}

function hero() {
  const W = 1000;
  const X = 64;
  const tracking = -0.05;
  const syne = fonts.syne800;
  // The </> mark sits at the right; the name takes the largest size that
  // still leaves a clear gap before it.
  const mx = W - X - 124;
  const widest = Math.max(measure(syne, profile.first, 1, tracking), measure(syne, profile.last, 1, tracking));
  const S = Math.min(88, Math.floor((mx - 124 - 48 - X) / widest));
  const cap = (syne.tables.os2.sCapHeight / syne.unitsPerEm) * S;

  const yStatus = 82;
  const y1 = 122 + cap;
  const y2 = y1 + 0.92 * S;
  const yRole = y2 + 46;
  const yTag1 = yRole + 50;
  const yTag2 = yTag1 + 34;
  const yRule = yTag2 + 40;
  const yNum = yRule + 44;
  const yLabel = yNum + 21;
  const H = Math.round(yLabel + 38);

  // The </> mark from the capt.dev avatar, broadcasting rings like the
  // portfolio's ping dots.
  const my = Math.round((y1 - cap + y2) / 2);
  const markD =
    `M${mx - 52} ${my - 62}L${mx - 116} ${my}L${mx - 52} ${my + 62}` +
    `M${mx + 26} ${my - 84}L${mx - 26} ${my + 84}` +
    `M${mx + 52} ${my - 62}L${mx + 116} ${my}L${mx + 52} ${my + 62}`;

  const spotX = [mx - 60, mx + 110, mx - 300, mx + 40, mx - 60];
  const spotY = [my, my - 100, my + 110, my + 190, my];

  const defs = `
<clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
${dotPattern('dots', { step: 24, r: 0.9, opacity: 0.1 })}
${dotPattern('hot', { step: 24, r: 1.9, opacity: 0.85 })}
<radialGradient id="spotFill"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
<mask id="spot" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#000"/>
  <circle r="150" cx="${spotX[0]}" cy="${spotY[0]}" fill="url(#spotFill)">
    <animate attributeName="cx" values="${spotX.join(';')}" keyTimes="0;.25;.5;.75;1" calcMode="spline" keySplines="${ease(4)}" dur="20s" repeatCount="indefinite"/>
    <animate attributeName="cy" values="${spotY.join(';')}" keyTimes="0;.25;.5;.75;1" calcMode="spline" keySplines="${ease(4)}" dur="20s" repeatCount="indefinite"/>
  </circle>
</mask>
<radialGradient id="aura" cx="${mx}" cy="${my}" r="340" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="${C.signal}" stop-opacity=".13"/><stop offset="1" stop-color="${C.signal}" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vignette" cx="42%" cy="38%" r="78%">
  <stop offset=".55" stop-color="${C.void}" stop-opacity="0"/><stop offset="1" stop-color="${C.void}" stop-opacity=".92"/>
</radialGradient>
<linearGradient id="markFill" gradientUnits="userSpaceOnUse" x1="${mx - 120}" y1="${my - 90}" x2="${mx + 120}" y2="${my + 90}">
  <stop offset="0" stop-color="${C.signal}"/><stop offset="1" stop-color="#19C3E6"/>
</linearGradient>
<filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12"/></filter>`;

  const rings = [0, 2, 4]
    .map(
      (b) => `<circle cx="${mx}" cy="${my}" r="90" stroke="${C.signal}" stroke-width="1.2" stroke-opacity="0">
  <animate attributeName="r" values="90;360" dur="6s" begin="${b}s" repeatCount="indefinite"/>
  <animate attributeName="stroke-opacity" values=".45;0" dur="6s" begin="${b}s" repeatCount="indefinite"/>
</circle>`,
    )
    .join('\n');

  const mark = `<g>
  <animateTransform attributeName="transform" type="translate" values="0 0;0 -8;0 0" keyTimes="0;.5;1" calcMode="spline" keySplines="${ease(2)}" dur="7s" repeatCount="indefinite"/>
  <path d="${markD}" stroke="url(#markFill)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" filter="url(#soft)" opacity=".5">
    <animate attributeName="opacity" values=".3;.65;.3" keyTimes="0;.5;1" dur="7s" repeatCount="indefinite"/>
  </path>
  <path d="${markD}" stroke="url(#markFill)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
</g>`;

  const mono = fonts.mono500;
  const role = profile.role.map((s) => s.toUpperCase()).join(' · ');

  const domains = new Set([featured, ...projects].map((p) => p.domain)).size;
  const stats = [
    [String(projects.length + 1), 'Production systems'],
    [String(domains), 'Domains served'],
    ['100%', 'Live deployments'],
    [null, 'Remote reach'],
  ];
  const cellW = (W - 2 * X) / stats.length;
  const statSvg = stats
    .map(([num, label], i) => {
      const cx = X + i * cellW + (i ? 28 : 0);
      let value;
      if (num === null) {
        const ph = measure(mono, 'PH', 22, -0.03);
        value =
          text(mono, 'PH', { x: cx, y: yNum, size: 22, tracking: -0.03, fill: C.chrome }) +
          arrowRight({ x: cx + ph + 7, y: yNum - 7.5, w: 16, color: C.signal, width: 2 }) +
          text(mono, 'GLOBAL', { x: cx + ph + 31, y: yNum, size: 22, tracking: -0.03, fill: C.chrome });
      } else {
        value = text(mono, num, { x: cx, y: yNum, size: 22, tracking: -0.03, fill: C.chrome });
      }
      const divider = i
        ? `<path d="M${n(X + i * cellW)} ${yNum - 26}V${yLabel + 6}" stroke="${C.chrome}" stroke-opacity=".08"/>`
        : '';
      return (
        divider +
        value +
        text(mono, label.toUpperCase(), { x: cx, y: yLabel, size: 10, tracking: 0.12, fill: C.chrome, opacity: 0.38 })
      );
    })
    .join('\n');

  const body = `<g clip-path="url(#frame)">
<rect width="${W}" height="${H}" fill="${C.void}"/>
<rect width="${W}" height="${H}" fill="url(#aura)"/>
<rect width="${W}" height="${H}" fill="url(#dots)"/>
<rect width="${W}" height="${H}" fill="url(#hot)" mask="url(#spot)"/>
${rings}
${mark}
<rect width="${W}" height="${H}" fill="url(#vignette)"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" stroke="${C.chrome}" stroke-opacity=".1"/>
${pulseDot({ cx: X + 4, cy: yStatus - 4, r: 3.5 })}
${text(mono, profile.status.toUpperCase(), { x: X + 20, y: yStatus, size: 12, tracking: 0.15, fill: C.signal })}
${text(syne, profile.first, { x: X - 3, y: y1, size: S, tracking, fill: C.signal })}
${text(syne, profile.last, { x: X - 3, y: y2, size: S, tracking, fill: C.chrome })}
${text(fonts.mono400, role, { x: X, y: yRole, size: 12, tracking: 0.16, fill: C.chrome, opacity: 0.5 })}
${text(fonts.syne700, profile.tagline[0], { x: X, y: yTag1, size: 25, tracking: -0.02, fill: C.chrome })}
${text(fonts.syne700, profile.tagline[1], { x: X, y: yTag2, size: 25, tracking: -0.02, fill: C.chrome })}
<path d="M${X} ${yRule + 0.5}H${W - X}" stroke="${C.chrome}" stroke-opacity=".08"/>
${statSvg}`;

  return doc({
    w: W,
    h: H,
    title: `Justine Basibas. ${profile.role.join(', ')}. ${profile.tagline.join(' ')}`,
    defs,
    body,
  });
}

function terminalCard() {
  const W = 480;
  const PX = 26;
  const size = 13.5;
  const lh = 24;
  const bar = 40;
  const first = bar + 32;
  const H = first + lh * terminal.length + 30;
  const mono = fonts.mono400;
  const cw = measure(mono, 'M', size);
  const step = 0.055;

  // Schedule: commands type out, output lines follow.
  let t = 0.6;
  const plan = terminal.map((line) => {
    if (line.cmd) {
      const start = t;
      t += 0.2 + line.cmd.length * step + 0.35;
      return { start, chars: line.cmd.length };
    }
    const start = t;
    t += 0.12;
    return { start, chars: 0 };
  });
  const finalAt = t + 0.15;
  const total = finalAt + 0.1;

  let defs = '';
  let lines = '';
  const reveal = (id, y, times, widths) => {
    defs += `<clipPath id="${id}"><rect x="0" y="${y - 17}" width="${W}" height="${lh}">
  <animate attributeName="width" values="${widths.map(n).join(';')}" keyTimes="${keyTimes(times, total)}" calcMode="discrete" dur="${total.toFixed(2)}s" fill="freeze"/>
</rect></clipPath>`;
  };

  terminal.forEach((line, i) => {
    const y = first + i * lh;
    const id = `l${i}`;
    const { start, chars } = plan[i];
    if (line.cmd) {
      const times = [0, start];
      const widths = [0, PX + 2 * cw];
      for (let k = 1; k <= chars; k++) {
        times.push(start + 0.2 + k * step);
        widths.push(PX + (2 + k) * cw);
      }
      times.push(start + 0.2 + chars * step + 0.01);
      widths.push(W);
      reveal(id, y, times, widths);
      lines += `<g clip-path="url(#${id})">${runs(mono, [['$ ', C.signal, 0.95], [line.cmd, C.chrome, 0.95]], { x: PX, y, size }).svg}</g>\n`;
    } else {
      reveal(id, y, [0, start], [0, W]);
      const parts = line.out.map(([s, color, op]) => [s, C[color], op]);
      lines += `<g clip-path="url(#${id})">${runs(mono, parts, { x: PX, y, size }).svg}</g>\n`;
    }
  });

  const yLast = first + terminal.length * lh;
  reveal('last', yLast, [0, finalAt], [0, W]);
  lines += `<g clip-path="url(#last)">${text(mono, '$', { x: PX, y: yLast, size, fill: C.signal, opacity: 0.95 })}
<rect x="${n(PX + 2 * cw)}" y="${yLast - 12}" width="${n(cw)}" height="16" fill="${C.signal}">
  <animate attributeName="opacity" values="1;0" keyTimes="0;.5" calcMode="discrete" dur="1.1s" repeatCount="indefinite"/>
</rect></g>`;

  const title = 'justine@capt.dev: ~';
  const body = `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="${C.deep}" stroke="${C.chrome}" stroke-opacity=".1"/>
<path d="M1 ${bar}H${W - 1}" stroke="${C.chrome}" stroke-opacity=".07"/>
<circle cx="24" cy="${bar / 2}" r="5.5" fill="#FF5F57" fill-opacity=".85"/>
<circle cx="43" cy="${bar / 2}" r="5.5" fill="#FEBC2E" fill-opacity=".85"/>
<circle cx="62" cy="${bar / 2}" r="5.5" fill="#28C840" fill-opacity=".85"/>
${text(mono, title, { x: W / 2, y: bar / 2 + 4, size: 11, fill: C.chrome, opacity: 0.38, anchor: 'middle' })}
${lines}`;

  return doc({
    w: W,
    h: H,
    title: 'Terminal: whoami, Justine Basibas, full-stack web developer. Now: Associate Software Developer at Thrive Dynamic Business Solutions, building resumiq.tech, shipping studynovaai.app. Stack: Next.js, React, TypeScript, Python, FastAPI, MongoDB. Status: open to remote roles, replies within 24 hours.',
    defs,
    body,
  });
}

function hostLink(url, { right, y, size = 11 }) {
  const label = host(url);
  const w = measure(fonts.mono500, label, size);
  return (
    text(fonts.mono500, label, { x: right - 15 - w, y, size, fill: C.signal, opacity: 0.92 }) +
    arrowUpRight({ x: right - 9, y: y - 9, s: 8.5, color: C.signal, width: 1.5, opacity: 0.92 })
  );
}

function projectCard(p, num) {
  const W = 490;
  const H = 272;
  const PX = 28;
  const col = C[p.color];
  const tag = wrap(fonts.mono400, p.tagline, 13, W - PX * 2);
  if (tag.length > 2) throw new Error(`${p.name}: tagline needs ${tag.length} lines, cards fit 2`);
  const dom = chip(p.domain, { x: 0, y: 0, color: col, size: 10.5 });

  const defs = `<radialGradient id="tint" cx="${W}" cy="0" r="320" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="${col}" stop-opacity=".15"/><stop offset="1" stop-color="${col}" stop-opacity="0"/>
</radialGradient>`;

  const body = `<rect width="${W}" height="${H}" rx="16" fill="${C.deep}"/>
<rect width="${W}" height="${H}" rx="16" fill="url(#tint)"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" stroke="${C.chrome}" stroke-opacity=".09"/>
${text(fonts.mono500, `SYSTEM_${String(num).padStart(2, '0')}`, { x: PX, y: 45, size: 11, tracking: 0.12, fill: C.signal, opacity: 0.7 })}
${chip(p.domain, { x: W - PX - dom.w, y: 29, color: col, size: 10.5 }).svg}
${text(fonts.syne700, p.name, { x: PX - 1, y: 93, size: 28, tracking: -0.02, fill: C.chrome })}
${tag.map((line, k) => text(fonts.mono400, line, { x: PX, y: 126 + k * 20.5, size: 13, fill: C.chrome, opacity: 0.55 })).join('\n')}
${chipRow(p.stack, { x: PX, y: 174, maxWidth: W - PX * 2, color: C.chrome, textOpacity: 0.66, bgOpacity: 0.04, borderOpacity: 0.13, upper: false, tracking: 0.02, size: 11, h: 23, font: fonts.mono400 })}
<path d="M${PX} 220.5H${W - PX}" stroke="${C.chrome}" stroke-opacity=".07"/>
${pulseDot({ cx: PX + 4, cy: 244, r: 3 })}
${text(fonts.mono500, 'LIVE', { x: PX + 17, y: 248, size: 10, tracking: 0.12, fill: C.chrome, opacity: 0.45 })}
${hostLink(p.url, { right: W - PX, y: 248.5, size: 12 })}`;

  return doc({ w: W, h: H, title: `${p.name}: ${p.tagline} Live at ${host(p.url)}.`, defs, body });
}

// Resumiq's icon mark, redrawn from resumiq_logo.svg.
function resumiqMark(x, y, k) {
  return `<g transform="translate(${x} ${y}) scale(${k})">
  <rect width="124" height="152" rx="16" fill="url(#rqBody)"/>
  <polygon points="90,0 124,34 90,34" fill="#3730A3" opacity=".5"/>
  <polygon points="90,0 124,34 90,34" fill="#fff" opacity=".12"/>
  <rect x="20" y="48" width="52" height="7" rx="3.5" fill="#fff" opacity=".95"/>
  <rect x="20" y="63" width="84" height="2" rx="1" fill="#fff" opacity=".25"/>
  <rect x="20" y="74" width="84" height="5" rx="2.5" fill="#fff" opacity=".55"/>
  <rect x="20" y="85" width="72" height="5" rx="2.5" fill="#fff" opacity=".55"/>
  <rect x="20" y="96" width="84" height="5" rx="2.5" fill="#fff" opacity=".55"/>
  <rect x="20" y="107" width="60" height="5" rx="2.5" fill="#fff" opacity=".55"/>
  <rect x="68" y="120" width="56" height="30" rx="15" fill="url(#rqBadge)"/>
  <text x="96" y="141" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="16" font-weight="700" fill="#fff" letter-spacing="1">iq</text>
</g>`;
}

function featuredCard() {
  const f = featured;
  const W = 1000;
  const H = 340;
  const PX = 40;
  const col = C[f.color];
  const k = 1.2;
  const docW = 124 * k;
  const docH = 152 * k;
  const dx = 792 - docW / 2;
  const dy = (H - docH) / 2;

  const defs = `<linearGradient id="rqBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6C63FF"/><stop offset="1" stop-color="#4F46E5"/></linearGradient>
<linearGradient id="rqBadge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
<radialGradient id="rqGlow" cx="${dx + docW / 2}" cy="${H / 2}" r="260" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="#6C63FF" stop-opacity=".28"/><stop offset="1" stop-color="#6C63FF" stop-opacity="0"/>
</radialGradient>
<linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${C.signal}" stop-opacity="0"/><stop offset=".85" stop-color="${C.signal}" stop-opacity=".55"/><stop offset="1" stop-color="${C.signal}" stop-opacity="0"/>
</linearGradient>
<clipPath id="docClip"><rect x="${dx}" y="${dy}" width="${docW}" height="${docH}" rx="${16 * k}"/></clipPath>
<clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
${dotPattern('dots', { step: 22, r: 0.9, opacity: 0.12 })}
<linearGradient id="fadeDots" x1="0" y1="0" x2="1" y2="0"><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
<mask id="rightHalf"><rect width="${W}" height="${H}" fill="url(#fadeDots)"/></mask>`;

  // Job keywords light up one by one as the scan finds them.
  const cycle = 8;
  const leftYs = [91, 141, 191, 241];
  const rightYs = [105, 155, 205, 255];
  const kw = f.keywords
    .map((word, i) => {
      const left = i % 2 === 0;
      const y = left ? leftYs[i >> 1] : rightYs[i >> 1];
      const probe = chip(word, { x: 0, y: 0, upper: false, size: 10.5 });
      const x = left ? dx - 26 - probe.w : dx + docW + 26;
      const base = chip(word, { x, y, color: C.chrome, upper: false, textOpacity: 0.55, bgOpacity: 0.04, borderOpacity: 0.14, size: 10.5 });
      const lit = chip(word, { x, y, color: C.signal, upper: false, textOpacity: 1, bgOpacity: 0.12, borderOpacity: 0.55, size: 10.5 });
      const on = (0.6 + i * 0.55) / cycle;
      const edge = left ? x + probe.w : x;
      const target = left ? dx : dx + docW;
      return `${base.svg}
<path d="M${n(edge + (left ? 4 : -4))} ${y + 11}H${n(target + (left ? -4 : 4))}" stroke="${C.signal}" stroke-opacity=".35" stroke-dasharray="2 4" opacity="0">
  <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${on.toFixed(3)};${(on + 0.02).toFixed(3)};.86;.94" dur="${cycle}s" repeatCount="indefinite"/>
</path>
<g opacity="0">${lit.svg}
  <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${on.toFixed(3)};${(on + 0.02).toFixed(3)};.86;.94" dur="${cycle}s" repeatCount="indefinite"/>
</g>`;
    })
    .join('\n');

  const scan = `<g clip-path="url(#docClip)"><rect x="${dx}" y="${dy - 40}" width="${docW}" height="40" fill="url(#scan)" opacity=".9">
  <animate attributeName="y" values="${dy - 40};${dy + docH};${dy + docH}" keyTimes="0;.6;1" dur="2.6s" repeatCount="indefinite"/>
</rect></g>`;

  const nowW = measure(fonts.mono500, 'NOW BUILDING', 11, 0.15);
  const tag = wrap(fonts.mono400, f.tagline, 14, 490);
  const check = (x, y) =>
    `<path d="M${x} ${y - 4}l3.4 3.4 6.6-7" stroke="${C.signal}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  const points = f.points
    .map((p, i) => {
      const y = 222 + i * 26;
      return check(PX + 1, y) + text(fonts.mono400, p, { x: PX + 22, y, size: 13, fill: C.chrome, opacity: 0.76 });
    })
    .join('\n');

  const body = `<g clip-path="url(#frame)">
<rect width="${W}" height="${H}" fill="${C.deep}"/>
<rect width="${W}" height="${H}" fill="url(#dots)" mask="url(#rightHalf)"/>
<rect width="${W}" height="${H}" fill="url(#rqGlow)"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" stroke="${C.chrome}" stroke-opacity=".1"/>
${pulseDot({ cx: PX + 4, cy: 48, r: 3.5 })}
${text(fonts.mono500, 'NOW BUILDING', { x: PX + 18, y: 52, size: 11, tracking: 0.15, fill: C.signal })}
${chip(f.domain, { x: PX + 18 + nowW + 14, y: 37, color: col, size: 10.5 }).svg}
${text(fonts.syne800, f.name, { x: PX - 2, y: 122, size: 52, tracking: -0.03, fill: C.chrome })}
${tag.map((line, i) => text(fonts.mono400, line, { x: PX, y: 158 + i * 22, size: 14, fill: C.chrome, opacity: 0.58 })).join('\n')}
${points}
${chipRow(f.stack, { x: PX, y: 296, maxWidth: 520, color: C.chrome, textOpacity: 0.66, bgOpacity: 0.04, borderOpacity: 0.13, upper: false, tracking: 0.02, size: 11, h: 23, font: fonts.mono400 })}
${hostLink(f.url, { right: W - PX, y: 52, size: 12 })}
${kw}
${resumiqMark(dx, dy, k)}
${scan}`;

  return doc({
    w: W,
    h: H,
    title: `Now building: Resumiq, ${f.tagline} ${f.points.join('. ')}. Live at resumiq.tech.`,
    defs,
    body,
  });
}

function docxCard() {
  const d = docxRepro;
  const W = 1000;
  const H = 276;
  const PX = 40;

  let cx = PX;
  const chips = [
    ['Open source', C.signal],
    ['Python 3.10+', C.sky],
    ['MIT', C.violet],
    ['Early alpha', C.ember],
  ]
    .map(([label, color]) => {
      const c = chip(label, { x: cx, y: 34, color, size: 10.5 });
      cx += c.w + 7;
      return c.svg;
    })
    .join('');

  const summary = wrap(fonts.mono400, d.summary, 14, 520);
  const pillY = 196;
  const cmd = `$ ${d.install}`;
  const pillW = Math.ceil(measure(fonts.mono500, cmd, 13) + 36);

  // The documented Mammoth demo: 201 body blocks in, 1 out.
  const bx = 612;
  const ox = 826;
  const bw = 124;
  const by = 74;
  const widths = [1, 0.82, 0.94, 0.7, 1, 0.88, 0.76, 0.96, 0.62, 1, 0.85, 0.72, 0.9];
  const culprit = 8;
  const cycle = 8;
  const bars = widths
    .map((w, i) => {
      const y = by + i * 12;
      if (i === culprit) {
        return `<rect x="${bx}" y="${y}" width="${n(bw * w)}" height="7" rx="3.5" fill="${C.signal}"/>`;
      }
      const off = (0.5 + i * 0.3) / cycle;
      return `<rect x="${bx}" y="${y}" width="${n(bw * w)}" height="7" rx="3.5" fill="${C.chrome}" fill-opacity=".28">
  <animate attributeName="fill-opacity" values=".28;.28;.05;.05;.28" keyTimes="0;${off.toFixed(3)};${(off + 0.03).toFixed(3)};.88;.96" dur="${cycle}s" repeatCount="indefinite"/>
</rect>`;
    })
    .join('\n');
  const cy = by + culprit * 12;
  const frameH = widths.length * 12 + 18;
  const reveal = (5.0 / cycle).toFixed(3);

  const body = `<rect width="${W}" height="${H}" rx="18" fill="${C.deep}"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" stroke="${C.chrome}" stroke-opacity=".1"/>
${chips}
${text(fonts.syne800, d.name, { x: PX - 2, y: 112, size: 46, tracking: -0.03, fill: C.chrome })}
${summary.map((line, i) => text(fonts.mono400, line, { x: PX, y: 148 + i * 22, size: 14, fill: C.chrome, opacity: 0.58 })).join('\n')}
<rect x="${PX + 0.5}" y="${pillY + 0.5}" width="${pillW - 1}" height="39" rx="8" fill="${C.void}" stroke="${C.signal}" stroke-opacity=".3"/>
${runs(fonts.mono500, [['$ ', C.signal, 1], [d.install, C.chrome, 0.92]], { x: PX + 18, y: pillY + 25, size: 13 }).svg}
${text(fonts.mono500, '201 BLOCKS', { x: bx - 12, y: by - 22, size: 10, tracking: 0.12, fill: C.chrome, opacity: 0.5 })}
${text(fonts.mono500, '1 BLOCK, SAME BUG', { x: ox - 12, y: by - 22, size: 10, tracking: 0.12, fill: C.signal, opacity: 0.9 })}
<rect x="${bx - 12.5}" y="${by - 11.5}" width="${bw + 24}" height="${frameH}" rx="8" stroke="${C.chrome}" stroke-opacity=".12"/>
<rect x="${ox - 12.5}" y="${by - 11.5}" width="${bw + 24}" height="${frameH}" rx="8" stroke="${C.signal}" stroke-opacity=".3" stroke-dasharray="3 4"/>
${bars}
${arrowRight({ x: bx + bw + 30, y: cy + 3.5, w: 36, color: C.signal, width: 1.8, opacity: 0.8 })}
<rect x="${ox}" y="${cy}" width="${n(bw * widths[culprit])}" height="7" rx="3.5" fill="${C.signal}">
  <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${reveal};${(+reveal + 0.03).toFixed(3)};.88;.96" dur="${cycle}s" repeatCount="indefinite"/>
</rect>
${text(fonts.mono400, 'Mammoth demo, reproducible with one command', { x: (bx - 12 + ox + bw + 12) / 2, y: by - 11.5 + frameH + 21, size: 10.5, fill: C.chrome, opacity: 0.42, anchor: 'middle' })}`;

  return doc({
    w: W,
    h: H,
    title: `docx-repro: ${d.summary} Install with ${d.install}. In the Mammoth demo it reduces 201 body blocks to the 1 that still shows the bug.`,
    body,
  });
}

function footer() {
  const W = 1000;
  const H = 84;
  const y = 47;
  const jb = measure(fonts.mono500, 'JB', 11, 0.15);
  const line = `M410 ${y - 5}H468l7-13 9 24 8-30 9 27 6-8H590`;
  const strong = 'SIGNAL STRONG';
  const sw = measure(fonts.mono500, strong, 9.5, 0.12);
  const body = `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="${C.void}" stroke="${C.chrome}" stroke-opacity=".09"/>
${text(fonts.mono500, 'JB', { x: 32, y, size: 11, tracking: 0.15, fill: C.signal })}
${text(fonts.mono400, 'Justine Basibas · All systems operational.', { x: 32 + jb + 16, y, size: 10.5, fill: C.chrome, opacity: 0.35 })}
<path d="${line}" stroke="${C.chrome}" stroke-opacity=".1" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
<path d="${line}" stroke="${C.signal}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="60 400" stroke-dashoffset="460">
  <animate attributeName="stroke-dashoffset" values="460;0" dur="2.6s" repeatCount="indefinite"/>
</path>
${pulseDot({ cx: W - 32 - sw - 14, cy: y - 3.5, r: 3 })}
${text(fonts.mono500, strong, { x: W - 32, y, size: 9.5, tracking: 0.12, fill: C.chrome, opacity: 0.32, anchor: 'end' })}`;
  return doc({ w: W, h: H, title: 'Justine Basibas. All systems operational.', body });
}

function button(label, { primary = false, external = true }) {
  const H = 40;
  const size = 11;
  const tracking = 0.1;
  const str = label.toUpperCase();
  const tw = measure(fonts.mono500, str, size, tracking);
  const W = Math.ceil(20 + tw + 12 + 11 + 20);
  const fg = primary ? C.void : C.chrome;
  const arrowColor = primary ? C.void : C.signal;
  const ax = 20 + tw + 12;
  const bg = primary
    ? `<rect width="${W}" height="${H}" rx="6" fill="${C.signal}"/>`
    : `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="5.5" fill="${C.deep}" stroke="${C.chrome}" stroke-opacity=".2"/>`;
  const arrow = external
    ? arrowUpRight({ x: ax + 1, y: H / 2 - 4.5, s: 9, color: arrowColor, width: 1.6 })
    : arrowRight({ x: ax, y: H / 2, w: 11, color: arrowColor, width: 1.6 });
  const body = `${bg}
${text(fonts.mono500, str, { x: 20, y: H / 2 + 4, size, tracking, fill: fg, opacity: primary ? 1 : 0.8 })}
${arrow}`;
  return doc({ w: W, h: H, title: label, body });
}

save('hero.svg', hero());
save('terminal.svg', terminalCard());
save('projects/resumiq.svg', featuredCard());
projects.forEach((p, i) => save(`projects/${p.slug}.svg`, projectCard(p, i + 2)));
save('oss/docx-repro.svg', docxCard());
save('footer.svg', footer());
save('buttons/work.svg', button('View my work', { primary: true, external: false }));
save('buttons/contact.svg', button('Get in touch', {}));
save('buttons/linkedin.svg', button('LinkedIn', {}));
save('buttons/resumiq.svg', button('resumiq.tech', {}));
