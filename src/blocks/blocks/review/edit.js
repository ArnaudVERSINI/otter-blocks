/**
 * External dependencies.
 */

import classnames from 'classnames';

import getSymbolFromCurrency from 'currency-symbol-map';

/**
 * WordPress dependencies.
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Placeholder,
	Spinner
} from '@wordpress/components';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import {
	check,
	close,
	StarFilled
} from '../../helpers/icons.js';
import {
	blockInit,
	getDefaultValueByField
} from '../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

const Stars = ({
	rating,
	scale = 'full'
}) => {
	const stars = [];

	const divide = 'half' === scale ? 2 : 1;

	for ( let i = 0; 10 / divide > i; i++ ) {
		stars.push(
			<StarFilled
				key={ i }
				className={ classnames(
					{
						'filled': i < Math.round( rating / divide )
					}
				) }
			/>
		);
	}

	return stars;
};

/**
 * Review component
 * @param {import('./type').ReviewProps} props
 * @returns
 */
const Edit = ({
	name,
	attributes,
	setAttributes,
	clientId,
	isSelected,
	status = 'isInactive',
	productAttributes = {}
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const overallRatings = ( attributes.features.reduce( ( accumulator, feature ) => accumulator + feature.rating, 0 ) / attributes.features.length ).toFixed( 1 );

	const changeFeature = ( index, value ) => {
		const features = [ ...attributes.features ];
		features[ index ] = {
			...features[ index ],
			...value
		};
		setAttributes({ features });
	};

	const changePro = ( index, value ) => {
		const pros = [ ...attributes.pros ];
		pros[ index ] = value;
		setAttributes({ pros });
	};

	const changeCon = ( index, value ) => {
		const cons = [ ...attributes.cons ];
		cons[ index ] = value;
		setAttributes({ cons });
	};

	const changeLinks = ( index, value ) => {
		const links = [ ...attributes.links ];
		links[ index ] = {
			...links[ index ],
			...value
		};
		setAttributes({ links });
	};

	const inlineStyles = {
		'--background-color': getValue( 'backgroundColor' ),
		'--primary-color': getValue( 'primaryColor' ),
		'--text-color': getValue( 'textColor' ),
		'--button-text-color': getValue( 'buttonTextColor' )
	};

	const isPlaceholder = ( 'object' === typeof status && null !== status && status.isError ) || 'isLoading' === status;

	const divide = 'half' === attributes.scale ? 2 : 1;

	let blockProps = useBlockProps({
		id: attributes.id,
		className: isPlaceholder && 'is-placeholder',
		style: inlineStyles
	});

	const detailsWidth = {
		25: 'is-quarter',
		50: 'is-half',
		100: 'is-full'
	};

	const mainHeading = attributes.mainHeading || 'h2';

	const SubHeading = attributes.subHeading || 'h3';

	if ( 'isLoading' === status ) {
		return (
			<Fragment>
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
					getValue={ getValue }
					productAttributes={ productAttributes }
				/>

				<div { ...blockProps }>
					<Placeholder><Spinner /></Placeholder>
				</div>
			</Fragment>
		);
	}

	if ( 'object' === typeof status && null !== status && status.isError ) {
		return (
			<Fragment>
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
					getValue={ getValue }
					productAttributes={ productAttributes }
				/>

				<div { ...blockProps }>
					<Placeholder
						instructions={ status.message }
					/>
				</div>
			</Fragment>
		);
	}

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				getValue={ getValue }
				productAttributes={ productAttributes }
			/>

			<div { ...blockProps }>
				<div className="o-review__header">
					{
						! productAttributes?.title ? (
							<RichText
								placeholder={ __( 'Name of your product…', 'otter-blocks' ) }
								allowedFormats={ [] }
								value={ attributes.title }
								onChange={ title => setAttributes({ title }) }
								tagName={ mainHeading }
							/>
						) : (
							<RichText.Content
								placeholder={ __( 'Name of your product…', 'otter-blocks' ) }
								allowedFormats={ [] }
								value={ productAttributes?.title }
								tagName={ mainHeading }
							/>
						)
					}

					<div className="o-review__header_meta">
						<div className="o-review__header_ratings">
							<Stars
								rating={ overallRatings }
								scale={ attributes.scale }
							/>

							<span>
								{ /** translators: %s Rating score. */ sprintf( __( '%f out of %f', 'otter-blocks' ), Math.abs( overallRatings / divide ).toFixed( 1 ) || 0, 10 / divide ) }
							</span>
						</div>

						<span
							className="o-review__header_price"
						>
							{ ( ( productAttributes?.price && productAttributes?.discounted ) || ( attributes.price && attributes.discounted ) ) && (
								<del>{ ( getSymbolFromCurrency( productAttributes?.currency || attributes.currency ) ?? '$' ) + '' + ( productAttributes?.price || attributes.price ) || 0 }</del>
							) }

							{ ( attributes.price || attributes.discounted || productAttributes?.price || productAttributes?.discounted ) && ( getSymbolFromCurrency( productAttributes?.currency || attributes.currency ) ?? '$' ) + '' + ( ( productAttributes?.discounted || attributes.discounted ) ? ( productAttributes?.discounted || attributes.discounted ) : ( productAttributes?.price || attributes.price ) ) }
						</span>
					</div>

					<div
						className={ classnames(
							'o-review__header_details',
							{
								'is-single': ! attributes.image || ( ! isSelected && ! attributes.description ),
								[ detailsWidth[ attributes.imageWidth ] ]: ( attributes.imageWidth && 33 !== attributes.imageWidth )
							}
						) }
					>
						{ ( productAttributes?.image ) ? (
							<img
								src={ productAttributes?.image?.url }
								alt={ productAttributes?.image?.alt }
							/>
						) : attributes.image && (
							<img
								src={ attributes.image.url }
								alt={ attributes.image.alt }
							/>
						) }

						{ ( isSelected || attributes.description ) && ! productAttributes?.description ? (
							<RichText
								placeholder={ __( 'Product description or a small review…', 'otter-blocks' ) }
								value={ attributes.description }
								onChange={ description => setAttributes({ description }) }
								tagName="p"
							/>
						) : (
							<RichText.Content
								placeholder={ __( 'Product description or a small review…', 'otter-blocks' ) }
								value={ productAttributes?.description }
								tagName="p"
							/>
						) }
					</div>
				</div>

				<div className="o-review__left">
					<div className="o-review__left_features">
						{ 0 < attributes.features.length && attributes.features.map( ( feature, index ) => {
							return (
								<div className="o-review__left_feature" key={ index }>
									<RichText
										placeholder={ __( 'Feature title', 'otter-blocks' ) }
										value={ feature.title }
										className="o-review__left_feature_title"
										onChange={ title => changeFeature( index, { title }) }
										tagName="span"
									/>

									<div className="o-review__left_feature_ratings">
										<Stars
											rating={ feature.rating }
											scale={ attributes.scale }
										/>

										<span>
											{ /** translators: %s Rating score. */ sprintf( __( '%f out of %f', 'otter-blocks' ), Math.abs( feature.rating / divide ).toFixed( 1 ) || 0, 10 / divide ) }
										</span>
									</div>
								</div>
							);
						}) }
					</div>
				</div>

				<div className="o-review__right">
					{ 0 < attributes.pros.length && (
						<div className="o-review__right_pros">
							<SubHeading>{ __( 'Pros', 'otter-blocks' ) }</SubHeading>

							{ attributes.pros.map( ( pro, index ) => (
								<div className="o-review__right_pros_item" key={ index }>
									{ check }

									<RichText
										placeholder={ __( 'Why do you like the product?', 'otter-blocks' ) }
										value={ pro }
										onChange={ value => changePro( index, value ) }
										tagName="p"
									/>
								</div>
							) ) }
						</div>
					) }

					{ 0 < attributes.cons.length && (
						<div className="o-review__right_cons">
							<SubHeading>{ __( 'Cons', 'otter-blocks' ) }</SubHeading>

							{ attributes.cons.map( ( con, index ) => (
								<div className="o-review__right_cons_item" key={ index }>
									{ close }

									<RichText
										placeholder={ __( 'What can be improved?', 'otter-blocks' ) }
										value={ con }
										onChange={ value => changeCon( index, value ) }
										tagName="p"
									/>
								</div>
							) )}
						</div>
					) }
				</div>

				{ ( 0 < productAttributes?.links?.length || 0 < attributes.links.length ) && (
					<div className="o-review__footer">
						<SubHeading className="o-review__footer_label">
							{ __( 'Buy this Product', 'otter-blocks' ) }
						</SubHeading>

						<div className="o-review__footer_buttons">
							{ ( productAttributes?.links || attributes.links ).map( ( link, index ) => (
								<RichText
									key={ index }
									placeholder={ __( 'Button label', 'otter-blocks' ) }
									value={ link.label }
									disabled={ 0 < productAttributes?.links }
									onChange={ label => changeLinks( index, { label }) }
									tagName="span"
								/>
							) ) }
						</div>
					</div>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
