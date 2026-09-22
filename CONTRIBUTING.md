# Contributing to Astro Xitter

Thanks for your interest in contributing! Bug fixes, documentation improvements, and new features are welcome.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies with the required package manager:

   ```sh
   pnpm install
   ```

3. Create a branch for your changes:

   ```sh
   git checkout -b my-change
   ```

> [!NOTE]
> Branch name should follow the [Conventional Branch](https://conventionalbranch.org/) convention.

## Making changes

- Keep changes focused and update the documentation when behavior or the public API changes.
- Follow the existing TypeScript and Astro patterns in the repository.
- Do not commit generated files, build output, or dependency directories.
- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages and explain non-obvious implementation decisions in the pull request.

## Checks

Before opening a pull request, run the relevant checks:

```sh
pnpm format
pnpm lint
pnpm --dir docs build
```

If your change affects only the documentation site, the documentation build is usually sufficient in addition to formatting.

## Pull requests

1. Push your branch and open a pull request against `main`.
2. Describe what changed and why.
3. Include screenshots or reproduction steps when relevant.
4. Make sure the checks pass and respond to review feedback.

By contributing, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
