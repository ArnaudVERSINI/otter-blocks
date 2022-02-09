/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import { createBlock } from '@wordpress/blocks';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import defaultAttributes from './attributes.js';
import Inspector from './inspector.js';
import themeIsleIcons from './../../../helpers/themeisle-icons.js';
import { blockInit } from '../../../helpers/block-utility.js';

const Edit = ({
	attributes,
	setAttributes,
	name,
	clientId,
	onReplace,
	onRemove,
	mergeBlocks
}) => {

	const [ isURL, setIsUrl ] = useState( false );

	const {
		hasParent,
		parentAttributes
	} = useSelect( select => {
		const {
			getBlock,
			getBlockRootClientId
		} = select( 'core/block-editor' );

		const parentClientId = getBlockRootClientId( clientId );
		const parentBlock = getBlock( parentClientId );

		return {
			hasParent: parentBlock ? true : false,
			parentAttributes: parentBlock ? parentBlock.attributes : {}
		};
	}, []);

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	useEffect( () => {
		setAttributes({
			library: attributes.library || parentAttributes.defaultLibrary,
			icon: attributes.icon || parentAttributes.defaultIcon,
			iconPrefix: attributes.iconPrefix || parentAttributes.defaultIconPrefix
		});
	}, [ hasParent, parentAttributes, attributes ]);

	useEffect( () => {
		if ( 'image' === attributes.library ) {
			try {
				const imageURL = new URL( attributes.icon );

				if (  'http:' === imageURL?.protocol || 'https:' === imageURL?.protocol ) {
					setIsUrl( true );
				}
			} catch ( _ ) {
				setIsUrl( false );
			}
		}
	}, [ attributes.library, attributes.icon ]);

	const Icon = themeIsleIcons.icons[ attributes.icon ];
	const iconClassName = `${ attributes.iconPrefix || parentAttributes.defaultIconPrefix } fa-${ attributes.icon || parentAttributes.defaultIcon }`;
	const contentStyle = {
		color: attributes.contentColor || parentAttributes.defaultContentColor,
		fontSize: parentAttributes.defaultSize + 'px'
	};
	const iconStyle = {
		color: attributes.iconColor || parentAttributes.defaultIconColor,
		fill: attributes.iconColor || parentAttributes.defaultIconColor,
		fontSize: parentAttributes.defaultSize + 'px'
	};

	const changeContent = value => {
		setAttributes({ content: value });
	};

	const blockProps = useBlockProps();


	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				{
					'image' === attributes.library && isURL ? (
						<img src={ attributes.icon } width={ parentAttributes.defaultSize + 'px' } />
					) : (
						'themeisle-icons' === attributes.library && attributes.icon && Icon !== undefined ? (
							<Icon
								className={ classnames(
									{ 'wp-block-themeisle-blocks-icon-list-item-icon': ! attributes.iconColor },
									{ 'wp-block-themeisle-blocks-icon-list-item-icon-custom': attributes.iconColor }
								) }
								style={ {
									...iconStyle,
									width: parentAttributes.defaultSize + 'px'
								} }
							/>
						) : (
							<i
								className={ classnames(
									iconClassName,
									{ 'wp-block-themeisle-blocks-icon-list-item-icon': ! attributes.iconColor },
									{ 'wp-block-themeisle-blocks-icon-list-item-icon-custom': attributes.iconColor }
								) }
								style={ iconStyle }
							></i>
						)
					)
				}

				<RichText
					identifier="content"
					tagName="p"
					placeholder={ __( 'Write your content…', 'otter-blocks' ) }
					className={ classnames(
						{ 'wp-block-themeisle-blocks-icon-list-item-content': ! attributes.contentColor },
						{ 'wp-block-themeisle-blocks-icon-list-item-content-custom': attributes.contentColor }
					) }
					style={ contentStyle }
					value={ attributes.content }
					onChange={ changeContent }
					onSplit={ ( value ) => {
						if ( ! value ) {
							return createBlock( name );
						}

						return createBlock( name, {
							...attributes,
							content: value
						});
					} }
					onMerge={ mergeBlocks }
					onReplace={ onReplace }
					onRemove={ onRemove }
					keepPlaceholderOnFocus={ true }
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
