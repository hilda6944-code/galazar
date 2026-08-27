# GALAZAR

GALAZAR is a local-first visual prompt-construction application. It uses structured DNA modules to help users build image prompts deliberately while keeping every creative choice under their control.

## Module order

`Intent → World → Atmosphere → Anchor → Subject → Detail → Camera & Composition → Format → Light → Color → Style → Medium → Finish → Exclusions`

The authoritative order is defined by `MODULE_ORDER` and is also used by the deterministic prompt pipeline.

## Core workflows

- Live Prompt Assembly
- Undo / Redo
- Clear Build
- Saved Builds
- Projects
- Variants / Branching
- Variant Lock
- DNA Library
- Browser-local persistence through `localStorage`

## Development stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix-based, shadcn-style UI components

## Local development

```sh
npm install
npm run dev
npm run build
npm run lint
npm test
```

`npm test` runs the supported GALAZAR regression suites in a deterministic sequence and stops on the first failure.

## Persistence

Application state is currently stored in the browser through `localStorage`. It is local to the browser profile and origin in which GALAZAR is running.

## Design principle

**Teach Without Taking Control**

GALAZAR may explain options and guide decisions, but it does not silently select creative choices for the user.
