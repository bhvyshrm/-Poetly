---
name: Liquid Literary Glass
colors:
  surface: '#131316'
  surface-dim: '#131316'
  surface-bright: '#39393c'
  surface-container-lowest: '#0e0e11'
  surface-container-low: '#1c1b1e'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2d'
  surface-container-highest: '#353438'
  on-surface: '#e5e1e5'
  on-surface-variant: '#d4c1d2'
  inverse-surface: '#e5e1e5'
  inverse-on-surface: '#313033'
  outline: '#9d8b9b'
  outline-variant: '#504250'
  surface-tint: '#f8acff'
  primary: '#f8acff'
  on-primary: '#570067'
  primary-container: '#e879f9'
  on-primary-container: '#68007b'
  inverse-primary: '#972cab'
  secondary: '#cebdff'
  on-secondary: '#361e74'
  secondary-container: '#503a8f'
  on-secondary-container: '#c1acff'
  tertiary: '#90cff1'
  on-tertiary: '#003548'
  tertiary-container: '#6eadce'
  on-tertiary-container: '#004057'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd6ff'
  primary-fixed-dim: '#f8acff'
  on-primary-fixed: '#350040'
  on-primary-fixed-variant: '#7b0190'
  secondary-fixed: '#e8ddff'
  secondary-fixed-dim: '#cebdff'
  on-secondary-fixed: '#21005e'
  on-secondary-fixed-variant: '#4d378c'
  tertiary-fixed: '#c2e8ff'
  tertiary-fixed-dim: '#90cff1'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d67'
  background: '#131316'
  on-background: '#e5e1e5'
  surface-variant: '#353438'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 44px
    fontWeight: '400'
    lineHeight: 54px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-title:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-title-mobile:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
    letterSpacing: -0.01em
  verse-lg:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: 0.01em
  verse-md:
    fontFamily: Newsreader
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.015em
  body-ui:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-ui-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  meta-caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  nav-label:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  micro-tag:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.75rem
  space-xl: 2.75rem
---

## Brand & Style

This design system embodies an intimate, sanctuary-like digital salon tailored for poets, creative essayists, and thoughtful readers. The platform balances deep literary reverence with cutting-edge optical tactility. Rather than feeling like a sterile document processor or an over-stimulating social timeline, the interface evokes the tranquility of late-night writing in a candlelit study, shielded by misted windowpanes.

The aesthetic fuses **Editorial Glassmorphism** with **Quiet Minimalism**:
- **Liquid Glass Tactility:** Multilayered frosted planes, anisotropic specular hairline borders, and refractive optical depths that suspend poetic text above tranquil, organic gradients.
- **Editorial Literary Dignity:** Reverence for verse layout, generous spatial breathing room, and classical typographic contrast.
- **Calm, Human Focus:** Deliberate suppression of hyperactive engagement hooks; interaction states emit soft, ethereal luminescence rather than jarring tactile bounces.

## Colors

The system establishes atmospheric immersion through an obsidian void punctuated by spectral jewel lights. Glass surfaces refract the background illumination, preventing flat sensory deadening.

### Dark Theme (Default)
- **Base Canvas:** `#050507` (Deep Obsidian Ink).
- **Secondary Underlay:** `#0A0A0F` (Midnight Slate).
- **Glass Panel Surface:** `rgba(255, 255, 255, 0.045)` to `rgba(255, 255, 255, 0.075)` with backdrop filters.
- **Hairline Specular Borders:** `rgba(255, 255, 255, 0.10)` on top/left edges, tapering to `rgba(255, 255, 255, 0.04)` on bottom/right.
- **Text & Foreground:**
  - `Text-Primary`: `#F5F3F8` (Luminous Alabaster).
  - `Text-Secondary`: `#A5A1AE` (Muted Vellum).
  - `Text-Tertiary / Meta`: `#777180` (Dusk Gray).
