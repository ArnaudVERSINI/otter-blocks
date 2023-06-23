/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls
} from '@wordpress/block-editor';

import {
	Button,
	PanelBody,
	SelectControl,
	TextControl
} from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */

import { Notice as OtterNotice } from '../../../blocks/components';
import { Fragment } from '@wordpress/element';
import { fieldTypesOptions, switchFormFieldTo } from '../../../blocks/blocks/form/common';
import { dispatch } from '@wordpress/data';


/**
 *
 * @param {import('./types').FormHiddenFieldInspectorPros} props
 * @returns {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes,
	clientId
}) => {

	// FormContext is not available here. This is a workaround.
	const selectForm = () => {
		const formParentId = Array.from( document.querySelectorAll( `.wp-block-themeisle-blocks-form:has(#block-${clientId})` ) )?.pop()?.dataset?.block;
		dispatch( 'core/block-editor' ).selectBlock( formParentId );
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Field Settings', 'otter-blocks' ) }
			>
				<Button
					isSecondary
					variant="secondary"
					onClick={ () => selectForm?.() }
				>
					{ __( 'Back to the Form', 'otter-blocks' ) }
				</Button>

				<SelectControl
					label={ __( 'Field Type', 'otter-blocks' ) }
					value={ attributes.type ?? 'hidden' }
					options={ fieldTypesOptions() }
					onChange={ type => {
						if ( 'hidden' !== type ) {
							switchFormFieldTo( type, clientId, attributes );
						}
					}}
				/>

				<TextControl
					label={ __( 'Label', 'otter-blocks' ) }
					value={ attributes.label }
					onChange={ label => setAttributes({ label }) }
					help={ __( 'The label will be used as the field name.', 'otter-blocks' ) }
					disabled={! Boolean( window?.otterPro?.isActive )}
				/>

				<TextControl
					label={ __( 'Query Param', 'otter-blocks' ) }
					value={ attributes.paramName }
					onChange={ paramName => setAttributes({ paramName }) }
					help={ __( 'The query parameter name that is used in URL. If the param is present, its value will be extracted and send with the Form.', 'otter-blocks' ) }
					placeholder={ __( 'e.g. utm_source', 'otter-blocks' ) }
					disabled={! Boolean( window?.otterPro?.isActive )}
				/>

				{ ! Boolean( window?.otterPro?.isActive ) && (
					<Fragment>
						<OtterNotice
							notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
							instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Sticky Extension.', 'otter-blocks' ) }
						/>
					</Fragment>
				)

				}

				<div className="o-fp-wrap">
					{ applyFilters( 'otter.feedback', '', 'sticky' ) }
					{ applyFilters( 'otter.poweredBy', '' ) }
				</div>
			</PanelBody>

		</InspectorControls>
	);
};

export default Inspector;
