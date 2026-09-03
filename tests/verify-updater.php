<?php

$root = dirname( __DIR__ );
$main = $root . '/heritaste-mapbox-journey-ui.php';
$updater = $root . '/includes/class-heritaste-mapbox-journey-ui-updater.php';
$library = $root . '/plugin-update-checker/plugin-update-checker.php';
$parsedown = $root . '/plugin-update-checker/vendor/Parsedown.php';
$failures = array();

if ( ! is_file( $library ) ) {
	$failures[] = 'The vendored Plugin Update Checker loader is missing.';
}

if ( ! is_file( $parsedown ) ) {
	$failures[] = 'Plugin Update Checker runtime dependencies are missing.';
}

$main_source = file_get_contents( $main );
$updater_source = file_get_contents( $updater );
$expectations = array(
	'Plugin version header' => array( $main_source, 'Version:           1.6.10' ),
	'Update URI header' => array( $main_source, 'Update URI:        https://github.com/GeorgeWebDevCy/heritaste-mapbox-journey-ui' ),
	'plugins_loaded bootstrap' => array( $main_source, "'plugins_loaded'" ),
	'GitHub repository' => array( $updater_source, 'https://github.com/GeorgeWebDevCy/heritaste-mapbox-journey-ui/' ),
	'Plugin slug' => array( $updater_source, "'heritaste-mapbox-journey-ui'" ),
	'Release ZIP selection' => array( $updater_source, 'enableReleaseAssets' ),
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

echo "Updater smoke test passed.\n";
