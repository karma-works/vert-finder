# Vert Finder Design System

## Direction

A field-tool interface: topographic, compact, and legible in bright outdoor conditions. The map is the main canvas. Controls resemble durable navigation equipment rather than consumer fitness dashboards.

## Tokens

- Ink: `#17201c`
- Paper: `#f1efe7`
- Route orange: `#e8743b`
- Low gain: `#4f8c69`
- Mid gain: `#d4a72c`
- High gain: `#c64635`
- Border: `#d0cec5` on paper, `#354039` on ink
- Body font: DM Sans, 400–700
- Data font: Space Mono, 400–700
- Spacing base: 4px, primarily 8/12/16/24/32px
- Corners: square by default; circles only for range controls
- Shadows: only for floating search/settings menus

## Interaction

- Minimum mobile touch target: 44px.
- Orange indicates selected routes and actionable emphasis.
- Gain color is always paired with a numeric value; color is not the only signal.
- Desktop uses a persistent filter rail. Mobile uses a map plus lower results sheet, with route details taking over the lower portion.
- Motion is brief and disabled under `prefers-reduced-motion`.
