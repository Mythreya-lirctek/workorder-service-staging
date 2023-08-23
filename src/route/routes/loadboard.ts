import { ApiRoute, apiPrefix,RouteMethod } from './api';
import passport from 'passport';
const nylasRoutes: ApiRoute[] = [
	{
		controller: 'loadboard#postLoads',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/loadboard/postLoads`
	},
	{
		controller: 'loadboard#updatePostedLoads',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/loadboard/updatePostedLoads`
	},
	{
		controller: 'loadboard#refreshPostedLoads',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/loadboard/refreshPostedLoads`
	},
	{
		controller: 'loadboard#deletePostedLoad',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/loadboard/deletePostedLoad`
	},
	{
		controller: 'loadboard#getLoadBoardReport',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/loadboard/getLoadBoardReport`
	},
	{
		controller: 'loadboard#validateLoadPosting',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/loadboard/validateLoadPosting/:co_Id`
	}
];

export default nylasRoutes;