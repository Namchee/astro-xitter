import cloudflare from '@astrojs/cloudflare';
import starlight from '@astrojs/starlight';
// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({ prerenderEnvironment: 'node' }),
  integrations: [
    starlight({
      title: 'Astro Xitter',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Namchee/astro-xitter' }],
      sidebar: [
        'getting-started',
        {
          label: 'Guides',
          items: [{ autogenerate: { directory: 'guides' } }],
        },
        {
          label: 'Demo',
          items: [
            { autogenerate: { directory: 'demo' } },
            {
              label: 'On Demand',
              link: '/demo/tweet',
            },
          ],
        },
      ],
    }),
  ],
  image: {
    domains: ["pbs.twimg.com"]
  }
});
