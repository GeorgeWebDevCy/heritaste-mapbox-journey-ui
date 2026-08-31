<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://www.georgenicolaou.me
 * @since      1.0.0
 *
 * @package    Heritaste_Mapbox_Journey_Ui
 * @subpackage Heritaste_Mapbox_Journey_Ui/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Heritaste_Mapbox_Journey_Ui
 * @subpackage Heritaste_Mapbox_Journey_Ui/admin
 * @author     George Nicolaou <orionas.elite@gmail.com>
 */
class Heritaste_Mapbox_Journey_Ui_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {
		if ( ! $this->is_settings_page() ) {
			return;
		}
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/heritaste-mapbox-journey-ui-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {
		if ( ! $this->is_settings_page() ) {
			return;
		}
		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/heritaste-mapbox-journey-ui-admin.js', array( 'jquery' ), $this->version, false );

	}

	/**
	 * Add the plugin page beneath the WordPress Settings menu.
	 */
	public function add_settings_page() {
		add_options_page(
			__( 'Heritaste Journey Map', 'heritaste-mapbox-journey-ui' ),
			__( 'Heritaste Journey Map', 'heritaste-mapbox-journey-ui' ),
			'manage_options',
			$this->plugin_name,
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Register Mapbox settings with the Settings API.
	 */
	public function register_settings() {
		register_setting(
			'heritaste_mapbox_journey_ui',
			'heritaste_mapbox_access_token',
			array(
				'type'              => 'string',
				'sanitize_callback' => array( $this, 'sanitize_access_token' ),
				'default'           => '',
			)
		);

		register_setting(
			'heritaste_mapbox_journey_ui',
			'heritaste_mapbox_style',
			array(
				'type'              => 'string',
				'sanitize_callback' => array( $this, 'sanitize_style_url' ),
				'default'           => 'mapbox://styles/mapbox/standard',
			)
		);

		add_settings_section(
			'heritaste_mapbox_connection',
			__( 'Mapbox connection', 'heritaste-mapbox-journey-ui' ),
			array( $this, 'render_connection_description' ),
			$this->plugin_name
		);

		add_settings_field(
			'heritaste_mapbox_access_token',
			__( 'Public access token', 'heritaste-mapbox-journey-ui' ),
			array( $this, 'render_token_field' ),
			$this->plugin_name,
			'heritaste_mapbox_connection'
		);

		add_settings_field(
			'heritaste_mapbox_style',
			__( 'Map style URL', 'heritaste-mapbox-journey-ui' ),
			array( $this, 'render_style_field' ),
			$this->plugin_name,
			'heritaste_mapbox_connection'
		);
	}

	/**
	 * Accept only Mapbox public tokens because the value is sent to browsers.
	 */
	public function sanitize_access_token( $value ) {
		$value = sanitize_text_field( trim( (string) $value ) );

		if ( '' !== $value && 0 !== strpos( $value, 'pk.' ) ) {
			add_settings_error(
				'heritaste_mapbox_access_token',
				'heritaste_mapbox_access_token_invalid',
				__( 'Use a Mapbox public token beginning with "pk.". Secret tokens must never be exposed in the browser.', 'heritaste-mapbox-journey-ui' ),
				'error'
			);
			return (string) get_option( 'heritaste_mapbox_access_token', '' );
		}

		return $value;
	}

	public function sanitize_style_url( $value ) {
		$value = sanitize_text_field( trim( (string) $value ) );
		if ( preg_match( '#^mapbox://styles/[a-z0-9._-]+/[a-z0-9._-]+$#i', $value ) ) {
			return $value;
		}

		add_settings_error(
			'heritaste_mapbox_style',
			'heritaste_mapbox_style_invalid',
			__( 'Enter a valid Mapbox style URL such as mapbox://styles/mapbox/standard.', 'heritaste-mapbox-journey-ui' ),
			'error'
		);
		return (string) get_option( 'heritaste_mapbox_style', 'mapbox://styles/mapbox/standard' );
	}

	public function render_connection_description() {
		echo '<p>' . esc_html__( 'The public token is required by Mapbox GL JS in visitors’ browsers. Restrict the token to Heritaste.eu in your Mapbox account.', 'heritaste-mapbox-journey-ui' ) . '</p>';
	}

	public function render_token_field() {
		$value = (string) get_option( 'heritaste_mapbox_access_token', '' );
		printf(
			'<input type="password" class="regular-text" id="heritaste_mapbox_access_token" name="heritaste_mapbox_access_token" value="%s" autocomplete="off" spellcheck="false" aria-describedby="heritaste-mapbox-token-help" />',
			esc_attr( $value )
		);
		echo '<p class="description" id="heritaste-mapbox-token-help">' . esc_html__( 'Paste a public Mapbox token beginning with pk.', 'heritaste-mapbox-journey-ui' ) . '</p>';
	}

	public function render_style_field() {
		$value = (string) get_option( 'heritaste_mapbox_style', 'mapbox://styles/mapbox/standard' );
		printf(
			'<input type="text" class="regular-text code" id="heritaste_mapbox_style" name="heritaste_mapbox_style" value="%s" />',
			esc_attr( $value )
		);
	}

	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		require plugin_dir_path( __FILE__ ) . 'partials/heritaste-mapbox-journey-ui-admin-display.php';
	}

	private function is_settings_page() {
		return isset( $_GET['page'] ) && $this->plugin_name === sanitize_key( wp_unslash( $_GET['page'] ) );
	}

}
