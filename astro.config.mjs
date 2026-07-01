import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { visit } from 'unist-util-visit';

// Tags markdown/MDX links as internal or external so they can be styled
// differently, and makes external links open in a new tab safely.
function rehypeLinkKinds() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string' || !href) return;

      const absolute = /^https?:\/\//i.test(href) || href.startsWith('//');
      let external = absolute || href.startsWith('mailto:') || href.startsWith('tel:');

      // Links back to my own domain count as internal navigation.
      if (external && /^https?:\/\//i.test(href)) {
        try {
          if (/(^|\.)danicallero\.es$/i.test(new URL(href).hostname)) external = false;
        } catch {}
      }

      const existing = node.properties.className;
      const classList = Array.isArray(existing) ? existing : existing ? [existing] : [];

      if (external) {
        classList.push('link-external');
        node.properties.target = '_blank';
        node.properties.rel = 'noopener noreferrer';
      } else {
        classList.push('link-internal');
      }
      node.properties.className = classList;
    });
  };
}

export default defineConfig({
  site: 'https://www.danicallero.es',
  markdown: {
    rehypePlugins: [rehypeLinkKinds],
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap(),
  ],
  output: 'static',
});
