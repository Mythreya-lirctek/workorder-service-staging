import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [
	{
		controller: 'cooffers#addOffer',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/cooffers/addOffer`,
	},
	{
		controller: 'cooffers#saveOffer',
		method: RouteMethod.PUT,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/cooffers/saveOffer/:coOfferId`,
	},
	{
		controller: 'cooffers#getCoOfferDetailsByUserId',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/cooffers/getCoOfferDetailsByUserId`,
	},
	{
		controller: 'cooffers#getCoOffersByCoId',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/cooffers/getCoOffersByCoId/:customerOrder_Id`,
	},
	{
		controller: 'cooffers#getCoOfferDetailsById',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/cooffers/getCoOfferDetailsById/:coOfferId`,
	},
	{
		controller: 'cooffers#getCoOfferedLoads',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/cooffers/getCoOfferedLoads`,
	},
	{
		controller: 'cooffers#sendQuotation',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/cooffers/sendQuotation`,
	},
	{
		controller: 'cooffers#acceptOffer',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/cooffers/acceptOffer`,
	},
	{
		controller: 'cooffers#postToLoadBoard',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/cooffers/postToLoadBoard`,
	},
	{
		controller: 'cooffers#getLoadBoardLoadPostedCarriers',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/cooffers/getLoadBoardLoadPostedCarriers/:customerOrder_Id`,
	},
	{
		controller: 'cooffers#sendCounterOffer',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/cooffers/sendCounterOffer`,
	}
];

export default routes;
