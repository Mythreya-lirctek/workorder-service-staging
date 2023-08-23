import express from 'express';
import { BaseController } from './base_controller';
import ActivityLogService from '../service/activitylog/activitylog.service';
import COAccountingService from '../service/coaccounting/coaccounting.service';
import CustomerOrderService from '../service/customerorder/customerorder.service';
import COAccountReceivableService from '../service/coaccountreceivable/coaccountreceivable.service';
import COInvoiceService from '../service/coinvoice/coinvoice.services';
import EmailService from '../service/email/email.service';
import PDFService from '../service/pdf/pdf.service';
import { parse } from 'json2csv';


export default class CoAccountingController extends BaseController {
	private pdfService: PDFService;
	private activityLogService: ActivityLogService;
	private coAccountingService: COAccountingService;
	private emailService: EmailService;
	private coInvoiceService: COInvoiceService;
	private customerOrderService: CustomerOrderService;
	private coAccountReceivableService: COAccountReceivableService;
	constructor() {
		super();
		this.pdfService = new PDFService();
		this.activityLogService = new ActivityLogService();
		this.coAccountingService = new COAccountingService();
		this.emailService = new EmailService();
		this.coInvoiceService = new COInvoiceService();
		this.customerOrderService = new CustomerOrderService();
		this.coAccountReceivableService = new COAccountReceivableService();
	}

	public async getCOBrokerWiseInvoiceReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.coAccountingService.getCOBrokerWiseInvoiceReport(req.body);
			res.send(this.getSuccessResponse({data:result.data[0],totalRecords: result.data[1][0].totalRecords,total: result.data[2][0]}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCOBrokerWiseInvoiceReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;

			const result = await this.coAccountingService.getCOBrokerWiseInvoiceReport(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLCOBrokerWiseInvoiceReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['customerName', 'currentTotalInvoiceNumbers', 'currentTotalInvoiceAmount', '30DaysTotalInvoiceNumbers',
				'30DaysTotalInvoiceAmount', '60DaysTotalInvoiceNumbers', '60DaysTotalInvoiceAmount', 
				'90DaysTotalInvoiceNumbers','90DaysTotalInvoiceAmount','totalInvoiceNumers','totalInvoiceAmount'];
				const opts = { fields };
				const csv = parse(result.data[0], opts);
				res.attachment('Aging Report.csv');
				res.status(200).send(csv);
			}
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCOInvoiceNotesReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.coAccountingService.getCOInvoiceNotesReport(req.body);
			res.send(this.getSuccessResponse({data:result.data[0],totalRecords: result.data[1][0].totalRecords}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCOInvoiceNotesReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
	
			const result = await this.coAccountingService.getCOInvoiceNotesReport(req.body);
	
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLCOInvoiceNotesReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['customerName','pickupLocation','deliveryLocation','fromCity','toCity','fromState','toState','pickupFromDate','deliveryToDate','dispatchStatus','customerOrderAmount'];
				const opts = { fields };
				const csv = parse(result.data[0], opts);
				res.attachment('Pending COInvoices.csv');
				res.status(200).send(csv);
			}	
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCOInvoiceDashboard(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.coAccountingService.getCOInvoiceDashboard(req.body);
			res.send(this.getSuccessResponse(result.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCOInvoicePaidReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.coAccountingService.getCOInvoicePaidReport(req.body);
			res.send(this.getSuccessResponse({data:result.data[0],totalRecords: result.data[1][0].totalRecords,amounts:result.data[2][0]}));
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getCOCustoumerDetailsReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
	
			const result = await this.coAccountingService.getCOCustoumerDetailsReport(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (e) {
				res.status(500).send(this.getErrorResponse(e));
		}
	}
	public async getCOInvoiceNotesByCOInvoiceId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { coInvoiceId} =req.params;

			const result = await this.coAccountingService.getCOInvoiceNotesByCOInvoiceId(Number(coInvoiceId));
			res.send(this.getSuccessResponse(result.data));
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCOInvoicePaidReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
	
			const result = await this.coAccountingService.getCOInvoicePaidReport(req.body);
	
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLCOInvoicePaidReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['coNumber','name','pickupLocation','deliveryLocation','pickupFromDate','deliveryFromDate',
				'issuedDate','amount','paidDate','paidAmount','checkNumber'];
				const opts = { fields };
				const csv = parse(result.data[0], opts);
				res.attachment('Invoice paid Report.csv');
				res.status(200).send(csv);
			}	
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCOARbyCusotmerName(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;

			const result = await this.coAccountingService.getCOARbyCusotmerName(req.body);
			res.send(this.getSuccessResponse({data:result.data[0],totalRecords: result.data[1][0].totalRecords}));
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCOUnPaidAndNotSentInvoices(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.coAccountingService.getCOUnPaidAndNotSentInvoices(req.body);
			res.send(this.getSuccessResponse({data:result.data[0],totalRecords: result.data[1][0].totalRecords}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getCOUnPaidAndNotSentInvoicesExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
				
			const result = await this.coAccountingService.getCOUnPaidAndNotSentInvoices(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLInvoiceReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['customerOrderNumber', 'referenceNumber', 'carrierName','pickupLocation',
				'deliveryLocation', 'customerOrderAmount', 'receivedAmount', 'invoiceAmount','customerEmail'];
				const opts = { fields };
				const csv = parse(result.data[0], opts);
				res.attachment('InVoiceReport.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async addCOInvoiceNotes(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			const result = await this.coAccountingService.addCOInvoiceNotes(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				description: JSON.stringify(req.body), 
				module: 'COInvoiceNotes', 
				module_Id: result.data.insertId, 				
				userId: user.id });
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveCOInvoiceNotes(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		const { coInvoiceNotesId } = req.params;
		try {
			req.body.coInvoiceNotesId = coInvoiceNotesId;
			const user = req.user as any;
			req.body.userId = user.id;
				
			const result = await this.coAccountingService.saveCOInvoiceNotes(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COInvoiceNotes',
				module_Id: coInvoiceNotesId,
				userId: req.body.userId,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getCOInvoiceNotesById(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {invoiceNoteId} = req.params;
			const result = await this.coAccountingService.getCOInvoiceNotesById(invoiceNoteId);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}


	public async invoiceRemainderPrint(req: express.Request, res: express.Response): Promise<any> {
		try {			
			const { invoices } = req.body;
			const response = [];
			let invoicesResult;
			
			for (const invoice of invoices) {
				const result = await this.coInvoiceService.sendEmailToCOCustomer(invoice.customerOrderId);
				
				response.push(result);	
			};
			invoicesResult = await Promise.all(response);
			const pdfResponse = await this.pdfService.generatePdf(invoiceRemainderHTML(invoicesResult)) as any;
			if(req.body.sendEmail) {
				try {
					const bodyBuffer = await pdfResponse.body();
					const emailRes = {} as any;
					emailRes.buffers = bodyBuffer;
					emailRes.body = req.body.body;
					emailRes.emails = req.body.toEmails;
					emailRes.fromEmail =req.body.fromEmail;
					emailRes.subject = 'Invoices Remainder';
					emailRes.fileName = 'RemainderInvoices';
					this.emailService.emailservice(emailRes);
					res.send(this.getSuccessResponse({data: 'Sent successfully.'}));
				}catch(e) {
					res.status(500).send(this.getErrorResponse(e));
				}
			} else {
				pdfResponse.pipe(res);
			}
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCOPendingInvoices(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;

			const result = await this.coAccountingService.getCOPendingInvoices(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getCOPendingInvoicesExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
	
			const result = await this.coAccountingService.getCOPendingInvoices(req.body);
	
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLCOPendingInvoicesReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['customerName','pickupLocation','deliveryLocation','pickupFromDate','deliveryToDate',
				'invoiceAmount','coNumber','referenceNumber'];
				const opts = { fields };
				const csv = parse(result.data[0], opts);
				res.attachment('Pending Invoices Report.csv');
				res.status(200).send(csv);
			}	
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCOPendingInvoicesGroupBy(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;

			const result = await this.coAccountingService.getCOPendingInvoicesGroupBy(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updateCOBulkReceivables(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			const { invoices } = req.body;
			const { paymentInfo } = req.body;
			
			for (const invoice of invoices) {
				const diffAmt = invoice.invoiceAmount - invoice.receivedAmount;
				const customerorder = {userId: user.id, customerOrderId: invoice.customerOrderId, isFullyPaid: 0} as any;
				if (invoice.isFullyPaid || diffAmt === 0) {
					customerorder.isFullyPaid = 1;
				}
				
				if (diffAmt > 0 && invoice.isFullyPaid) {
					invoice.debitedAmount = (invoice.receivedAmount - invoice.invoiceAmount);
				}
				
				if (diffAmt < 0 && invoice.isFullyPaid) {
					invoice.creditedAmount= (invoice.receivedAmount - invoice.invoiceAmount);
				}
				if(invoice.hasOwnProperty('isFullyPaid')){
					customerorder.status_Id =  invoice.isFullyPaid ? 16 : 11   // Invoiced Paid , Invoiced Status
				}
				const saveCO = await this.customerOrderService.saveCustomerOrder(customerorder);
				invoice.userId = user.id;
				const saveCOInvoice = await this.coInvoiceService.saveCOInvoice(invoice);
				
				const ar = {
					amount: invoice.receivedAmount,
					bankAccount_Id: paymentInfo.bankAccount_Id,
					checkNumber: paymentInfo.checkNumber,
					coInvoice_Id: invoice.coInvoiceId,
					currencyName: paymentInfo.currencyName,	
					invoiceNumber: invoice.invoiceNumber ? invoice.invoiceNumber : invoice.loadNumber,
					paidDate: paymentInfo.paymentDate,
					paymentType: paymentInfo.paymentType,	
					userId: user.id
										
				};
				const addWOReceivable = await this.coAccountReceivableService.addCOAccountReceivable(ar);
			};
			res.send(this.getSuccessResponse({data: 'Updated successfully.'}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}	
	
	public async saveCOAccountReceivable(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {coAccountReceivableId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.coAccountReceivableId = coAccountReceivableId;

			const result = await this.coAccountReceivableService.saveCOAccountReceivable(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COAccountReceivable',
				module_Id: coAccountReceivableId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getCOCreditedDebitedReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.coAccountingService.getCOCreditedDebitedReport(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords,totalAmounts: result.data[2][0]}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getCOCreditedDebitedReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.coAccountingService.getCOCreditedDebitedReport(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLCDReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['invoiceNumber', 'customerName', 'pickupCity','pickupState', 'deliveryCity','deliveryState', 'issuedDate', 'invoicedAmount','creditedAmount','debitedAmount', 'receivedAmount'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('CreditDebitReport.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getCOWeeklyInvoiceReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.coAccountingService.getCOWeeklyInvoiceReport(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0] }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCOWeeklyInvoiceReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.coAccountingService.getCOWeeklyInvoiceReport(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLWeeklyReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['weekstart', 'weekend', 'noOfLoadsBilled', 'noOfLoadsBilledAmount', 'noOfLoadsNotBilled', 'noOfLoadsNotBilledAmount','loadsLessThanTenDols', 'loadsLessThanTenDolsAmount', 'totalNoOfLoads', 'noOfLoadsAmount'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('WeeklyInvoicesReport.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

const exportHTMLInvoiceReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `InVoice Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>customerOrderNumber</td><td>referenceNumber</td><td>carrierName</td><td>pickupLocation</td><td>deliveryLocation</td><td>customerOrderAmount</td><td>receivedAmount</td><td>invoiceAmount</td><td>customerEmail</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.customerOrderNumber}</td><td>${item.referenceNumber}</td><td>${item.carrierName ? item.carrierName : ''}</td><td>${item.pickupLocation}</td><td>${item.deliveryLocation}</td><td>${item.customerOrderAmount}</td>
		<td>${item.receivedAmount}</td><td>${item.invoiceAmount}</td><td>${item.customerEmail}</td>
		</tr>`;
	}
		
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};

const exportHTMLCOBrokerWiseInvoiceReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Aging Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>Customer Name</td><td>Current total invoice No</td><td>Current total invoice $</td><td>30days total invoice No</td><td>30days total invoice $</td><td>60days total invoice No</td><td>60days total invoice $</td><td>90days total invoice No</td><td>90days total invoice $</td><td>Total Invoice Numbers</td><td>Total Invoice Amount$</td></tr>';

	for (const item of result) {
		htmlString += `<tr><td>${item.customerName?item.customerName:''}</td><td>${item.currentTotalInvoiceNumbers}</td><td>${item.currentTotalInvoiceAmount}</td><td>${item['30DaysTotalInvoiceNumbers']}</td><td>${item['30DaysTotalInvoiceAmount']}</td><td>${item['60DaysTotalInvoiceNumbers']}</td><td>${item['60DaysTotalInvoiceAmount']}</td><td>${item['90DaysTotalInvoiceNumbers']}</td><td>${item['90DaysTotalInvoiceAmount']}</td>
		<td>${item.totalInvoiceNumers}</td><td>${item.totalInvoiceAmount}</td></tr>`;
	}

	htmlString += `</tr></table></body></html>`;

	return htmlString;
};

const exportHTMLCOInvoicePaidReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Invoice paid Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>coNumber</td><td>name</td><td>pickupLocation</td><td>deliveryLocation</td><td>pickupFromDate</td><td>deliveryFromDate</td><td>issuedDate</td><td>amount</td><td>paidDate</td><td>paidAmount</td><td>checkNumber</td></tr>';

	for (const item of result) {
		htmlString += `<tr><td>${item.coNumber ? item.coNumber :''}</td><td>${item.name ? item.name : ''}</td><td>${item.pickupLocation ? item.pickupLocation : ''}</td><td>${item.deliveryLocation ? item.deliveryLocation : ''}</td><td>${item.pickupFromDate ? item.pickupFromDate : ''}</td>
		<td>${item.deliveryFromDate ? item.deliveryFromDate :' '}</td><td>${item.issuedDate ? item.issuedDate : ''}</td><td>${item.amount ? item.amount : 0}</td><td>${item.paidDate ? item.paidDate :''}</td><td>${item.paidAmount ? item.paidAmount: 0}</td><td>${item.checkNumber ? item.checkNumber :''}</td><td>${item.coNumber ? item.coNumber :''}</td>
		</tr>`;
	}

	htmlString += `</tr></table></body></html>`;

	return htmlString;
};

const invoiceRemainderHTML = (res: any) => {
	const result = res[0].data[0][0];
	let htmlString = '';
	const logourl = result.logoUrl ? `https://lircteksams.s3.amazonaws.com/${result.logoUrl}` : ``;
		
	htmlString += `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd"> <html lang="en" > <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta charset="UTF-8"> <title>Invoice</title> </head> <body style="color: #000 !important; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 1.42857143; background-color: #fff; margin: 20px;" bgcolor="#fff">
		<table style="width:100%;font-size:10px;font-family: Arial;"> <tr> <td style="padding-right: 0px;" valign="top"> <img style="align:top;max-height: 60px;" src="${logourl}"> </td> <td style="padding-left: 0px;font-size:12px;text-align:left;" width="50%" valign="top">${(result.showCompanyName ? `<span > <b style="font-size:18px;">${result.companyName} </b></span><br>` : '')} ${result.address1}&nbsp; ${(result.address2 ? result.address2 : '')} <br> ${result.city} , ${result.state} &nbsp; ${result.zip} <br><b>Ph: </b> ${result.companyPhone} ${(result.ext ? `&nbsp;&nbsp; <b>EXT:</b> ${result.ext}` : '')} &nbsp;&nbsp;&nbsp;${(result.fax ? `<br><b>Fax: </b>${result.fax}` : '')}  ${(result.email ? `<br><b>Email: </b>${result.email}` : '')}  ${(result.mc ? `<br><b>MC: </b> ${result.mc}` : '')} ${(result.federalId ? `<br><b>Federal Id: </b>${result.federalId}` : '')} </td><td align="left" style="font-size: 12px;"><b style="font-size: 24px;" valign="top">PENDING INVOICES</b></td></tr></table>
		<br><br><table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%; font-size:11px;"> <tr> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;" width="15%">Ref #</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="10%">Invoice #</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Pickup</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;">Delivery</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;">Pick Date</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;">Del. Date</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;">Issued Date</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;">Aging</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;border-top-right-radius: 6px;">Inv Amount</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;border-top-right-radius: 6px;">Paid Amount</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;border-top-right-radius: 6px;">Amount</th> </tr>${invoiceshtml(res)}</body></html>`;

	return htmlString;
};

const invoiceshtml = (invoices: any) => {
	let htmlString = '';
	let total = 0;	
	
	for (const inv of invoices) {
		const invoice = inv.data[0][0];
		htmlString += `<tr style="font-size: 11px"><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;">${invoice.referenceNumber}</td> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.invoiceNumber}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.pickupLocation ? invoice.pickupLocation : ''}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.deliveryLocation ? invoice.deliveryLocation : ''}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.pickupFromDate}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.deliveryFromDate}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.issuedDate}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.invoiceAging ? invoice.invoiceAging : ''}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;" align="right">$${(invoice.invoicedAmount ? invoice.invoicedAmount.toFixed(2) : 0)}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;" align="right">$${(invoice.paidAmount ? invoice.paidAmount.toFixed(2) : 0)}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;" align="right">$${(invoice.remainingAmount ? invoice.remainingAmount.toFixed(2) : 0)}</td> </tr>`;
		total += invoice.remainingAmount;
	}

	htmlString += `<tr><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;" colspan="10" align="right" ><b style="font-size: 12px;">TOTAL</b></td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;" align="right"><b style="font-size: 12px;">$${total.toFixed(2)}</b></td> </tr>`;

	return htmlString;
};

const exportHTMLCOInvoiceNotesReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `COInvoices Notes Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>CustomerName</td><td>Pickup Location</td><td>Delivery Location</td><td>From City</td><td>To City</td><td>From State</td><td>To State</td><td>Pickup From Date</td><td>Delivery To Date</td><td>Dispatch Status</td><td>CustomerOrder Amount</td></tr>';

	for (const item of result) {
		htmlString += `<tr><td>${item.customerName ? item.customerName :''}</td><td>${item.pickupLocation ? item.pickupLocation : ''}</td><td>${item.deliveryLocation ? item.deliveryLocation : ''}</td><td>${item.fromCity ? item.fromCity : ''}</td><td>${item.toCity ? item.toCity : ''}</td>
		<td>${item.fromState ? item.fromState :' '}</td><td>${item.toState ? item.toState : ''}</td><td>${item.pickupFromDate ? item.pickupFromDate : ''}</td><td>${item.deliveryToDate ? item.deliveryToDate :''}</td><td>${item.dispatchStatus ? item.dispatchStatus: ''}</td><td>${item.customerOrderAmount ? item.customerOrderAmount :''}</td></td>
		</tr>`;
	}

	htmlString += `</tr></table></body></html>`;

	return htmlString;
};

const exportHTMLCOPendingInvoicesReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `CO Pending Invoices<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>CustomerName</td><td>Pickup Location</td><td>Delivery Location</td><td>Pickup From Date</td><td>Delivery To Date</td><td>Invoice Amount</td><td>CoNumber</td><td>Reference Number</td></tr>';

	for (const item of result) {
		htmlString += `<tr><td>${item.customerName ? item.customerName :''}</td><td>${item.pickupLocation ? item.pickupLocation : ''}</td><td>${item.deliveryLocation ? item.deliveryLocation : ''}</td><td>${item.pickupFromDate ? item.pickupFromDate : ''}</td><td>${item.deliveryToDate ? item.deliveryToDate :''}</td>
		<td>${item.invoiceAmount ? item.invoiceAmount :0}</td><td>${item.coNumber ? item.coNumber : ''}</td><td>${item.referenceNumber ? item.referenceNumber : ''}</td></td>
		</tr>`;
	}

	htmlString += `</tr></table></body></html>`;

	return htmlString;
};

const exportHTMLCDReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Credited & Debited Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>invoiceNumber</td><td>customerName</td><td>pickupCity </td><td>deliveryCity </td><td>issuedDate</td><td>invoicedAmount</td><td>creditedAmount</td><td>debitedAmount</td><td>receivedAmount</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.invoiceNumber}</td><td>${item.customerName}</td><td>${item.pickupCity}, ${item.pickupState}</td><td>${item.deliveryCity}, ${item.deliveryState}</td><td>${item.issuedDate ? item.issuedDate : ''}</td><td>${item.invoicedAmount ? item.invoicedAmount :''}</td><td>${item.creditedAmount ? item.creditedAmount :''}</td><td>${item.debitedAmount ? item.debitedAmount :''}</td><td>${item.receivedAmount ? item.receivedAmount : ''}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};

const exportHTMLWeeklyReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Weekly Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>weekstart</td><td>weekend</td><td>noOfLoadsBilled </td><td>BilledAmount </td><td>noOfLoadsNotBilled</td><td>NotBilledAmount</td><td>load < $1</td><td>load $1 Amount</td><td>total Loads</td><td>Total Loads Amount</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.weekstart}</td><td>${item.weekend}</td><td>${item.noOfLoadsBilled ? item.noOfLoadsBilled : 0}</td><td>${item.noOfLoadsBilledAmount ? item.noOfLoadsBilledAmount : 0}</td><td>${item.noOfLoadsNotBilled ? item.noOfLoadsNotBilled : 0}</td><td>${item.noOfLoadsNotBilledAmount ? item.noOfLoadsNotBilledAmount : 0}</td><td>${item.loadsLessThanTenDols ? item.loadsLessThanTenDols : 0}</td><td>${item.loadsLessThanTenDolsAmount ? item.loadsLessThanTenDolsAmount : 0}</td><td>${item.totalNoOfLoads ? item.totalNoOfLoads : 0}</td><td>${item.noOfLoadsAmount ? item.noOfLoadsAmount : 0}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};