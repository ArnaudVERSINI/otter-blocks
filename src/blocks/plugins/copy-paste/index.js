/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { select, dispatch } from '@wordpress/data';
import { PluginBlockSettingsMenuItem } from '@wordpress/edit-post';
import { Fragment } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { KeyboardShortcuts, MenuGroup, MenuItem } from '@wordpress/components';
import { isAppleOS, displayShortcut } from '@wordpress/keycodes';

/**
  * Internal dependencies.
  */
import { adaptors } from './adaptors';
import CopyPaste from './copy-paste';
import { pick } from 'lodash';
import { extractThemeCSSVar } from './utils';
import { OtterControlTools } from '../../components/otter-tools';


const copyPaste = new CopyPaste();

function copy() {

	if ( 'undefined' !== typeof window && window.oThemeStyles === undefined ) {
		const settings = pick( select( 'core/block-editor' )?.getSettings?.() ?? {}, [ 'colors', 'gradients', 'styles' ]);
		extractThemeCSSVar( settings );
	}

	const { getMultiSelectedBlocks, getSelectedBlock, getSelectedBlockCount } = select( 'core/block-editor' );

	if ( getMultiSelectedBlocks === undefined || getSelectedBlock === undefined || getSelectedBlockCount === undefined ) {
		return;
	}

	let blocks = [];

	if ( 1 < getSelectedBlockCount() ) {
		blocks = getMultiSelectedBlocks();
	} else {
		blocks = [ getSelectedBlock() ];
	}

	if ( 0 === blocks.length ) {
		return;
	}

	const blockName = blocks[0].name;

	// All the blocks in multi-select must be the same type.
	if ( blocks.some( block => block.name !== blockName ) ) {
		return;
	}

	const copied = blocks.map( block => copyPaste.copy( block ) );

	const { createNotice } = dispatch( 'core/notices' );

	if ( copied?.every( x => x ) ) {
		createNotice(
			'info',
			__( 'Copied the styles.', 'otter-blocks' ),
			{
				isDismissible: true,
				type: 'snackbar',
				id: 'o-copied'
			}
		);
	} else {
		createNotice(
			'error',
			__( 'An error occured when trying to copy the style.', 'otter-blocks' ),
			{
				isDismissible: true,
				type: 'snackbar',
				id: 'o-copied'
			}
		);
	}
}

function paste() {
	const { getMultiSelectedBlocks, getSelectedBlock, getSelectedBlockCount } = select( 'core/block-editor' );

	if ( getMultiSelectedBlocks === undefined || getSelectedBlock === undefined || getSelectedBlockCount === undefined ) {
		return;
	}

	let blocks = [];

	if ( 1 < getSelectedBlockCount() ) {
		blocks = getMultiSelectedBlocks();
	} else {
		blocks = [ getSelectedBlock() ];
	}

	if ( 0 === blocks.length ) {
		return;
	}

	const { updateBlockAttributes } = dispatch( 'core/block-editor' );

	if ( updateBlockAttributes === undefined ) {
		return;
	}

	blocks.forEach( block => {
		const attrs = copyPaste.paste( block );
		if ( attrs !== undefined ) {
			updateBlockAttributes( block.clientId, attrs );
		}
	});
}

const iconTextWrapper = ( text ) => (
	<span style={{ marginLeft: '', marginRight: '2px' }}>{text}</span>
);

/**
 * Separate component to prevent multiple calls from filter.
 *
 * @returns
 */
const CopyPasteComponent = ( ) => {
	return (
		<Fragment>
			{
				window?.themeisleGutenberg?.isBlockEditor && (
					<Fragment>
						<PluginBlockSettingsMenuItem
							label={  __( 'Copy style', 'otter-blocks' ) }
							onClick={ copy }
						/>

						{
							! copyPaste.isExpired && (
								<PluginBlockSettingsMenuItem
									label={  __( 'Paste style', 'otter-blocks' ) }
									onClick={ paste }
								/>
							)
						}
					</Fragment>
				)
			}
		</Fragment>
	);
};

const withCopyPasteExtension = createHigherOrderComponent( BlockEdit => {
	return ( props ) => {

		if ( adaptors?.[props.name] && props.isSelected ) {

			return (
				<Fragment>
					<KeyboardShortcuts

						// Sometime it works, sometime is not. Not to reliable
						shortcuts={ {
							'mod+alt+j': copy,
							'mod+alt+k': paste
						} }
					/>

					<BlockEdit { ...props } />
					{

						/**
							Might be useful in the future.
							<CopyPasteComponent {...props} />
						*/
					}

					<OtterControlTools order={0}>
						<MenuGroup>
							<MenuItem
								onClick={ copy }
								shortcut={ isAppleOS() ? displayShortcut.primaryAlt( 'j' ) : '' }
							>
								{ __( 'Copy Style', 'otter-blocks' ) }
							</MenuItem>

							<MenuItem
								onClick={ paste }
								shortcut={ isAppleOS() ? displayShortcut.primaryAlt( 'k' ) : '' }
							>
								{ __( 'Paste Style', 'otter-blocks' ) }
							</MenuItem>
						</MenuGroup>
					</OtterControlTools>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withCopyPasteExtension' );

if ( select?.( 'core/editor' ) !== undefined ) {
	addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/copy-paste-extension', withCopyPasteExtension );
}

