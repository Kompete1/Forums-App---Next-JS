# Design Tokens

## Primary Direction: Motorsport Editorial

### Color Palette
- `bg.canvas`: `#F5F7FA`
- `bg.surface`: `#FFFFFF`
- `text.primary`: `#0F172A`
- `text.muted`: `#475569`
- `border.subtle`: `#D0D7DE`
- `brand.blue`: `#0057B8`
- `accent.lime`: `#72C100`
- `state.danger`: `#B42318`

### Typography
- Heading family: `Rajdhani` (500/600/700)
- Body family: `Source Sans 3` (400/500/600/700)
- Monospace family: `JetBrains Mono`
- Size scale:
  - `text-sm`: 14px
  - `text-base`: 16px
  - `text-lg`: 18px
  - `h2`: 24px
  - `h1`: 32px (responsive clamp)
- Body line-height: `1.6`

### Spacing Scale
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px

### Radius and Shadow
- Radius scale:
  - `radius-sm`: 8px
  - `radius-md`: 12px
  - `radius-lg`: 16px
- Shadow tiers:
  - `shadow-subtle`: `0 2px 8px rgba(15, 23, 42, 0.05)`
  - `shadow-raised`: `0 10px 24px rgba(15, 23, 42, 0.08)`

### Component Styles
- Buttons:
  - Primary: solid `brand.blue`, white text
  - Secondary: surface background + subtle border
  - Ghost: transparent background, muted text, strong focus ring
- Cards:
  - Surface background, subtle border, raised shadow, consistent header/body/footer spacing

### Focus and Accessibility
- Focus ring: `2px` solid `brand.blue` with `2px` offset.
- Visible focus state required on links, buttons, form fields, icon buttons, and menu items.
- Contrast target: WCAG AA minimum (`4.5:1` for normal text).
- Keyboard-first operation required for dropdowns and dialogs.

## Alternative Direction: Neutral Product UI
- Keep same spacing/radius/a11y baselines.
- Reduce accent usage and motorsport-specific color emphasis.
- Use lower-contrast neutral surfaces for denser enterprise look.
