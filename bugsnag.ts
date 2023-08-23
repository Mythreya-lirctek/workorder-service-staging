import Bugsnag from '@bugsnag/js'
import bugsnagExpress from '@bugsnag/plugin-express'

export default (bugsnagConfig: any) => {
	const bugsnagClient = Bugsnag.start({
		apiKey: bugsnagConfig.apiKey,
		collectUserIp: true,
		plugins: [bugsnagExpress],
		releaseStage: process.env.NODE_ENV || 'development'
	});
	return bugsnagClient;
}
