=== Heritaste Mapbox Journey UI ===
Contributors: georgenicolaou
Tags: mapbox, maps, journeys, heritage
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 1.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Mapbox-powered journey and heritage-map interface for Heritaste.eu.

== Description ==

Heritaste Mapbox Journey UI displays every published participant journey together on one interactive Mapbox world map. Journey routes and stops are managed with ACF Pro. Stops can include a photo, story text, and audio recording.

Configure a Mapbox public access token under **Settings → Heritaste Journey Map**, then place `[heritaste_journey_map]` on the map page.

Updates are delivered from the plugin's public GitHub releases.

== Installation ==

1. Upload the `heritaste-mapbox-journey-ui` directory to `/wp-content/plugins/` or install the release ZIP in WordPress.
2. Activate **Heritaste Mapbox Journey UI** from the Plugins screen.

== Changelog ==

= 1.1.0 =
* Add a secure Mapbox public-token and style settings screen.
* Add the shared `[heritaste_journey_map]` world-map shortcode.
* Render ACF-managed participant routes, accessible pins, photos, stories, and audio.
* Add an accessible non-map journey list.

= 1.0.1 =
* Include Plugin Update Checker's runtime dependencies in release packages.

= 1.0.0 =
* Initial plugin boilerplate.
* Add GitHub release updates through Plugin Update Checker 5.7.
