# Workflow Conductor Viewer - Library Usage Guide

## Installation

\`\`\`bash
npm install @johngalt/workflow-conductor-viewer
\`\`\`

## Required Peer Dependencies

Make sure you have these installed in your project:

\`\`\`bash
npm install react react-dom tailwindcss tailwindcss-animate
\`\`\`

## Setup

### 1. Import the CSS

In your main application file (e.g., `main.tsx`, `App.tsx`, or `_app.tsx`), import the library CSS:

\`\`\`tsx
import '@johngalt/workflow-conductor-viewer/dist/assets/index.css'
\`\`\`

### 2. Tailwind Configuration (Optional but Recommended)

If your project uses Tailwind CSS, you can add the library to your `tailwind.config.js` content array to ensure proper purging:

\`\`\`js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@johngalt/workflow-conductor-viewer/**/*.{js,jsx,ts,tsx}', // Add this line
  ],
  // ... rest of your config
}
\`\`\`

**Note:** The library uses the `wcv-` prefix for all Tailwind classes to avoid conflicts with your application's styles.

### 3. CSS Variables (Already Included)

The library CSS includes all necessary CSS variables globally on `:root`, so portals (popovers, dialogs) work correctly. If you need to customize the theme colors, you can override these variables in your own CSS:

\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  /* ... and so on */
}
\`\`\`

## Basic Usage

\`\`\`tsx
import { WorkflowViewerTool, defaultWorkflowFormLocalization } from '@johngalt/workflow-conductor-viewer'
import type { ConductorWorkflow } from '@johngalt/workflow-conductor-viewer'

function App() {
  const [workflow, setWorkflow] = useState<ConductorWorkflow | null>(null)

  const handleSave = (updatedWorkflow: ConductorWorkflow) => {
    console.log('Workflow saved:', updatedWorkflow)
    // Send to your API
    // await fetch('/api/workflows', { method: 'POST', body: JSON.stringify(updatedWorkflow) })
  }

  const handleCancel = () => {
    console.log('Edit cancelled')
  }

  // Don't render until workflow is loaded
  if (!workflow) {
    return <div>Loading workflow...</div>
  }

  return (
    <WorkflowViewerTool
      initialWorkflow={workflow}
      onSave={handleSave}
      onCancel={handleCancel}
      formLocalizedObj={defaultWorkflowFormLocalization}
    />
  )
}
\`\`\`

## TypeScript Types

The library exports all necessary types:

\`\`\`tsx
import type {
  ConductorWorkflow,
  ConductorTask,
  WorkflowFormLocalization,
} from '@johngalt/workflow-conductor-viewer'
\`\`\`

## Custom Localization

You can customize the form labels by providing your own localization object:

\`\`\`tsx
import { defaultWorkflowFormLocalization } from '@johngalt/workflow-conductor-viewer'

const spanishLocalization = {
  ...defaultWorkflowFormLocalization,
  workflowTab: 'Flujo de Trabajo',
  taskTab: 'Tarea',
  save: 'Guardar',
  cancel: 'Cancelar',
  // ... customize other labels
}

<WorkflowViewerTool
  initialWorkflow={workflow}
  formLocalizedObj={spanishLocalization}
  onSave={handleSave}
/>
\`\`\`

## Dark Mode Support

The library supports dark mode. Add the `dark` class to the `<html>` or `<body>` element to enable it:

\`\`\`tsx
<html className="dark">
  {/* Your app */}
</html>
\`\`\`

## Common Issues

### Popovers/Dialogs Not Visible

**Cause:** CSS variables not accessible to Radix UI portals.

**Solution:** Make sure you've imported the library CSS in your main file:
\`\`\`tsx
import '@johngalt/workflow-conductor-viewer/dist/assets/index.css'
\`\`\`

This CSS file includes global CSS variables on `:root` that portals can access.

### CodeMirror Editor Broken/No Syntax Highlighting

**Cause:** CodeMirror theme CSS not loaded.

**Solution:** The library CSS now includes CodeMirror theme styles. Ensure you've imported:
\`\`\`tsx
import '@johngalt/workflow-conductor-viewer/dist/assets/index.css'
\`\`\`

### Tailwind Classes Not Working

**Cause:** The library uses `wcv-` prefixed classes that might not exist in your app.

**Solution:** Import the library CSS which includes all pre-built Tailwind classes with the `wcv-` prefix.

### Save/Cancel Buttons Not Visible

**Cause:** CSS variable scoping issue with ScrollArea portal.

**Solution:** Import the library CSS as described above. The global CSS variables will fix this.

## Advanced: Styling Customization

The library wraps everything in a `.workflow-visualizer-root` class. You can target this to override styles:

\`\`\`css
.workflow-visualizer-root {
  /* Your custom CSS variables */
  --primary: 220 80% 50%;
  --radius: 1rem;
}

.workflow-visualizer-root .wcv-bg-primary {
  /* Custom overrides */
}
\`\`\`

## Browser Support

- Modern browsers with ES6+ support
- React 18.3+
- Node.js 18+

## License

Proprietary - Internal use only within the company.
