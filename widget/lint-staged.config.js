/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */

export default {
  '**/*.{ts,tsx}': stagedFiles => [`eslint .`, `prettier --write ${stagedFiles.join(' ')}`],
}
