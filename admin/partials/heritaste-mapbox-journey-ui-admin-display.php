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
</div>
