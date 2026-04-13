// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://mcp-tool-shop-org.github.io',
  base: '/motif',
  integrations: [
    starlight({
      title: 'Motif',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/mcp-tool-shop-org/motif' },
      ],
      sidebar: [
        { label: 'Getting Started', autogenerate: { directory: 'handbook/getting-started' } },
        { label: 'Product', autogenerate: { directory: 'handbook/product' } },
        { label: 'Architecture', autogenerate: { directory: 'handbook/architecture' } },
        { label: 'Studio', autogenerate: { directory: 'handbook/studio' } },
        { label: 'Creative Workflows', autogenerate: { directory: 'handbook/workflows' } },
        { label: 'Strategy', autogenerate: { directory: 'handbook/strategy' } },
      ],
      customCss: ['./src/styles/starlight-custom.css'],
      disable404Route: true,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
