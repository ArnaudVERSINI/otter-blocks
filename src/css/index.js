/**
 * WordPress dependencies.
 */
import { assign } from 'lodash';

import { __ } from '@wordpress/i18n';

import { hasBlockSupport } from '@wordpress/blocks';

import { InspectorControls } from '@wordpress/block-editor';

import { PanelBody } from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { select } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

import {
	addFilter,
	applyFilters
} from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import './editor.scss';

import CSSEditor from './editor.js';

import './inject-css.js';

const addAttribute = ( settings ) => {
	if ( hasBlockSupport( settings, 'customClassName', true ) ) {
		settings.attributes = assign( settings.attributes, {
			hasCustomCSS: {
				type: 'boolean',
				default: false
			},
			customCSS: {
				type: 'string',
				default: null
			}
		});
	}

	return settings;
};

const withInspectorControls = createHigherOrderComponent( BlockEdit => {
	return props => {
		const hasCustomClassName = hasBlockSupport( props.name, 'customClassName', true );
		if ( hasCustomClassName && props.isSelected ) {
			let Inspector = InspectorControls;

			if ( window?.otterComponents?.useOtterTools ) {
				Inspector = window.otterComponents.useOtterTools({
					hasValue: () => Boolean( props.attributes?.hasCustomCSS ),
					label: __( 'Custom CSS', 'otter-blocks' ),
					onDeselect: () => {
						props.setAttributes({
							hasCustomCSS: false,
							customCSS: null
						});
					}
				});
			}

			return (
				<Fragment>
					<BlockEdit { ...props } />
					<Inspector>
						<PanelBody
							title={ __( 'Custom CSS', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<CSSEditor
								clientId={ props.clientId }
								setAttributes={ props.setAttributes }
								attributes={ props.attributes }
							/>

							<div className="o-fp-wrap">
								{ applyFilters( 'otter.feedback', '', 'custom-css' ) }
								{ applyFilters( 'otter.poweredBy', '' ) }
							</div>
						</PanelBody>
					</Inspector>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withInspectorControl' );

addFilter( 'blocks.registerBlockType', 'themeisle-custom-css/attribute', addAttribute );
addFilter( 'editor.BlockEdit', 'themeisle-custom-css/with-inspector-controls', withInspectorControls );
