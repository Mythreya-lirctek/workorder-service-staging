import { BaseController } from './base_controller';
import AccountingService from '../service/accounting/accounting.service';
import WorkOrderService from '../service/workorder/workorder.service';
import WOInvoiceService from '../service/woinvoice/woinvoice.service';
import WOAccountReceivableService from '../service/woaccountreceivable/woaccountreceivable.service';
import RateDetailService from '../service/ratedetail/ratedetail.service';
import WOStopService from '../service/wostop/wostop.service';
import PDFService from '../service/pdf/pdf.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import { parse } from 'json2csv';
import moment from 'moment';
import EmailService from '../service/email/email.service';

import express from 'express';

export default class AccoutingController extends BaseController {
	private accountingService: AccountingService;
	private pdfService: PDFService;
	private activityLogService: ActivityLogService;
	private workOrderService: WorkOrderService;
	private woInvoiceService: WOInvoiceService;
	private woAccountReceivableService: WOAccountReceivableService;
	private rateDetailService: RateDetailService;
	private woStopService: WOStopService;
	private emailService: EmailService;
	constructor() {
		super();
		this.accountingService = new AccountingService();
		this.pdfService = new PDFService();
		this.activityLogService = new ActivityLogService();
		this.workOrderService = new WorkOrderService();
		this.woInvoiceService = new WOInvoiceService();
		this.woAccountReceivableService = new WOAccountReceivableService();
		this.rateDetailService = new RateDetailService();
		this.woStopService = new WOStopService();
		this.emailService = new EmailService();
	}