- **Accent Illumination:**
  - `Primary Orchid`: `#E879F9` (Focal interactions, bookmarks, vibrant aura).
  - `Secondary Lavender`: `#B9A2FF` (Poetic tags, secondary links, verse annotations).
  - `Tertiary Cerulean`: `#9DDCFF` (Fresh prompts, draft states, audio recitation nodes).

### Light Theme (Warm Alabaster Parchment)
- **Base Canvas:** `#F7F5F8` (Bleached Linen Parchment).
- **Secondary Underlay:** `#EFECF3` (Soft Pressed Cotton).
- **Glass Panel Surface:** `rgba(255, 255, 255, 0.65)` layered over subtle ivory tints.
- **Hairline Borders:** `rgba(33, 27, 41, 0.08)`.
- **Text & Foreground:**
  - `Text-Primary`: `#211B29` (Deep Charcoal Ink).
  - `Text-Secondary`: `#746C7D` (Graphite Wash).
  - `Text-Tertiary`: `#9B94A4` (Silvered Pencil).
- **Accents:**
  - `Primary Orchid`: `#C84EDC`.
  - `Secondary Lavender`: `#7C5CE5`.
  - `Tertiary Cerulean`: `#0284C7`.

## Typography

Typography governs the dual identity of the interface: classical prose and modern ergonomic utility.

- **The Literary Layer (`Newsreader`):** Used exclusively for poetic expression—titles, stanza lines, epigraphs, and writer biographies. Newsreader carries humanist warmth, graceful optical serifs, and italics that flow like handwritten calligraphy without sacrificing legibility. Stanza lines use loose, intentional leading (`1.8x` to `2.0x` font size) to give silence and cadence equal standing with text.
- **The System Control Layer (`Plus Jakarta Sans`):** Used for navigation, chrome metadata, metric tags, tooltips, and editor settings. Its geometric precision and clear apertures keep functional controls legible, quiet, and distinctly decoupled from the artwork.

## Layout & Spacing

The architecture employs an asymmetrical 3-column fixed-fluid layout designed to center attention entirely on the act of reading and creation while providing immediate ambient utilities.

### Breakpoints & Shell Geometry
- **Desktop (≥ 1280px):**
  - **Left Rail (Persistent Shell Navigation):** Fixed `260px` width. Floating frosted spine housing navigation nodes, private collections, and quick composer CTA.
  - **Center Well (Editorial Feed / Studio):** Max-width `680px`, fluid scaling with `gutter` spacing. Generous stanza padding shields the poetry from visual clutter.
  - **Right Rail (Discovery & Ambient Context):** Fixed `340px` width. Features the Daily Prompt, featured anthologies, and trending acoustic recitations.
- **Tablet (768px – 1279px):**
  - The right discovery rail collapses into contextual drawer sheets or sits below the feed.
  - The left rail compresses into a compact `72px` icon-only frosted rail.
  - Center reading well expands to a maximum of `640px`.
- **Mobile (< 768px):**
  - Single column with full width minus `margin-mobile` padding.
  - Left navigation migrates to a liquid floating glass bottom bar (`h-16`).
  - Feed elements stretch across screen bounds with edge-to-edge subtle glass padding.

## Elevation & Depth

Visual hierarchy does not use harsh drop shadows; instead, it relies on optical light refraction, gradient back-illumination, and layered translucency.

