import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [{	
	controller: 'coaccounting#getCOBrokerWiseInvoiceReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/coaccounting/getCOBrokerWiseInvoiceReport`
},{	
	controller: 'coaccounting#getCOInvoiceNotesReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/coaccounting/getCOInvoiceNotesReport`
},{
	controller: 'coaccounting#getCOInvoiceDashboard',
  	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOInvoiceDashboard`
},{
	controller: 'coaccounting#getCOInvoicePaidReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOInvoicePaidReport`
},{
	controller: 'coaccounting#getCOInvoicePaidReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOInvoicePaidReportExportAll`
},{	
	controller: 'coaccounting#getCOUnPaidAndNotSentInvoices',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/coaccounting/getCOUnPaidAndNotSentInvoices`
},{	
	controller: 'coaccounting#getCOUnPaidAndNotSentInvoicesExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/coaccounting/getCOUnPaidAndNotSentInvoicesExportAll`
},{	
	controller: 'coaccounting#getCOBrokerWiseInvoiceReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/coaccounting/getCOBrokerWiseInvoiceReportExportAll`
},{	
	controller: 'coaccounting#getCOARbyCusotmerName',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/coaccounting/getCOARbyCusotmerName`
},{
	controller: 'coaccounting#getCOCustoumerDetailsReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOCustoumerDetailsReport`
},{
	controller: 'coinvoicelock#addCoInvoiceUnlock',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coinvoicelock/addCoInvoiceUnlock`
},{
	controller: 'coinvoice#saveCOInvoice',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coinvoice/saveCOInvoice/:invoiceId`
},{	
	controller: 'coinvoice#getCOInvoiceDetailsByInvId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/coinvoice/getCOInvoiceDetailsByInvId/:invoiceId`
},{
	controller: 'coaccounting#getCOInvoiceNotesByCOInvoiceId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOInvoiceNotesByCOInvoiceId/:coInvoiceId`
},{
	controller: 'coinvoicelock#getUnlocksByCOInvoiceId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coinvoicelock/getUnlocksByCOInvoiceId/:coInvoiceId`
},{	
	controller: 'coaccounting#addCOInvoiceNotes',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/coaccounting/addCOInvoiceNotes`
},{	
	controller: 'coaccounting#saveCOInvoiceNotes',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/coaccounting/saveCOInvoiceNotes/:coInvoiceNotesId`
},{
	controller: 'coaccounting#getCOInvoiceNotesById',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOInvoiceNotesById/:invoiceNoteId`
},
{
	controller: 'coaccounting#invoiceRemainderPrint',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/invoiceRemainderPrint`
},{
	controller: 'coaccounting#getCOPendingInvoices',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOPendingInvoices`
},{
	controller: 'coaccounting#getCOPendingInvoicesGroupBy',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOPendingInvoicesGroupBy`
},{	
	controller: 'coinvoice#getInvoiceSentLogs',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coinvoice/getInvoiceSentLogs/:coInvoiceId`
},{	
	controller: 'coaccounting#updateCOBulkReceivables',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/updateCOBulkReceivables`
},{
	controller: 'coaccounting#getCOInvoiceNotesReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],	
	path: `${apiPrefix}/coaccounting/getCOInvoiceNotesReportExportAll`
},{
	controller: 'coaccounting#getCOPendingInvoicesExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOPendingInvoicesExportAll`
},{
	controller: 'coinvoice#invoicePrint',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coinvoice/invoicePrint/:customerOrderId/:invoiceId`
},{
	controller: 'coinvoice#updateBulkReadytoBillCOInvId',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coinvoice/updateBulkReadytoBillCOInvId`
},{
	controller: 'coaccounting#saveCOAccountReceivable',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/saveCOAccountReceivable/:coAccountReceivableId`
},{
	controller: 'coinvoice#printInvoiceAndOtherDocs',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coinvoice/printInvoiceAndOtherDocs`
},{
	controller: 'coaccounting#getCOCreditedDebitedReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOCreditedDebitedReport`
},{
	controller: 'coaccounting#getCOCreditedDebitedReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOCreditedDebitedReportExportAll`
},{
	controller: 'coaccounting#getCOWeeklyInvoiceReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOWeeklyInvoiceReport`
}, {
	controller: 'coaccounting#getCOWeeklyInvoiceReportExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coaccounting/getCOWeeklyInvoiceReportExportAll`
}, {
		controller: 'coinvoice#updateBulkBillToCOInvId',
		method: RouteMethod.PUT,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/coinvoice/updateBulkBillToCOInvId`
	},
	{
		controller: 'coinvoice#sendInvoiceAndOtherDocsToTriumph',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/coinvoice/sendInvoiceAndOtherDocsToTriumph`
	},
	{
		controller: 'coinvoice#sendInvoiceAndOtherDocsToWex',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/coinvoice/sendInvoiceAndOtherDocsToWex`
	}, {
		controller: 'coinvoice#sendInvoiceAndOtherDocsToOTR',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/coinvoice/sendInvoiceAndOtherDocsToOTR`
	}, {
		controller: 'coinvoice#sendInvoiceAndOtherDocsToRTS',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/coinvoice/sendInvoiceAndOtherDocsToRTS`
	}, {
		controller: 'coinvoice#getFactorLogList',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/coinvoice/getFactorLogList`
	}, {
		controller: 'coinvoice#getfactorbatchlogLatest',
		method: RouteMethod.GET,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/coinvoice/getfactorbatchlogLatest`
	}
	];

export default routes;
