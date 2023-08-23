import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [{
	controller: 'customerorder#addCustomerOrderInfo',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/customerorder/addCustomerOrderInfo`
},{
	controller: 'cocarrierlineitem#addCOCarrierLineItem',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/cocarrierlineitem/addCOCarrierLineItem`
},{
	controller: 'cocarrierlineitem#saveCOCarrierLineItem',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/cocarrierlineitem/saveCOCarrierLineItem/:lineItemId`
},{	
	controller: 'customerorder#getCoListLoad',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/customerorder/getCoListLoad`
},{	
	controller: 'customerorder#getCOLoads',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/customerorder/getCOLoads`
},{	
	controller: 'customerorder#getCOLoadsgroupby',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/customerorder/getCOLoadsgroupby`
},{	
	controller: 'customerorder#getCOALLLoads',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/customerorder/getCOALLLoads`
},{	
	controller: 'customerorder#getCoListLoadsGroupby',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/customerorder/getCoListLoadsGroupby`
},{	
	controller: 'cocarriercheckcall#addCOCarrierCheckCall',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/cocarriercheckcall/addCOCarrierCheckCall`
},{	
	controller: 'cocarriercheckcall#saveCOCarrierCheckCall',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/cocarriercheckcall/saveCOCarrierCheckCall/:coCarrierCheckCallId`
},{	
	controller: 'cocarriercheckcall#getCOCarrierCheckcalls',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/cocarriercheckcall/getCOCarrierCheckcalls`
},{	
	controller: 'cocustomercheckcall#addCOCustomerCheckCall',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/cocustomercheckcall/addCOCustomerCheckCall`
},{	
	controller: 'cocustomercheckcall#saveCOCustomerCheckCall',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/cocustomercheckcall/saveCOCustomerCheckCall/:coCustomerCheckCallId`
},{	
	controller: 'cocustomercheckcall#getCOCustomerCheckcalls',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/cocustomercheckcall/getCOCustomerCheckcalls`
},{	
	controller: 'customerorder#getCOAllLoadsgroupby',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/customerorder/getCOAllLoadsgroupby`
},{	
	controller: 'customerorder#getCOListLoadsExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/customerorder/getCOListLoadsExportAll`
},{	
	controller: 'customerorder#saveCustomerOrder',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/customerorder/saveCustomerOrder/:customerOrderId`
},{	
	controller: 'customerorder#COStatusChange',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/customerorder/COStatusChange`
},{	
	controller: 'customerorder#getCOdetailsbyCOId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/customerorder/getCOdetailsbyCOId/:coId`
}, {	
	controller: 'customerorder#validateRefnoCusComIdInCO',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/customerorder/validateRefnoCusComIdInCO/:customerId/:refNumber`
}, {	
	controller: 'costop#addCOStop',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/costop/addCOStop`
}, {	
	controller: 'costop#saveCOStop',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/costop/saveCOStop/:coStopId`
}, {	
	controller: 'costop#getCOStopDetailsById',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/costop/getCOStopDetailsById/:coStopId`
},{
	controller: 'cocarrierlineitem#getCOCarrierLineItemsByCOId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/cocarrierlineitem/getCOCarrierLineItemsByCOId`
 },{
	controller: 'cocarrierlineitem#getCOCarrierLineItemsByRelayId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/cocarrierlineitem/getCOCarrierLineItemsByRelayId`
 },{
	controller: 'corelay#addCORelay',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/corelay/addCORelay`
 },{
	controller: 'corelay#saveCORelay',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/corelay/saveCORelay/:relayId`
 },{
	controller: 'corelay#deleteCORelay',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/corelay/deleteCORelay/:relayId`
},{
	controller: 'customerorder#sendRateConfirmation',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/customerorder/sendRateConfirmation`
},{
	controller: 'customerorder#getCarrierAmountBrokerage',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/customerorder/getCarrierAmountBrokerage`
},
	{
		controller: 'costopitem#addCOStopItem',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/costopitem/addCOStopItem`
	}, {
		controller: 'costopitem#saveCOStopItem',
		method: RouteMethod.PUT,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/costopitem/saveCOStopItem/:coStopItemId`
	},{
		controller: 'costopitem#getCOStopItemsByCOId',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/costopitem/getCOStopItemsByCOId/:coId`
	},
	{
		controller: 'customerorder#rateConPrint',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/customerorder/rateConPrint`
	}
	, {
		controller: 'costop#getStopsWithStopItemsByCoId',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/costop/getStopsWithStopItemsByCoId`
	}
	, {
		controller: 'customerorder#getCOCustomerSummary',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/customerorder/getCOCustomerSummary`
	}
	, {
		controller: 'customerorder#getCOCarrierSummary',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/customerorder/getCOCarrierSummary`
	}
];


export default routes;