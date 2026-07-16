# Desktop Menubar

> Capability: the desktop's top menu bar (`ul[role="menu-bar"]`) and its responsive reflow across viewports.

## Purpose

Defines how the desktop menubar reflows on narrow viewports: the Now-Playing block wraps to a second line via `flex-wrap`, and the menubar layout-shrinks on portrait (≤ `sm`) via responsive font-size/padding to preserve `desktop-bounds` content height. `transform: scale()` SHALL NOT be used for these purposes.

## Requirements

### Requirement: Now-Playing wraps to a second line on narrow viewports

The menubar (`ul[role="menu-bar"]`) SHALL allow its items to wrap (`flex-wrap`) and the Now-Playing block (the "Now Playing —" label and the track marquee) SHALL take a full row (`flex-basis: 100%`) so that it wraps to a second line on viewports too narrow to fit it inline. This replaces the previous non-wrapping `flex` row that overflowed horizontally on narrow widths.

#### Scenario: Narrow width wraps the Now-Playing block

- **WHEN** the viewport width is insufficient to fit all menubar items on one line
- **THEN** the Now-Playing block wraps to a second line
- **AND** the track marquee remains visible and not clipped off-screen

#### Scenario: Wide width keeps the menubar on one line

- **WHEN** the viewport is desktop-width
- **THEN** the menubar renders on a single line (the Now-Playing block does not force a wrap)

### Requirement: Menubar layout-shrinks on portrait to preserve desktop content height

On narrow/portrait viewports (≤ `sm`), the menubar SHALL reduce its layout height via responsive CSS (clamped font-size and reduced padding) so that `desktop-bounds` retains its content height. `transform: scale()` SHALL NOT be used for this purpose, because it is paint-only and does not reclaim layout height for the flex-column sibling `desktop-bounds`.

#### Scenario: Portrait viewport shrinks the menubar layout height

- **WHEN** the viewport is narrow (≤ `sm`)
- **THEN** the menubar's layout height is reduced relative to its desktop-width height (smaller font-size and padding)
- **AND** `desktop-bounds` is taller than it would be with an un-shrunk menubar

#### Scenario: transform: scale is not used to shrink the menubar

- **WHEN** the menubar is rendered on any viewport
- **THEN** no `transform: scale(...)` is applied to the menubar or its container
- **AND** the height reclamation comes from layout-affecting properties (font-size, padding), not paint-only transforms
