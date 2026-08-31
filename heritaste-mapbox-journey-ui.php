<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://www.georgenicolaou.me
 * @since             1.0.0
 * @package           Heritaste_Mapbox_Journey_Ui
 *
 * @wordpress-plugin
 * Plugin Name:       Heritaste Mapbox Journey UI
 * Plugin URI:        https://www.georgenicolaou.me/plugins/heritaste-mapbox-journey-ui
 * Update URI:        https://github.com/GeorgeWebDevCy/heritaste-mapbox-journey-ui
 * Description:       Displays ACF-managed participant journeys together on an interactive Mapbox world map.
 * Version:           1.2.0
 * Author:            George Nicolaou
 * Author URI:        https://www.georgenicolaou.me/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       heritaste-mapbox-journey-ui
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'HERITASTE_MAPBOX_JOURNEY_UI_VERSION', '1.2.0' );

/**
 * Configure updates from the plugin's public GitHub repository.
 */
require_once plugin_dir_path( __FILE__ ) . 'includes/class-heritaste-mapbox-journey-ui-updater.php';

add_action(
	'plugins_loaded',
	function() {
		Heritaste_Mapbox_Journey_Ui_Updater::init( __FILE__ );
	},
	20
);

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-heritaste-mapbox-journey-ui-activator.php
 */
function activate_heritaste_mapbox_journey_ui() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-heritaste-mapbox-journey-ui-activator.php';
	Heritaste_Mapbox_Journey_Ui_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-heritaste-mapbox-journey-ui-deactivator.php
 */
function deactivate_heritaste_mapbox_journey_ui() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-heritaste-mapbox-journey-ui-deactivator.php';
	Heritaste_Mapbox_Journey_Ui_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_heritaste_mapbox_journey_ui' );
register_deactivation_hook( __FILE__, 'deactivate_heritaste_mapbox_journey_ui' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-heritaste-mapbox-journey-ui.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_heritaste_mapbox_journey_ui() {

	$plugin = new Heritaste_Mapbox_Journey_Ui();
	$plugin->run();

}
run_heritaste_mapbox_journey_ui();
