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

	/**
	 * Create the fictional participant and journey records used for map testing.
	 */
	public function generate_demo_data() {
		$this->authorize_demo_action( 'heritaste_generate_demo_data' );

		if ( ! function_exists( 'update_field' ) ) {
			$this->redirect_demo_status( 'acf_missing' );
		}

		if ( $this->get_demo_post_ids() ) {
			$this->redirect_demo_status( 'already_exists' );
		}

		$created_ids = array();
		foreach ( $this->get_demo_journeys() as $demo ) {
			$participant_id = wp_insert_post(
				array(
					'post_type'   => 'ht_participant',
					'post_status' => 'publish',
					'post_title'  => $demo['participant'],
				),
				true
			);

			if ( is_wp_error( $participant_id ) ) {
				$this->delete_post_ids( $created_ids );
				$this->redirect_demo_status( 'error' );
			}

			$created_ids[] = $participant_id;
			update_post_meta( $participant_id, '_heritaste_demo_data', '1' );
			update_field( 'participant_biography', $demo['biography'], $participant_id );

			$journey_id = wp_insert_post(
				array(
					'post_type'   => 'ht_journey',
					'post_status' => 'publish',
					'post_title'  => $demo['journey'],
				),
				true
			);

			if ( is_wp_error( $journey_id ) ) {
				$this->delete_post_ids( $created_ids );
				$this->redirect_demo_status( 'error' );
			}

			$created_ids[] = $journey_id;
			update_post_meta( $journey_id, '_heritaste_demo_data', '1' );
			update_field( 'journey_participant', $participant_id, $journey_id );
			update_field( 'origin_country', $demo['origin'], $journey_id );
			update_field( 'destination_country', $demo['destination'], $journey_id );
			update_field( 'journey_color', $demo['color'], $journey_id );
			update_field( 'journey_stops', $demo['stops'], $journey_id );
		}

		$this->redirect_demo_status( 'created', count( $created_ids ) );
	}

	/**
	 * Permanently delete only records carrying the plugin's demo marker.
	 */
	public function delete_demo_data() {
		$this->authorize_demo_action( 'heritaste_delete_demo_data' );
		$ids = $this->get_demo_post_ids();
		$this->delete_post_ids( $ids );
		$this->redirect_demo_status( 'deleted', count( $ids ) );
	}

	public function get_demo_post_ids() {
		return get_posts(
			array(
				'post_type'      => array( 'ht_participant', 'ht_journey' ),
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'meta_key'       => '_heritaste_demo_data',
				'meta_value'     => '1',
				'fields'         => 'ids',
			)
		);
	}

	private function authorize_demo_action( $nonce_action ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to manage Heritaste demo data.', 'heritaste-mapbox-journey-ui' ) );
		}
		check_admin_referer( $nonce_action );
	}

	private function delete_post_ids( $ids ) {
		foreach ( $ids as $post_id ) {
			wp_delete_post( absint( $post_id ), true );
		}
	}

	private function redirect_demo_status( $status, $count = 0 ) {
		$url = add_query_arg(
			array(
				'page'                  => $this->plugin_name,
				'heritaste_demo_status' => sanitize_key( $status ),
				'heritaste_demo_count'  => absint( $count ),
			),
			admin_url( 'options-general.php' )
		);
		wp_safe_redirect( $url );
		exit;
	}

	private function get_demo_journeys() {
		return array(
			array(
				'participant' => '[Demo] Asha',
				'biography'   => 'Fictional demo participant used to test the Heritaste journey map.',
				'journey'     => '[Demo] Asha - Nepal to Cyprus',
				'origin'      => 'Nepal',
				'destination' => 'Cyprus',
				'color'       => '#c45432',
				'stops'       => array(
					array( 'stop_title' => 'Kathmandu, Nepal', 'stop_latitude' => 27.7172, 'stop_longitude' => 85.3240, 'stop_story' => 'The demo journey begins in Kathmandu, where family recipes and familiar flavours connect Asha to home.', 'stop_photo' => '', 'stop_audio' => '' ),
					array( 'stop_title' => 'Doha, Qatar', 'stop_latitude' => 25.2854, 'stop_longitude' => 51.5310, 'stop_story' => 'A short stop in Doha marks the middle of the journey and the anticipation of a new beginning.', 'stop_photo' => '', 'stop_audio' => '' ),
					array( 'stop_title' => 'Larnaca, Cyprus', 'stop_latitude' => 34.9003, 'stop_longitude' => 33.6232, 'stop_story' => 'The journey reaches Cyprus, where new experiences meet memories carried from Nepal.', 'stop_photo' => '', 'stop_audio' => '' ),
				),
			),
			array(
				'participant' => '[Demo] Milan',
				'biography'   => 'Fictional demo participant used to test multiple routes on the shared world map.',
				'journey'     => '[Demo] Milan - Albania to Greece',
				'origin'      => 'Albania',
				'destination' => 'Greece',
				'color'       => '#2f6f8f',
				'stops'       => array(
					array( 'stop_title' => 'Tirana, Albania', 'stop_latitude' => 41.3275, 'stop_longitude' => 19.8187, 'stop_story' => 'Milan leaves Tirana carrying stories, traditions, and favourite foods from home.', 'stop_photo' => '', 'stop_audio' => '' ),
					array( 'stop_title' => 'Thessaloniki, Greece', 'stop_latitude' => 40.6401, 'stop_longitude' => 22.9444, 'stop_story' => 'Thessaloniki marks the middle of the demo journey into Greece.', 'stop_photo' => '', 'stop_audio' => '' ),
					array( 'stop_title' => 'Athens, Greece', 'stop_latitude' => 37.9838, 'stop_longitude' => 23.7275, 'stop_story' => 'In Athens, Milan begins building a new chapter while keeping close ties to Albania.', 'stop_photo' => '', 'stop_audio' => '' ),
				),
			),
			array(
				'participant' => '[Demo] Tara',
				'biography'   => 'Fictional demo participant used to test map pins, routes, and accessible fallback content.',
				'journey'     => '[Demo] Tara - Africa to Italy',
				'origin'      => 'Africa',
				'destination' => 'Italy',
				'color'       => '#5f7d3c',
				'stops'       => array(
					array( 'stop_title' => 'Africa', 'stop_latitude' => 0.0000, 'stop_longitude' => 20.0000, 'stop_story' => 'Tara begins the journey in Africa with memories of family meals and community celebrations.', 'stop_photo' => '', 'stop_audio' => '' ),
					array( 'stop_title' => 'Mediterranean crossing', 'stop_latitude' => 34.0000, 'stop_longitude' => 16.0000, 'stop_story' => 'The Mediterranean crossing marks the middle point on the route.', 'stop_photo' => '', 'stop_audio' => '' ),
					array( 'stop_title' => 'Rome, Italy', 'stop_latitude' => 41.9028, 'stop_longitude' => 12.4964, 'stop_story' => 'Rome is the final destination, connecting Tara’s past experiences with a new home.', 'stop_photo' => '', 'stop_audio' => '' ),
				),
			),
		);
	}

	private function is_settings_page() {
		return isset( $_GET['page'] ) && $this->plugin_name === sanitize_key( wp_unslash( $_GET['page'] ) );
	}

}
