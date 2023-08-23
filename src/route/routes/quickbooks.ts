import { ApiRoute, apiPrefix,RouteMethod } from './api';
import passport from 'passport';

const quickBookRoutes: ApiRoute[] = [
	{
		controller: 'quickbooks#syncInvoices',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/quickbooks/syncInvoices`
	},
	{
		controller: 'quickbooks#getInvoicesAndSync',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/quickbooks/getInvoicesAndSync`
	}
];

export default quickBookRoutes;