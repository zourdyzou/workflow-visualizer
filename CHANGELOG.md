# Changelog

## [1.2.4] - 2025-01-XX

### Fixed
- **Critical:** CSS variables now defined globally on `:root` to fix portal rendering issues
  - Popovers, dialogs, and scroll areas now properly visible in consuming applications
  - Radix UI portals can now access CSS variables outside component scope
- **Critical:** CodeMirror theme CSS now bundled with library
  - Syntax highlighting now works correctly in consuming applications
  - One Dark theme styles included in main CSS bundle
- Save/Cancel buttons now visible in form panel
- Task selection popover now opens correctly when clicked

### Changed
- CSS architecture: Variables now on `:root` with scoped overrides in `.workflow-visualizer-root`
- Improved library CSS to be fully self-contained
- Enhanced documentation with troubleshooting guide

### Added
- Comprehensive LIBRARY_USAGE.md documentation
- Troubleshooting section for common integration issues

## [1.2.3] - Previous Release
- Initial library release with workflow visualization features
\`\`\`

```json file="" isHidden
