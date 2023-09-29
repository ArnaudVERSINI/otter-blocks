/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	FontSizePicker,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl
} from '@wordpress/components';

import {
	Fragment
} from '@wordpress/element';

import {
	isObjectLike
} from 'lodash';

import { _px, compactObject } from '../../../../helpers/helper-functions';
import { useResponsiveAttributes } from '../../../../helpers/utility-hooks';
import { ClearButton, GoogleFontsControl, ResponsiveControl } from '../../../../components';
import { makeBox } from '../../../copy-paste/utils';

const Heading = ({
	blockName,
	defaults: attributes,
	changeConfig
}) => {

	const setAttributes = x => {
		changeConfig( blockName, x );
	};

	const { responsiveSetAttributes, responsiveGetAttributes } = useResponsiveAttributes( setAttributes );

	const changeFontFamily = value => {
		if ( ! value ) {
			setAttributes({
				fontFamily: value,
				fontVariant: value
			});
		} else {
			setAttributes({
				fontFamily: value,
				fontVariant: 'normal',
				fontStyle: 'normal'
			});
		}
	};

	const oldPaddingDesktop = 'unlinked' === attributes.paddingType ? ({
		top: _px( attributes.paddingTop ) ?? '0px',
		bottom: _px( attributes.paddingBottom ) ?? '0px',
		right: _px( attributes.paddingRight ) ?? '0px',
		left: _px( attributes.paddingLeft ) ?? '0px'
	}) : ( isFinite( attributes.padding ) ? makeBox( _px( attributes.padding ) ) : {
		top: '0px',
		bottom: '0px',
		right: '0px',
		left: '0px'
	});

	const oldPaddingTablet = 'unlinked' === attributes.paddingTypeTablet ? ({
		top: _px( attributes.paddingTopTablet ) ?? '0px',
		bottom: _px( attributes.paddingBottomTablet ) ?? '0px',
		right: _px( attributes.paddingRightTablet ) ?? '0px',
		left: _px( attributes.paddingLeftTablet ) ?? '0px'
	}) : ( isFinite( attributes.paddingTablet ) ? makeBox( _px( attributes.paddingTablet ) ) : undefined );

	const oldPaddingMobile = 'unlinked' === attributes.paddingTypeMobile ?  ({
		top: _px( attributes.paddingTopMobile ) ?? '0px',
		bottom: _px( attributes.paddingBottomMobile ) ?? '0px',
		right: _px( attributes.paddingRightMobile ) ?? '0px',
		left: _px( attributes.paddingLeftMobile ) ?? '0px'
	}) : ( isFinite( attributes.paddingMobile ) ? makeBox( _px( attributes.paddingMobile ) ) : undefined );

	const oldMarginDesktop = undefined === attributes.marginType ?  ({
		top: _px( attributes.marginTop ) ?? '0px',
		bottom: _px( attributes.marginBottom ) ?? '25px'
	}) : ( isFinite( attributes.margin ) ? makeBox( _px( attributes.margin ) ) : undefined );

	const oldMarginTablet = undefined === attributes.marginTypeTablet ? ({
		top: _px( attributes.marginTopTablet ) ?? '0px',
		bottom: _px( attributes.marginBottomTablet ) ?? '0px'
	}) : ( isFinite( attributes.marginTablet ) ? makeBox( _px( attributes.marginTablet ) ) : undefined ) ;

	const oldMarginMobile = undefined === attributes.marginTypeMobile ?  ({
		top: _px( attributes.marginTopMobile ) ?? '0px',
		bottom: _px( attributes.marginBottomMobile ) ?? '0px'
	}) : ( isFinite( attributes.marginMobile ) ? makeBox( _px( attributes.marginMobile ) ) : undefined );

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Typography', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<ResponsiveControl
					label={ __( 'Font Size', 'otter-blocks' ) }
				>

					<FontSizePicker
						value={ _px( responsiveGetAttributes([ attributes.fontSize, attributes.fontSizeTablet, attributes.fontSizeMobile  ]) ) }
						onChange={ value => responsiveSetAttributes( value, [ 'fontSize', 'fontSizeTablet', 'fontSizeMobile' ]) }
						fontSizes={
							[
								{
									name: __( '13', 'otter-blocks' ),
									size: '13px',
									slug: 'small'
								},
								{
									name: __( '20', 'otter-blocks' ),
									size: '20px',
									slug: 'medium'
								},
								{
									name: __( '36', 'otter-blocks' ),
									size: '36px',
									slug: 'large'
								},
								{
									name: __( '42', 'otter-blocks' ),
									size: '42px',
									slug: 'xl'
								}
							]
						}
					/>
				</ResponsiveControl>

				<GoogleFontsControl
					label={ __( 'Font Family', 'otter-blocks' ) }
					value={ attributes.fontFamily }
					onChangeFontFamily={ changeFontFamily }
					valueVariant={ attributes.fontVariant }
					onChangeFontVariant={ fontVariant => setAttributes({ fontVariant }) }
					valueStyle={ attributes.fontStyle }
					onChangeFontStyle={ fontStyle => setAttributes({ fontStyle }) }
					valueTransform={ attributes.textTransform }
					onChangeTextTransform={ textTransform => setAttributes({ textTransform }) }
				/>

				<UnitControl
					label={ __( 'Line Height', 'otter-blocks' ) }
					value={ attributes.lineHeight }
					onChange={ lineHeight => setAttributes({ lineHeight }) }
					step={ 0.1 }
					min={ 0 }
					units={[
						{
							a11yLabel: 'Unitless (-)',
							label: '-',
							step: 0.1,
							value: ''
						},
						{
							a11yLabel: 'Pixels (px)',
							label: 'px',
							step: 0.1,
							value: 'px'
						},
						{
							a11yLabel: 'Percentage (%)',
							label: '%',
							step: 1,
							value: '%'
						}
					]}
				/>

				<br />

				<UnitControl
					label={ __( 'Letter Spacing', 'otter-blocks' ) }
					value={ attributes.letterSpacing }
					onChange={ letterSpacing => setAttributes({ letterSpacing }) }
					step={ 0.1 }
					min={ -50 }
					max={ 100 }
				/>

				<ClearButton
					values={[ 'fontFamily', 'fontVariant', 'fontStyle', 'textTransform', 'lineHeight', 'letterSpacing' ]}
					setAttributes={ setAttributes }
				/>

			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.headingColor,
						onChange: headingColor => setAttributes({ headingColor }),
						label: __( 'Text', 'otter-blocks' ),
						isShownByDefault: true
					},
					{
						value: attributes.backgroundColor,
						onChange: backgroundColor => setAttributes({ backgroundColor }),
						label: __( 'Background', 'otter-blocks' ),
						isShownByDefault: true
					},
					{
						value: attributes.linkColor,
						onChange: linkColor => setAttributes({ linkColor }),
						label: __( 'Link', 'otter-blocks' ),
						isShownByDefault: false
					},
					{
						value: attributes.linkHoverColor,
						onChange: linkHoverColor => setAttributes({ linkHoverColor }),
						label: __( 'Link Hover', 'otter-blocks' ),
						isShownByDefault: false
					},
					{
						value: attributes.highlightColor,
						onChange: highlightColor => setAttributes({ highlightColor }),
						label: __( 'Highlight Text', 'otter-blocks' ),
						isShownByDefault: false
					},
					{
						value: attributes.highlightBackground,
						onChange: highlightBackground => setAttributes({ highlightBackground }),
						label: __( 'Highlight Background', 'otter-blocks' ),
						isShownByDefault: false
					}
				] }
			/>

			<PanelBody
				title={ __( 'Dimensions', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<ResponsiveControl
					label={ __( 'Screen Type', 'otter-blocks' ) }
				>
					<BoxControl
						label={ __( 'Padding', 'otter-blocks' ) }
						values={
							compactObject(
								responsiveGetAttributes([
									isObjectLike( attributes.padding ) ?  attributes.padding : oldPaddingDesktop,
									isObjectLike( attributes.paddingTablet ) ? attributes.paddingTablet : oldPaddingTablet,
									isObjectLike( attributes.paddingMobile ) ?  attributes.paddingMobile : oldPaddingMobile
								])
							) ?? makeBox( '0px' )
						}
						onChange={ value => {
							responsiveSetAttributes( value, [ 'padding', 'paddingTablet', 'paddingMobile' ], {}, setAttributes );
						} }
					/>

					<BoxControl
						label={ __( 'Margin', 'otter-blocks' ) }
						values={
							compactObject(
								responsiveGetAttributes([
									isObjectLike( attributes.margin ) ? attributes.margin : oldMarginDesktop,
									isObjectLike( attributes.marginTablet ) ? attributes.marginTablet : oldMarginTablet,
									isObjectLike( attributes.marginMobile ) ?  attributes.marginMobile : oldMarginMobile
								])
							) ?? {
								top: '0px',
								bottom: '25px'
							}
						}
						onChange={ value => {
							responsiveSetAttributes( value, [ 'margin', 'marginTablet', 'marginMobile' ], {}, setAttributes );
						} }
						sides={ [ 'top', 'bottom' ] }
					/>
				</ResponsiveControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Shadow', 'otter-blocks' ) }
				initialOpen={ false }
				className="o-adv-h-panel"
			>
				<ToggleControl
					label={ __( 'Enable Text Shadow', 'otter-blocks' ) }
					checked={ attributes.textShadow }
					onChange={ textShadow => setAttributes({ textShadow }) }
				/>

				{ attributes.textShadow && (
					<Fragment>
						<ColorGradientControl
							label={ __( 'Color', 'otter-blocks' ) }
							colorValue={ attributes.textShadowColor }
							onColorChange={ textShadowColor => setAttributes({ textShadowColor }) }
						/>

						<ControlPanelControl
							label={ __( 'Shadow Properties', 'otter-blocks' ) }
						>
							<RangeControl
								label={ __( 'Opacity', 'otter-blocks' ) }
								value={ attributes.textShadowColorOpacity }
								onChange={ textShadowColorOpacity => setAttributes({ textShadowColorOpacity }) }
								min={ 0 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Blur', 'otter-blocks' ) }
								value={ attributes.textShadowBlur }
								onChange={ textShadowBlur => setAttributes({ textShadowBlur }) }
								min={ 0 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Horizontal', 'otter-blocks' ) }
								value={ attributes.textShadowHorizontal }
								onChange={ textShadowHorizontal => setAttributes({ textShadowHorizontal }) }
								min={ -100 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Vertical', 'otter-blocks' ) }
								value={ attributes.textShadowVertical }
								onChange={ textShadowVertical => setAttributes({ textShadowVertical }) }
								min={ -100 }
								max={ 100 }
							/>
						</ControlPanelControl>

					</Fragment>
				) }

			</PanelBody>
		</Fragment>
	);
};

export default Heading;
