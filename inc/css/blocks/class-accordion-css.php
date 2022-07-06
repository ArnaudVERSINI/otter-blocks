<?php
/**
 * Css handling logic for blocks.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Accordion_CSS
 */
class Accordion_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'accordion';

	/**
	 * Generate Accordion CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		if ( isset( $block['attrs']['id'] ) ) {
			$this->get_google_fonts( $block['attrs'] );
		}

		$css = new CSS_Utility( $block );

		$border_variables = array();
		foreach ( [ 'header', 'content' ] as $type ) {
			foreach ( [ 'top', 'right', 'bottom', 'left' ] as $position ) {
				foreach ( [ 'width', 'style', 'color' ] as $property ) {
					array_push(
						$border_variables,
						array(
							'property'  => '--' . $type[0] . 'Border' . strtoupper( $position[0] ) . strtoupper( $property[0] ),
							'value'     => $type . 'Border',
							'format'    => function( $value ) use ( $property, $position ) {
								return isset( $value[ $position ] ) ?
									$value[ $position ][ $property ] :
									$value[ $property ];
							},
							'condition' => function( $attrs ) use ( $position, $property, $type ) {
								return isset( $attrs[ $type . 'Border' ] ) &&
									( isset( $attrs[ $type . 'Border' ][ $position ] ) && isset( $attrs[ $type . 'Border' ][ $position ][ $property ] ) || isset( $attrs[ $type . 'Border' ][ $property ] ) );
							},
						)
					);
				}
			}
		}

		$border = array(
			'property'       => 'box-shadow',
			'pattern'        => 'horizontal vertical blur spread color',
			'pattern_values' => $border_variables,
		);

		$padding_variables = array();
		foreach ( [ 'header', 'content' ] as $type ) {
			foreach ( [ 'top', 'right', 'bottom', 'left' ] as $position ) {
				array_push(
					$padding_variables,
					array(
						'property'  => '--' . $type[0] . 'Padding' . ucwords( $position ),
						'value'     => $type . 'Padding',
						'format'    => function( $value ) use ( $position ) {
							return $value[ $position ];
						},
						'condition' => function( $attrs ) use ( $position, $type ) {
							return isset( $attrs[ $type . 'Padding' ] ) && isset( $attrs[ $type . 'Padding' ][ $position ] );
						},
					)
				);
			}
		};

		$css->add_item(
			array(
				'properties' => array_merge(
					array(
						array(
							'property' => '--titleColor',
							'value'    => 'titleColor',
							'hasSync'  => 'accordionTitleColor',
						),
						array(
							'property' => '--titleBackground',
							'value'    => 'titleBackground',
							'hasSync'  => 'accordionTitleBackground',
						),
						array(
							'property' => '--borderColor',
							'value'    => 'borderColor',
							'hasSync'  => 'accordionBorderColor',
						),
						array(
							'property' => '--contentBackground',
							'value'    => 'contentBackground',
							'hasSync'  => 'accordionContentBackground',
						),
						array(
							'property' => '--fontFamily',
							'value'    => 'fontFamily',
						),
						array(
							'property' => '--fontVariant',
							'value'    => 'fontVariant',
						),
						array(
							'property' => '--fontStyle',
							'value'    => 'fontStyle',
						),
						array(
							'property' => '--textTransform',
							'value'    => 'textTransform',
						),
						array(
							'property' => '--letterSpacing',
							'value'    => 'letterSpacing',
							'unit'     => 'px',
						),
						array(
							'property' => '--fontSize',
							'value'    => 'fontSize',
							'unit'     => 'px',
						),
						array(
							'property'       => '--boxShadow',
							'pattern'        => 'horizontal vertical blur spread color',
							'pattern_values' => array(
								'horizontal' => array(
									'value'   => 'boxShadowHorizontal',
									'unit'    => 'px',
									'default' => 0,
								),
								'vertical'   => array(
									'value'   => 'boxShadowVertical',
									'unit'    => 'px',
									'default' => 0,
								),
								'blur'       => array(
									'value'   => 'boxShadowBlur',
									'unit'    => 'px',
									'default' => 5,
								),
								'spread'     => array(
									'value'   => 'boxShadowSpread',
									'unit'    => 'px',
									'default' => 1,
								),
								'color'      => array(
									'value'   => 'boxShadowColor',
									'default' => '#000',
									'format'  => function( $value, $attrs ) {
										$opacity = ( isset( $attrs['boxShadowColorOpacity'] ) ? $attrs['boxShadowColorOpacity'] : 50 );
										return ( strpos( $value, '#' ) !== false && $opacity < 100 ) ? $this->hex2rgba( $value, $opacity / 100 ) : $value;
									},
								),
							),
							'condition'      => function( $attrs ) {
								return isset( $attrs['boxShadow'] ) && true === $attrs['boxShadow'];
							},
						),
					),
					$border_variables,
					$padding_variables
				),
			)
		);

		$style = $css->generate();

		return $style;
	}

	/**
	 * Generate Accordion Global CSS
	 *
	 * @return string
	 * @since   2.0.0
	 * @access  public
	 */
	public function render_global_css() {
		$defaults = get_option( 'themeisle_blocks_settings_global_defaults' );
		$block    = $this->library_prefix . '/' . $this->block_prefix;

		if ( empty( $defaults ) ) {
			return;
		}

		$defaults = json_decode( $defaults, true );

		if ( ! isset( $defaults[ $block ] ) ) {
			return;
		}

		$block = array(
			'attrs' => $defaults[ $block ],
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => '.wp-block-themeisle-blocks-accordion',
				'properties' => array(
					array(
						'property' => '--accordionTitleColor',
						'value'    => 'titleColor',
					),
					array(
						'property' => '--accordionTitleBackground',
						'value'    => 'titleBackground',
					),
					array(
						'property' => '--accordionBorderColor',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--accordionContentBackground',
						'value'    => 'contentBackground',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
