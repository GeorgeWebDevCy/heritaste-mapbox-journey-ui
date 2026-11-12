<?php

$root        = dirname( __DIR__ );
$main        = file_get_contents( $root . '/heritaste-mapbox-journey-ui.php' );
$core        = file_get_contents( $root . '/includes/class-heritaste-mapbox-journey-ui.php' );
$admin       = file_get_contents( $root . '/admin/class-heritaste-mapbox-journey-ui-admin.php' );
$admin_view  = file_get_contents( $root . '/admin/partials/heritaste-mapbox-journey-ui-admin-display.php' );
$public      = file_get_contents( $root . '/public/class-heritaste-mapbox-journey-ui-public.php' );
$javascript  = file_get_contents( $root . '/public/js/heritaste-mapbox-journey-ui-public.js' );
$css         = file_get_contents( $root . '/public/css/heritaste-mapbox-journey-ui-public.css' );
$land_mask   = (string) file_get_contents( $root . '/public/data/areas.json' );
$failures    = array();
$expectations = array(
	'Plugin version constant'      => array( $main, "HERITASTE_MAPBOX_JOURNEY_UI_VERSION', '1.14.0" ),
	'Settings registration hook'   => array( $core, "'admin_init'" ),
	'Settings menu hook'           => array( $core, "'admin_menu'" ),
	'Public token validation'      => array( $admin, "strpos( \$value, 'pk.' )" ),
	'Shortcode registration'       => array( $public, "add_shortcode( 'heritaste_journey_map'" ),
	'ACF journey post type'        => array( $public, "'post_type'              => 'ht_journey'" ),
	'ACF participant relationship' => array( $public, "get_field( 'journey_participant'" ),
	'ACF stop repeater'            => array( $public, "get_field( 'journey_stops'" ),
	'Accessible audio fallback'    => array( $public, '<audio controls preload="none"' ),
	'Participant age payload'      => array( $public, "get_field( 'participant_age'" ),
	'Supporting document payload'  => array( $public, "'document'  =>" ),
	'Supporting document link'     => array( $javascript, "documentLink.rel = 'noopener noreferrer'" ),
	'Audio speaker CTA'            => array( $javascript, 'createAudioCallToAction(stop, journey)' ),
	'Audio prompt text'            => array( $javascript, 'Click the icon to listen to the full story' ),
	'Fullscreen shortcode layout'  => array( $public, "'fullscreen' === sanitize_key" ),
	'Participant journey legend'   => array( $public, 'heritaste-map-legend' ),
	'Pin meaning legend'           => array( $public, 'heritaste-map-legend__pin--start' ),
	'Recipe meaning legend'        => array( $public, 'heritaste-map-legend__recipe' ),
	'GeoJSON route'                => array( $javascript, "type: 'LineString'" ),
	'True route coordinates'       => array( $javascript, 'coordinates: routeCoordinates' ),
	'Recipe route midpoint'        => array( $javascript, 'getRouteMidpoint(routeCoordinates)' ),
	'Recipe plate marker'          => array( $javascript, 'createRecipeMarkerIcon()' ),
	'Real journeys before demos'   => array( $public, "return \$left_is_demo ? 1 : -1" ),
	'Albania to Greece demo'       => array( $admin, "'[Demo] Milan - Albania to Greece'" ),
	'Africa to Italy demo'         => array( $admin, "'[Demo] Tara - Africa to Italy'" ),
	'Keyboard-labelled marker'     => array( $javascript, "marker.setAttribute('aria-label'" ),
	'Shared origin colour setting' => array( $admin, "'heritaste_origin_route_colors'" ),
	'Nepal default shared colour'  => array( $public, 'Nepal = #c8102e' ),
	'Albania default shared colour'=> array( $public, 'Albania = #1f5fa8' ),
	'Panel opens at its top'       => array( $javascript, 'focusAfterOpen: false' ),
	'Recipe pin from title'        => array( $javascript, "return /recipe/i.test(stop.title || '')" ),
	'Style box hidden under panel' => array( $css, ':has(.mapboxgl-popup) .heritaste-map-style-switcher' ),
	'Screen-space pin spreading'   => array( $javascript, 'createMarkerSpreader(map, updateZoomHint)' ),
	'Spreading follows the view'   => array( $javascript, "map.on('move', schedule)" ),
	'Pins return to true place'    => array( $javascript, 'marker.setOffset([0, 0])' ),
	'Story paragraphs in panel'    => array( $javascript, 'stop.story.split(/\r?\n+/)' ),
	'Story paragraphs in fallback' => array( $public, "preg_split( '/\R+/', \$stop['story']" ),
	'Zoom tip markup'              => array( $public, 'data-zoom-hint hidden' ),
	'Zoom tip hidden under panel'  => array( $css, ':has(.mapboxgl-popup) .heritaste-map-zoom-hint' ),
	'Land outline asset'           => array( $land_mask, '"FeatureCollection"' ),
	'Land outline URL'             => array( $public, "'landMaskUrl' => plugin_dir_url( __FILE__ ) . 'data/areas.json" ),
	'Moved pins stay on land'      => array( $javascript, 'keepOnLand(active, positions, origins)' ),
	'Route pins slide onto land'   => array( $javascript, 'moveRoutePinsOntoLand()' ),
	'Same piece of land only'      => array( $javascript, 'landUnderTip(candidate, entry) !== entry.landId' ),
	'Routes hidden until selected' => array( $javascript, "visibility: 'none'" ),
	'Selection shows one route'    => array( $javascript, "map.setLayoutProperty(layerId, 'visibility', selected ? 'visible' : 'none')" ),
	'Overview shows origin pins'   => array( $javascript, 'var show = item.isOrigin || selected;' ),
	'Origin pin selects journey'   => array( $javascript, 'if (item.isOrigin && selectedId !== journey.id)' ),
	'Legend selects journey'       => array( $public, 'data-journey-id="<?php echo esc_attr( $journey[\'id\'] ); ?>" aria-pressed="false"' ),
	'Show all participants'        => array( $public, 'data-journey-show-all' ),
	'Overview tip translatable'    => array( $public, "esc_html_e( 'Choose a pin or a name to see that person" ),
	'Crowded sentence on demand'   => array( $javascript, 'zoomHintCrowded.hidden = largestShift < 8' ),
	'Pins keep button semantics'   => array( $javascript, "entry.marker.getElement().removeAttribute('role')" ),
	'Pin click stays off the map'  => array( $javascript, 'event.stopPropagation();' ),
	'Spread pins stay on screen'   => array( $javascript, 'position.x = Math.min(Math.max(position.x, edge), canvas.clientWidth - edge);' ),
	'Route contrast casing'        => array( $javascript, "id: sourceId + '-casing'" ),
	'Legend-aware bottom padding'  => array( $javascript, 'bottom: Math.min(Math.round(legendRect.height + 40)' ),
	'Shared colour applied'        => array( $public, '$shared_color ?:' ),
	'Origin pin name on hover'     => array( $javascript, "'heritaste-map-marker__name', journey.participant.name" ),
	'YouTube story video dialog'   => array( $javascript, 'openVideoDialog(videoId' ),
	'Privacy-enhanced embed'       => array( $javascript, 'https://www.youtube-nocookie.com/embed/' ),
	'Video stops on close'         => array( $javascript, "dialog.addEventListener('close'" ),
	'Video fallback link'          => array( $public, "is_video_link( \$stop['audio'] )" ),
	'Origin name hover style'      => array( $css, '.heritaste-map-marker--start:hover .heritaste-map-marker__name' ),
	'Direct narrative route'       => array( $javascript, 'isDirectNarrativeJourney(routeCoordinates)' ),
	'Narrative markers on line'    => array( $javascript, 'coordinate = getRoutePosition(routeCoordinates, fraction)' ),
	'Location pin marker anchor'   => array( $javascript, "anchor: recipeStop ? 'center' : 'bottom'" ),
	'Start and end pin semantics'  => array( $javascript, "stopType === 'start'" ),
	'Data-driven initial viewport' => array( $javascript, 'fitMapToJourneyData' ),
	'Legend-aware map padding'     => array( $javascript, 'getInitialMapPadding' ),
	'Live public style selector'   => array( $public, 'data-map-style-selector' ),
	'Live Mapbox style change'     => array( $javascript, 'map.setStyle(nextStyle)' ),
	'Route restoration after style'=> array( $javascript, "map.once('style.load'" ),
	'Demo generation action'       => array( $core, 'admin_post_heritaste_generate_demo_data' ),
	'Demo deletion action'         => array( $core, 'admin_post_heritaste_delete_demo_data' ),
	'Demo capability protection'   => array( $admin, "current_user_can( 'manage_options' )" ),
	'Demo nonce protection'        => array( $admin, 'check_admin_referer( $nonce_action )' ),
	'Demo deletion marker'         => array( $admin, "'_heritaste_demo_data'" ),
	'Generate demo button'         => array( $admin_view, 'Generate Demo Data' ),
	'Delete demo button'           => array( $admin_view, 'Delete Demo Data' ),
);

foreach ( $expectations as $label => $expectation ) {
	if ( false === strpos( $expectation[0], $expectation[1] ) ) {
		$failures[] = $label . ' is not configured as expected.';
	}
}

if ( false !== strpos( $javascript, "addEventListener('mouseenter'" ) || false !== strpos( $javascript, "addEventListener('focus'" ) ) {
	$failures[] = 'Markers must not open popups on hover or focus.';
}

if ( strpos( $javascript, "'heritaste-map-popup__title', stop.title" ) > strpos( $javascript, "'heritaste-map-popup__participant', journey.participant.name" ) ) {
	$failures[] = 'The panel title must appear directly below its photo and before participant details.';
}

if ( $failures ) {
	fwrite( STDERR, implode( PHP_EOL, $failures ) . PHP_EOL );
	exit( 1 );
}

echo "Journey map smoke test passed.\n";
