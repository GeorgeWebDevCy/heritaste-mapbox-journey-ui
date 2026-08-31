<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://www.georgenicolaou.me
 * @since      1.0.0
 *
 * @package    Heritaste_Mapbox_Journey_Ui
 * @subpackage Heritaste_Mapbox_Journey_Ui/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Heritaste_Mapbox_Journey_Ui
 * @subpackage Heritaste_Mapbox_Journey_Ui/includes
 * @author     George Nicolaou <orionas.elite@gmail.com>
 */
class Heritaste_Mapbox_Journey_Ui_i18n {


	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'heritaste-mapbox-journey-ui',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);

	}



}
