<?php

/**
 * GitHub update integration for the plugin.
 *
 * @package Heritaste_Mapbox_Journey_Ui
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Initializes Plugin Update Checker.
 */
final class Heritaste_Mapbox_Journey_Ui_Updater {

	const REPOSITORY_URL = 'https://github.com/GeorgeWebDevCy/heritaste-mapbox-journey-ui/';
	const PLUGIN_SLUG = 'heritaste-mapbox-journey-ui';

	/**
	 * Initialize the update checker once.
	 *
	 * @param string $plugin_file Absolute path to the main plugin file.
	 * @return object|null The update checker instance, or null when unavailable.
	 */
	public static function init( $plugin_file ) {
		static $update_checker = null;

		if ( null !== $update_checker ) {
			return $update_checker;
		}

		$library_file = dirname( __DIR__ ) . '/plugin-update-checker/plugin-update-checker.php';

		if ( ! is_readable( $library_file ) ) {
			return null;
		}

		require_once $library_file;

		$factory_class = '\\YahnisElsts\\PluginUpdateChecker\\v5\\PucFactory';

		if ( ! class_exists( $factory_class ) ) {
			return null;
		}

		$update_checker = $factory_class::buildUpdateChecker(
			self::REPOSITORY_URL,
			$plugin_file,
			self::PLUGIN_SLUG
		);

		$update_checker->setBranch( 'main' );
		$update_checker->getVcsApi()->enableReleaseAssets(
			'/heritaste-mapbox-journey-ui\\.zip($|[?&#])/i'
		);

		return $update_checker;
	}
}
