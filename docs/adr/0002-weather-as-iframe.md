# Weather as iframe

Weather displays are embedded as third-party iframes rather than built from native components or proxied APIs. WeatherStar 4000+ (by netbymatt) and RetroCast (by The Weather Channel) are shown via `SafeResourceUrl` with a toggle in the Weather source service. This keeps integration simple and leverages maintained weather UIs, at the cost of no control over their layout, no direct styling, and cross-origin constraints (no programmatic access to the iframe's content).
