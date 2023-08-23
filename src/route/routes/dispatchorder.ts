import {ApiRoute, apiPrefix, RouteMethod} from './api';
import passport from 'passport';

const routes: ApiRoute[] = [{
	controller: 'driverlineitem#addDriverLineItem',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/driverlineitem/addDriverLineItem`
}, {
	controller: 'driverlineitem#saveDriverLineItem',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/driverlineitem/saveDriverLineItem/:lineItemId`
}, {
	controller: 'owneroplineitem#addOwneropLineItem',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/owneroplineitem/addOwneropLineItem`
}, {
	controller: 'owneroplineitem#saveOwneropLineItem',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/owneroplineitem/saveOwneropLineItem/:lineItemId`
}, {
	controller: 'carrierlineitem#addCarrierLineItem',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/carrierlineitem/addCarrierLineItem`
}, {
	controller: 'carrierlineitem#saveCarrierLineItem',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/carrierlineitem/saveCarrierLineItem/:lineItemId`
}, {
	controller: 'dispatchorder#GetStartLocandDriverId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/GetStartLocandDriverId`
}, {
	controller: 'dispatchorder#getCurrentLoadsByTruckId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getCurrentLoadsByTruckId`
}, {
	controller: 'dispatchorder#addDispatchOrder',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/addDispatchOrder`
}, {
	controller: 'dispatchorder#saveDispatchOrder',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/saveDispatchOrder/:dispatchOrderId`
}, {
	controller: 'dispatchorder#searchTripNumbers',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/searchTripNumbers`
}, {
	controller: 'dispatchorder#getInfotoSendDispatch',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getInfotoSendDispatch`
}, {
	controller: 'dispatchorder#getStopsbyDOIdRelayId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getStopsbyDOIdRelayId`
}, {
	controller: 'dispatchorder#rateConPrint',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/rateConPrint`
}, {
	controller: 'dispatchorder#deleteDO',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/deleteDO`
}, {
	controller: 'relay#addRelay',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/relay/addRelay`
}, {
	controller: 'relay#saveRelay',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/relay/saveRelay/:relayId`
}, {
	controller: 'relay#deleteRelay',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/relay/deleteRelay/:relayId`
}, {
	controller: 'dispatchorder#calculateDOMiles',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/calculateDOMiles`
}, {
	controller: 'dispatchorder#addTerminaltoDO',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/addTerminaltoDO`
}, {
	controller: 'dispatchorder#sendDispatchNotification',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/sendDispatchNotification`
}, {
	controller: 'dispatchorder#getWayPointsByDOIdRelayId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getWayPointsByDOIdRelayId`
}, {
	controller: 'waypoint#addWayPoint',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/waypoint/addWayPoint`
}, {
	controller: 'waypoint#saveWayPoint',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/waypoint/saveWayPoint/:waypointId`
}, {
	controller: 'waypoint#getWPstopsbyDORelayId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/waypoint/getWPstopsbyDORelayId`
}, {
	controller: 'waypoint#updateWaypointAddress',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/waypoint/updateWaypointAddress`
}, {
	controller: 'notification#sendPushNotification',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/notification/sendPushNotification`
},{
	controller: 'notification#sendPushNotifications',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/notification/sendPushNotifications`
}, {
	controller: 'dispatchorder#getAcceptedRejectedLogsById',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getAcceptedRejectedLogsById`
}, {
	controller: 'dostops#saveDOStop',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dostop/saveDOStop/:doStopId`
}, {
	controller: 'dostops#getDOStopInfoByDOStopId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dostop/getDOStopInfoByDOStopId/:doStopId`
}, {
	controller: 'dispatchorder#getLTLDORelayDetailsbyId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getLTLDORelayDetailsbyId/:doId`
}, {
	controller: 'dispatchorder#getroutebyDORelayID',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getroutebyDORelayID`
}, {
	controller: 'dispatchorder#getLatePickups',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getLatePickups`
}, {
	controller: 'dispatchorder#getLateDeliverys',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getLateDeliverys`
}, {
	controller: 'dispatchorder#getLateDeliverysExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getLateDeliverysExportAll`
}, {
	controller: 'dispatchorder#getLatePickupsExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getLatePickupsExportAll`
}, {
	controller: 'dispatchorder#getAdditionPickandDel',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getAdditionPickandDel`
}, {
	controller: 'dispatchorder#getAutoDispatchData',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getAutoDispatchData`
}, {
	controller: 'dostops#getDoStopsbyDOIdRelayId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dostops/getDoStopsbyDOIdRelayId`
}, {
	controller: 'dispatchorder#getOwneropAmount',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getOwneropAmount`
}, {
	controller: 'dispatchorder#getCarrierAmount',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/dispatchorder/getCarrierAmount`
},{
		controller: 'dispatchorder#getDispatchOrderListByCompany',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dispatchorder/getDispatchOrderListByCompany`
	}, {
		controller: 'dispatchorder#getStateWideMilesByDORelayId',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dispatchorder/getStateWideMilesByDORelayId`
	}, {
		controller: 'dispatchorder#getmilesbydorelayId',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dispatchorder/getmilesbydorelayId`
	}, {
		controller: 'dispatchorder#updateLTLTripStatus',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dispatchorder/updateLTLTripStatus`
	}, {
		controller: 'dispatchorder#updateBulkApproveAmt',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dispatchorder/updateBulkApproveAmt`
	}, {
		controller: 'dispatchorder#autoDispatchWorkOrder',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dispatchorder/autoDispatchWorkOrder`
	}, {
		controller: 'dispatchorder#updateLegLoadAmount',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/dispatchorder/updateLegLoadAmount`
	}
]

export default routes;