---
name: yunyoujun
description: "YunYouJun's opinionated coding preferences and tooling conventions for JavaScript/TypeScript projects. Use when working on YunYouJun's projects, setting up new projects, or following YunYouJun's coding style."
metadata:
  author: YunYouJun
  version: 0.2.0
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

## Code Documentation

### Comment Guidelines

- Write comments in **English**; keep them concise and purposeful
- Use comments to explain **why**, not **what** — code should be self-explanatory
- Avoid redundant comments that merely restate the code
- Place comments on the line above the code they describe, not inline (except for brief clarifications)

```ts
// Good — explains intent
// Retry up to 3 times to handle transient network failures
await retry(fetchData, { attempts: 3 })

// Bad — restates the code
// Set count to 0
const count = 0
```

### JSDoc / TSDoc Standards

All **public** functions, classes, interfaces, and type exports must include JSDoc:

````ts
/**
 * Resolve a module path relative to the project root.
 *
 * @param name - The module specifier (e.g. `@yunyoujun/utils`)
 * @param options - Resolution options
 * @returns The absolute file path of the resolved module
 * @throws {ModuleNotFoundError} If the module cannot be located
 *
 * @example
 * ```ts
 * const path = resolveModule('@yunyoujun/utils', { root: '/app' })
 * ```
 */
export function resolveModule(name: string, options: ResolveOptions): string {
  // ...
}
````

Key rules:

- **`@param`** — describe every parameter with its purpose
- **`@returns`** — describe the return value and type
- **`@throws`** — document error conditions
- **`@example`** — provide a usage example for non-trivial APIs
- **`@see`** — link to related documentation, functions, or external references
- **`@deprecated`** — mark deprecated APIs with migration guidance
- Internal / private helpers do **not** require JSDoc (a short `//` comment suffices)

### Vue Component Documentation

Document component props, emits, and slots using TypeScript types and comments:

````vue
<script setup lang="ts">
/**
 * A reusable card component with configurable header and content.
 *
 * @example
 * ```vue
 * <BaseCard title="Hello" :closable="true" @close="onClose">
 *   <p>Content goes here</p>
 * </BaseCard>
 * ```
 */

interface Props {
  /** Card title displayed in the header */
  title: string
  /** Whether to show the close button */
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closable: false,
})

const emit = defineEmits<{
  /** Emitted when the close button is clicked */
  close: []
}>()
</script>
````

## Module Organization

### File & Directory Structure

- **One concept per file** — each file should have a clear, single responsibility
- **Group by feature**, not by type (prefer `features/auth/` over `components/`, `services/`)
- **Index files** (`index.ts`) should only re-export; avoid putting logic in barrel files
- Use **flat structure** within a module; nest directories only when >5 related files exist

```
# Good — feature-based grouping
src/
  features/
    auth/
      composables/
        use-auth.ts
      components/
        LoginForm.vue
      types.ts
      index.ts          # re-exports only
    dashboard/
      ...

# Avoid — type-based grouping at scale
src/
  components/
    LoginForm.vue
    DashboardCard.vue
  composables/
    use-auth.ts
    use-dashboard.ts
```

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

| Topic                | Command                             |
| -------------------- | ----------------------------------- |
| Fix issues           | `/ai-coding:fix-issue`              |
| PR automation        | `/ai-coding:pr-cycle`               |
| Review feedback      | `/ai-coding:review-feedback`        |
| Copilot review reply | `/ai-coding:address-copilot-review` |
| Copilot review loop  | `/ai-coding:copilot-review-loop`    |
