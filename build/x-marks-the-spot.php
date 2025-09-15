<?php
/**
 * Plugin Name:       X Marks the Spot
 * Description:       Transform static images into engaging, clickable experiences with interactive hotspots.
 * Version:           0.1.0
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Author:            WordPress Telex
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       x-marks-the-spot-block-wp
 *
 * @package XMarksTheSpot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function telex_x_marks_the_spot_block_init() {
	register_block_type( __DIR__ . '/build/' );
}
add_action( 'init', 'telex_x_marks_the_spot_block_init' );

/**
 * Enqueue scripts for the interactive functionality
 */
function x_marks_the_spot_enqueue_scripts() {
	if ( has_block( 'telex/block-x-marks-the-spot' ) ) {
		wp_enqueue_script(
			'x-marks-the-spot-frontend',
			plugins_url( 'build/view.js', __FILE__ ),
			array(),
			'0.1.0',
			true
		);
	}
}
add_action( 'wp_enqueue_scripts', 'x_marks_the_spot_enqueue_scripts' );