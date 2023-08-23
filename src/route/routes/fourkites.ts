import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [
	{
		controller: 'fourkites#sendEmailToFourKitesForSD',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/sendEmailToFourKitesForSD`,
	},
	{
		controller: 'fourkites#getDataToSendToFourKites',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/getDataToSendToFourKites`,
	},
	{
		controller: 'fourkites#createLoad',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/createLoad`,
	},
	{
		controller: 'fourkites#createEasyLoad',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/createEasyLoad`,
	},
	{
		controller: 'fourkites#updateLoad',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/updateLoad/:loadId`,
	},
	{
		controller: 'fourkites#deleteLoad',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/deleteLoad`,
	},
	{
		controller: 'fourkites#getShipments',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/getShipments`,
	},
	{
		controller: 'fourkites#getShipmentDetails',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/getShipmentDetails/:shipmentId`,
	},
	{
		controller: 'fourkites#getShipmentEUrl',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/getShipmentEUrl/:shipmentId`,
	},
	{
		controller: 'fourkites#getStopEUrl',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/getStopEUrl`,
	},
	{
		controller: 'fourkites#getAssetList',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/getAssetList/:carrierId`,
	},
	{
		controller: 'fourkites#createPurchaseOrder',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/createPurchaseOrder`,
	},
	{
		controller: 'fourkites#updatePurchaseOrder',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/fourkites/updatePurchaseOrder/:purchaseOrderId`,
	}
];

export default routes;
