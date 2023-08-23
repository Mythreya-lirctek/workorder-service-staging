import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [{
	controller: 'workorder#createWorkOrder',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder`
}, {
	controller: 'workorder#saveWorkOrder',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/saveworkorder/:workOrderId`
}, {
	controller: 'workorder#addLTLWorkorderInfo',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/ltl`
}, {
	controller: 'workorder#getDBLoadsgroupby',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBLoadsgroupby`
}, {
	controller: 'workorder#getDBLoads',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBLoads`
}, {
	controller: 'workorder#getDBAllLoadsgroupby',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBAllLoadsgroupby`
}, {
	controller: 'workorder#getDBAllLoads',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBAllLoads`
}, {
	controller: 'wostop#addWOStop',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/wostop/addWOStop`
}, {
	controller: 'wostop#saveWOStop',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/wostop/saveWOStop/:woStopId`
}, {
	controller: 'wostop#getWOStopDetailsById',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/wostop/getWOStopDetailsById/:woStopId`
}, {
	controller: 'wostop#getStopsByWOId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/wostop/getStopsByWOId`
}, {
	controller: 'wostop#getStopsWithStopItemsByWoId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/wostop/getStopsWithStopItemsByWoId`
}, {
	controller: 'wostopitem#addWOStopItem',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/wostopitem/addWOStopItem`
}, {	
	controller: 'wostopitem#saveWOStopItem',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/wostopitem/saveWOStopItem/:woStopItemId`
}, {	
	controller: 'ratedetail#addRateDetail',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ratedetail/addRateDetail`
}, {	
	controller: 'ratedetail#getRateDetailsByWOId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ratedetail/getRateDetailsByWOId/:workOrderId`
}, {	
	controller: 'ratedetail#saveRateDetail',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ratedetail/saveRateDetail/:rateDetailId`
}, {	
	controller: 'workorder#ValidateRefnoCusConId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/ValidateRefnoCusConId/:customerId/:refNumber`
}, {	
	controller: 'workorder#getFLBWorkorderdetails',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getFLBWorkorderdetails/:workOrderId`
}, {	
	controller: 'workorder#getLTLWODetailsByWOId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getLTLWODetailsByWOId/:workOrderId`
}, {	
	controller: 'woinvoice#saveWOInvoice',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/saveWOInvoice/:woInvoiceId`
}, {	
	controller: 'woinvoice#getWOInvoiceDetailsByInvId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/getWOInvoiceDetailsByInvId/:woInvoiceId`
}, {	
	controller: 'woinvoice#getInvoiceSentLogs',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/getInvoiceSentLogs/:woInvoiceId`
}, {	
	controller: 'workorder#getDBListLoads',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBListLoads`
}, {	
	controller: 'workorder#getDBListLoadsExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBListLoadsExportAll`
}, {	
	controller: 'woinvoiceunlock#addWOInvoiceUnlock',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoiceunlock/addWOInvoiceUnlock`
}, {	
	controller: 'woinvoiceunlock#saveWOInvoiceUnlock',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoiceunlock/saveWOInvoiceUnlock/:woInvoiceUnlockId`
}, {	
	controller: 'woinvoiceunlock#getUnlocksByWOInvoiceId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoiceunlock/getUnlocksByWOInvoiceId/:woInvoiceId`
}, {	
	controller: 'workorder#FLWOStatusChange',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/FLWOStatusChange`
}, {	
	controller: 'workorder#getDBLTLListLoads',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBLTLListLoads`
}, {	
	controller: 'wostopitem#getWOStopItemsByWOId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/wostopitem/getWOStopItemsByWOId/:woId`
}, {	
	controller: 'workorder#copyLoadToOtherCompany',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/copyLoadToOtherCompany`
}, {	
	controller: 'woincident#addWOIncident',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woincident/addWOIncident`
}, {	
	controller: 'woincident#saveWOIncident',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woincident/saveWOIncident/:woIncidentId`
}, {	
	controller: 'woincident#getWOIncidentsbyWOId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woincident/getWOIncidentsbyWOId`
}, {	
	controller: 'woincident#getWOincidentsReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woincident/getWOincidentsReport`
}, {	
	controller: 'brokercheckcall#addBrokerCheckCall',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/brokercheckcall/addBrokerCheckCall`
}, {	
	controller: 'brokercheckcall#saveBrokerCheckCall',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/brokercheckcall/saveBrokerCheckCall/:brokerCheckCallId`
},{	
	controller: 'brokercheckcall#getBrokerCheckCallsbyWOId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/brokercheckcall/getBrokerCheckCallsbyWOId`
},{	
	controller: 'brokercheckcall#getBrokerCheckCallexistReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/brokercheckcall/getBrokerCheckCallexistReport`
},{	
	controller: 'brokercheckcall#getBrokerCheckCallexistReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/brokercheckcall/getBrokerCheckCallexistReportExportAll`
},{	
	controller: 'brokercheckcall#getBrokerCheckCallNotexistReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/brokercheckcall/getBrokerCheckCallNotexistReport`
},{	
	controller: 'brokercheckcall#getBrokerCheckCallNotexistReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/brokercheckcall/getBrokerCheckCallNotexistReportExportAll`
},{	
	controller: 'workorder#copyWOtoMultipleWO',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/copyWOtoMultipleWO`
},{	
	controller: 'workorder#copyWOtoCO',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/copyWOtoCO`
},{
	controller: 'workorder#getWorkorderReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWorkorderReport`
},{
	controller: 'workorder#getWorkorderReportSummary',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWorkorderReportSummary`
}
,{
	controller: 'workorder#getWorkorderReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWorkorderReportExportAll`
},{	
	controller: 'workorder#getWorkorderWithNoLineItems',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWorkorderWithNoLineItems`
},{	
	controller: 'workorder#getWorkorderWithNoLineItemsExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWorkorderWithNoLineItemsExportAll`
},{	
	controller: 'woinvoice#printInvoiceAndOtherDocs',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/printInvoiceAndOtherDocs`
},{	
	controller: 'workorder#getWOStatusLogByWOId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWOStatusLogByWOId`
},{	
	controller: 'woincident#getWOincidentsReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woincident/getWOincidentsReportExportAll`
},{	
	controller: 'workorder#getWorkOrderPaymentHistory',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWorkOrderPaymentHistory`
},{	
	controller: 'workorder#getWeeklyScheduleReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWeeklyScheduleReport`
},{	
	controller: 'workorder#getInfotoSendStatustoCustomer',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getInfotoSendStatustoCustomer`
},{	
	controller: 'workorder#getDBLTLLoads',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBLTLLoads`
},{	
	controller: 'workorder#getDBAllLTLLoads',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBAllLTLLoads`
},{	
	controller: 'workorder#getDBLTLLoadsgroupby',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBLTLLoadsgroupby`
},{	
	controller: 'workorder#getDBAllLTLLoadsgroupby',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBAllLTLLoadsgroupby`
},{	
	controller: 'workorder#getwoStatusSentLogbyWoId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getwoStatusSentLogbyWoId/:workOrderId`
},{	
	controller: 'workorder#updateWOFromDobyWOId',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/updateWOFromDobyWOId/:workOrderId`
}, {	
	controller: 'currentlocation#addCurrentLocation',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/currentlocation/addCurrentLocation`
}, {	
	controller: 'currentlocation#saveCurrentLocation',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/currentlocation/saveCurrentLocation/:currentLocationId`
}, {	
	controller: 'currentlocation#getCurrentLocationsbyWOId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/currentlocation/getCurrentLocationsbyWOId`
}, {	
	controller: 'workorder#getWOGlobalSearch',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWOGlobalSearch`
}, {	
	controller: 'wostopnotes#addWOStopNotes',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/wostopnotes/addWOStopNotes`
}, {	
	controller: 'wostopnotes#saveWOStopNotes',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/wostopnotes/saveWOStopNotes/:woStopNotesId`
}, {	
	controller: 'wostopnotes#getWOStopNotesbyWOStopId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/wostopnotes/getWOStopNotesbyWOStopId`
},{	
	controller: 'scheduleplanningnotes#getScheduleNotesByTruckId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/scheduleplanningnotes/getScheduleNotesByTruckId`
}, {	
	controller: 'scheduleplanningnotes#addSchedulePlanningNotes',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/scheduleplanningnotes/addSchedulePlanningNotes`
}, {	
	controller: 'scheduleplanningnotes#saveSchedulePlanningNotes',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/scheduleplanningnotes/savescheduleplanningnotes/:schedulePlanningNotesId`
}, {	
	controller: 'woinvoice#updateBulkReadytoBillWOInvId',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/updateBulkReadytoBillWOInvId`
}, {
	controller: 'woinvoice#updateBulkBillToWOInvId',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/updateBulkBillToWOInvId`
},
	{
	controller: 'workorder#searchWOTemplate',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/searchWOTemplate`
}, {	
	controller: 'workorder#getWeeklyScheduleReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWeeklyScheduleReportExportAll`
}, {	
	controller: 'workorder#getwoListbyCustomerId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getwoListbyCustomerId`
}, {	
	controller: 'workorder#getDBLTLListLoadsExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBLTLListLoadsExportAll`
}, {	
	controller: 'workorder#getDBCListLoads',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDBCListLoads`
}, {	
	controller: 'workorder#getwodetailsforcustomer',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getwodetailsforcustomer`
},  {	
	controller: 'woincident#getWoIncidentsCount',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woincident/getWoIncidentsCount`
}, {	
	controller: 'workorder#getwoListbyCustomerIdExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getwoListbyCustomerIdExportAll`
}, {	
	controller: 'workorder#getWOTemplates',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWOTemplates`
}, {	
	controller: 'workorder#addWOTemplate',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/addWOTemplate`
}, {	
	controller: 'workorder#getDashboardAnalytics',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDashboardAnalytics`
}, {	
	controller: 'availableloads#saveAvailableLoads',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/availableloads/saveAvailableLoads/:availableLoad_Id`
}, {	
	controller: 'availableloads#addAvailableLoad',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/availableloads/addAvailableLoad`
}, {	
	controller: 'availableloads#deleteAvailableLoad',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/availableloads/deleteAvailableLoad`
}, {
	controller: 'workorder#getDashboardPLICount',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getDashboardPLICount`
}, {
	controller: 'workorder#getETAlocationbyWO',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getETAlocationbyWO`
}, {
	controller: 'workorder#getAvailableUnits',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getAvailableUnits`
}, {
	controller: 'workorder#getWOCustomerSummary',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWOCustomerSummary`
}, {
	controller: 'availableloads#getALsByDOId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/availableloads/getALsByDOId`
}, {
	controller: 'availableloads#getALItemsbywostopsId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/availableloads/getALItemsbywostopsId`
}, {	
	controller: 'workorder#getWOLTLGlobalSearch',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/workorder/getWOLTLGlobalSearch`
}];

export default routes;
