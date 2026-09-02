=== Heritaste Mapbox Journey UI ===
Contributors: georgenicolaou
Tags: mapbox, maps, journeys, heritage
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 1.6.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Mapbox-powered journey and heritage-map interface for Heritaste.eu.

== Description ==

Heritaste Mapbox Journey UI displays every published participant journey together on one interactive Mapbox world map. Journey routes and stops are managed with ACF Pro. Stops can include a photo, story text, audio recording, and a labelled supporting document. Participant age can also appear in map popups.

Configure a Mapbox public access token under **Settings → Heritaste Journey Map**, then place `[heritaste_journey_map]` on the map page.
Use `[heritaste_journey_map layout="fullscreen"]` for a full-width, full-viewport-height map page.

Updates are delivered from the plugin's public GitHub releases.

== Installation ==

1. Upload the `heritaste-mapbox-journey-ui` directory to `/wp-content/plugins/` or install the release ZIP in WordPress.
2. Activate **Heritaste Mapbox Journey UI** from the Plugins screen.

== Changelog ==

= 1.6.3 =
* Open journey popups only when a marker is clicked or keyboard-activated, not on hover or focus.

= 1.6.2 =
* Keep widened desktop popups centered inside the viewport with internal scrolling for long stories.

= 1.6.1 =
* Apply an explicit 480px desktop popup width instead of allowing the panel to shrink-wrap its content.

= 1.6.0 =
* Widen desktop story popups to reduce excessive text wrapping.
* Present phone popups as a nearly full-width, scrollable overlay that remains entirely on screen.

= 1.5.6 =
* Open phone popups beneath their marker so the participant header starts inside the viewport.

= 1.5.5 =
* Center phone popups below their marker and keep the full panel inside narrow viewports.

= 1.5.4 =
* Anchor phone popups below the selected marker so their header remains inside the viewport.

= 1.5.3 =
* Constrain long map popups on phones and keep their content internally scrollable.
* Temporarily hide the mobile legend while a popup is open to preserve reading space.

= 1.5.2 =
* Keep shared-location narrative pins independently interactive on narrow mobile maps.

= 1.5.1 =
* Increase shared-location pin separation so every narrative pin remains hoverable at the fitted world-map zoom.

= 1.5.0 =
* Add participant age to map popups.
* Add accessible, labelled supporting-document links for journey stops such as recipe PDFs.

= 1.4.0 =
* Add secure Generate Demo Data and Delete Demo Data controls to the plugin settings page.
* Prevent duplicate demo sets and scope deletion to explicitly marked demo records.

= 1.3.0 =
* Add an accessible public selector for changing Mapbox styles without reloading the page.
* Restore custom journey route layers automatically after each live style change.

= 1.2.4 =
* Place and style zoom controls in the unobstructed top-right map corner.
* Calculate the initial viewport from current journey data, screen size, and legend dimensions.

= 1.2.3 =
* Restore Mapbox's absolute marker positioning so successive pins do not accumulate vertical layout offsets.

= 1.2.2 =
* Preserve Mapbox marker positioning transforms so every location pin remains attached to its route.

= 1.2.1 =
* Distinguish origin, intermediate, and destination pins on the map and legend.
* Support stable top-left placement for the fullscreen Back to Home control.
* Keep the non-map journey list available to assistive technology without extending the visual map page.

= 1.2.0 =
* Separate overlapping journey origins and route lines while preserving source coordinates.
* Replace numbered markers with accessible location pins.
* Add a responsive participant journey legend styled for Heritaste.eu.

= 1.1.1 =
* Add an optional fullscreen shortcode layout for dedicated map pages.

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
