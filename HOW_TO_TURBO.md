# Creating a New Package in Turborepo

## 1. Navigate to `packages/`
```bash
cd packages
```

## 2. Create the Package Folder
```bash
mkdir my-new-package
cd my-new-package
```

## 3. Create `package.json`
```json
{
  "name": "@velocitylabs-org/my-new-package",
  "version": "0.0.1",
  "private": true,
  "description": "Describe your package here",
  "type": "module",
  "author": "Stefano Imparato <stefano@velocitylabs.org>", //only if you're me
  // if applicable, in the case of configs, these are useless
  "scripts": {
    // tsc-alias might not be always necessary
    "build": "tsc -b && tsc-alias",
    "watch": "tsc --watch & tsc-alias -w",
    "lint": "eslint ."
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "devDependencies": {
    "@velocitylabs-org/turtle-eslint-config": "workspace:*",
    "@velocitylabs-org/turtle-typescript-config": "workspace:*",
    "eslint": "^9.25.1",
    "prettier": "^3.5.3",
    "tsc-alias": "^1.8.16"
  }
}
```

## 4. Create `tsconfig.json`
```json
{
  "extends": "@velocitylabs-org/turtle-typescript-config/minimal.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## 5. Create Source Folder
```bash
mkdir src
echo "export const hello = () => 'Hello World'" > src/index.ts
```

## 6. Build
```bash
pnpm build --filter @velocitylabs-org/my-new-package
```

✅ Done — your new package follows the same structure as the existing ones in the repo.
