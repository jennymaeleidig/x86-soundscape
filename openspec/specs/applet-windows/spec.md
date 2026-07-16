# Applet Windows

> Capability: the desktop's applet windows (About, Announcements, Visualizer, WeatherStar) and their placement/sizing within `desktop-bounds`.

## Purpose

Defines how applet windows render and are placed inside the desktop bounds on every viewport: responsive sizing (no hardcoded pixel offsets), an open-order cascade via `WindowService`, and the 320px minimum-width floor. Depends on `desktop-bounds` rendering on every viewport (see `winamp-player` / the `remove-mobile-ua-gate` change).

## Requirements

### Requirement: Applet windows render within the desktop bounds on every viewport

The applet windows (About, Announcements, Visualizer, WeatherStar) SHALL render fully within `desktop-bounds` on every viewport width. Window placement SHALL NOT use hardcoded pixel offsets; window sizing SHALL use responsive units (`max-w`, percentages, `clamp()`) so that no open window extends past the desktop bounds on initial open at any viewport. This change depends on `remove-mobile-ua-gate` having made `desktop-bounds` render on every viewport.

#### Scenario: Windows are fully contained on a narrow viewport

- **WHEN** the viewport is narrow (≤ `sm`, 640px)
- **THEN** every open applet window's rendered box lies fully within `desktop-bounds`
- **AND** no window is clipped by `overflow: hidden` on initial open (the window fits by sizing, not by clipping)

#### Scenario: Windows render within bounds on a wide viewport

- **WHEN** the viewport is desktop-width
- **THEN** every open applet window's rendered box lies fully within `desktop-bounds`
- **AND** no hardcoded pixel offset (`left-75`, `left-55`, etc.) is present in the window template

### Requirement: Applet windows are placed via an open-order cascade

`WindowService` SHALL maintain an open-order counter and place each newly opened window at a cascade offset of `n × step`, where `step` is a percentage of `desktop-bounds` (container-relative, not device pixels). The cascade SHALL collapse to a single vertical stack below the `sm:` breakpoint. The offset SHALL be applied via a per-window value (e.g. a CSS custom property) so that placement is declarative and does not require an imperative viewport-detection signal.

#### Scenario: Cascade offsets each new window on a wide viewport

- **WHEN** multiple applet windows are opened in sequence on a wide viewport
- **THEN** each subsequent window is offset from the previous by the cascade step
- **AND** the step is expressed as a percentage of `desktop-bounds` (container-relative)
- **AND** no `matchMedia`, `ResizeObserver`, or `BreakpointObserver` call is introduced to compute placement

#### Scenario: Cascade collapses to a single vertical stack on narrow viewports

- **WHEN** the viewport is narrow (≤ `sm`)
- **THEN** the cascade offsets collapse to vertical-only (a single full-width-ish stack)
- **AND** each window remains fully within `desktop-bounds`

### Requirement: Window sizing keeps the 320px minimum-width floor initially

Applet windows SHALL honor the `.window { min-width: 320px }` floor from system.css on viewports wide enough to accommodate it. On viewports narrower than the floor plus margins, windows MAY be clipped by `desktop-bounds`' `overflow: hidden` as an accepted last resort; lowering the floor is explicitly deferred to a future refinement.

#### Scenario: Floor is respected above the narrow breakpoint

- **WHEN** the viewport is wider than `sm`
- **THEN** each applet window's rendered width is at least 320px

#### Scenario: Sub-floor viewports clip as an accepted edge case

- **WHEN** the viewport is narrower than ~320px plus window margins
- **THEN** a window may be clipped by `overflow: hidden`
- **AND** this is an accepted, documented edge case, not a regression (the floor is intentionally kept for now)