	public async getWOUnPaidAndNotSentInvoices(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.accountingService.getWOUnPaidAndNotSentInvoices(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getInvoiceDashboard(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.accountingService.getInvoiceDashboard(req.body);
			res.send(this.getSuccessResponse(result.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOPendingInvoices(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.accountingService.getWOPendingInvoices(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOPendingInvoicesGroupBy(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.accountingService.getWOPendingInvoicesGroupBy(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOPendingInvoicesExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.accountingService.getWOPendingInvoices(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLPendingReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['invoiceNumber', 'brokerName', 'referenceNumber', 'pickupFromDate','deliveryFromDate', 'pickupLocation', 'deliveryLocation', 'invoiceAmount'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('PaidUnPaidInvoices.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCreditedDebitedReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.accountingService.getCreditedDebitedReport(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords,totalAmounts: result.data[2][0]}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getInvoicePaidReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.accountingService.getInvoicePaidReport(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords,totalAmounts: result.data[2][0]}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getInvoicePaidReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.accountingService.getInvoicePaidReport(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLpaidReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['workOrderNumber', 'name', 'refNumber', 'truckNumber', 'driver1', 'pickupFromDate','deliveryFromDate', 'pickupLocation', 'deliveryLocation', 'paidDate', 'issuedAmount', 'paidAmount', 'checkNumber'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('PaidUnPaidInvoices.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOUnPaidAndNotSentInvoicesExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.accountingService.getWOUnPaidAndNotSentInvoices(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTML(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['loadNumber', 'brokerName', 'refNumber', 'truckNumberr', 'driverNamee', 'pickupFromDate','deliveryFromDate', 'pickupLocation', 'deliveryLocation', 'bolReceivedDatee', 'invoiceAmount'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('Invoices.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCreditedDebitedReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.accountingService.getCreditedDebitedReport(req.body);
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
	
	public async getWOWeeklyInvoiceReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.accountingService.getWOWeeklyInvoiceReport(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0] }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOWeeklyInvoiceReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.accountingService.getWOWeeklyInvoiceReport(req.body);
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
	
	public async getBrokerWiseInvoiceReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.accountingService.getBrokerWiseInvoiceReport(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords,total:result.data[2][0]}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getBrokerWiseInvoiceReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.accountingService.getBrokerWiseInvoiceReport(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLAgingReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['customerName', 'currentInvoices', 'currentAmount', 'thirtyDaysInvoices', 'thirtyDaysAmount', 'sixtyDaysInvoices','sixtyDaysAmount', 'nintyDaysInvoices', 'nintyDaysAmount', 'totalInvoices','totalAmount'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('Aging Report.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCheckPrintsByCompanyId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.accountingService.getCheckPrintsByCompanyId(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCheckPrintsByCompanyIdExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.accountingService.getCheckPrintsByCompanyId(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLChecks(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['payTo', 'paidDate', 'amount', 'memo', 'checkNumber', 'reconcile','bankAccountNumber', 'voidDate'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('checks.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOARbyCusotmerName(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.accountingService.getWOARbyCusotmerName(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOARbyCusotmerNameExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.accountingService.getWOARbyCusotmerName(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLReceivables(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['customerName', 'totalBrokerInvoices', 'totalBrokerInvoiceAmount', 'totalFactorInvoices', 'totalFactorInvoiceAmount', 'totalInvoices','totalInvoiceAmount'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('Receivables Report.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async addWOInvoiceNotes(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			const result = await this.accountingService.addWOInvoiceNotes(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body), 
				module: 'WOInvoiceNotes', 
				module_Id: result.data.insertId, 				
				userId: user.id });
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveWOInvoiceNotes(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		const { invoiceNoteId } = req.params;
		try {
			req.body.invoiceNoteId = invoiceNoteId;
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.accountingService.saveWOInvoiceNotes(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOInvoiceNotes',
				module_Id: invoiceNoteId,
				userId: req.body.userId,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}	
	
	public async getWOInvoiceNotesById(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {invoiceNoteId} = req.params;
			const result = await this.accountingService.getWOInvoiceNotesById(invoiceNoteId);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getWOInvoiceNotesByWOInvoiceId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.accountingService.getWOInvoiceNotesByWOInvoiceId(req.body);
			res.send(this.getSuccessResponse({data: result.data}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async updateBulkReceivables(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			const { invoices } = req.body;
			const { paymentInfo } = req.body;
			
			for (const invoice of invoices) {
				invoice.receivedAmount = invoice.receivedAmount ? invoice.receivedAmount : 0;
				const diffAmt = invoice.invoiceAmount - invoice.receivedAmount;
				const workorder = {userId: user.id, workOrderId: invoice.workOrderId, isFullyPaid: 0} as any;
				if (invoice.isFullyPaid || diffAmt === 0) {
					workorder.isFullyPaid = 1;
				}
				
				if (diffAmt > 0 && invoice.isFullyPaid) {
					invoice.debitedAmount = (invoice.receivedAmount - invoice.invoiceAmount);
				}

				if(invoice.hasOwnProperty('isFullyPaid')){
					this.woInvoiceService.updateDOandRelayStatusbyWOId(Number(invoice.workOrderId), invoice.isFullyPaid ? 16 : 11);
					workorder.status_Id =  invoice.isFullyPaid ? 16 : 11 ;  // Invoiced Paid , Invoiced Status
				}
				
				if (diffAmt < 0 && invoice.isFullyPaid) {
					invoice.creditedAmount= (invoice.receivedAmount - invoice.invoiceAmount);
				}
				const saveWO = await this.workOrderService.saveWorkOrder(workorder);
				this.activityLogService.addActivityLog({
					activityType: invoice.activityType ? invoice.activityType : '',
					description: JSON.stringify(workorder),
					module: 'WorkOrder',
					module_Id: workorder.workOrderId,
					userId: req.body.userId,
				});
				invoice.userId = user.id;
				const saveWOInvoice = await this.woInvoiceService.saveWOInvoice(invoice);
				this.activityLogService.addActivityLog({
					activityType: invoice.activityType ? invoice.activityType : '',
					description: JSON.stringify(invoice),
					module: 'WOinvoice',
					module_Id: invoice.woInvoiceId,
					userId: req.body.userId,
				});
				
				const ar = {
					amount: invoice.receivedAmount,
					bankAccount_Id: paymentInfo.bankAccount_Id,
					checkNumber: paymentInfo.checkNumber,
					currencyName: paymentInfo.currencyName,	
					invoiceNumber: invoice.invoiceNumber ? invoice.invoiceNumber : invoice.loadNumber,
					paidDate: paymentInfo.paymentDate,
					paymentType: paymentInfo.paymentType,	
					userId: user.id,
					woInvoice_Id: invoice.woInvoiceId					
				};
				const addWOReceivable = await this.woAccountReceivableService.addWOAccountReceivable(ar);
			};
			res.send(this.getSuccessResponse({data: 'Updated successfully.'}));
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
				const result = await this.woInvoiceService.SendEmailToCustomer(invoice.workOrderId);
				
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
	
	public async invoicePrint(req: express.Request, res: express.Response): Promise<any> {
		try {			
			const { invoiceId, workOrderId } = req.params;
			let invoicesResult = {} as any;
			const stops = [];
			let amount = 0;
			
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			
			const invPrintresult = await this.woInvoiceService.getWOInvPrintByInvId(Number(invoiceId));
			const arResult = await this.woAccountReceivableService.getAccountReceivablesByWOInvoiceId(Number(invoiceId));
			const rdResult = await this.rateDetailService.getRateDetailsByWOId(Number(workOrderId));
			const stopResult = await this.woStopService.getStopsByWOId(Number(workOrderId));
			
			for (const stop of stopResult.data[0]) {
				stop.stopItems = (stop.stopItems ? JSON.parse(`[ ${stop.stopItems} ]`) : []);
				stops.push(stop);
			}
			for (const i of arResult.data[0]) {
				amount += i.amount;
			}
			
			const invoice = invPrintresult.data[0];
			invoicesResult = invoice[0];
			invoicesResult.totalARAmount = amount;			
			invoicesResult.accountReceivables = arResult.data[0];
			invoicesResult.rateDetails = rdResult.data[0];
			invoicesResult.stops = stops;
			const pdfResponse = await this.pdfService.generatePdf(invoiceHTML(invoicesResult));
			if (!req.body.isPreview){
				this.workOrderService.saveWorkOrder({userId: user.id, workOrderId: Number(workOrderId), status_Id: 11});
				await this.woInvoiceService.updateDOandRelayStatusbyWOId(Number(workOrderId),11);
				const d = new Date();
				const updateInvoiceIssuedDate={
					activityType: req.body.activityType ? req.body.activityType : '',
					issuedDate:`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
					userId : user.id,
					woInvoiceId:invoiceId
				};
				await this.woInvoiceService.saveWOInvoice(updateInvoiceIssuedDate)
				this.activityLogService.addActivityLog({
					activityType: req.body.activityType ? req.body.activityType : '',
					description: JSON.stringify(updateInvoiceIssuedDate),
					module: 'WOinvoice',
					module_Id: invoiceId,
					userId: req.body.userId,
				});
			}
			pdfResponse.pipe(res);
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async saveCheckPrint(req: express.Request, res: express.Response): Promise<any> {
		try {	
			const { checkPrintId } = req.params;
			req.body.checkPrintId = checkPrintId;
			const pdfResponse = await this.accountingService.saveCheckPrint(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'CheckPrint',
				module_Id: checkPrintId,
				userId: req.body.userId,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getCheckPrintDetailsByCheckPrintId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {checkPrintId} = req.params;
			const result = await this.accountingService.getCheckPrintDetailsByCheckPrintId(checkPrintId);
			result.data[0][0].cpLineItems = result.data[0][0].cpLineItems ? JSON.parse(`[${result.data[0][0].cpLineItems}]`) : [];
			res.send(this.getSuccessResponse(result.data[0][0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getBrokerDetailsReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			const result = await this.accountingService.getBrokerDetailsReport(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getProfitAndLossReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			const result = await this.accountingService.getProfitAndLossReport(req.body);
			res.send(this.getSuccessResponse(result.data));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getdetailsByInvoiceNumbers(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			const result = await this.accountingService.getdetailsByInvoiceNumbers(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async saveWOAccountReceivable(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {woAccountReceivableId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.woAccountReceivableId = woAccountReceivableId;

			const result = await this.woAccountReceivableService.saveWOAccountReceivable(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOAccountReceivable',
				module_Id: woAccountReceivableId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

const exportHTML = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Invoices<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>loadNumber</td><td>brokerName</td><td>refNumber </td><td>TruckNumberr </td><td>driverNamee</td><td>pickupFromDate</td><td>deliveryFromDate</td><td>pickupLocation</td><td>deliveryLocation</td><td>bolReceivedDatee</td><td>invoiceAmount</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.loadNumber}</td><td>${item.brokerName}</td><td>${item.refNumber}</td><td>${item.truckNumberr ? item.truckNumberr :''}</td><td>${item.driverNamee ? item.driverNamee :''}</td><td>${item.pickupFromDate ? item.pickupFromDate :''}</td><td>${item.deliveryFromDate ? item.deliveryFromDate :''}</td><td>${item.pickupLocation ? item.pickupLocation :''}</td><td>${item.deliveryLocation ? item.deliveryLocation :''}</td><td>${item.bolReceivedDatee ? item.bolReceivedDatee :''}</td><td>${item.invoiceAmount ? item.invoiceAmount :''}</td></tr>`;
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

const exportHTMLpaidReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Paid & Unpaid Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>loadNumber</td><td>brokerName</td><td>refNumber </td><td>TruckNumber </td><td>driver1</td><td>pickupFromDate</td><td>deliveryFromDate</td><td>pickupLocation</td><td>deliveryLocation</td><td>paidDate</td><td>invoiceAmount</td><td>paidAmount</td><td>checkNumber</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.workOrderNumber}</td><td>${item.name}</td><td>${item.refNumber}</td><td>${item.truckNumber ? item.truckNumber :''}</td><td>${item.driver1 ? item.driver1 :''}</td><td>${item.pickupFromDate}</td><td>${item.deliveryFromDate}</td><td>${item.pickupLocation}</td><td>${item.deliveryLocation}</td><td>${item.paidDate ? item.paidDate :''}</td><td>${item.issuedAmount ? item.issuedAmount :''}</td><td>${item.paidAmount ? item.paidAmount :''}</td><td>${item.checkNumber ? item.checkNumber :''}</td></tr>`;
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

const exportHTMLAgingReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Aging Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>customerName</td><td>currentInvoices</td><td>currentAmount </td><td>30DaysInvoices </td><td>30Days Amount</td><td>60DaysInvoices</td><td>60 DaysAmount</td><td>90 DaysInvoices</td><td>90 DaysAmount</td><td>totalInvoices</td><td>totalAmount</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.customerName}</td><td>${item.currentInvoices ? item.currentInvoices : 0}</td><td>${item.currentAmount ? item.currentAmount :0}</td><td>${item.thirtyDaysInvoices ? item.thirtyDaysInvoices : 0}</td><td>${item.thirtyDaysAmount ? item.thirtyDaysAmount : 0}</td><td>${item.sixtyDaysInvoices ? item.sixtyDaysInvoices : 0}</td><td>${item.sixtyDaysAmount ? item.sixtyDaysAmount : 0}</td><td>${item.nintyDaysInvoices ? item.nintyDaysInvoices : 0}</td><td>${item.nintyDaysAmount ? item.nintyDaysAmount : 0}</td><td>${item.totalInvoices ? item.totalInvoices : 0}</td><td>${item.totalAmount ? item.totalAmount : 0}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};

const exportHTMLChecks = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Checks List<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>payTo</td><td>paidDate</td><td>amount </td><td>memo </td><td>checkNumber</td><td>reconcile</td><td>bankAccountNumber</td><td>voidDate</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.payTo}</td><td>${item.paidDate}</td><td>${item.amount}</td><td>${item.memo ? item.memo : ''}</td><td>${item.checkNumber ? item.checkNumber : ''}</td><td>${item.reconcile ? item.reconcile : 0}</td><td>${item.bankAccountNumber ? item.bankAccountNumber : ''}</td><td>${item.voidDate ? item.voidDate : ''}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};

const exportHTMLReceivables = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Receivables List<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>customerName</td><td>totalBrokerInvoices</td><td>totalBrokerInvoiceAmount </td><td>totalFactorInvoices </td><td>totalFactorInvoiceAmount</td><td>totalInvoices</td><td>totalInvoiceAmount</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.customerName}</td><td>${item.totalBrokerInvoices ? item.totalBrokerInvoices : 0}</td><td>${item.totalBrokerInvoiceAmount ? item.totalBrokerInvoiceAmount : 0}</td><td>${item.totalFactorInvoices ? item.totalFactorInvoices : 0}</td><td>${item.totalFactorInvoiceAmount ? item.totalFactorInvoiceAmount : 0}</td><td>${item.totalInvoices ? item.totalInvoices : 0}</td><td>${item.totalInvoiceAmount ? item.totalInvoiceAmount : 0}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};

const exportHTMLPendingReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Pending Invoices Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>invoiceNumber</td><td>brokerName</td><td>referenceNumber </td><td>pickupFromDate </td><td>deliveryFromDate</td><td>pickupLocation</td><td>deliveryLocation</td><td>invoiceAmount</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.invoiceNumber}</td><td>${item.brokerName}</td><td>${item.referenceNumber?item.referenceNumber:null}</td><td>${item.pickupFromDate}</td><td>${item.deliveryFromDate}</td><td>${item.pickupLocation}</td><td>${item.deliveryLocation}</td><td>${item.invoiceAmount}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};


const invoiceRemainderHTML = (res: any) => {
	const result = res[0].data[0][0];
	let htmlString = '';
	const logourl = result.logoUrl ? `https://lircteksams.s3.amazonaws.com/${result.logoUrl}` : ``;
		
	htmlString += `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd"> <html lang="en" > <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta charset="UTF-8"> <title>Invoice</title> </head> <body style="color: #000 !important; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 1.42857143; background-color: #fff; margin: 20px;" bgcolor="#fff">
		<table style="width:100%;font-size:10px;font-family: Arial;"> <tr> <td style="padding-right: 0px;" valign="top"> <img style="align:top;max-height: 60px;" src="${logourl}"> </td> <td style="padding-left: 0px;font-size:12px;text-align:left;" width="50%" valign="top">${(result.showCompanyName ? `<span > <b style="font-size:18px;">${result.companyName} </b></span><br>` : '')} ${result.address1}&nbsp; ${(result.address2 ? result.address2 : '')} <br> ${result.city} , ${result.state} &nbsp; ${result.zip} <br><b>Ph: </b> ${result.companyPhone} ${(result.ext ? `&nbsp;&nbsp; <b>EXT:</b> ${result.ext}` : '')} &nbsp;&nbsp;&nbsp;${(result.fax ? `<br><b>Fax: </b>${result.fax}` : '')}  ${(result.email ? `<br><b>Email: </b>${result.email}` : '')}  ${(result.mc ? `<br><b>MC: </b> ${result.mc}` : '')}  ${(result.federalId ? `<br><b>Federal Id: </b>${result.federalId}` : '')} </td><td align="left" style="font-size: 12px;"><b style="font-size: 24px;" valign="top">PENDING INVOICES</b></td></tr></table>
		<br><br><table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%; font-size:11px;"> <tr> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;" width="15%">Ref #</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="10%">Invoice #</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Pickup</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;">Delivery</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;">Pick Date</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;">Del. Date</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;">Issued Date</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;">Aging</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;border-top-right-radius: 6px;">Inv Amount</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;border-top-right-radius: 6px;">Paid Amount</th><th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;border-top-right-radius: 6px;">Amount</th> </tr>${invoiceshtml(res)}</body></html>`;

	return htmlString;
};

const invoiceshtml = (invoices: any) => {
	let htmlString = '';
	let total = 0;

	for (const inv of invoices) {
		const invoice = inv.data[0][0];
		htmlString += `<tr style="font-size: 11px"><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;">${invoice.refNumber}</td> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.invoiceNumber}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.pickupLocation}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.deliveryLocation}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.pickupFromDate}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.deliveryFromDate}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.issuedDate}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${invoice.invoiceAging}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;" align="right">$${(invoice.invoicedAmount ? invoice.invoicedAmount.toFixed(2) : 0)}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;" align="right">$${(invoice.paidAmount ? invoice.paidAmount.toFixed(2) : 0)}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;" align="right">$${(invoice.remainingAmount ? invoice.remainingAmount.toFixed(2) : 0)}</td> </tr>`;
		total += invoice.remainingAmount;
	}

	htmlString += `<tr><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;" colspan="10" align="right" ><b style="font-size: 12px;">TOTAL</b></td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;" align="right"><b style="font-size: 12px;">$${total.toFixed(2)}</b></td> </tr>`;

	return htmlString;
};

// tslint:disable-next-line: cyclomatic-complexity
const invoiceHTML = (result: any) => {
	
	const logourl = result.logoUrl ? `https://lircteksams.s3.amazonaws.com/${result.logoUrl}` : ``;
	
	let htmlString = '';
	htmlString += `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd"> <html lang="en" > <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta charset="UTF-8"> <title>Invoice</title> </head> <body style="color: #000 !important; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 1.42857143; background-color: #fff; margin: 20px;" bgcolor="#fff">
		<table style="width:100%;font-size:10px;font-family: Arial;"> <tr>${(result.showOnlyLogo && logourl ? `<td colspan="1" style="padding-right: 0px;" width="50%" valign="top"> <img style="align:top;max-height: 60px;" src="${logourl}"> </td>` : `${(logourl ? `<td style="padding-right: 0px;" valign="top"> <img style="align:top;max-height: 60px;" src="${logourl}">` :'')} </td> 
		<td style="padding-left: 0px;font-size:12px;text-align:left;" width="40%" valign="top">${(result.showCompanyName ? `<span > 
		<b style="font-size:18px;">${result.companyName}</b></span><br>` : '')} ${result.companyAddress1} &nbsp;${(result.companyAddress2 ? result.companyAddress2 : '')}<br> ${result.companyCity} , ${result.companyState}&nbsp; ${result.companyZip}<br>
		<b>Ph: </b>${result.companyPhone} ${(result.ext ? `&nbsp;&nbsp; <b>EXT:</b>${result.ext}` : '')} &nbsp;&nbsp;&nbsp;${(result.companyFax ? `<br><b>Fax: </b>${result.companyFax}` : '')}
		<br><b>Email: </b>${result.email}  ${(result.mc ? `<br><b>MC: </b>${result.mc}` : '')}
		${(result.federalId ? `<br><b>Federal Id: </b>${result.federalId}` : '')}</td>`)}`;
		
	htmlString += ` <td align="left" style="font-size: 12px;text-align:right;"><b style="font-size: 28px;">INVOICE</b><br><b>Invoice # : </b>
		${result.invoiceNumber}<br><b>Issued Date : </b>${result.issuedDate}<br><b>Reference # : </b>${result.referenceNumber} ${(result.isFullLoad && !result.splitFullLoad && result.truckNumber ? `<br><b>Truck # : </b>${result.truckNumber}` : '')}  ${(result.isFullLoad && !result.splitFullLoad && result.showDriverName ? `<br><b>Driver Name : </b> ${(result.driver1Name ? result.driver1Name : '')}<br> ${(result.driver2Name ? result.driver2Name : '')}`  : '')} <br></td></tr></table>`;
		
	htmlString += ` <br><table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%;font-size:10px; "> <tr style="height:16px;"> <th style="font-size:12px;border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 2px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;" width="50%">Bill To:</th> <th style="font-size:12px;border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 2px; background: #eee; border-top: 1px solid #bbb; text-align: left;border-top-right-radius: 6px;">Remit To:</b></p></th></tr><tr><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;"><b style="font-size: 12px;">${result.brokerName}</b><br>${result.brokerAddress1} ${(result.brokerAddress2 ? result.brokerAddress2 :'')} <br> ${result.brokerCity} ${result.brokerState}  ${result.brokerZip}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;"><b style="font-size: 12px;">${(result.isCareofFactor ? `${result.companyName} <br> C/O ${result.remitToName ? result.remitToName : ''}` : (result.remitToName ? result.remitToName : ''))}</b><br> ${result.remitToAddress1} ${result.remitToAddress2 ? result.remitToAddress2 : ''} <br> ${result.remitToCity} ${result.remitToState}  ${result.remitToZip}</td></tr></table>
        ${stopsHTML(result.stops,result.isDate24HrFormat)}   
        ${(result.isFullLoad && !result.splitFullLoad && result.showDriverName && result.truckNumber ? `<br><table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%; font-size:11px;"> <tr> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;" width="55%">Drivers</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Trucks</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Trailers</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;border-top-right-radius: 6px;">Payment Terms</th> </tr>${loadTrucksDrivers(result)}</table>` : '')}        
		<br><br><table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%; font-size:11px;"> <tr> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;" width="55%">Description</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Units</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Per</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: right;border-top-right-radius: 6px;">Amount</th> </tr>
		${rateDetails(result.rateDetails)} 
		 ${accountReceivables(result.accountReceivables)} 
		<tr><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;" colspan="3" align="right" ><b style="font-size: 12px;">Remaining Balance</b></td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;" align="right"><b style="font-size: 12px;">$${(result.isFullyPaid ? (0.00).toFixed(2) : (result.amount - (result.totalARAmount > 0 ? result.totalARAmount : 0)).toFixed(2))}</b></td> </tr></table> ${(result.notes ? `<br><br><b>Notes:</b>&nbsp; ${result.notes}` : '')}  ${(result.remitTo === 'Factor' && !result.stampURL ? `<br><p>Notice of Assignment This Account has been assigned and must be paid only to <br> ${result.remitToName} <br> ${result.remitToAddress1}  ${result.remitToAddress2 ? result.remitToAddress2 : ''} <br> ${result.remitToCity} ${result.remitToState} ${result.remitToZip} <br> ${result.remitToName} must be promptly notified at ${(result.factorPhone ? result.factorPhone : `-`)}  of any claims or offsets against this invoice</p>` : (result.stampURL ? `<center><img style="align: center;" src="https://lircteksams.s3.ap-southeast-1.amazonaws.com/${result.stampURL}"></center>` : ''))} <footer><p style="text-align: end;">Powered by: <a target="blank" style="vertical-align: sub;" href="https://www.awako.ai/"><img style="height: 19px;" src="https://app.awako.ai/images/logos/logo-2.png"></a></p></footer></body></html>`;

	return htmlString;
};

// tslint:disable-next-line: cyclomatic-complexity
const stopsHTML = (stops: any,isDate24HrFormat: any) => {
	let htmlString = `<br>`;

	if (stops.length > 0) {
		htmlString += `<table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%;font-size:10px; ">`;
		htmlString += `<tr> <th style="font-size:12px;border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 2px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;border-top-right-radius: 6px;padding-top:2px;">Stops</b></p></th></tr>`;
		
	}
	
	for (const stop of stops) {
		let typeText = `PU`;
		if(stop.stopType === 'Delivery') {
			typeText = 'CO';
		}
		
		if (stop !== (stops.length -1)) {
			htmlString += `<tr> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;"> <table style="width: 100%; max-width: 100%;font-size:10px;">`;
		} else {
			htmlString += `<tr> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;border-bottom-right-radius: 6px;"> <table style="width: 100%; max-width: 100%;font-size:10px;">`;
		}
		
		htmlString += `<tr> <td><b style="font-size: 12px;">${stop.stopNumber}. ${stop.facilityName}</b>  &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp; <b style="font-size:10px;text-transform: uppercase;">${stop.stopType}</b> <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="padding-top:5px;font-size: 10px">${stop.address1} ${stop.address2 ? stop.address2 : ''}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${stop.location} </span> ${(stop.phone ? `<br><b>Ph: </b>${stop.phone}` : '')}</td><td style="width:45%; font-size: 11px;" valign="top"><b style="font-size: 12px;">${typeText} #: </b> ${(stop.poNumber ? stop.poNumber : '' )} ${( stop.appNumber ? `<br><b style="font-size: 12px;">Appt #: </b>${stop.appNumber}` : '')} <br><b style="font-size: 12px;">Date & Time: </b> ${moment(stop.fromDate).format('MM/DD/YYYY')}  ${((stop.toDate && (stop.toDate !== '0000-00-00 00:00:00')) ? `- ${moment(stop.toDate).format('MM/DD/YYYY')}` : '')}  ${((stop.fromTime && (stop.fromTime !== '0000-00-00 00:00:00')) ? `${(isDate24HrFormat ? moment(stop.fromTime).format('HH:mm') : moment(stop.fromTime).format('hh:mm a'))}` : '')}  ${((stop.toTime && (stop.toTime !== '0000-00-00 00:00:00')) ? `- ${(isDate24HrFormat ? moment(stop.toTime).format('HH:mm') : moment(stop.toTime).format('hh:mm a'))}` : '')}  ${(stop.shippingHours ? `<br><b>Shipping Hours: </b>${stop.shippingHours}` : '')}</td></tr>`;
		htmlString += `<tr> <td colspan="2"> <table width="100%" style="padding-top: 15px;padding-left: 10px;padding-right: 10px;padding-bottom: 10px;font-size:10px; border-spacing: 0;"> <tr> <td width="15%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>ItemNumber</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>PO#</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>CO#</b> </td> <td width="20%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Commodity</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Weight</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Pallets</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Count</b> </td> <td width="25%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;"> <b>Temp</b> </td> </tr>`;
		for (const item of stop.stopItems) {
			htmlString += `<tr><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.itemNumber ? item.itemNumber : '')} </td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.poNumber ? item.poNumber : '')} </td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.coNumber ? item.coNumber : '')} </td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.commodity ? item.commodity : '')} </td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.weight ? item.weight : '')}</td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.pallets ? item.pallets : '')}</td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.pieceCount ? item.pieceCount : '')}</td><td style="padding-left: 5px;">${(item.temperature ? item.temperature : '')}</tr>`;                
		}
		
		htmlString += `</table></td></tr>`;
		htmlString += `</table></td> </tr>`;
	}
	htmlString += `</table>`;
	return htmlString;
};

const rateDetails = (rates: any) => {
	let htmlString = '';
	let	total = 0;

	for (const rate of rates) {
		htmlString += `<tr style="font-size: 11px"><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;">${rate.name} </td> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${rate.units}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${rate.per}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;" align="right">$${(rate.amount ? rate.amount.toFixed(2) : 0)}</td> </tr>`;
		total += rate.amount;
	}

	htmlString += `<tr><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;" colspan="3" align="right" ><b style="font-size: 12px;">TOTAL</b></td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;" align="right"><b style="font-size: 12px;">$${total.toFixed(2)}</b></td> </tr>`;

	return htmlString;
};

const accountReceivables = (receivables: any) => {
	let htmlString = '';

	if (receivables.length > 0) {
		for (const item of receivables) {
			htmlString += `<tr><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;" colspan="3" align="right" >Amount Received on - ${item.paymentDate}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;" align="right">-$${(item.amount >0 ? item.amount : 0).toFixed(2)}</td> </tr>`;
		}
	}

	return htmlString;
};

const loadTrucksDrivers = (result: any) => {
	let htmlString = '';
	
	if (result.truckNumber) {
		htmlString += `<tr style="font-size: 11px"><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;"> ${result.driver1Name + (result.driver2Name ? `<br>${result.driver2Name}` : '')}</td> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${result.truckNumber}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${(result.trailerNumber ? result.trailerNumber : '')}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;">${(result.paymenterms ? result.paymenterms : '')}</td> </tr>`;
	}
	
	if (result.rTrucks) {
		result.rTrucks = result.rTrucks.split(',');
		result.rDriver1Name = (result.rDriver1Name ? result.rDriver1Name.split(',') : ''); 
		result.rDriver2Name = (result.rDriver2Name ? result.rDriver2Name.split(',') : '');
		result.rTrailers = (result.rTrailers ? result.rTrailers.split(',') : '');
	
	}
	
	return htmlString;
};