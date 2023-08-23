import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [
	{
		controller: 'truckstops#getAccessToken',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/truckstop/token/getAccessToken`,
	},
	{
		controller: 'truckstops#getRefreshToken',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/truckstop/token/getRefreshToken`,
	},
	{
		controller: 'truckstops#loginTruckStops',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/truckstop/loginTruckStops`,
	},
	{
		controller: 'truckstops#callback',
		method: RouteMethod.GET,
		path: `${apiPrefix}/truckstop/callback`,
	},
	{
		controller: 'truckstops#webhook',
		method: RouteMethod.POST,
		path: `${apiPrefix}/truckstops/webhook/:customerOrderId`
	},
	{
		controller: 'truckstops#getLoad',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/truckstop/getLoad`,
	}
];

export default routes;
