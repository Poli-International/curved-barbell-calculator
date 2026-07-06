# Curved Barbell Length Calculator - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Schemas](#data-schemas)
3. [Calculation / Logic Algorithms](#calculation--logic-algorithms)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Customization](#customization)
7. [Performance](#performance)
8. [Browser Compatibility](#browser-compatibility)
9. [Security](#security)
10. [Version History](#version-history)
11. [Support / Contact](#support--contact)

## Architecture Overview

### Technology Stack

- **HTML5**, Semantic markup with form inputs and dynamic content containers
- **CSS3**, Linked via external stylesheet (`/tools/curved-barbell-calculator/css/style.css`)
- **Vanilla JavaScript (ES6)**, No frameworks, libraries, or dependencies. Single application file (`/tools/curved-barbell-calculator/js/app.js`)

### File Structure

```
/tools/curved-barbell-calculator/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

### Component / Logic Breakdown

The tool consists of three logical layers:

1. **Presentation Layer (HTML)**, Form controls (select dropdowns, number input, button), result containers, and a disclaimer block. The page includes an iframe detection script that applies a dark theme when embedded and listens for theme change messages from the parent window.

2. **Styling Layer (CSS)**, External stylesheet loaded from `/tools/curved-barbell-calculator/css/style.css`.

3. **Application Layer (JS)**, Contains all data (presets, size arrays), UI population logic, event handlers, calculation engine, and HTML rendering functions. The script uses `'use strict'` mode and includes an HTML escaping utility.

## Data Schemas

### PRESETS Array

An array of 6 objects, each representing a piercing type with anatomy and sizing parameters.

| Field | Type | Description | Example (Rook) |
|-------|------|-------------|-----------------|
| `id` | string | Unique identifier | `"rook"` |
| `name` | string | Display name | `"Rook"` |
| `icon` | string | Emoji icon | `"👂"` |
| `desc` | string | Anatomical description | `"Antihelix cartilage fold, upper inner ear"` |
| `typicalMin` | number | Minimum typical anatomy span (mm) | `5` |
| `typicalMax` | number | Maximum typical anatomy span (mm) | `9` |
| `gauge` | string | Recommended gauge description | `"16g (1.2 mm)"` |
| `gaugeNote` | string | Additional gauge guidance | `"Most rooks are pierced at 16g. 18g is possible for delicate anatomy."` |
| `clearanceFresh` | number | Extra length for fresh piercings (mm) | `5` |
| `clearanceHealed` | number | Extra length for healed piercings (mm) | `3` |
| `standardSizes` | array of numbers | Available standard internal lengths (mm) | `[6, 7, 8, 9, 10, 12]` |

### ALL_SIZES Array

A flat array of all standard curved barbell internal lengths used for size matching:

```javascript
[6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20]
```

### UI State Variables

| Variable | Element ID | Type | Purpose |
|----------|------------|------|---------|
| `piercingTypeSel` | `piercing-type` | HTMLSelectElement | Piercing type dropdown |
| `measurementInput` | `anatomy-mm` | HTMLInputElement | Anatomy span number input |
| `healingStage` | `healing-stage` | HTMLSelectElement | Fresh/healed toggle |
| `calcBtn` | `calc-btn` | HTMLButtonElement | Calculate trigger |
| `resultArea` | `results` | HTMLElement | Result output container |
| `presetInfo` | `preset-info` | HTMLElement | Preset information display |

## Calculation / Logic Algorithms

### `updatePresetInfo()`, Preset Information Display

**Trigger:** Fires on page load and whenever the piercing type dropdown changes.

**Logic:**
1. Finds the preset object matching the currently selected `piercingTypeSel.value`
2. If no preset found, clears the preset info area
3. Renders a preset card containing:
   - Icon and name
   - Anatomical description
   - Typical anatomy span range (`typicalMin`–`typicalMax` mm)
   - Standard gauge description
   - Gauge note

### `calculate()`, Main Calculation Function

**Trigger:** Fires when the Calculate button (`calcBtn`) is clicked.

**Logic Steps:**

1. **Lookup preset:** Finds the preset object matching `piercingTypeSel.value`

2. **Validate input:** Parses `measurementInput.value` as a float. If `NaN` or outside range 1–40, displays error message: `"Enter a valid anatomy measurement between 1 and 40 mm."` and exits.

3. **Calculate clearance:** Selects clearance value based on healing stage:
   - `stage === 'fresh'` → `preset.clearanceFresh`
   - `stage === 'healed'` → `preset.clearanceHealed`

4. **Calculate recommended length:**
   ```
   recommended = span + clearance
   ```

5. **Find best fit:** Uses `Array.find()` on `ALL_SIZES` to locate the first size `>= recommended`. If no size found, defaults to the last element in `ALL_SIZES` (20 mm).

6. **Find next size up:** Uses `Array.find()` on `ALL_SIZES` to locate the first size `> bestFit`. Returns `null` if none exists.

7. **Render results:** Calls `buildResult()` with all calculated values and inserts HTML into `resultArea`.

### `buildResult(preset, span, stage, clearance, recommended, bestFit, nextUp)`, Result HTML Generator

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `preset` | object | The selected piercing preset |
| `span` | number | User-entered anatomy measurement (mm) |
| `stage` | string | `"fresh"` or `"healed"` |
| `clearance` | number | Clearance value used (mm) |
| `recommended` | number | Calculated minimum length (mm) |
| `bestFit` | number | Nearest standard size at or above recommended |
| `nextUp` | number or null | Next standard size above bestFit, if exists |

**Output:** Returns an HTML string containing:
- Result header with icon, recommended size, and tissue stage
- Calculation breakdown table (anatomy span + clearance = recommended minimum)
- Size options (primary recommendation and optional next size up)
- Gauge information
- Stage-specific advice with link to BioFlex® polymer page

### `escHtml(s)`, HTML Escaping Utility

**Purpose:** Sanitizes user-facing strings before insertion into the DOM to prevent XSS.

**Logic:** Replaces `&`, `<`, `>`, `"` with their HTML entity equivalents.

## API Reference

### Public Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `escHtml(s)` | `s` (any) | string | Escapes HTML special characters |
| `updatePresetInfo()` | None | void | Updates preset information card when piercing type changes |
| `calculate()` | None | void | Main calculation entry point; validates input, computes size, renders results |
| `buildResult(preset, span, stage, clearance, recommended, bestFit, nextUp)` | See parameters above | string (HTML) | Generates result HTML for display |

### Event Handlers

| Element | Event | Handler | Description |
|---------|-------|---------|-------------|
| `piercingTypeSel` | `change` | `updatePresetInfo` | Updates preset info on selection change |
| `calcBtn` | `click` | `calculate` | Triggers calculation on button click |

### Global Variables

| Variable | Type | Description |
|----------|------|-------------|
| `PRESETS` | Array (const) | Read-only array of 6 piercing preset objects |
| `ALL_SIZES` | Array (const) | Read-only array of 12 standard internal lengths |

## Integration Guide

### Standalone Embedding

The tool is fully self-contained and can be embedded via iframe:

```html
<iframe 
  src="https://poliinternational.com/tools/curved-barbell-calculator/" 
  width="100%" 
  height="700" 
  frameborder="0"
  title="Curved Barbell Length Calculator">
</iframe>
```

### Iframe Communication

The tool automatically detects if it is running in an iframe (`window.self !== window.top`). When embedded, it:

1. Sets the HTML `data-theme` attribute to `"dark"` by default
2. Listens for `message` events with type `poli-theme` to toggle between light and dark themes

To control the theme from the parent page:

```javascript
// Set light theme
iframe.contentWindow.postMessage({ type: 'poli-theme', light: true }, '*');

// Set dark theme
iframe.contentWindow.postMessage({ type: 'poli-theme', light: false }, '*');
```

### Dependencies

None. The tool is dependency-free static HTML/CSS/JavaScript.

## Customization

### Modifying Presets

To add or modify piercing types, edit the `PRESETS` array in `js/app.js`. Each object requires all fields as documented in the Data Schemas section.

### Adjusting Standard Sizes

Modify the `ALL_SIZES` array to add or remove standard internal lengths. The calculation algorithm uses `Array.find()` to locate the first size equal to or greater than the recommended length.

### Styling

All visual styling is controlled via `/tools/curved-barbell-calculator/css/style.css`. The tool uses CSS classes prefixed with `tool-`, `input-`, `preset-`, `result-`, `calc-`, and `size-`.

## Performance

- **Zero external dependencies**, No frameworks, libraries, or CDN resources
- **Minimal DOM manipulation**, Only updates two containers (`presetInfo` and `resultArea`) on user interaction
- **Efficient array lookups**, Uses `Array.find()` which short-circuits on first match
- **Lightweight**, Total page weight under 15KB (HTML + JS, excluding CSS)

## Browser Compatibility

The tool uses standard ES6 features and modern HTML5 APIs:

- `'use strict'` mode
- `const` and `let` declarations
- Arrow functions
- Template literals
- `Array.find()`
- `Array.forEach()`
- `insertAdjacentHTML()`
- `window.postMessage()` and `message` event
- CSS custom properties (via `data-theme` attribute)

Compatible with all modern browsers: Chrome, Firefox, Safari, Edge (Chromium-based), and Opera.

## Security

### Input Handling

- **Number validation:** The anatomy span input is validated to ensure it is a number between 1 and 40. Non-numeric or out-of-range values trigger an error message and prevent calculation.
- **HTML escaping:** All user-facing strings are passed through `escHtml()` before DOM insertion, replacing `&`, `<`, `>`, and `"` with HTML entities.
- **Input type:** The anatomy span field uses `type="number"` with `min="1"`, `max="40"`, and `step="0.5"` for browser-level validation.

### Cross-Site Scripting (XSS) Prevention

- All dynamic content is inserted via `innerHTML` using pre-escaped strings
- Preset data is hardcoded and not user-modifiable
- The `escHtml()` utility sanitizes all text content before rendering
- No user input is ever executed as code or stored

### Iframe Security

- The page includes `<meta name="robots" content="noindex, nofollow">` to prevent search engine indexing of the tool page directly
- The iframe detection script only applies theme changes and does not expose sensitive functionality

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial release | Core calculation engine, 6 piercing presets, iframe theme support |

## Support / Contact

For technical issues, feature requests, or questions about this tool:

- **Email:** support@poliinternational.com
- **Website:** https://poliinternational.com

For jewellery sizing verification, always consult a professional piercer before ordering.
