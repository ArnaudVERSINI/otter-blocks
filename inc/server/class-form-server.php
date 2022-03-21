<?php
/**
 * Card server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Integration\Form_Email;
use ThemeIsle\GutenbergBlocks\Integration\Form_Settings_Data;
use ThemeIsle\GutenbergBlocks\Integration\Mailchimp_Integration;
use ThemeIsle\GutenbergBlocks\Integration\Sendinblue_Integration;

/**
 * Class Plugin_Card_Server
 */
class Form_Server {

	/**
	 * The main instance var.
	 *
	 * @var Form_Server
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Form_Server
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Form_Server
	 */
	public $version = 'v1';


	/**
	 * Initialize the class
	 */
	public function init() {
        /**
         * Register the REST API endpoints.
         */
		add_action('rest_api_init', array( $this, 'register_routes' ) );

        /**
         * Add filter for validation the form data.
         */
		add_filter('otter_form_validation', array( $this, 'check_form_conditions' ));

        /**
         * Add filter for captcha validation.
         */
		add_filter('otter_form_captcha_validation', array( $this, 'check_form_captcha' ));

        /**
         * Register an email provider that can be used to send emails or subscribe to a service.
         */
		do_action( 'otter_register_form_provider', array( 'default' =>  array( $this, 'send_default_email') ) );

		// Register 3rd party mail providers.
		do_action( 'otter_register_form_provider', array( 'sendinblue' => array( $this, 'subscribe_to_service' ) ));
		do_action( 'otter_register_form_provider', array( 'mailchimp' =>  array( $this, 'subscribe_to_service' ) ) );
	}

	/**
	 * Register REST API route
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;
		register_rest_route(
			$namespace,
			'/forms',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'submit_form' ),
					'permission_callback' => function () {
						return __return_true();
					},
				),
			)
		);
		register_rest_route(
			$namespace,
			'/integration',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'get_integration_data' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}


	/**
	 * Handle the request from the form block
	 *
	 * @param mixed $request Form request.
	 *
	 * @return mixed|\WP_REST_Response
	 */
	public function submit_form( $request ) {

		$data = new Form_Data_Request( json_decode( $request->get_body(), true ) );
		$res  = new Form_Data_Response();

		$reasons = apply_filters('otter_form_validation', $data);

		if ( 0 < count( $reasons ) ) {
			$res->set_error( __( 'Invalid request!', 'otter-blocks' ) );
			$res->set_reasons( $reasons );
			return $res->build_response();
		}

		if ( $data->is_set( 'token' ) ) {

			$result = apply_filters( 'otter_form_captcha_validation', $data );
			if ( false == $result['success'] ) {
				$res->set_error( __( 'The reCaptcha was invalid!', 'otter-blocks' ) );
				return $res->build_response();
			}
		}


		$form_options = Form_Settings_Data::get_form_setting_from_wordpress_options( $data->get( 'formOption' ) );
        $data->set_form_options($form_options);


        $provider_action = apply_filters('otter_select_form_provider', $data);

		$provider_response = $provider_action($data);

		if( $data->field_has( 'action', array( 'subscribe', 'submit-subscribe' )) && 'submit-subscribe' === $data->get( 'action' ) ) {
			return $this->send_default_email($data);
		}

		return $provider_response;
	}


	/**
	 * Send Email using SMTP
	 *
	 * @param Form_Data_Request $data Data from request body.
	 * @return mixed|\WP_REST_Response
	 */
	private function send_default_email( $data ) {
		$res = new Form_Data_Response();

        $form_options = $data->get_form_options();
		$email_subject = isset($form_options) && $form_options->has_email_subject() ? $form_options->get_email_subject() : ( __( 'A new form submission on ', 'otter-blocks' ) . get_bloginfo( 'name' ) );

		$email_body    = Form_Email::instance()->build_email($data);

		// Sent the form date to the admin site as a default behaviour.
		$to = sanitize_email( get_site_option( 'admin_email' ) );

		// Check if we need to send it to another user email.
		if ( $data->is_set( 'formOption' ) ) {
			$option_name = $data->is_set( 'formOption' );
			$form_emails = get_option( 'themeisle_blocks_form_emails' );

			foreach ( $form_emails as $form ) {
				if ( $form['form'] === $option_name && isset( $form['email'] )) {
					$to = sanitize_email( $form['email'] );
				}
			}
		}

		$headers = array( 'Content-Type: text/html; charset=UTF-8', 'From: ' . esc_url( get_site_url() ) );

		try {
			// phpcs:ignore
			wp_mail( $to, $email_subject, $email_body, $headers );
			$res->mark_as_success();
		} catch (\Exception  $e ) {
			$res->set_error( $e->getMessage() );
		} finally {
            $form_options = $data->get_form_options();
            $res->add_values( $form_options->get_submit_data() );
			return $res->build_response();
		}
	}

    private static function function_send_error_email( $error, $form_data ) {

        $email_subject = ( __( 'An error with the Form blocks has occurred on  ', 'otter-blocks' ) . get_bloginfo( 'name' ) );
        $email_body    = Form_Email::instance()->build_error_email($error, $form_data);
        // Sent the form date to the admin site as a default behaviour.
        $to = sanitize_email( get_site_option( 'admin_email' ) );
        $headers = array( 'Content-Type: text/html; charset=UTF-8', 'From: ' . esc_url( get_site_url() ) );
        // phpcs:ignore
        wp_mail( $to, $email_subject, $email_body, $headers );
    }


