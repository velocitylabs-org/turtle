/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */

export default {
  '**/*.{js,jsx,ts,tsx,json,mjs,cjs}': (stagedFiles) => [`biome check --write ${stagedFiles.join(' ')}`],
}
