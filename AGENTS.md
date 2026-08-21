## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: prettier, eslint, playwright, tailwindcss, sveltekit-adapter, ai-tools, experimental

## Project Overview

A static digital scholarly edition of manuscripts, deployed to GitHub Pages via `@sveltejs/adapter-static`. Planned sections:

- **Transcription page** — the most complex view; renders manuscript text (likely with facsimile/text alignment, apparatus, annotations).
- **Index of people and places** — prosopographical/geographical registry, cross-linked from transcriptions and commentary.
- **Commentary** — scholarly notes tied to transcription passages.

Since the site is static (no server-side runtime at request time), prefer build-time data loading (`load` functions with `prerender = true`) over runtime API calls, and keep cross-references (e.g. person/place IDs cited in transcriptions) resolvable at build time.

## Conventions

- This project targets the **SvelteKit 3 release candidate** (Svelte 5 required). Config lives in [vite.config.ts](../vite.config.ts), not `svelte.config.js`; [tsconfig.json](../tsconfig.json) extends `$app/tsconfig` rather than `.svelte-kit/tsconfig.json`.
- Runes mode is forced project-wide (see [vite.config.ts](../vite.config.ts)) except inside `node_modules`.
- Import app code via the `#lib` subpath import (Node/TS native, maps to `src/lib`), e.g. `import Foo from '#lib/Foo.svelte'`. When importing a plain module (not a `.svelte` file), the path must be unambiguous, e.g. `#lib/foo.ts` or `#lib/foo/index.ts`.
- `async` and `remoteFunctions` are enabled as `experimental` features in [vite.config.ts](../vite.config.ts) — remote functions are still behind a flag upstream in the SvelteKit 3 RC, so expect API changes before stable release.
- Global styles/Tailwind/DaisyUI are imported once in [+layout.svelte](../src/routes/+layout.svelte) via [layout.css](../src/routes/layout.css).

## Commands

- `pnpm dev` — dev server. `pnpm build` / `pnpm preview` — production build/preview.
- `pnpm check` — svelte-check type checking (run after non-trivial edits).
- `pnpm lint` / `pnpm format` — prettier + eslint check / auto-format.
- `pnpm test` (alias for `pnpm test:e2e`) — Playwright e2e tests; specs live alongside routes as `*.e2e.ts`.

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit 3 release candidate documentation.

You are able to use context7 as an MCP for DaisyUI.

## DaisyUI

DaisyUI is a Tailwind CSS component plugin, enabled via `@plugin 'daisyui';` in [layout.css](../src/routes/layout.css). Use context7 to look up current DaisyUI component classes/APIs before using unfamiliar components — do not guess class names, as they change between major versions.

Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
