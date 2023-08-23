import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [
	{
		controller: 'project44#registerClientApplication',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/project44/registerClientApplication`
	},
	{
		controller: 'project44#generateClientSecret',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/project44/generateClientSecret`
	},
	{
		controller: 'project44#grantAccessToken',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/project44/grantAccessToken`
	},
	{
		controller: 'project44#createShipment',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/project44/shippers/createShipment`
	},
	{
		controller: 'project44#updateShipment',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/project44/shippers/updateShipment`
	},
	{
		controller: 'project44#deleteShipment',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/project44/shippers/deleteShipment`
	},
	{
		controller: 'project44#getEventHistory',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/project44/shippers/getEventHistory`
	},
	{
		controller: 'project44#getPositionHistory',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/project44/shippers/getPositionHistory`
	}
]

export default routes;
