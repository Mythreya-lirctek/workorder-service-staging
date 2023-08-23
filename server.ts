import debugModule from 'debug';
import application from './app';
import ConfigService from './src/service/config/config';

const debug = debugModule('api:server');
const app = 'prime';
const profile = process.env.NODE_ENV || 'default';

// Load and make configs available
ConfigService
	.loadConfig(app, profile)
	.then((config) => {
		application(config);
	})
	.catch((err) => {
		debug('Failed to load configurations');
		debug(err);
		process.exit(1);
	});
