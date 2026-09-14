import { createESLintConfig } from '@namchee/eslint-config';

export default createESLintConfig({ astro: true, json: true, stylistic: false, typecheck: false, package: false, regexp: false });