	/**
	 * Get data about the given provider
	 *
	 * @param \WP_REST_Request $request Search request.
	 * @return mixed|\WP_REST_Response
	 */
	public function get_integration_data( $request ) {
		$res = new Form_Data_Response();

		$data = new Form_Data_Request( json_decode( $request->get_body(), true ) );

		try {
			$service = null;
			switch ( $data->get( 'provider' ) ) {
				case 'mailchimp':
					$service = new Mailchimp_Integration();
					break;
				case 'sendinblue':
					$service = new Sendinblue_Integration();
					break;
				default:
					$res->set_error( __( 'Invalid request! Provider is missing.', 'otter-blocks' ) );
			}

			if( isset($service) ) {
				$valid_api_key = $service::validate_api_key( $data->get( 'apiKey' ) );
				if ( $valid_api_key['valid'] ) {
					$service->set_api_key( $data->get('apiKey') );
					$res->set_response( $service->get_provider_data( $data ) );
				} else {
					$res->set_error( $valid_api_key['reason'] );
				}
			}
		} catch (\Exception $e) {
			$res->set_error($e->getMessage());
		} finally {
			return $res->build_response();
		}
	}

    /**
     * @param Form_Data_Request $data
     * @return mixed|\WP_REST_Response
     */
	public function subscribe_to_service( $data ) {
		$res = new Form_Data_Response();
		// Get the first email from form.
		$email = $this->get_email_from_form_input($data);

		if ( '' === $email ) {
			$res->set_error( 'No email provided!' );
			return $res->build_response();
		}

        try {
            // Get the api credentials from the Form block.
            $form_options = $data->get_form_options();

            $issues = $form_options->check_data();

            if (
                count($issues) == 0
            ) {
                $service = null;
                switch ($form_options->get_provider()) {
                    case 'mailchimp':
                        $service = (new Mailchimp_Integration())->extract_data_from_integration($form_options);
                        break;
                    case 'sendinblue':
                        $service = (new Sendinblue_Integration())->extract_data_from_integration($form_options);
                        break;
                }

                $valid_api_key = $service::validate_api_key( $form_options->get_api_key() );

                if ( $valid_api_key['valid'] ) {
                    $res->copy( $service->subscribe( $email ) );
                    $res->add_values( $form_options->get_submit_data() );
                } else {
                    $res->set_error( $valid_api_key['reason'] );
                }
            } else {
                $res->set_reasons($issues);
            }
        } catch (\Exception $e) {
            $res->set_error( __('Server error!') );
        } finally {
            return $res->build_response();
        }
	}

	/**
	 * Check for required data.
	 *
	 * @access private
	 * @param Form_Data_Request $data Data from the request.
	 *
	 * @return boolean
	 */
	private function has_required_data($data ) {
		return $data->are_fields_set(
			array(
				'nonceValue',
				'postUrl',
				'formId',
				'formOptions',
			)
		) && wp_verify_nonce( $data->get( 'nonceValue' ), 'form-verification' );
	}

	/**
	 * Check if the data request has the data needed by form: captha, integrations.
	 *
	 * @access public
	 * @param Form_Data_Request $data Data from the request.
	 *
	 * @return array
	 */
	public function check_form_conditions( $data ) {

		$reasons           = array();
		if ( ! $this->has_required_data( $data ) ) {
			$reasons += array( __( 'Essential data is missing!', 'otter-blocks' ) );
			return $reasons;
		}

        try {
            $form_options = $data->get_form_options();

            if ( $form_options->form_has_captcha() && ( ! $data->is_set( 'token' ) || '' === $data['token'] ) ) {
                $reasons += array(
                    __( 'Token is missing!', 'otter-blocks' ),
                );
            }
        } catch (\Exception $e) {
			$reasons[] = $e->getMessage();
        } finally {
			return $reasons;
		}

	}

	/**
	 * Check if the data request has the data needed by form: captha, integrations.
	 *
	 * @access public
	 * @param Form_Data_Request $data Data from the request.
	 *
	 * @return array
	 */
	public function check_form_captcha( $data ) {
		$secret = get_option( 'themeisle_google_captcha_api_secret_key' );
		$resp   = wp_remote_post(
			'https://www.google.com/recaptcha/api/siteverify',
			array(
				'body'    => 'secret=' . $secret . '&response=' . $data->get( 'token' ),
				'headers' => [
					'Content-Type' => 'application/x-www-form-urlencoded',
				],
			)
		);
		return json_decode( $resp['body'], true );
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Form_Server
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @since 1.0.0
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
	 * @since 1.0.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * @param Form_Data_Request $data
	 * @return mixed|string
	 */
	private function get_email_from_form_input(Form_Data_Request $data)
	{
		foreach ($data->get('data') as $input_field) {
			if ('email' == $input_field['type']) {
				return $input_field['value'];
			}
		}
		return '';
	}
}
