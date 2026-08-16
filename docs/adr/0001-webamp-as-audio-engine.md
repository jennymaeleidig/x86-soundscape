# Webamp as audio engine

Webamp is the sole audio playback engine — every Station is modeled as a Webamp playlist track. This was chosen to get Winamp skin support, a free visualizer, and playlist management without building a custom player. The trade-off: stations must carry a placeholder `duration` (live streams have no fixed length) and the domain concept of a Station is flattened into Webamp's track model.
