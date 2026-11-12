=== Heritaste Mapbox Journey UI ===
Contributors: georgenicolaou
Tags: mapbox, maps, journeys, heritage
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 1.14.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Mapbox-powered journey and heritage-map interface for Heritaste.eu.

== Description ==

Heritaste Mapbox Journey UI displays every published participant journey together on one interactive Mapbox world map. Journey routes and stops are managed with ACF Pro. Stops can include a photo, story text, an audio file or YouTube video link (YouTube videos play in an on-page dialog via youtube-nocookie.com), and a labelled supporting document. Participant age can also appear in map popups.

Configure a Mapbox public access token under **Settings → Heritaste Journey Map**, then place `[heritaste_journey_map]` on the map page.
Use `[heritaste_journey_map layout="fullscreen"]` for a full-width, full-viewport-height map page.

Updates are delivered from the plugin's public GitHub releases.

== Installation ==

1. Upload the `heritaste-mapbox-journey-ui` directory to `/wp-content/plugins/` or install the release ZIP in WordPress.
2. Activate **Heritaste Mapbox Journey UI** from the Plugins screen.

== Changelog ==

= 1.14.0 =
* Show only one origin pin per participant at first. Choosing a person (their origin pin or their name in the legend) shows their route and story pins and zooms to the journey; other origin pins stay, dimmed. A bar names the selected person and offers "Show all participants"; Escape also returns to the overview.
* The top tip now explains how to open a journey, adding the zoom advice only while pins are crowded.

= 1.13.0 =
* Keep pins on land where possible: pins that are moved apart look for the nearest free spot on the same piece of land as their real location, and story or recipe pins on a route line slide along it off the water. Uses bundled, simplified Natural Earth land areas (unnamed, no external requests).

= 1.12.0 =
* Show a dismissible tip to use the + zoom button while nearby places have to be spread apart; it hides once zoomed in far enough or while a story panel is open.

= 1.11.1 =
* Keep the paragraph breaks from story content in map panels and the text fallback list.

= 1.11.0 =
* Spread overlapping pins on screen as the map moves: crowded areas such as Greece fan out just enough for every pin to be clickable, and pins return to their exact coordinates once zoomed in.

= 1.10.1 =
* Open story panels at the top (photo and title first) and move keyboard focus to the panel's close button.
* Hide the map style box while a story panel is open on mobile.
* Show the recipe plate icon for stops titled as recipes even without a recipe document.
* Give the panel close button a larger, labelled touch target.

= 1.10.0 =
* Add a light outline under every route and draw routes slightly thicker so they stay readable on satellite and dark map styles.
* Make story pins on the route line smaller so the line stays visible between them.
* Start closer on desktop: the legend now reserves space below the routes instead of a full-height column.

= 1.9.0 =
* Draw each participant's route as its own line: journeys on the same route are spread into parallel lines instead of overlapping.
* Add Albania (#1f5fa8) to the default shared origin-country route colours alongside Nepal.

= 1.8.0 =
* Play YouTube story videos in a dialog over the map instead of leaving the page. The player loads only on click, uses YouTube's privacy-enhanced (no-cookie) domain, and stops when closed.
* Show a "Watch the full story" link for YouTube stops in the text fallback list.

= 1.7.0 =
* Draw every journey from the same origin country in one shared route colour (configurable under Settings, Nepal by default).
* Show the participant name when hovering over or focusing an origin pin.
* Spread overlapping recipe and story pins when several journeys share the same route.

= 1.6.13 =
* Use proximity grouping so endpoint pins on opposite sides of a coordinate bucket are also separated.

= 1.6.12 =
* Separate nearby origin and destination pins with compact pixel offsets while keeping them in the correct country area.

= 1.6.11 =
* Restore the previous demo route palette.

= 1.6.10 =
* Give every participant a distinct route and marker color, including regenerated demo data.

= 1.6.9 =
* Keep endpoint pins on their true coordinates and place direct-journey narrative markers along their connecting route.

= 1.6.8 =
* List real participants before demo journeys and update the fictional routes to Nepal-Cyprus, Albania-Greece, and Africa-Italy.

= 1.6.7 =
* Draw routes from true journey coordinates and place recipe content on the route with a plate-and-cutlery marker.

= 1.6.6 =
* Add a reusable speaker-icon prompt beneath every map story, ready for supplied audio links.

= 1.6.5 =
* Show complete panel photos in a contained frame instead of cropping portrait images.
* Keep popup content dimensions and scrolling inside the visible viewport.

= 1.6.4 =
* Place every panel title directly below its photo, before participant details and story content.

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
