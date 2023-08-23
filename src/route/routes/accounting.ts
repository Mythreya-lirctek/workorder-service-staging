import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [{
	controller: 'accounting#getWOUnPaidAndNotSentInvoices',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getWOUnPaidAndNotSentInvoices`
}, {
	controller: 'accounting#getWOUnPaidAndNotSentInvoicesExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getWOUnPaidAndNotSentInvoicesExportAll`
}, {
	controller: 'accounting#getInvoiceDashboard',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getInvoiceDashboard`
}, {
	controller: 'accounting#getWOPendingInvoices',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getWOPendingInvoices`
}, {
	controller: 'accounting#getWOPendingInvoicesExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getWOPendingInvoicesExportAll`
}, {
	controller: 'accounting#getWOPendingInvoicesGroupBy',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getWOPendingInvoicesGroupBy`
}, {
	controller: 'accounting#getCreditedDebitedReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getCreditedDebitedReport`
}, {
	controller: 'accounting#getInvoicePaidReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getInvoicePaidReport`
}, {
	controller: 'accounting#getInvoicePaidReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getInvoicePaidReportExportAll`
}, {
	controller: 'accounting#getCreditedDebitedReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getCreditedDebitedReportExportAll`
}, {
	controller: 'accounting#getWOWeeklyInvoiceReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getWOWeeklyInvoiceReport`
}, {
	controller: 'accounting#getWOWeeklyInvoiceReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getWOWeeklyInvoiceReportExportAll`
}, {
	controller: 'accounting#getBrokerWiseInvoiceReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getBrokerWiseInvoiceReport`
}, {
	controller: 'accounting#getBrokerWiseInvoiceReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getBrokerWiseInvoiceReportExportAll`
}, {
	controller: 'accounting#getCheckPrintsByCompanyId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getCheckPrintsByCompanyId`
}, {
	controller: 'accounting#getCheckPrintsByCompanyIdExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getCheckPrintsByCompanyIdExportAll`
}, {
	controller: 'accounting#getCheckPrintDetailsByCheckPrintId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getCheckPrintDetailsByCheckPrintId/:checkPrintId`
}, {
	controller: 'accounting#saveCheckPrint',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/saveCheckPrint/:checkPrintId`
}, {
	controller: 'accounting#getWOARbyCusotmerName',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getWOARbyCusotmerName`
}, {
	controller: 'accounting#getWOARbyCusotmerNameExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getWOARbyCusotmerNameExportAll`
}, {
	controller: 'accounting#addWOInvoiceNotes',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/addWOInvoiceNotes`
}, {
	controller: 'accounting#saveWOInvoiceNotes',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/saveWOInvoiceNotes/:invoiceNoteId`
}, {
	controller: 'accounting#getWOInvoiceNotesById',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getWOInvoiceNotesById/:invoiceNoteId`
}, {
	controller: 'accounting#getWOInvoiceNotesByWOInvoiceId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getWOInvoiceNotesByWOInvoiceId`
}, {
	controller: 'accounting#updateBulkReceivables',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/updateBulkReceivables`
}, {
	controller: 'accounting#invoiceRemainderPrint',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/invoiceRemainderPrint`
}, {
	controller: 'accounting#invoicePrint',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/invoicePrint/:workOrderId/:invoiceId`
}, {
	controller: 'accounting#getBrokerDetailsReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getBrokerDetailsReport`
}, {
	controller: 'accounting#saveWOAccountReceivable',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/saveWOAccountReceivable/:woAccountReceivableId`
}, {
	controller: 'accounting#getProfitAndLossReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getProfitAndLossReport`
}, {
	controller: 'accounting#getdetailsByInvoiceNumbers',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/accounting/getdetailsByInvoiceNumbers`
}, {
	controller: 'woinvoice#SendInvoiceAndOtherDocsToTriumph',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/SendInvoiceAndOtherDocsToTriumph`
}, {
	controller: 'woinvoice#SendInvoiceAndOtherDocsToOTR',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/SendInvoiceAndOtherDocsToOTR`
}, {
	controller: 'woinvoice#sendInvoiceAndOtherDocsToWex',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/sendInvoiceAndOtherDocsToWex`
}, {
	controller: 'woinvoice#sendInvoiceAndOtherDocsToRTS',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/sendInvoiceAndOtherDocsToRTS`
}, {
	controller: 'woinvoice#getfactorbatchlogLatest',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/getfactorbatchlogLatest`
}, {
	controller: 'woinvoice#getFactorLogList',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/getFactorLogList`
}, {
	controller: 'woinvoice#getInvoiceToSyncToQuickBook',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/woinvoice/getInvoiceToSyncToQuickBook`
}
];

export default routes;