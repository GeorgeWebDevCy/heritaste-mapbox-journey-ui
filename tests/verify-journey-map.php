<?php

$root        = dirname( __DIR__ );
$main        = file_get_contents( $root . '/heritaste-mapbox-journey-ui.php' );
$core        = file_get_contents( $root . '/includes/class-heritaste-mapbox-journey-ui.php' );
$admin       = file_get_contents( $root . '/admin/class-heritaste-mapbox-journey-ui-admin.php' );
$public      = file_get_contents( $root . '/public/class-heritaste-mapbox-journey-ui-public.php' );
$javascript  = file_get_contents( $root . '/public/js/heritaste-mapbox-journey-ui-public.js' );
$failures    = array();
$expectations = array(
	'Plugin version constant'      => array( $main, "HERITASTE_MAPBOX_JOURNEY_UI_VERSION', '1.2.2" ),
	'Settings registration hook'   => array( $core, "'admin_init'" ),
	'Settings menu hook'           => array( $core, "'admin_menu'" ),
	'Public token validation'      => array( $admin, "strpos( \$value, 'pk.' )" ),
	'Shortcode registration'       => array( $public, "add_shortcode( 'heritaste_journey_map'" ),
	'ACF journey post type'        => array( $public, "'post_type'              => 'ht_journey'" ),
	'ACF participant relationship' => array( $public, "get_field( 'journey_participant'" ),
	'ACF stop repeater'            => array( $public, "get_field( 'journey_stops'" ),
	'Accessible audio fallback'    => array( $public, '<audio controls preload="none"' ),
	'Fullscreen shortcode layout'  => array( $public, "'fullscreen' === sanitize_key" ),
	'Participant journey legend'   => array( $public, 'heritaste-map-legend' ),
	'Pin meaning legend'           => array( $public, 'heritaste-map-legend__pin--start' ),
	'GeoJSON route'                => array( $javascript, "type: 'LineString'" ),
	'Keyboard-labelled marker'     => array( $javascript, "marker.setAttribute('aria-label'" ),
	'Overlapping-point separation' => array( $javascript, 'buildDisplayCoordinates' ),
	'Location pin marker anchor'   => array( $javascript, "anchor: 'bottom'" ),
	'Start and end pin semantics'  => array( $javascript, "stopType === 'start'" ),
);

foreach ( $expectations as $label => $expectation ) {
	if ( false === strpos( $expectation[0], $expectation[1] ) ) {
		$failures[] = $label . ' is not configured as expected.';
	}
}

if ( $failures ) {
	fwrite( STDERR, implode( PHP_EOL, $failures ) . PHP_EOL );
	exit( 1 );
}

echo "Journey map smoke test passed.\n";
