# Post-Build Verification Checklist

After building your library, verify these files and contents before publishing.

## File Structure Check

\`\`\`
dist/
├── assets/
│   └── index.css          ← Should exist and be substantial (>50KB)
├── components/
│   └── workflow-visualizer/
│       └── index.js
│       └── index.d.ts
├── main.js
└── main.d.ts
\`\`\`

## CSS File Verification

Open `dist/assets/index.css` and verify it contains:

### 1. CSS Variables on :root (Critical)

Search for `:root {` - should find:
\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  /* ... many more variables */
}
\`\`\`

### 2. Dark Mode Variables

Search for `.dark {` - should find:
\`\`\`css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode variables */
}
\`\`\`

### 3. Scoped Wrapper Class

Search for `.workflow-visualizer-root` - should find:
\`\`\`css
.workflow-visualizer-root {
  --background: var(--background, 0 0% 100%);
  /* ... with fallbacks */
}
\`\`\`

### 4. Tailwind Utilities with wcv- Prefix

Search for `.wcv-` - should find hundreds of classes:
\`\`\`css
.wcv-flex { display: flex; }
.wcv-bg-popover { background-color: hsl(var(--popover)); }
.wcv-text-foreground { color: hsl(var(--foreground)); }
/* ... many more */
\`\`\`

### 5. React Flow Styles

Search for `.react-flow` - should find:
\`\`\`css
.react-flow__node { ... }
.react-flow__edge { ... }
\`\`\`

### 6. CodeMirror Styles (Critical)

Search for `.cm-` - should find:
\`\`\`css
.cm-editor { ... }
.cm-scroller { ... }
.cm-line { ... }
\`\`\`

And specifically One Dark theme:
\`\`\`css
.cm-theme-one-dark { ... }
\`\`\`

### 7. Radix UI Styles

Search for `[data-radix` - should find:
\`\`\`css
[data-radix-popper-content-wrapper] { ... }
\`\`\`

## Size Verification

Expected file sizes:
- `dist/assets/index.css`: ~100-200 KB (with all styles)
- `dist/main.js`: ~200-500 KB (depending on bundle)

If index.css is < 50 KB, something is wrong - CodeMirror and other styles are missing.

## Import Test

Create a test file locally before publishing:

\`\`\`tsx
// test-import.tsx
import { WorkflowViewerTool } from './dist/main.js'
import './dist/assets/index.css'

console.log('Import successful:', WorkflowViewerTool)
\`\`\`

Run: `node test-import.tsx` (or use tsx/ts-node)

Should not throw errors.

## Browser DevTools Test

After deploying to consuming app:

1. Open DevTools → Network tab
2. Reload page
3. Check that `index.css` loads (should be ~100-200 KB)
4. Open DevTools → Console
5. Run:
\`\`\`javascript
// Should return the CSS variable value
getComputedStyle(document.documentElement).getPropertyValue('--popover')
// Expected: " 0 0% 100%" (note the space)

// Should return the computed color
getComputedStyle(document.documentElement).getPropertyValue('--background')
// Expected: " 0 0% 100%"
\`\`\`

6. Inspect a popover element:
\`\`\`javascript
// After opening a popover
const popover = document.querySelector('[role="dialog"]')
getComputedStyle(popover).backgroundColor
// Expected: "rgb(255, 255, 255)" not "rgba(0, 0, 0, 0)"
\`\`\`

## Common Issues During Build

### Issue: CSS file is tiny (< 10 KB)

**Cause:** CSS not being processed correctly by Vite

**Fix:**
- Ensure `cssCodeSplit: false` in vite.config.ts
- Verify globals.css is imported in main.ts or a component
- Check that `libInjectCss()` plugin is active

### Issue: CodeMirror styles missing

**Cause:** Import statement might be wrong or module not found

**Fix:**
- Verify `@codemirror/theme-one-dark` is in dependencies (not devDependencies)
- Check import statement: `@import '@codemirror/theme-one-dark/theme/one-dark.css';`
- Try importing in main.ts instead: `import '@codemirror/theme-one-dark'`

### Issue: wcv- classes missing

**Cause:** Tailwind not running or content paths wrong

**Fix:**
- Check tailwind.config has correct content paths
- Verify `tailwindcss` and `autoprefixer` in devDependencies
- Run build with verbose logging: `vite build --debug`

## Pre-Publish Checklist

- [ ] dist/assets/index.css exists and is > 50 KB
- [ ] CSS contains `:root` variables
- [ ] CSS contains `.dark` variables  
- [ ] CSS contains `.workflow-visualizer-root` class
- [ ] CSS contains wcv- prefixed utilities
- [ ] CSS contains React Flow styles
- [ ] CSS contains CodeMirror styles (search for .cm-)
- [ ] package.json version bumped
- [ ] CHANGELOG.md updated
- [ ] All TypeScript types compile without errors
- [ ] Local import test passes
- [ ] No errors in build output

If all checks pass: ✅ Ready to publish!

\`\`\`bash
npm publish
