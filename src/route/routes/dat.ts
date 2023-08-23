import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [
	{
		controller: 'dat#getOrganizationAccessToken',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/token/getOrganizationAccessToken`,
	},
	{
		controller: 'dat#getUserAccessToken',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/token/getUserAccessToken`,
	},
	{
		controller: 'dat#createLoad',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/createLoad`,
	},
	{
		controller: 'dat#getLoads',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/getLoads`,
	},
	{
		controller: 'dat#deleteAsync',
		method: RouteMethod.DELETE,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/deleteAsync/:referenceId`,
	},
	{
		controller: 'dat#delete',
		method: RouteMethod.DELETE,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/:loadPostingId`,
	},
	{
		controller: 'dat#getLoadById',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/:loadPostingId`,
	},
	{
		controller: 'dat#updateLoad',
		method: RouteMethod.PUT,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/:loadPostingId`,
	},
	{
		controller: 'dat#refreshLoads',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/refresh`,
	},
	{
		controller: 'dat#refreshLoad',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/refresh/:loadPostingId`,
	},
	{
		controller: 'dat#createBid',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/bids/createBid`,
	},
	{
		controller: 'dat#getBids',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/bids`,
	},
	{
		controller: 'dat#bulkUpdateBids',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/bids/bulkUpdateBids`,
	},
	{
		controller: 'dat#getBidCounts',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/bids/getBidCounts`,
	},
	{
		controller: 'dat#getBid',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/bids/:bidId`,
	},
	{
		controller: 'dat#updateBid',
		method: RouteMethod.PUT,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/loads/bids/:bidId`,
	},
	{
		controller: 'dat#createNewAssetQuery',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/search/createNewAssetQuery`,
	},
	{
		controller: 'dat#getAssetQueriesByUser',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/search/getQueriesByUser`,
	},
	{
		controller: 'dat#getAssetQueryById',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/search/getAssetQueryById/:queryId`,
	},
	{
		controller: 'dat#deleteAssetQueryById',
		method: RouteMethod.DELETE,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/search/deleteAssetQueryById/:queryId`,
	},
	{
		controller: 'dat#getAssetsByQueryId',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/search/getAssetsByQueryId/:queryId`,
	},
	{
		controller: 'dat#getDetailsInformationByMatchId',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/search/getDetailsInformationByMatchId/:matchId`,
	},
	{
		controller: 'dat#webhook',
		method: RouteMethod.POST,
		path: `${apiPrefix}/dat/webhook/:customerOrderId`
	},
	{
		controller: 'dat#rateLookUp',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dat/rateLookUp`
	}
];

export default routes;
