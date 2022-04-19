<?php

namespace ThemeIsle\GutenbergBlocks\Integration;

class Form_Email
{
	/**
	 * The main instance var.
	 *
	 * @var Form_Email
	 */
	public static $instance = null;

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 2.0.1
	 * @access public
	 * @return Form_Email
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

    /**
     * Add email rendering actions.
     * @return void
     */
	public function init() {
        /**
         * Add action that render the email's header.
         */
		add_filter('otter_form_email_head', array($this, 'build_head'));

        /**
         * Add action that render the email's body.
         */
		add_filter('otter_form_email_body', array($this, 'build_body'));

		/**
		 * Add action that render the email's body for errors.
		 */
		add_filter('otter_form_email_body_error', array($this, 'build_error_body'), 1, 2);
	}

    /**
     * Create the email content.
     * @param $form_data The form request data.
     * @return false|string
     */
	public function build_email( $form_data ) {
		ob_start(); ?>
		<!doctype html>
		<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
			<meta http-equiv="Content-Type" content="text/html;" charset="utf-8"/>
			<!-- view port meta tag -->
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
			<title><?php esc_html__( 'Mail From: ', 'otter-blocks' ) . sanitize_email( get_site_option( 'admin_email' ) ); ?></title>
		</head>
		<body>
        <?php
        apply_filters('otter_form_email_head', $form_data);
        apply_filters('otter_form_email_body', $form_data);
        ?>
		</body>
		</html>
		<?php
		return ob_get_clean();
	}

    /**
     * Create the content for the email header.
     */
	public function build_head() {
		ob_start(); ?>
		<h3>
			<?php esc_html_e( 'Content Form submission from ', 'otter-blocks' ); ?>
			<a href="<?php echo esc_url( get_site_url() ); ?>"><?php bloginfo( 'name' ); ?></a>
		</h3>
		<hr/>
		<?php
		return ob_get_clean();
	}

    /**
     * Create the content for the email body.
     * @param Form_Data_Request $form_data The form request data.
     */
	public function build_body($form_data ) {
		$emailFormContent = $form_data->get_form_inputs();
		ob_start(); ?>
        <table>
        <tbody>
		<?php
		foreach ($emailFormContent as $input ) {
			?>
			<tr>
				<td>
					<strong><?php echo esc_html( $input['label'] ); ?>: </strong>
					<?php echo esc_html( $input['value'] ); ?>
				</td>

			</tr>
			<?php
		}
		?>
        </tbody>
            <tfoot>
            <tr>
                <td>
                    <hr/>
                    <?php esc_html_e( 'You received this email because your email address is set in the content form settings on ', 'otter-blocks' ); ?>
                    <a href="<?php echo esc_url( get_site_url() ); ?>"><?php bloginfo( 'name' ); ?></a>
                </td>
            </tr>
            </tfoot>
        </table>
		<?php
		return ob_get_clean();
	}

	/**
	 * @param string $error The error message.
	 * @param Form_Data_Request $form_data The form request data.
	 * @return false|string
	 */
    public function build_error_email( $error, $form_data ) {
        ob_start(); ?>
        <!doctype html>
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta http-equiv="Content-Type" content="text/html;" charset="utf-8"/>
            <!-- view port meta tag -->
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
            <title><?php esc_html__( 'Mail From: ', 'otter-blocks' ) . sanitize_email( get_site_option( 'admin_email' ) ); ?></title>
        </head>
        <body>
		<?php
		apply_filters('otter_form_email_body_error', $error, $form_data);
		?>
        <div>
            <h3> <?php esc_html__( 'Submitted form content', 'otter-blocks' ) ?> </h3>
            <div style="padding: 10px; border: 1px dashed black;">
                <?php
				apply_filters('otter_form_email_body', $form_data);
                ?>
            </div>
        </div>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }

	/**
	 * @param string $error The error message.
	 * @param Form_Data_Request $form_data The form request data.
	 * @return false|string
	 */
	public function build_error_body( $error, $form_data ) {
		ob_start();  ?>
		<h3><?php esc_html__( 'An error has occurred when a user submitted the form.', 'otter-blocks' ) ?></h3>
		<div style="padding: 10px;">
			<span style="color: red;"> <?php esc_html__( 'Error: ', 'otter-blocks' ) ?> </span>
			<?php esc_html__( $error, 'otter-blocks' ) ?>
			<br/>
			<p> <?php esc_html__( 'Please check your Form credential from the email provider.', 'otter-blocks' ) ?></p>
		</div>
		<?php
		return ob_get_clean();
	}


	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @since 2.0.1
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @since 2.0.1
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
