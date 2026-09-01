# UI/UX Pro Max Design Intelligence

This workspace is integrated with **UI/UX Pro Max** (`.skills/ui-ux-pro-max`), providing AI-powered design intelligence with 84 UI styles, 192 color palettes, 74 font pairings, 98 UX guidelines, and 25 chart types.

## Available Design Database & CLI Search

Run search queries directly via python:
```bash
python3 .skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "Project Name"
```

### Specialized Domain Searches
```bash
# UX Guidelines & Best Practices
python3 .skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux

# Color Palettes & Contrast Systems
python3 .skills/ui-ux-pro-max/scripts/search.py "<query>" --domain color

# Typography & Font Pairings
python3 .skills/ui-ux-pro-max/scripts/search.py "<query>" --domain typography

# UI Styles & Visual Aesthetics
python3 .skills/ui-ux-pro-max/scripts/search.py "<query>" --domain style

# React / Tailwind Best Practices
python3 .skills/ui-ux-pro-max/scripts/search.py "<query>" --stack react
```

## Core UI/UX Pro Max Principles Enforced

1. **Accessibility First (WCAG AA compliant)**:
   - High text contrast (4.5:1 minimum for body text, 3:1 for large text).
   - Clear, visible focus rings on interactive elements.
   - 44x44px minimum touch targets for all mobile & responsive controls.
   - Smooth 150ms–300ms transitions on interactive hover/active states.

2. **Typography Hierarchy**:
   - Distinctive pairings with clear optical weights and scale factor ratios.
   - Strict baseline readability (16px base font, 1.5–1.7 line height).
   - No hyphenated label wrapping in action buttons or badges.

3. **Consistent Spacing & Layout Tokens**:
   - Container padding math: outer padding $\ge$ inner gap between children.
   - Border radius continuity: $\text{Inner Radius} = \text{Outer Radius} - \text{Padding}$.
   - High visual clarity without visual clutter or unnecessary nested card borders.

---

# 21st.dev Component & Design Skills

This workspace is integrated with **21st.dev** (`@21st-dev/cli` and `.skills/21st-*`), providing access to component discovery, design review, and registry installation:

- **Search Catalog**: `npx @21st-dev/cli search "<query>"`
- **Fetch Logos**: `npx @21st-dev/cli logo "<brand>"`
- **Inspect Component Code**: `npx @21st-dev/cli get <id>`
- **Add Component**: `npx @21st-dev/cli add <user>/<slug>`
- **UI Review**: `npx @21st-dev/cli review <path...>`

