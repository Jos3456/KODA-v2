# Koda Colour Palette

This palette is derived from the six Koda interface reference screenshots in `Koda design structure/`.

The hex values are **initial design tokens estimated from the screenshots**, not sampled from the original design source. Treat them as the canonical starting point for implementation; they can be fine-tuned later against the original mock-ups.

## 1. Core brand colours

| Token | Hex | Purpose |
|---|---|---|
| `brand-brown-900` | `#512F28` | Deep brown; top of the main application background gradient |
| `brand-brown-700` | `#754034` | Mid-tone brown for surfaces and gradient transitions |
| `brand-terracotta-600` | `#A65343` | Warm terracotta accent and gradient transition |
| `brand-coral-500` | `#E87561` | Primary brand accent; playback controls, active states, buttons and highlights |
| `brand-peach-300` | `#F4B18F` | Warm peach transition in the application background |
| `brand-peach-200` | `#FFD4B4` | Light end of the main background gradient |

## 2. Backgrounds and surfaces

| Token | Hex | Purpose |
|---|---|---|
| `background-app` | `#F5F3F0` | Neutral outer application frame and page surroundings |
| `background-gradient-start` | `#512F28` | Main content background gradient start |
| `background-gradient-middle` | `#B96855` | Main content background gradient middle |
| `background-gradient-end` | `#FFD4B4` | Main content background gradient end |
| `surface-cream` | `#F0EED0` | Settings panels and warm light surfaces |
| `surface-card` | `#F4F1EC` | Neutral cards and list surfaces |
| `surface-card-hover` | `#FBE4D2` | Hovered card or row |
| `surface-selected` | `#FFDCC1` | Selected queue row or selected item |
| `surface-artwork-placeholder` | `#D9D9D9` | Placeholder background when artwork is unavailable |
| `surface-sage` | `#BEC9B5` | Muted sage surface used by playlist shortcut tiles |

### Main application gradient

Use a vertical gradient for the main library and settings backgrounds:

```css
background: linear-gradient(
  180deg,
  #512F28 0%,
  #754034 28%,
  #B96855 58%,
  #F4B18F 82%,
  #FFD4B4 100%
);
```

The gradient should remain atmospheric and subdued. It must not reduce the legibility of text, controls or artwork.

## 3. Text and icons

| Token | Hex | Purpose |
|---|---|---|
| `text-primary` | `#292522` | Main text on light surfaces |
| `text-secondary` | `#77716C` | Supporting text, metadata and timestamps |
| `text-on-dark` | `#FFFFFF` | Text and icons on dark brown or coral surfaces |
| `text-on-accent` | `#FFFFFF` | Labels on primary coral buttons |
| `text-muted-on-gradient` | `#F5E7DF` | Secondary labels on dark portions of the gradient |
| `icon-muted` | `#85817D` | Inactive icons and artwork placeholder glyphs |
| `icon-primary` | `#292522` | Primary icons on light surfaces |

## 4. Interactive states

| Token | Hex | Purpose |
|---|---|---|
| `accent-primary` | `#E87561` | Primary actions, active navigation, playback progress and toggles |
| `accent-hover` | `#D96754` | Hover state for primary actions |
| `accent-pressed` | `#C95746` | Pressed state for primary actions |
| `accent-soft` | `#FFE4D2` | Soft accent background and active navigation pill |
| `accent-contrast` | `#FFFFFF` | Foreground content on coral accent |
| `focus-ring` | `#238BE6` | Keyboard focus outline; keep clearly visible against all surfaces |
| `progress-track` | `#D6C5B9` | Inactive playback progress track |
| `progress-fill` | `#E87561` | Played portion of the progress bar |

## 5. Playback component colours

| Token | Hex | Purpose |
|---|---|---|
| `player-background` | `#E87561` | Persistent mini-player background |
| `player-text` | `#FFFFFF` | Track title and player labels |
| `player-progress-track` | `#F6C5B6` | Mini-player progress track |
| `player-progress-fill` | `#71392F` | Played portion of mini-player progress |
| `player-control` | `#FFFFFF` | Playback and queue action icons |
| `player-artwork-placeholder` | `#D9D9D9` | Mini-player artwork fallback |

## 6. Usage principles

1. **Coral is the primary action colour.** Use it for active navigation, primary buttons, playback progress, toggles and selected interactive controls. Avoid using it for large blocks outside the player.
2. **Brown and peach establish Koda's identity.** Use the warm gradient for the main content canvas, not for every individual card or panel.
3. **Cream is the calm surface colour.** Use it for settings panels, dialogs and other areas where users need to read or configure information.
4. **Keep artwork visually dominant.** Do not apply the application gradient or accent tint over album artwork.
5. **Use dark text on light surfaces and white text on dark or coral surfaces.** Do not assume white text will be readable on the light peach end of the gradient.
6. **Use the sage colour sparingly.** It is a supporting colour for selected playlist tiles, not a second primary brand colour.
7. **Maintain visible keyboard focus.** The blue focus ring is an accessibility indicator and should not be replaced with a subtle colour shift.
8. **Do not use colour alone to communicate state.** Combine colour changes with icons, labels, focus indicators or other visual cues.

## 7. Theme and future expansion

The screenshots currently define Koda's warm light appearance. The `dynamic color` setting shown in the mock-up suggests a future theme system, but dynamic colours should be implemented as a separate derived palette rather than changing these base brand tokens.

A dark theme should also be defined separately. Do not simply invert the light palette; choose dark surfaces and text colours that preserve the warm Koda identity while maintaining readable contrast.

## 8. Implementation notes

- Keep these values in one central theme definition rather than scattering hex codes throughout the application.
- Use semantic names such as `surface-cream` and `text-primary` in UI components. Components should not depend directly on a specific hex value.
- The palette is framework-independent and can be shared by the Linux desktop build and future Windows/macOS builds.
- Before release, verify text and control contrast against WCAG contrast guidance, especially over the gradient and on coral surfaces.
