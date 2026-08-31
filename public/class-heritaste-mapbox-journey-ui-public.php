<?php

/**
 * Public shared journey map.
 *
 * @package Heritaste_Mapbox_Journey_Ui
 */
class Heritaste_Mapbox_Journey_Ui_Public {

	private $plugin_name;
	private $version;
	private $assets_configured = false;

	public function __construct( $plugin_name, $version ) {
		$this->plugin_name = $plugin_name;
		$this->version     = $version;
	}

	/**
	 * Register styles. They are enqueued only when the shortcode renders.
	 */
	public function enqueue_styles() {
		wp_register_style(
			$this->plugin_name . '-mapbox',
			'https://api.mapbox.com/mapbox-gl-js/v3.28.1/mapbox-gl.css',
			array(),
			'3.28.1'
		);

		wp_register_style(
			$this->plugin_name,
			plugin_dir_url( __FILE__ ) . 'css/heritaste-mapbox-journey-ui-public.css',
			array( $this->plugin_name . '-mapbox' ),
			$this->version
		);
	}

	/**
	 * Register scripts. They are enqueued only when the shortcode renders.
	 */
	public function enqueue_scripts() {
		wp_register_script(
			$this->plugin_name . '-mapbox',
			'https://api.mapbox.com/mapbox-gl-js/v3.28.1/mapbox-gl.js',
			array(),
			'3.28.1',
			true
		);

		wp_register_script(
			$this->plugin_name,
			plugin_dir_url( __FILE__ ) . 'js/heritaste-mapbox-journey-ui-public.js',
			array( $this->plugin_name . '-mapbox' ),
			$this->version,
			true
		);
	}

	public function register_shortcode() {
		add_shortcode( 'heritaste_journey_map', array( $this, 'render_map_shortcode' ) );
	}

	/**
	 * Render one world map containing every published journey.
	 */
	public function render_map_shortcode() {
		$token = (string) get_option( 'heritaste_mapbox_access_token', '' );

		if ( '' === $token ) {
			$message = current_user_can( 'manage_options' )
				? __( 'Add a Mapbox public access token under Settings → Heritaste Journey Map.', 'heritaste-mapbox-journey-ui' )
				: __( 'The journey map is not configured yet.', 'heritaste-mapbox-journey-ui' );

			return '<p class="heritaste-map-notice">' . esc_html( $message ) . '</p>';
		}

		if ( ! function_exists( 'get_field' ) ) {
			return '<p class="heritaste-map-notice">' . esc_html__( 'The journey map requires Advanced Custom Fields Pro.', 'heritaste-mapbox-journey-ui' ) . '</p>';
		}

		$journeys = $this->get_journeys();
		if ( empty( $journeys ) ) {
			return '<p class="heritaste-map-notice">' . esc_html__( 'No participant journeys have been published yet.', 'heritaste-mapbox-journey-ui' ) . '</p>';
		}

		$this->enqueue_map_assets( $token );

		$instance_id = wp_unique_id( 'heritaste-journey-map-' );
		$payload_id  = $instance_id . '-data';
		$payload     = array(
			'journeys' => $journeys,
		);

		ob_start();
		?>
		<section class="heritaste-journey-map" aria-labelledby="<?php echo esc_attr( $instance_id ); ?>-title">
			<h2 class="screen-reader-text" id="<?php echo esc_attr( $instance_id ); ?>-title"><?php esc_html_e( 'Participant journeys', 'heritaste-mapbox-journey-ui' ); ?></h2>
			<div class="heritaste-journey-map__canvas" id="<?php echo esc_attr( $instance_id ); ?>" data-journey-map data-payload-id="<?php echo esc_attr( $payload_id ); ?>" role="region" aria-label="<?php esc_attr_e( 'Interactive world map of participant journeys', 'heritaste-mapbox-journey-ui' ); ?>"></div>
			<script type="application/json" id="<?php echo esc_attr( $payload_id ); ?>"><?php echo wp_json_encode( $payload, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ); ?></script>
			<div class="heritaste-journey-map__fallback">
				<h3><?php esc_html_e( 'Journeys and stops', 'heritaste-mapbox-journey-ui' ); ?></h3>
				<?php foreach ( $journeys as $journey ) : ?>
					<article class="heritaste-journey-summary">
						<h4><?php echo esc_html( $journey['participant']['name'] ); ?></h4>
						<p><?php echo esc_html( $journey['origin_country'] . ' → ' . $journey['destination_country'] ); ?></p>
						<ol>
							<?php foreach ( $journey['stops'] as $stop ) : ?>
								<li>
									<strong><?php echo esc_html( $stop['title'] ); ?></strong>
									<?php if ( '' !== $stop['story'] ) : ?><p><?php echo esc_html( $stop['story'] ); ?></p><?php endif; ?>
									<?php if ( '' !== $stop['audio'] ) : ?><audio controls preload="none" src="<?php echo esc_url( $stop['audio'] ); ?>"></audio><?php endif; ?>
								</li>
							<?php endforeach; ?>
						</ol>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
		return ob_get_clean();
	}

