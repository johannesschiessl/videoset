# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Videoset is a React 19 + TypeScript web application built with Vite, Tailwind CSS, and shadcn/ui components. The project uses Base UI for advanced components and includes the React Compiler for optimization.

## Common Commands

- **Development server**: `bun run dev` - Starts Vite dev server at http://localhost:5173
- **Build for production**: `bun run build` - Compiles TypeScript, then bundles with Vite
- **Lint code**: `bun run lint` - Runs ESLint to check TypeScript and React files
- **Preview production build**: `bun run preview` - Serves the built dist folder locally

## Tech Stack

- **Frontend Framework**: React 19 with React Compiler (babel-plugin-react-compiler)
- **Build Tool**: Vite 7
- **Language**: TypeScript 5.9 (strict mode enabled)
- **Styling**: Tailwind CSS 4 with Tailwind Merge for utility class merging
- **Component Library**: shadcn/ui (base-maia style) with Base UI for advanced components
- **Icons**: Lucide React
- **CSS Utilities**: class-variance-authority for component variants, clsx for conditional classes

## Code Organization

```
src/
├── App.tsx           - Root application component
├── main.tsx          - Entry point (renders App into root DOM element)
├── styles.css        - Global Tailwind CSS styles
├── components/       - UI components (shadcn/ui components go here)
│   └── ui/          - Base UI components (auto-installed by shadcn)
├── hooks/           - Custom React hooks
├── lib/
│   └── utils.ts     - Utility functions and cn() helper
└── index.html       - HTML template
```

## Styling

Use Tailwind for styling. I mostly use it for layout styling and try to use the built-in styles of the Shadcn components as much as possible, without customising them. For components that are not from Shadcn, use CSS variables.

## shadcn/ui Setup

Components are configured with:

- **Style**: base-maia (minimalist design system)
- **Icon Library**: Lucide
- **CSS Variables**: Enabled (Tailwind design tokens)
- **Aliases**:
  - `@/components` - UI components
  - `@/ui` - shadcn/ui base components
  - `@/lib/utils` - Utility functions
  - `@/hooks` - Custom hooks

Add components with: `bunx shadcn@latest add <component-name>`

## Development Notes

- React Compiler is enabled for automatic memoization and optimization
- Tailwind CSS v4 is integrated via Vite plugin (not PostCSS)
- The project uses strict TypeScript settings; all imports must be explicit
- The `@` alias makes imports clean: `import Component from "@/components/MyComponent"`
