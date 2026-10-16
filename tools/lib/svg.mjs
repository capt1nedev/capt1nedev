import { fonts, measure, text, takeGlyphDefs } from './type.mjs';

// Same tokens as the portfolio's tailwind.config.ts.
export const C = {
  void: '#050A0F',
  deep: '#0A1628',
  fog: '#1A2840',
  signal: '#00E5A0',
  ember: '#FF4D1C',
  chrome: '#C8D8E8',
  sky: '#38BDF8',
  violet: '#C4B5FD',
};

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const n = (v) => Math.round(v * 100) / 100;

// Call with a finished body: it collects the glyphs that body used.
export function doc({ w, h, title, defs = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img">
<title>${esc(title)}</title>
<defs>
${takeGlyphDefs()}
${defs}
</defs>
${body}
</svg>
`;
}

// Small mono tag, like the portfolio's domain chips. Returns svg and width.
export function chip(label, { x, y, color = C.chrome, textOpacity = 0.6, bgOpacity = 0.08, borderOpacity = 0.2, size = 10, upper = true, padX = 9, h = 22, font = fonts.mono500, tracking = 0.08 }) {
  const str = upper ? label.toUpperCase() : label;
  const tw = measure(font, str, size, tracking);
  const w = Math.ceil(tw + padX * 2);
  const svg =
    `<rect x="${n(x + 0.5)}" y="${n(y + 0.5)}" width="${w - 1}" height="${h - 1}" rx="4" fill="${color}" fill-opacity="${bgOpacity}" stroke="${color}" stroke-opacity="${borderOpacity}"/>` +
    text(font, str, { x: x + padX, y: y + h / 2 + size * 0.36, size, tracking, fill: color, opacity: textOpacity });
  return { svg, w };
}

// Lays chips left to right and stops before overflowing maxWidth.
export function chipRow(labels, { x, y, maxWidth, gap = 6, ...opts }) {
  let cx = x;
  let out = '';
  for (const label of labels) {
    const probe = chip(label, { x: cx, y, ...opts });
    if (cx + probe.w > x + maxWidth) break;
    out += probe.svg;
    cx += probe.w + gap;
  }
  return out;
}

// The pulsing "live" dot from the portfolio (animate-ping).
export function pulseDot({ cx, cy, r = 3.5, color = C.signal, dur = 1.6, begin = 0 }) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="0">
  <animate attributeName="r" values="${r};${r * 3}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
  <animate attributeName="fill-opacity" values="0.7;0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
</circle>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
}

// Arrows drawn as strokes: the web-font subsets have no arrow glyphs.
export function arrowRight({ x, y, w = 12, color, width = 1.6, opacity = 1 }) {
  const h = w * 0.42;
  return `<path d="M${x} ${y}H${x + w}M${x + w - h} ${y - h}L${x + w} ${y}L${x + w - h} ${y + h}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export function arrowUpRight({ x, y, s = 9, color, width = 1.6, opacity = 1 }) {
  return `<path d="M${x} ${y + s}L${x + s} ${y}M${x + s * 0.3} ${y}H${x + s}V${y + s * 0.7}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// Faint dot grid like the hero canvas on the portfolio.
export function dotPattern(id, { step = 24, r = 0.9, color = C.signal, opacity = 0.07 }) {
  const c = step / 2;
  return `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><circle cx="${c}" cy="${c}" r="${r}" fill="${color}" fill-opacity="${opacity}"/></pattern>`;
}
