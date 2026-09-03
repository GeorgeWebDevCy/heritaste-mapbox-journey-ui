<?php

$root        = dirname( __DIR__ );
$main        = file_get_contents( $root . '/heritaste-mapbox-journey-ui.php' );
$core        = file_get_contents( $root . '/includes/class-heritaste-mapbox-journey-ui.php' );
$admin       = file_get_contents( $root . '/admin/class-heritaste-mapbox-journey-ui-admin.php' );
$admin_view  = file_get_contents( $root . '/admin/partials/heritaste-mapbox-journey-ui-admin-display.php' );
$public      = file_get_contents( $root . '/public/class-heritaste-mapbox-journey-ui-public.php' );
$javascript  = file_get_contents( $root . '/public/js/heritaste-mapbox-journey-ui-public.js' );
$failures    = array();
$expectations = array(
	'Plugin version constant'      => array( $main, "HERITASTE_MAPBOX_JOURNEY_UI_VERSION', '1.6.7" ),
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
	'Audio speaker CTA'            => array( $javascript, 'createAudioCallToAction(stop)' ),
	'Audio prompt text'            => array( $javascript, 'Click the icon to listen to the full story' ),
	'Fullscreen shortcode layout'  => array( $public, "'fullscreen' === sanitize_key" ),
	'Participant journey legend'   => array( $public, 'heritaste-map-legend' ),
	'Pin meaning legend'           => array( $public, 'heritaste-map-legend__pin--start' ),
	'Recipe meaning legend'        => array( $public, 'heritaste-map-legend__recipe' ),
	'GeoJSON route'                => array( $javascript, "type: 'LineString'" ),
	'True route coordinates'       => array( $javascript, 'coordinates: routeCoordinates' ),
	'Recipe route midpoint'        => array( $javascript, 'getRouteMidpoint(routeCoordinates)' ),
	'Recipe plate marker'          => array( $javascript, 'createRecipeMarkerIcon()' ),
	'Keyboard-labelled marker'     => array( $javascript, "marker.setAttribute('aria-label'" ),
	'Overlapping-point separation' => array( $javascript, 'buildDisplayCoordinates' ),
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