	private function enqueue_map_assets( $token ) {
		wp_enqueue_style( $this->plugin_name . '-mapbox' );
		wp_enqueue_style( $this->plugin_name );
		wp_enqueue_script( $this->plugin_name . '-mapbox' );
		wp_enqueue_script( $this->plugin_name );

		if ( ! $this->assets_configured ) {
			wp_localize_script(
				$this->plugin_name,
				'heritasteJourneyMap',
				array(
					'accessToken' => $token,
					'style'       => (string) get_option( 'heritaste_mapbox_style', 'mapbox://styles/mapbox/standard' ),
				)
			);
			$this->assets_configured = true;
		}
	}

	private function get_journeys() {
		$post_ids = get_posts(
			array(
				'post_type'              => 'ht_journey',
				'post_status'            => 'publish',
				'posts_per_page'         => -1,
				'orderby'                => 'menu_order title',
				'order'                  => 'ASC',
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
			)
		);

		$journeys = array();
		foreach ( $post_ids as $post_id ) {
			$journey = $this->prepare_journey( $post_id );
			if ( null !== $journey ) {
				$journeys[] = $journey;
			}
		}

		return $journeys;
	}

	private function prepare_journey( $post_id ) {
		$participant_value = get_field( 'journey_participant', $post_id );
		$participant_id    = is_object( $participant_value ) ? $participant_value->ID : absint( $participant_value );
		$stops_value       = get_field( 'journey_stops', $post_id );
		$stops             = array();

		if ( is_array( $stops_value ) ) {
			foreach ( $stops_value as $stop ) {
				if ( ! isset( $stop['stop_latitude'], $stop['stop_longitude'] ) || ! is_numeric( $stop['stop_latitude'] ) || ! is_numeric( $stop['stop_longitude'] ) ) {
					continue;
				}
				$latitude  = isset( $stop['stop_latitude'] ) ? (float) $stop['stop_latitude'] : 0.0;
				$longitude = isset( $stop['stop_longitude'] ) ? (float) $stop['stop_longitude'] : 0.0;

				if ( $latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180 ) {
					continue;
				}

				$stops[] = array(
					'title'     => sanitize_text_field( $stop['stop_title'] ?? __( 'Journey stop', 'heritaste-mapbox-journey-ui' ) ),
					'latitude'  => $latitude,
					'longitude' => $longitude,
					'photo'     => $this->get_media_url( $stop['stop_photo'] ?? '' ),
					'story'     => wp_strip_all_tags( $stop['stop_story'] ?? '' ),
					'audio'     => $this->get_media_url( $stop['stop_audio'] ?? '' ),
				);
			}
		}

		if ( empty( $stops ) ) {
			return null;
		}

		return array(
			'id'                  => absint( $post_id ),
			'title'               => get_the_title( $post_id ),
			'origin_country'      => sanitize_text_field( get_field( 'origin_country', $post_id ) ),
			'destination_country' => sanitize_text_field( get_field( 'destination_country', $post_id ) ),
			'color'               => sanitize_hex_color( get_field( 'journey_color', $post_id ) ) ?: '#c45432',
			'participant'         => array(
				'id'        => $participant_id,
				'name'      => $participant_id ? get_the_title( $participant_id ) : get_the_title( $post_id ),
				'portrait'  => $participant_id ? $this->get_media_url( get_field( 'participant_portrait', $participant_id ) ) : '',
				'biography' => $participant_id ? wp_strip_all_tags( get_field( 'participant_biography', $participant_id ) ) : '',
			),
			'stops'               => $stops,
		);
	}

	private function get_media_url( $value ) {
		if ( is_array( $value ) && isset( $value['url'] ) ) {
			return esc_url_raw( $value['url'] );
		}
		if ( is_object( $value ) && isset( $value->ID ) ) {
			$value = $value->ID;
		}
		if ( is_numeric( $value ) ) {
			$url = wp_get_attachment_url( absint( $value ) );
			return $url ? esc_url_raw( $url ) : '';
		}

		return esc_url_raw( (string) $value );
	}
}
