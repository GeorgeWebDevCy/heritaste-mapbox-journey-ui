<?php
/**
 * Settings page markup.
 *
 * @package Heritaste_Mapbox_Journey_Ui
 */
?>
<div class="wrap heritaste-mapbox-settings">
	<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
	<p><?php esc_html_e( 'Configure the shared world map used to display all participant journeys.', 'heritaste-mapbox-journey-ui' ); ?></p>
	<?php settings_errors(); ?>
	<form method="post" action="options.php">
		<?php
		settings_fields( 'heritaste_mapbox_journey_ui' );
		do_settings_sections( 'heritaste-mapbox-journey-ui' );
		submit_button();
		?>
	</form>
	<hr />
	<h2><?php esc_html_e( 'Map shortcode', 'heritaste-mapbox-journey-ui' ); ?></h2>
	<p><?php esc_html_e( 'Add this shortcode to the page where the shared participant map should appear:', 'heritaste-mapbox-journey-ui' ); ?></p>
	<p><code>[heritaste_journey_map]</code></p>
	<hr />
	<h2><?php esc_html_e( 'Demo data', 'heritaste-mapbox-journey-ui' ); ?></h2>
	<?php
	$demo_ids    = $this->get_demo_post_ids();
	$demo_status = isset( $_GET['heritaste_demo_status'] ) ? sanitize_key( wp_unslash( $_GET['heritaste_demo_status'] ) ) : '';
	$demo_count  = isset( $_GET['heritaste_demo_count'] ) ? absint( $_GET['heritaste_demo_count'] ) : 0;
	$messages    = array(
		'created'        => sprintf( _n( '%d demo record created.', '%d demo records created.', $demo_count, 'heritaste-mapbox-journey-ui' ), $demo_count ),
		'deleted'        => sprintf( _n( '%d demo record deleted.', '%d demo records deleted.', $demo_count, 'heritaste-mapbox-journey-ui' ), $demo_count ),
		'already_exists' => __( 'Demo data already exists. Delete it before generating a fresh set.', 'heritaste-mapbox-journey-ui' ),
		'acf_missing'    => __( 'Advanced Custom Fields Pro must be active before demo data can be generated.', 'heritaste-mapbox-journey-ui' ),
		'error'          => __( 'Demo data could not be generated. Any partially created records were removed.', 'heritaste-mapbox-journey-ui' ),
	);
	if ( isset( $messages[ $demo_status ] ) ) :
		?>
		<div class="notice <?php echo in_array( $demo_status, array( 'created', 'deleted' ), true ) ? 'notice-success' : 'notice-error'; ?> inline"><p><?php echo esc_html( $messages[ $demo_status ] ); ?></p></div>
	<?php endif; ?>
	<p><?php esc_html_e( 'Generate three fictional participants and journeys for map testing. Every generated record is marked so it can be deleted without touching real content.', 'heritaste-mapbox-journey-ui' ); ?></p>
	<p><?php echo esc_html( sprintf( _n( '%d marked demo record currently exists.', '%d marked demo records currently exist.', count( $demo_ids ), 'heritaste-mapbox-journey-ui' ), count( $demo_ids ) ) ); ?></p>
	<div class="heritaste-demo-actions">
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="heritaste_generate_demo_data" />
			<?php wp_nonce_field( 'heritaste_generate_demo_data' ); ?>
			<?php submit_button( __( 'Generate Demo Data', 'heritaste-mapbox-journey-ui' ), 'secondary', 'submit', false, ! empty( $demo_ids ) ? array( 'disabled' => 'disabled' ) : array() ); ?>
		</form>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" onsubmit="return confirm('<?php echo esc_js( __( 'Delete all marked Heritaste demo records? This cannot be undone.', 'heritaste-mapbox-journey-ui' ) ); ?>');">
			<input type="hidden" name="action" value="heritaste_delete_demo_data" />
			<?php wp_nonce_field( 'heritaste_delete_demo_data' ); ?>
			<?php submit_button( __( 'Delete Demo Data', 'heritaste-mapbox-journey-ui' ), 'delete', 'submit', false, empty( $demo_ids ) ? array( 'disabled' => 'disabled' ) : array() ); ?>
		</form>
	</div>
</div>
