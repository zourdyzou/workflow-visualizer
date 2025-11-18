# Migration Guide: Fixing Library Integration Issues

This guide explains how to fix the CSS variable scoping and CodeMirror issues in your workflow-conductor-viewer library.

## Problems Being Solved

1. ✅ Popovers not visible (Radix UI portals can't access CSS variables)
2. ✅ Save/Cancel buttons not visible (ScrollArea portal CSS issue)
3. ✅ CodeMirror syntax highlighting broken (theme CSS not bundled)
4. ✅ Background colors missing (CSS variables undefined in portals)

## Step-by-Step Migration

### Step 1: Replace globals.css

**Location:** `src/styles/globals.css`

Replace your current globals.css with the new version provided in `globals.css` file above.

**Key Changes:**
- CSS variables moved from `.workflow-visualizer-root` to `:root` (global scope)
- `.workflow-visualizer-root` now inherits from `:root` with fallbacks
- Added `@import '@codemirror/theme-one-dark/theme/one-dark.css';` for CodeMirror styles

### Step 2: Update vite.config.ts

**Location:** `vite.config.ts`

Add these changes to your Vite configuration:

**Change 1:** Add `cssCodeSplit: false` to build options
\`\`\`ts
build: {
  cssCodeSplit: false, // Bundle all CSS into one file
  lib: {
    // ... existing config
  }
}
\`\`\`

**Change 2:** Update assetFileNames to ensure consistent CSS naming
\`\`\`ts
output: {
  entryFileNames: '[name].js',
  assetFileNames: (assetInfo) => {
    if (assetInfo.name === 'style.css') return 'assets/index.css'
    return 'assets/[name][extname]'
  },
  // ... rest of output config
}
\`\`\`

**Change 3:** Add CSS processing configuration
\`\`\`ts
css: {
  postcss: './postcss.config.js',
}
\`\`\`

### Step 3: Verify package.json exports

Ensure your `package.json` has the CSS export:

\`\`\`json
{
  "exports": {
    ".": {
      "types": "./dist/main.d.ts",
      "import": "./dist/main.js"
    },
    "./dist/assets/index.css": "./dist/assets/index.css"
  }
}
\`\`\`

### Step 4: Rebuild the library

\`\`\`bash
npm run build
\`\`\`

**Verify the build output:**
- Check that `dist/assets/index.css` exists
- Check that the CSS file includes:
  - `:root { --background: ... }` declarations
  - `.dark { ... }` declarations
  - `.workflow-visualizer-root { ... }` declarations
  - CodeMirror theme styles
  - All `wcv-` prefixed Tailwind utilities

### Step 5: Bump version and republish

Update `package.json` version:
\`\`\`json
{
  "version": "1.2.4"
}
\`\`\`

Publish to your private registry:
\`\`\`bash
npm publish
\`\`\`

### Step 6: Update consuming applications

In your target project where you use the library:

**1. Update the package:**
\`\`\`bash
npm install @johngalt/workflow-conductor-viewer@1.2.4
\`\`\`

**2. Ensure CSS is imported in your main file:**
\`\`\`tsx
// In main.tsx, App.tsx, or _app.tsx
import '@johngalt/workflow-conductor-viewer/dist/assets/index.css'
\`\`\`

**3. Clear build cache:**
\`\`\`bash
# For Vite projects
rm -rf node_modules/.vite

# For Next.js projects
rm -rf .next

# Rebuild
npm run dev
\`\`\`

## Testing Checklist

After migration, verify:

- [ ] Task selection popover opens when clicking the plus (+) button
- [ ] Popover has visible white/dark background
- [ ] Task list items are visible in the popover
- [ ] Form panel has visible Save and Cancel buttons at the bottom
- [ ] CodeMirror editor has syntax highlighting (colored JSON/JavaScript)
- [ ] CodeMirror editor has dark theme background
- [ ] Workflow nodes are properly styled
- [ ] Dark mode toggle works (if applicable)
- [ ] All form inputs are visible and styled
- [ ] ScrollArea works properly in form panel

## Troubleshooting

### Popovers Still Not Visible

**Check 1:** Verify CSS is imported
\`\`\`tsx
// Should be in your main entry file
import '@johngalt/workflow-conductor-viewer/dist/assets/index.css'
\`\`\`

**Check 2:** Inspect the popover element in browser DevTools
- Open DevTools → Elements
- Find the popover element (it will be at the end of `<body>`)
- Check computed styles for `background-color`
- It should show `rgb(255, 255, 255)` or similar, not `rgba(0, 0, 0, 0)`

**Check 3:** Verify CSS variables exist
- Open DevTools → Console
\`\`\`javascript
getComputedStyle(document.documentElement).getPropertyValue('--popover')
\`\`\`
- Should return `0 0% 100%` or similar, not empty string

### CodeMirror Still Broken

**Check 1:** Verify theme CSS is in bundle
- Open `node_modules/@johngalt/workflow-conductor-viewer/dist/assets/index.css`
- Search for `.cm-` classes
- Should find CodeMirror theme styles

**Check 2:** Check if CodeMirror theme is imported
\`\`\`tsx
// This should be in your library's workflow-form-panel or similar
import { oneDark } from '@codemirror/theme-one-dark'
\`\`\`

### Save/Cancel Buttons Still Not Visible

**Issue:** ScrollArea portal can't access CSS variables

**Solution:** Ensure the new globals.css with `:root` variables is deployed. The ScrollArea uses `wcv-bg-background` which references `var(--background)` which must be on `:root`.

## Architecture Explanation

### Why This Fix Works

**Before (Broken):**
\`\`\`
<html>
  <body>
    <div class="workflow-visualizer-root">
      <!-- CSS variables defined here -->
      <button>Click me</button>
    </div>
    
    <!-- Radix Portal renders here -->
    <div class="popover">
      <!-- ❌ Can't access CSS variables from .workflow-visualizer-root -->
      <div class="wcv-bg-popover">No color!</div>
    </div>
  </body>
</html>
\`\`\`

**After (Fixed):**
\`\`\`
<html> <!-- CSS variables defined here on :root -->
  <body>
    <div class="workflow-visualizer-root">
      <!-- Inherits variables + can override -->
      <button>Click me</button>
    </div>
    
    <!-- Radix Portal renders here -->
    <div class="popover">
      <!-- ✅ Can access CSS variables from :root -->
      <div class="wcv-bg-popover">Proper color!</div>
    </div>
  </body>
</html>
\`\`\`

The key insight: **Radix UI portals render at document root level**, so they need CSS variables at document root level (`:root`) to work properly.

## Rollback Plan

If you need to rollback:

1. Revert to version 1.2.3:
   \`\`\`bash
   npm install @johngalt/workflow-conductor-viewer@1.2.3
   \`\`\`

2. Or keep code changes and handle CSS in consuming app:
   \`\`\`css
   /* In your app's global CSS */
   :root {
     --background: 0 0% 100%;
     --popover: 0 0% 100%;
     /* ... all other variables */
   }
   \`\`\`

## Questions?

If issues persist after following this guide:

1. Check browser console for CSS errors
2. Verify all files were properly updated
3. Ensure build was successful
4. Clear all caches (browser, bundler, node_modules)
5. Check that dist/assets/index.css contains expected CSS
