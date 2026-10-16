// Everything the generated images say. Copy follows capt1nedev.vercel.app.

export const profile = {
  first: 'JUSTINE',
  last: 'BASIBAS',
  status: 'Available for remote opportunities',
  role: ['Web developer', 'Philippines', 'Remote-ready'],
  tagline: ['I turn complex workflows', 'into products people can use.'],
};

// color keys refer to C in lib/svg.mjs; they match the portfolio's domain chips.
export const featured = {
  slug: 'resumiq',
  name: 'Resumiq',
  domain: 'Career SaaS',
  color: 'ember',
  url: 'https://resumiq.tech/',
  tagline: 'AI resume optimizer with job-specific rewrites, keyword scores, and document exports.',
  points: [
    'Scores keyword coverage before and after the AI rewrite',
    'Tailored cover letters and saved optimization history',
    'PDF and DOCX exports, free plan plus paid tiers',
  ],
  stack: ['Next.js', 'TypeScript', 'OpenAI', 'MongoDB', 'NextAuth', 'Paddle'],
  keywords: ['REST APIs', 'TypeScript', 'React', 'CI/CD', 'Agile', 'SQL', 'Figma', 'AWS'],
};

export const projects = [
  {
    slug: 'studynova',
    name: 'StudyNova AI',
    domain: 'EdTech SaaS',
    color: 'violet',
    url: 'https://studynovaai.app/',
    tagline: 'AI study platform for turning notes into flashcards, quizzes, and classroom assignments.',
    stack: ['Next.js', 'OpenAI', 'Tesseract.js', 'Upstash Redis', 'Paddle'],
  },
  {
    slug: 'tindatrack',
    name: 'TindaTrack',
    domain: 'Retail Operations',
    color: 'sky',
    url: 'https://tindatracker.vercel.app/',
    tagline: 'Inventory tracking for small retail stores with barcode, batch, and expiry workflows.',
    stack: ['Next.js', 'MongoDB', 'AWS S3', 'ZXing', 'Zod'],
  },
  {
    slug: 'marketplace',
    name: 'Capt Dev Marketplace',
    domain: 'Developer Marketplace',
    color: 'violet',
    url: 'https://captdev-marketplace.vercel.app/',
    tagline: 'Digital storefront for templates and source code with private post-purchase downloads.',
    stack: ['Next.js', 'AWS S3', 'GCash', 'Playwright', 'Zod'],
  },
  {
    slug: 'naga',
    name: 'Explore Naga City',
    domain: 'Tourism',
    color: 'sky',
    url: 'https://tourism-naga.vercel.app/',
    tagline: 'Tourism intelligence platform for the Pilgrim City of Bicol, Philippines.',
    stack: ['JavaScript', 'Leaflet.js', 'jsPDF', 'HTML', 'CSS'],
  },
  {
    slug: 'gadgetone',
    name: 'GadgetOne',
    domain: 'Commerce',
    color: 'ember',
    url: 'https://gadgetone.vercel.app/',
    tagline: 'Full-stack e-commerce engine with cloud image storage and cart management.',
    stack: ['Next.js', 'Stripe', 'AWS S3', 'NextAuth', 'MongoDB'],
  },
  {
    slug: 'balon',
    name: 'Balon BMS',
    domain: 'Civic Tech',
    color: 'signal',
    url: 'https://balonbms.vercel.app/',
    tagline: 'Resident information and certificate request portal for Barangay Balon Anito, Philippines.',
    stack: ['React', 'Vite', 'TailwindCSS', 'DaisyUI', 'Axios'],
  },
];

export const docxRepro = {
  name: 'docx-repro',
  url: 'https://github.com/capt1nedev/docx-repro',
  summary: 'Shrinks a DOCX parser bug report to the smallest document that still shows the bug.',
  install: 'pip install docx-repro',
  facts: ['Python 3.10+', 'MIT', 'No runtime deps', 'Early alpha'],
};

export const terminal = [
  { cmd: 'whoami' },
  { out: [['Justine Basibas', 'chrome', 0.9], [' · full-stack web developer', 'chrome', 0.5]] },
  { cmd: 'cat now.md' },
  { out: [['- ', 'signal', 0.8], ['Associate Software Developer', 'chrome', 0.75]] },
  { out: [['  ', 'chrome', 0], ['@ Thrive Dynamic Business Solutions', 'chrome', 0.45]] },
  { out: [['- ', 'signal', 0.8], ['Building ', 'chrome', 0.75], ['resumiq.tech', 'signal', 0.95]] },
  { out: [['- ', 'signal', 0.8], ['Shipping ', 'chrome', 0.75], ['studynovaai.app', 'signal', 0.95]] },
  { cmd: 'ls stack/' },
  { out: [['next.js   react     typescript', 'sky', 0.85]] },
  { out: [['python    fastapi   mongodb', 'sky', 0.85]] },
  { cmd: 'echo $STATUS' },
  { out: [['open to remote roles', 'signal', 0.95], [' · replies < 24h', 'chrome', 0.5]] },
];
