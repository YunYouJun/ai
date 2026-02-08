---
name: yunyoujun
description: "YunYouJun's opinionated coding preferences and tooling conventions for JavaScript/TypeScript projects. Use when working on YunYouJun's projects, setting up new projects, or following YunYouJun's coding style."
metadata:
  author: YunYouJun
  version: 0.1.0
---

YunYouJun's coding preferences and tooling conventions.

## Coding Practices

### General

- Use English for code, comments, and commit messages
- Use Chinese (Simplified) for documentation and user-facing content
- Prefer functional and declarative programming patterns
- Keep files focused and single-responsibility
- Use `export default` sparingly; prefer named exports

### TypeScript

- Always use TypeScript for new projects
- Prefer `interface` over `type` for object shapes
- Use explicit return types for public APIs
- Avoid `enum`; prefer `as const` objects or union types
- Use `type` imports: `import type { Foo } from './foo'`

### Vue

- Use Vue 3 Composition API with `<script setup lang="ts">`
- Use `defineProps`, `defineEmits`, `defineModel` macros
- Prefer single-file components (`.vue`)
- Use VueUse composables when appropriate

### Naming

- Files: `kebab-case` for all files
- Components: `PascalCase` for Vue components
- Variables/functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE` for true constants
- Types/Interfaces: `PascalCase`

### Git Commits

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

## Tooling

### Package Manager

- Use **pnpm** as the package manager
- Use `pnpm` commands directly (not ni/nr)
- Use pnpm workspace for monorepos
- Use pnpm catalogs for shared dependency versions

### ESLint

- Use `@antfu/eslint-config` — no Prettier needed
- Run `pnpm lint --fix` after making changes

### TypeScript Config

Prefer the following base `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

### Build & Dev

- Use **Vite** for web projects
- Use **VitePress** for documentation sites
- Use **UnoCSS** (or Tailwind CSS) for styling
- Use **Vitest** for testing

### CI/CD

- Use **GitHub Actions** for CI
- Use `gh` CLI for GitHub operations

## References

| Topic           | Skill              | Plugin Command            |
| --------------- | ------------------ | ------------------------- |
| PR automation   | `/pr-cycle`        | `/yyj-ai:pr-cycle`        |
| Fix issues      | `/fix-issue`       | `/yyj-ai:fix-issue`       |
| Review feedback | `/review-feedback` | `/yyj-ai:review-feedback` |
