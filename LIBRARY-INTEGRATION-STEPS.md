# Library Integration Steps

## Problem Summary
The library has CSS issues because:
1. CodeMirror CSS wasn't being imported properly
2. CSS variables were scoped to `.workflow-visualizer-root` but Radix UI portals render outside this scope
3. The `@import` statements in CSS don't work with Vite library mode

## Solution: 3 Files to Update

### 1. Create `src/main.ts` (Library Entry Point)
\`\`\`typescript
// Copy content from LIBRARY-main.ts
\`\`\`
This file:
- Imports CodeMirror CSS directly (instead of @import in CSS)
- Imports the library's global styles
- Exports all public components and types

### 2. Replace `src/styles/globals.css`
\`\`\`css
// Copy content from LIBRARY-globals-fixed.css
\`\`\`
This file:
- Removes all @import statements
- Moves CSS variables to :root (global scope) so portals can access them
- Keeps Tailwind directives and base styles

### 3. Verify `vite.config.ts` has these settings
\`\`\`typescript
build: {
  lib: {
    entry: resolve(__dirname, 'src/main.ts'), // ✅ Already correct
    formats: ['es'],
  },
  rollupOptions: {
    output: {
      assetFileNames: 'assets/[name][extname]', // ✅ Should generate assets/index.css
    },
  },
}
\`\`\`

## After Making Changes

1. **Rebuild the library**:
   \`\`\`bash
   npm run build
   \`\`\`

2. **Verify the build output**:
   - Check `dist/main.js` exists
   - Check `dist/assets/index.css` exists and is >100KB
   - The CSS file should contain:
     - All Tailwind classes with `wcv-` prefix
     - React Flow styles
     - CodeMirror styles
     - CSS custom properties on :root

3. **Bump version** in package.json:
   \`\`\`json
   {
     "version": "1.2.4"
   }
   \`\`\`

4. **Publish**:
   \`\`\`bash
   npm publish
   \`\`\`

5. **Update consuming project**:
   \`\`\`bash
   npm install @johngalt/workflow-conductor-viewer@1.2.4
   \`\`\`

6. **Verify in consuming app**:
   \`\`\`tsx
   import { WorkflowViewerTool } from '@johngalt/workflow-conductor-viewer'
   import '@johngalt/workflow-conductor-viewer/dist/assets/index.css'
   
   // Component should now work with visible popovers and styled CodeMirror
   \`\`\`

## Why This Fixes Everything

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| Popover not visible | CSS vars on `.workflow-visualizer-root`, portal renders outside | Move vars to `:root` |
| CodeMirror broken | Theme CSS not imported | Import in main.ts |
| Save/Cancel hidden | Same as popover - portal outside scope | Move vars to `:root` |
| @import error in Storybook | Vite can't resolve @import in library mode | Import in TypeScript |

## Testing Checklist

- [ ] Popovers open and are visible
- [ ] CodeMirror has proper syntax highlighting
- [ ] Save/Cancel buttons are visible in form panel
- [ ] Dark mode works correctly
- [ ] No console errors about undefined CSS variables
- [ ] Storybook runs without errors
