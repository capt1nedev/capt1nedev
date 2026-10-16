// Turns text into SVG outlines so every viewer sees the same fonts.
// GitHub serves README images through a proxy that blocks web fonts,
// so the SVGs carry glyph paths instead of <text>.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// DEPS_DIR points at a folder whose node_modules holds the build deps.
// Without it, packages resolve from this repo's own node_modules.
const require = createRequire(
  process.env.DEPS_DIR ? `${process.env.DEPS_DIR}/package.json` : import.meta.url,
);
const opentype = require('opentype.js');

function load(spec) {
  const buf = readFileSync(require.resolve(spec));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

export const fonts = {
  syne800: load('@fontsource/syne/files/syne-latin-800-normal.woff'),
  syne700: load('@fontsource/syne/files/syne-latin-700-normal.woff'),
  mono400: load('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff'),
  mono500: load('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff'),
};

function glyphs(font, str) {
  return [...str].map((ch) => {
    const g = font.charToGlyph(ch);
    if (!g || g.index === 0) {
      throw new Error(`No glyph for "${ch}" (U+${ch.codePointAt(0).toString(16)}) in ${font.names.fullName?.en}`);
    }
    return g;
  });
}

// tracking is in em, like CSS letter-spacing.
function advances(font, str, size, tracking) {
  const scale = size / font.unitsPerEm;
  const gs = glyphs(font, str);
  const xs = [];
  let x = 0;
  gs.forEach((g, i) => {
    xs.push(x);
    x += g.advanceWidth * scale;
    if (i < gs.length - 1) x += font.getKerningValue(g, gs[i + 1]) * scale + tracking * size;
  });
  return { gs, xs, width: x };
}

export function measure(font, str, size, tracking = 0) {
  return advances(font, str, size, tracking).width;
}

// opentype.js 2.0's toPathData() writes NaN when a coordinate's fractional
// part is tiny enough to print in exponent form, so serialize commands here.
const num = (v) => String(Math.round(v * 10) / 10 || 0);

function pathData(commands) {
  let d = '';
  let prev = '';
  for (const c of commands) {
    const vals =
      c.type === 'C' ? [c.x1, c.y1, c.x2, c.y2, c.x, c.y] : c.type === 'Q' ? [c.x1, c.y1, c.x, c.y] : c.type === 'Z' ? [] : [c.x, c.y];
    const body = vals.map(num).join(' ').replace(/ -/g, '-');
    // Repeated commands can drop their letter, but only after a number.
    d += c.type === prev && c.type !== 'Z' && c.type !== 'M' ? ` ${body}`.replace(/^ -/, '-') : c.type + body;
    prev = c.type;
  }
  return d;
}

// Each glyph is defined once per image, in font units, and placed with <use>.
// That keeps text-heavy cards a fraction of the size of inline outlines.
const fontKeys = new Map(Object.values(fonts).map((font, i) => [font, String.fromCharCode(97 + i)]));
let glyphDefs = new Map();

function glyphId(font, g) {
  const id = `${fontKeys.get(font)}${g.index}`;
  if (!glyphDefs.has(id)) glyphDefs.set(id, pathData(g.getPath(0, 0, font.unitsPerEm).commands));
  return id;
}

// Returns the <path> defs for every glyph used since the last call.
export function takeGlyphDefs() {
  const defs = [...glyphDefs].filter(([, d]) => d).map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('\n');
  glyphDefs = new Map();
  return defs;
}

// One line of text as a group of glyph references.
export function text(font, str, { fill, opacity, x = 0, y = 0, size, tracking = 0, anchor = 'start' }) {
  const { gs, xs, width } = advances(font, str, size, tracking);
  const x0 = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  const s = size / font.unitsPerEm;
  const uses = gs
    .map((g, i) => {
      const id = glyphId(font, g);
      return glyphDefs.get(id) ? `<use href="#${id}" x="${num(xs[i] / s)}"/>` : '';
    })
    .join('');
  if (!uses) return '';
  const op = opacity == null ? '' : ` fill-opacity="${opacity}"`;
  const k = +s.toFixed(5);
  return `<g transform="matrix(${k} 0 0 ${k} ${num(x0)} ${num(y)})" fill="${fill}"${op}>${uses}</g>`;
}

// A line made of differently coloured runs: [[str, fill, opacity?], ...].
export function runs(font, parts, { x = 0, y = 0, size, tracking = 0 }) {
  let cx = x;
  let out = '';
  for (const [str, fill, opacity] of parts) {
    if (str.trim()) out += text(font, str, { x: cx, y, size, tracking, fill, opacity });
    cx += measure(font, str, size, tracking) + tracking * size;
  }
  return { svg: out, width: cx - x };
}

export function wrap(font, str, size, maxWidth, tracking = 0) {
  const lines = [];
  let line = '';
  for (const word of str.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (!line || measure(font, next, size, tracking) <= maxWidth) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}
