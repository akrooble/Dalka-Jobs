---
name: Neo-Technical Precision
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#464555'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4e44e2'
  primary: '#3e32d3'
  on-primary: '#ffffff'
  primary-container: '#5850ec'
  on-primary-container: '#e9e5ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#724700'
  on-tertiary: '#ffffff'
  tertiary-container: '#935c00'
  on-tertiary-container: '#ffe4c7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3424ca'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-trust, modern recruitment portal tailored for high performance and institutional clarity. The brand personality is authoritative, agile, and transparent, bridging top Somali talent, NGOs, tech enterprises, and international organizations.

The aesthetic embraces an **Experimental Neo-Technical Brutalism**:
- Razor-sharp structural geometry (zero corner radii) echoing the modular faceted emblem and technical octagonal wordmark.
- Dense, highly structured information architecture designed to render vast amounts of metadata—compensation scales, closing dates, verification credentials—without visual ambiguity.
- Uncompromising performance: lightweight vector treatments, high-contrast borders over heavy raster drop shadows, and high data density.
- High-trust signaling through assertive micro-elements: verified employer crests, precise status flags, and tabular metadata blocks.

## Colors

The palette balances intense electric indigo accents against clinical high-contrast neutrals, with purpose-built semantic indicators:

- **Primary (`#5850EC`)**: The electric indigo-violet core derived from the brand emblem. Used for critical interactive triggers, focused states, primary buttons, and system-level calls-to-action.
- **Secondary (`#10B981`)**: Emerald trust green, dedicated strictly to "Verified Employer", "Vetted Listing", and high-trust status badges.
- **Tertiary (`#F59E0B`)**: Amber urgency warning, reserved for "Closing Soon", "Expiring", and high-priority action alerts.
- **Neutral Core (`#111827`)**: Deep slate charcoal grounding typography, heavy technical structural outlines, and header contrast.
- **Surface Palette**: Pure clean backdrop (`#FFFFFF`), light gray utility panels (`#F9FAFB`), and structural grid boundaries (`#E5E7EB` / `#D1D5DB`).

## Typography

The type scale combines **Space Grotesk** for display headers and **Geist** for technical data density and body content.

- **Space Grotesk** captures the architectural, mechanical facets present in the logo wordmark. It is employed across high-level headers, page titles, and prominent compensation metrics.
- **Geist** provides clinical, high-legibility rendering for extensive job descriptions, technical specifications, and dense table lists.
- Numeric compensation metrics, job reference IDs, and closing dates use tabular figure adjustments to preserve horizontal grid alignment across scanning rows.

## Layout & Spacing

The layout philosophy follows a rigid, modular 12-column architectural grid with zero dead space and crisp spatial boundaries:

- **Desktop (1280px+)**: 12 columns with 1.25rem gutters and 2rem outer canvas margin. Multi-column split architecture: 3 columns dedicated to instant categorical filters, 9 columns for dense job listings or detailed split-pane job inspection.
- **Tablet (768px - 1279px)**: 8 columns with 1rem gutters and 1.5rem margin. Filter arrays collapse into a top-mounted horizontal segmented tray.
- **Mobile (< 768px)**: 4 columns with 0.75rem gutters and 1rem canvas margins. Content reflows into single-column full-bleed technical cards with condensed metadata rows.
- **Spacing Rhythm**: Strictly based on a 4px/8px base unit. Internal card padding uses `space-md` for standard density, shrinking to `space-sm` in compact table views to guarantee high screen efficiency.

## Elevation & Depth

In alignment with the sharp, experimental neo-brutalist identity, depth is communicated through **structural containment, high-contrast outlines, and tonal layer shifts** rather than blurred realistic drop shadows:

- **Borders over Shadows**: All surfaces are contained with crisp `1px` or `2px` solid borders (`#111827` or `#E5E7EB`). 
- **Offset Accent Elevation**: Interactive focus states, selected cards, and primary buttons employ flat geometric offset shadows (`2px 2px 0px #111827` or `3px 3px 0px #5850EC`).
- **Tonal Layering**: Secondary information panels and filter sidebars rest on `#F9FAFB` surfaces set directly against `#FFFFFF` body canvas, delineated by sharp `#E5E7EB` grid lines.
- **Floating Modals & Flyouts**: Deep overlay scrim (`#111827` at 60% opacity) beneath a pure white modal bounded by a hard `2px solid #111827` stroke and a sharp `6px 6px 0px #111827` offset edge.

## Shapes

The shape system is strictly **Sharp (`roundedness: 0`)**:
- All components—including cards, input fields, badges, buttons, tooltips, dialogs, and avatar containers—feature absolute `0px` border radii.
- This creates an unapologetically modern, engineered interface that directly reflects the geometric precision of the faceted emblem and mechanical typography.
- Tags, badges, and segmented toggles use rigid rectilinear boundaries, relying on inner padding and border weights to signify container status.

## Components

### Buttons
- **Primary**: Background `#5850EC`, text `#FFFFFF`, border `1px solid #111827`, sharp corners (`0px`). Hover state applies a hard offset shadow: `2px 2px 0px #111827` and translates `transform: translate(-1px, -1px)`.
- **Secondary / Ghost**: Background `#FFFFFF`, text `#111827`, border `1px solid #D1D5DB`. Hover shifts to `#F9FAFB` with border `#111827`.
- **Verified / Action**: Background `#10B981`, text `#FFFFFF`, border `1px solid #065F46`.

### Job Listing Cards
- Sharp white container (`#FFFFFF`), `1px solid #E5E7EB` outline.
- Left-edge border indicator: 3px solid `#5850EC` for featured roles, `3px solid #10B981` for verified enterprise postings.
- Hover transition: Outline shifts from `#E5E7EB` to `#111827` with a `2px 2px 0px #111827` hard technical shadow.
- Interior data grid: Dedicated columns for company mark, role & seniority, location/type (e.g., "Mogadishu • Remote"), salary range block, and timestamp.

### Input Fields & Search Bars
- Background `#FFFFFF`, border `1px solid #9CA3AF`, sharp 0px corners, font `Geist` 14px.
- Focus state: Border `2px solid #5850EC`, subtle flat inset line or `2px 2px 0px #5850EC`.
- Search composite bar: Merged multi-cell container separating Keyword, City/Region, and Category into zero-gap bordered cells topped by a solid `#5850EC` execute button.

### Badges & Status Chips
- **Verified Employer**: Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`, 0px radius, paired with a geometric square-check icon.
- **Closing Soon**: Background `#FFFBEB`, text `#92400E`, border `1px solid #FDE68A`, uppercase 11px label font.
- **Category Filter Chips**: Background `#F3F4F6`, text `#374151`, border `1px solid #E5E7EB`. Active state: Background `#111827`, text `#FFFFFF`, border `1px solid #111827`.

### Checkboxes & Radio Controls
- Square boxes with `0px` radius, `1.5px solid #111827`.
- Checked state: Filled with `#5850EC` displaying a crisp geometric tick mark.