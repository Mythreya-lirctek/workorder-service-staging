import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [
	{
		controller: 'eldsync#isValidSamsaraToken',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/isValidSamsaraToken`,
	},
	{
		controller: 'eldsync#isValidMotiveToken',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/isValidMotiveToken`,
	},
	{
		controller: 'eldsync#syncUsers',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/syncUsers`,
	},
	{
		controller: 'eldsync#syncVehicles',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/syncVehicles`,
	},
	{
		controller: 'eldsync#syncAssets',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/syncAssets`,
	},
	{
		controller: 'eldsync#getAvailableTime',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/getAvailableTime/:driver_id`,
	},
	{
		controller: 'eldsync#getHoursOfService',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/getHoursOfService`,
	},
	{
		controller: 'eldsync#getVehicleLocation',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/getVehicleLocation/:vehicle_id`,
	},
	{
		controller: 'eldsync#getAssetLocation',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/getAssetLocation`,
	},
	{
		controller: 'eldsync#getIftaSummary',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/getIftaSummary`,
	},
	{
		controller: 'eldsync#calculateEta',
		method: RouteMethod.GET,
		path: `${apiPrefix}/eldsync/calculateEta`,
	},
	{
		controller: 'eldsync#getTravelHistory',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/getTravelHistory`,
	},
	{
		controller: 'eldsync#getRouteInfo',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/getRouteInfo`,
	},
	{
		controller: 'eldsync#createRoute',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/createRoute`,
	},
	{
		controller: 'eldsync#updateRoute',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/updateRoute`,
	},
	{
		controller: 'eldsync#getRouteUpdates',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/getRouteUpdates`,
	},
	{
		controller: 'eldsync#deleteRoute',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/eldsync/deleteRoute`,
	}
];

export default routes;