### Glassmorphism System
- **Level 0 (Atmospheric Ground):** Solid canvas (`#050507`) embedded with two ambient radial mesh gradients: a subtle orchid bloom (`rgba(232, 121, 249, 0.05)`) at the top right and lavender glow (`rgba(185, 162, 255, 0.04)`) at the bottom left.
- **Level 1 (Structural Glass Panels - Cards, Feeds):**
  - Surface: `rgba(255, 255, 255, 0.035)`.
  - Backdrop Blur: `blur(20px) saturate(180%)`.
  - Perimeter Border: `1px solid rgba(255, 255, 255, 0.08)`.
  - Shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.36)`.
- **Level 2 (Interactive Floating Elements - Modals, Composer, Dropdowns):**
  - Surface: `rgba(255, 255, 255, 0.065)`.
  - Backdrop Blur: `blur(32px) saturate(200%)`.
  - Border: `1px solid rgba(255, 255, 255, 0.15)`.
  - Shadow: `0 16px 48px -8px rgba(0, 0, 0, 0.55), 0 0 1px 1px rgba(255, 255, 255, 0.1) inset`.
- **Level 3 (Spectral Focal Aura - Active Verse, Floating Action):**
  - Glow: `0 0 24px -2px rgba(232, 121, 249, 0.25)`.
  - Top highlight stroke using linear gradient `(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)`.

## Shapes

The interface balances organic fluidity with modern structure through Level 2 roundedness (`rounded-lg: 1rem`, `rounded-xl: 1.5rem`).

- **Cards & Primary Vessels:** Uniform `1.25rem` (20px) corner radius, softening the frame around classical serif typography.
- **Buttons & Interactive Tags:** Pill shapes (`9999px`) for quick-toggles, mood selectors, and primary action buttons, highlighting tactile touchability.
- **Input Fields & Stanza Blocks:** `0.75rem` (12px) border radius to maintain structural alignment with verse margins.
- **Glass Edge Reflections:** All borders use inner highlights with softened vertices, simulating liquid molded glass edges rather than cut acrylic sheets.

## Components

### Buttons
- **Primary Glowing Action (Compose / Publish):** Pill-shaped container filled with a gradient blend of Orchid (`#E879F9`) to Lavender (`#B9A2FF`), paired with `#050507` bold sans text. Features a persistent soft outer blur `0 4px 20px rgba(232, 121, 249, 0.3)`. Hover elevates saturation and slightly expands the atmospheric glow.
- **Secondary Ghost Glass:** Frosted glass fill (`rgba(255, 255, 255, 0.05)`), border `rgba(255, 255, 255, 0.12)`, text `#F5F3F8`. On hover, border shifts to `#B9A2FF` with background `rgba(255, 255, 255, 0.09)`.

### Chips & Filter Pills
- Compact pill silhouettes with `0.5rem` horizontal padding.
- Default: `rgba(255, 255, 255, 0.03)` with faint border.
- Active/Selected: Ethereal Orchid wash (`rgba(232, 121, 249, 0.15)`) with an active border stroke of `#E879F9` and text illuminated in `#F5F3F8`.

### Input Fields & Quick Compose Bar
- Floating frosted bar pinned with backdrop blur.
- Default state: Translucent dark channel (`rgba(0, 0, 0, 0.25)`), inset border `rgba(255, 255, 255, 0.08)`.
- Focus state: Inner shadow deepens, border transitions to `rgba(185, 162, 255, 0.45)`, accompanied by a subtle ambient outer sheen of Lavender.
- Text input alternates seamlessly: serif typography for spontaneous verse lines, sans-serif for tags and topic annotations.

### Canonical PoemCard
- Centerpiece of the reading feed.
- Multi-tier structure:
  1. **Header:** Author avatar within a soft circular glass ring, author handle in sans-serif, and subtle timestamp in Dusk Gray.
  2. **Poem Body:** Title rendered in Newsreader (`headline-title`), followed by verse lines in `verse-lg` with `lineHeight: 36px`. Generous stanza separation (`space-lg`).
  3. **Footer Toolbar:** Quiet micro-interactions positioned horizontally. Heart (Like), Quill (Critique/Comment), Resonate (Share), and Audio (Recitation play node) rendered with hairline strokes that fill with jewel luminescence upon interaction.

### Daily Prompt Card
- Glass card anchored in the right rail with an asymmetric refractive top border colored in Cerulean (`#9DDCFF`).
- Displays a poetic prompt, contemporary word anchor, and an ambient counter tracking participating poets.
- Includes a direct "Write to Prompt" micro-action that auto-seeds the composer with the day's motif.

### Form Elements (Checkboxes & Radios)
- Custom circular glass dials (`18px`).
- Inactive: Frosted translucent circle with `rgba(255, 255, 255, 0.2)` stroke.
- Checked: Core illuminated by an internal Orchid jewel pip with an ambient glow radius of `6px`.