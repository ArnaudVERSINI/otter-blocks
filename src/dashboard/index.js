/**
 * WordPress dependencies.
 */
import {
	render,
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import './style.scss';
import '../blocks/plugins/feedback';
import Notices from './components/Notices.js';
import Header from './components/Header.js';
import Main from './components/Main.js';
import Footer from './components/Footer.js';
import useSettings from '../blocks/helpers/use-settings.js';

if ( undefined === window.otterUtils ) {
	window.otterUtils = {};
}

window.otterUtils.useSettings = useSettings;

function getInitialStateFromURLQuery() {
	const hash = window.location.hash.slice( 1 ); // Remove the '#' at the start
	return hash;
}


const App = () => {
	const [ currentTab, setTab ] = useState( getInitialStateFromURLQuery() );

	return (
		<Fragment>
			{ undefined !== wp.notices.store && <Notices />}

			<Header
				isActive={ currentTab }
				setActive={ setTab }
			/>

			<Main
				currentTab={ currentTab }
				setTab={ setTab }
			/>

			<Footer />
		</Fragment>
	);
};

render(
	<App />,
	document.getElementById( 'otter' )
);
