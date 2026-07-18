### Requirement: WeatherStar 4000+ is the default weather source

The weather window SHALL open with WeatherStar 4000+ (`weatherstar.netbymatt.com`) as the active source by default, preserving the existing single-source behavior until the user toggles.

#### Scenario: Window opens on WeatherStar 4000+

- **WHEN** the weather window is opened
- **THEN** the iframe loads `weatherstar.netbymatt.com` with the default location applied
- **AND** the window title bar shows the WeatherStar 4000+ display name

### Requirement: Toggle between retro weather sources

The weather window SHALL present a single toggle button inline in the location bar that switches the active source to the other available source (WeatherStar 4000+ ↔ RetroCast at `weather.com/retro/`). The button SHALL be labeled with the destination source's display name (the app the user will switch to), since the window title bar already conveys the currently active source.

#### Scenario: User switches to RetroCast

- **WHEN** the user clicks the toggle button while WeatherStar 4000+ is active
- **THEN** the iframe source changes to `https://weather.com/retro/`
- **AND** the toggle button label changes to the WeatherStar 4000+ display name
- **AND** the window title bar text changes to the RetroCast display name

#### Scenario: User switches back to WeatherStar 4000+

- **WHEN** the user clicks the toggle button while RetroCast is active
- **THEN** the iframe source changes back to WeatherStar 4000+
- **AND** the last-committed location is applied to the URL parameters
- **AND** the toggle button label changes to the RetroCast display name

### Requirement: Location input only for location-param sources

The location input and Update button SHALL be displayed only when the active source accepts a location URL parameter. Sources that take location input in-site (RetroCast) SHALL NOT show the location input or Update button; the toggle button SHALL expand to fill the freed width in that mode.

#### Scenario: Location bar on WeatherStar 4000+

- **WHEN** WeatherStar 4000+ is the active source
- **THEN** the location input and Update button are visible in the location bar
- **AND** the toggle is rendered inline alongside them

#### Scenario: Location bar on RetroCast

- **WHEN** RetroCast is the active source
- **THEN** the location input and Update button are not rendered
- **AND** the toggle expands to occupy the freed width of the location bar

### Requirement: Location commit on submit

For sources that accept a location parameter, the iframe SHALL be refreshed with the new location only when the user commits via the Update button, not on every keystroke.

#### Scenario: Typing does not refresh the iframe

- **WHEN** the user types into the location input without pressing Update
- **THEN** the iframe source is unchanged

#### Scenario: Update commits the location

- **WHEN** the user presses the Update button
- **THEN** the iframe source is rebuilt with the committed location encoded into the URL parameters

### Requirement: Weather-source registry as a reusable service

A `WeatherStarService` SHALL hold a registry of weather-source descriptors, where each descriptor carries the id, display name, base URL, iframe `allow` attribute, whether it accepts a location URL parameter, and a URL builder. The active source and committed location SHALL be exposed as signals; the signed iframe URL SHALL be a computed signal derived from them; the non-active source SHALL be exposed as a computed for the toggle button's label/destination. Adding a new source SHALL require only a new descriptor, with no changes to the weather view.

#### Scenario: Adding a third weather source

- **WHEN** a new weather-source descriptor is added to the service's registry
- **THEN** the toggle button can switch to it
- **AND** selecting it loads its `baseUrl` in the iframe
- **AND** no edits to `WeatherComponent` are required

### Requirement: Shared CRT component for the weather window

A single `appCrt` attribute component SHALL apply the CRT effect (scanlines, grayscale filter, text-shadow animation) to the iframe for both weather sources. The weather component SHALL NOT carry its own CRT CSS.

#### Scenario: CRT effect applies to WeatherStar 4000+

- **WHEN** the active source is WeatherStar 4000+
- **THEN** the iframe renders under the CRT effect produced by the `appCrt` component

#### Scenario: CRT effect applies to RetroCast

- **WHEN** the active source is RetroCast
- **THEN** the iframe renders under the same CRT effect produced by the `appCrt` component

### Requirement: Dynamic window title from active source

The weather window title bar SHALL display the active source's display name, sourced from `WeatherStarService`, rather than a hardcoded string.

#### Scenario: Title reflects source after toggle

- **WHEN** the user toggles between WeatherStar 4000+ and RetroCast
- **THEN** the window title bar text updates to the active source's display name

### Requirement: Geolocation permission on the weather iframe

The weather iframe SHALL carry `allow="geolocation"` for both sources, so sources that offer browser-based location detection continue to function.

#### Scenario: Geolocation permitted on WeatherStar 4000+

- **WHEN** the active source is WeatherStar 4000+
- **THEN** the iframe is allowed to request geolocation

#### Scenario: Geolocation permitted on RetroCast

- **WHEN** the active source is RetroCast
- **THEN** the iframe is allowed to request geolocation

### Requirement: No persistence of source or location

The selected source and committed location SHALL NOT be persisted across window open/close cycles. Each open SHALL reset to the default source (WeatherStar 4000+) and default location.

#### Scenario: Reopening resets to defaults

- **WHEN** the weather window is closed and reopened
- **THEN** the active source is WeatherStar 4000+
- **AND** the location is the default location

### Requirement: Neutral desktop icon caption

The desktop applet icon for the weather window SHALL be captioned `Weather`, independent of which source is active.

#### Scenario: Desktop icon label

- **WHEN** the weather applet icon is rendered on the desktop
- **THEN** its caption reads `Weather`
