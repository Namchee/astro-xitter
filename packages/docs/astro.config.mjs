import node from '@astrojs/node';
import starlight from '@astrojs/starlight';
// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // The docs site is static by default. The Node adapter lets individual
  // routes opt into on-demand rendering with `export const prerender = false`.
  adapter: node({ mode: 'standalone' }),
  integrations: [
    starlight({
      title: 'Astro Xitter',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
      sidebar: [
        'getting-started',
        {
          label: 'Reference',
          items: [{ autogenerate: { directory: 'reference' } }],
        },
        {
          label: 'Demo',
          items: [
            { autogenerate: { directory: 'demo' } },
            {
              label: 'Dynamic',
              link: '/demo/tweet',
            },
          ],
        },
      ],
    }),
  ],
});
