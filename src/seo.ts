// Centralized SEO setup: title, meta, links, and JSON-LD structured data.
// Idempotent: safe to call multiple times (e.g., during HMR).

type Attrs = Record<string, string>;

function findInHead(tag: string, key: string, val: string): HTMLElement | null {
  const els = document.head.querySelectorAll<HTMLElement>(tag);
  for (const el of Array.from(els)) {
    if (el.getAttribute(key) === val) return el;
  }
  return null;
}

function upsert(tag: string, key: string, keyVal: string, attrs: Attrs): HTMLElement {
  let el = findInHead(tag, key, keyVal);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(key, keyVal);
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

function upsertMetaByName(name: string, content: string) {
  return upsert('meta', 'name', name, { content });
}

function upsertMetaByProp(property: string, content: string) {
  return upsert('meta', 'property', property, { content });
}

function upsertLink(rel: string, href: string, attrs: Attrs = {}) {
  return upsert('link', 'rel', rel, { href, ...attrs });
}

function upsertScriptJsonLd(id: string, json: unknown) {
  let script = findInHead('script', 'data-seo-id', id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-id', id);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(json);
}

export interface SeoOptions {
  canonical: string;
  siteName: string;
  personName: string;
  alternateNames?: string[];
  description: string;
  author?: string;
  themeColor?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  sameAs?: string[];
  imageUrl?: string;
  imageAlt?: string;
  imageType?: string;
  imageWidth?: string | number;
  imageHeight?: string | number;
}

export function initSEO(opts?: Partial<SeoOptions>) {
  const canonical = opts?.canonical ?? 'https://www.danicallero.es/';
  const siteName = opts?.siteName ?? 'danicallero';
  const personName = opts?.personName ?? 'Daniel Callero';
  const description = opts?.description ?? 'Personal site of Daniel (Dani) Callero — CS student and aspiring developer from A Coruña, Spain. Also known as danicallero / danielcallero.';
  const author = opts?.author ?? 'Daniel Callero';
  const themeColor = opts?.themeColor ?? '#000000';

  const imageUrl = opts?.imageUrl ?? 'https://www.danicallero.es/og-image.png?v=1';
  const twitterCard = opts?.twitterCard ?? (imageUrl ? 'summary_large_image' : 'summary');
  const sameAs = opts?.sameAs ?? ['https://github.com/danicallero', 'https://links.danicallero.es'];
  const alternateNames = opts?.alternateNames ?? ['Dani Callero', 'danicallero', 'danielcallero'];
  const imageAlt = opts?.imageAlt ?? `${personName} — ${siteName}`;
  const imageType = opts?.imageType ?? 'image/png';
  const imageWidth = opts?.imageWidth;
  const imageHeight = opts?.imageHeight;

  // Title
  const title = `${personName} — ${siteName}`;
  if (document.title !== title) document.title = title;

  // Canonical
  upsertLink('canonical', canonical);

  // Meta basics
  upsertMetaByName('description', description);
  upsertMetaByName('author', author);
  upsertMetaByName('robots', 'index, follow');
  upsertMetaByName('theme-color', themeColor);

  // Favicon/manifest links (leave as-is if already in index.html)
  // These upserts won’t override existing different rels like manifest/apple-touch-icon.
  upsertLink('icon', '/favicon.svg', { type: 'image/svg+xml' });

  // Open Graph
  upsertMetaByProp('og:type', 'website');
  upsertMetaByProp('og:title', title);
  upsertMetaByProp('og:description', description);
  upsertMetaByProp('og:url', canonical);
  upsertMetaByProp('og:site_name', siteName);
  if (imageUrl) {
    upsertMetaByProp('og:image', imageUrl);
    upsertMetaByProp('og:image:alt', imageAlt);
    upsertMetaByProp('og:image:type', imageType);
    if (imageWidth) upsertMetaByProp('og:image:width', String(imageWidth));
    if (imageHeight) upsertMetaByProp('og:image:height', String(imageHeight));
  }

  // Twitter
  upsertMetaByName('twitter:card', twitterCard);
  upsertMetaByName('twitter:title', title);
  upsertMetaByName('twitter:description', description);
  if (imageUrl) {
    upsertMetaByName('twitter:image', imageUrl);
    upsertMetaByName('twitter:image:alt', imageAlt);
  }

  // JSON-LD: Website
  upsertScriptJsonLd('website', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: canonical,
    name: siteName,
    author: { '@id': `${canonical}#person` },
  });

  // JSON-LD: Person
  upsertScriptJsonLd('person', {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${canonical}#person`,
    name: personName,
    alternateName: alternateNames,
    url: canonical,
    sameAs,
    homeLocation: { '@type': 'Place', name: 'A Coruña, Spain' },
    jobTitle: 'CS Student',
  });
}
