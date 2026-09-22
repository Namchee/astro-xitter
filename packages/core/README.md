# astro-xitter

Embed posts from [Twitter / X](https://x.com) in Astro websites with minimal client-side JavaScript.

Astro Xitter fetches post data on the server and renders it without an iframe. It supports both static and on-demand Astro rendering.

## Installation

```sh
pnpm add astro-xitter
```

You can also install the package with npm, Yarn, or Bun.

## Usage

Import the `Xitter` component and provide a post ID:

```astro
---
import { Xitter } from 'astro-xitter';
---

<Xitter id="20" />
```

Please read the [documentation site](https://astro-xitter.namchee.dev/) for API reference of the component.

## Contributing

See the repository's [contributing guidelines](../../CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](../../LICENSE).
