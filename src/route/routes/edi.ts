import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [
	{
		controller: 'edi#getEdiSendStatusLog',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/getEdiSendStatusLog/:loadTenderId`
	},
	{
		controller: 'edi#getLoadTendersListByCompanyId',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/getLoadTendersListByCompanyId`
	},
	{
		controller: 'edi#getStopDetailsByLoadTenderId',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/getStopDetailsByLoadTenderId`
	},
	{
		controller: 'edi#getLoadTendersListByCompanyIdExportAll',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/getLoadTendersListByCompanyIdExportAll`
	},{
		controller: 'edi#getUnopenedLTs',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/getUnopenedLTs`
	},
	{
		controller: 'edi#getLoadTendersUpdateLog',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/getLoadTendersUpdateLog/:loadTenderId`
	},
	{
		controller: 'edi#getLoadTenderRawData',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/getLoadTenderRawData/:loadTenderId`
	},
	{
		controller: 'edi#updateLoadTender',
		method: RouteMethod.PUT,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/updateLoadTender/:loadTenderId`
	},
	{
		controller: 'edi#sendLoadTenderResponse',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/sendLoadTenderResponse`
	},
	{
		controller: 'edi#sendInvoice',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/sendInvoice`
	},
	{
		controller: 'edi#sendLoadStatusMessages',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/sendLoadStatusMessages`
	},
	{
		controller: 'edi#getLatestLoadTenders',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/getLatestLoadTenders`
	},
	{
		controller: 'edi#updateOrder',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/edi/updateOrder`
	}
]

export default routes;
