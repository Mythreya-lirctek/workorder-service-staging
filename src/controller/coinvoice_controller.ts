import express from 'express';
import { BaseController } from './base_controller';
import ActivityLogService from '../service/activitylog/activitylog.service';
import COInvoiceService from '../service/coinvoice/coinvoice.services';
import PDFService from '../service/pdf/pdf.service';
import COAccountReceivableService from '../service/coaccountreceivable/coaccountreceivable.service';
import CORateDetailService from '../service/coratedetail/coratedetail.service';
import COStopService from '../service/costop/costop.service';
import CustomerOrderService from '../service/customerorder/customerorder.service';
import moment from 'moment';
import DocumentService from '../service/document/document.service';
import fs from 'fs';
import PDFMerge from 'pdf-merge';
import ConfigService from '../service/config/config';
import AWS from 'aws-sdk';
import EmailService from '../service/email/email.service';
import {bufferToStream, createTheFile, deleteFiles, handleDuplicateDocuments, stringToStream} from '../utils/file.util';
import zipFileStream, {createZipFile} from '../service/zip/zip.service';
import {parse} from 'json2csv';
import TriumphService from '../service/triumph/triumph.service';
import OTRService from '../service/otrservice/otr.service';
import XLSX from 'xlsx';
import WexService from '../service/wex/wex.service';
import RtsService from '../service/rts/rts.service';
import CompanyService from '../service/checkhq/company.service';

class COInvoiceController extends BaseController {
	private activityLogService: ActivityLogService;
	private coInvoiceService: COInvoiceService;
	private pdfService: PDFService;
	private coAccountReceivableService: COAccountReceivableService;
	private coRateDetailService: CORateDetailService;
	private coStopService: COStopService;
	private customerOrderService: CustomerOrderService;
	private documentService: DocumentService;
	private emailService: EmailService;
	private triumphService: TriumphService;
	private otrService: OTRService;
	private wexService:WexService;
	private rtsService: RtsService;
	private companyService : CompanyService;

	constructor() {
		super();
		this.activityLogService = new ActivityLogService();
		this.coInvoiceService = new COInvoiceService();
		this.pdfService = new PDFService();
		this.coAccountReceivableService = new COAccountReceivableService();
		this.coRateDetailService = new CORateDetailService();
		this.coStopService = new COStopService();
		this.customerOrderService = new CustomerOrderService();
		this.documentService = new DocumentService();
		this.emailService = new EmailService();
		this.triumphService = new TriumphService();
		this.otrService= new OTRService();
		this.wexService= new WexService();
		this.rtsService = new RtsService();
		this.companyService = new CompanyService();
	}
	

	public async saveCOInvoice(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const { invoiceId }= req.params;
			req.body.coInvoiceId =invoiceId;

			const result = await this.coInvoiceService.saveCOInvoice(req.body);
			
			const coUpdate = {} as any;
			if(req.body.remitTo === 'Company') {
				coUpdate.billToType = 'Broker';
				coUpdate.billTo_Id = req.body.broker_Id;
			} else if(req.body.remitTo === 'Factor') {
				coUpdate.billToType = 'Factor';
				coUpdate.billTo_Id = req.body.factor_Id;				
			}
			
			if(req.body.hasOwnProperty('issuedDate') && req.body.issuedDate == null && req.body.customerOrder_Id) {
				coUpdate.status_Id = 5;
			}

			if(req.body.issuedDate && req.body.status_Id && req.body.customerOrder_Id) {
				// if co status is delivered,pending or Tonu making the co as invoiced
				if([5, 12, 13].includes(req.body.status_Id)){
					coUpdate.status_Id = 11; // Invoiced
				}
			}

			coUpdate.userId = user.id;
			coUpdate.customerOrderId = req.body.customerOrder_Id;
			this.customerOrderService.saveCustomerOrder(coUpdate);
			
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COInvoice', 
				module_Id: invoiceId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ result:'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCOInvoiceDetailsByInvId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { invoiceId } = req.params;
			const result = await this.coInvoiceService.getCOInvoiceDetailsByInvId(Number(invoiceId));
				
			result.data[0][0].receivables = result.data[0][0].receivables ? JSON.parse(`[${result.data[0][0].receivables}]`) : [];
			result.data[0][0].rateDetails = result.data[0][0].rateDetails ? JSON.parse(`[${result.data[0][0].rateDetails}]`) : [];
				
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getInvoiceSentLogs(req: express.Request,res: express.Response): Promise<any> {
		try {
			const {coInvoiceId} = req.params;
			req.body.coInvoiceId = coInvoiceId;

			const user= req.user as any;
			
			const result = await this.coInvoiceService.getInvoiceSentLogs(req.body.coInvoiceId, user.companyId);
			result.data[0][0] = result.data[0][0].sentLogDetails ? JSON.parse(`[${result.data[0][0].sentLogDetails}]`) : []; 
			res.send(this.getSuccessResponse(result.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async invoicePrint(req: express.Request, res: express.Response): Promise<any> {
		try {			
			const { invoiceId, customerOrderId } = req.params;
			let invoicesResult = {} as any;
			const stops = [];
			let amount = 0;
			
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			
			const invPrintresult = await this.coInvoiceService.getCOInvPrintByInvId(Number(invoiceId));
			const arResult = await this.coAccountReceivableService.getAccountReceivablesByCOInvoiceId(Number(invoiceId));
			const rdResult = await this.coRateDetailService.getCORateDetailsByCOId(Number(customerOrderId));
			const stopResult = await this.coStopService.getCOStopsByCOId(Number(customerOrderId));
			
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
				const d = new Date();
				const updateInvoiceIssuedDate={
					coInvoiceId: invoiceId,
					issuedDate:`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
					userId : user.id					
				};
				await this.coInvoiceService.saveCOInvoice(updateInvoiceIssuedDate)
				this.customerOrderService.saveCustomerOrder({userId: user.id, customerOrderId: Number(customerOrderId), status_Id: 11});
			}
			pdfResponse.pipe(res);
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	
	public async printInvoiceAndOtherDocs(req: express.Request, res: express.Response): Promise<any> {
		try {
			const files = [] as any;
			let outResult = '' as any;
			const invoices = req.body.invoices;
			const user= req.user as any;
			req.body.userId = user.id;

			for (const item of invoices) {
				item.filesArray = [];	
				item.fileNames = 'Invoice';	
				item.documents = [];		
				if (req.body.documents && req.body.documents.length > 0) {
					item.documents = req.body.documents;
				} else if(req.body.isOnlyInvoice) {
					item.documents = [];
				} else {
					const params = { containerId: item.customerOrderId, containerName: 'customerorder' };
					const documentResults = await this.documentService.getContainerDocuments(params);
					item.documents = documentResults ? documentResults.data[0] : [];
				}
				req.body.addAttachment = true;
				req.body.coInvoiceId = item.coInvoiceId;
				req.body.coId = item.customerOrderId;
				item.status = req.body.status;

				if (req.body.isIncludeInvoice && (item.status === '' || item.status === 5 || item.status === 11)) {
					let invoicesResult = {} as any;
					const stops = [];
					let amount = 0;

					const invPrintresult = await this.coInvoiceService.getCOInvPrintByInvId(Number(item.coInvoiceId));

					const invoice = invPrintresult.data[0];
					invoicesResult = invoice[0];
					invoicesResult.accountReceivables = [];
					if (invoicesResult.receivablesCount > 0) {
						const arResult = await this.coAccountReceivableService.getAccountReceivablesByCOInvoiceId(Number(item.coInvoiceId));
						invoicesResult.accountReceivables = arResult.data[0];
						invoicesResult.totalARAmount = 0;
						for (const i of invoicesResult.accountReceivables) {
							amount += i.amount;
						}
						invoicesResult.totalARAmount = amount;
					}

					const rdResult = await this.coRateDetailService.getCORateDetailsByCOId(Number(item.customerOrderId));
					invoicesResult.rateDetails = rdResult.data[0];

					const stopResult = await this.coStopService.getCOStopsByCOId(Number(item.customerOrderId));

					for (const stop of stopResult.data[0]) {
						stop.stopItems = (stop.stopItems ? JSON.parse(`[ ${stop.stopItems} ]`) : []);
						stops.push(stop);
					}

					invoicesResult.stops = stops;

					const htmlResult = await this.pdfService.generatePdf(invoiceHTML(invoicesResult));

					if (req.body.status === '') {
						const d = new Date();
						req.body.issuedDate = `${d.getFullYear()}-${d.getMonth() +1}-${d.getDate()}`;

						const updateResult = await this.customerOrderService.saveCustomerOrder({
							customerOrderId: Number(req.body.coId), 
							status_Id: 11,
							userId: user.id
						});
						if (updateResult) {
							await this.coInvoiceService.saveCOInvoice(req.body);
						}
					}
					if (invoices.length === 1 && item.documents.length === 0 && !req.body.emails) {
						outResult = htmlResult;
						if(req.body.isSingleFile){
							await createTheFile(htmlResult,`./brokerdocs/Invoice-${item.customerOrderId}.pdf`)
							const filepath = (`./brokerdocs/Invoice-${item.customerOrderId}.pdf`).replace('\\', '/');
							item.filesArray.push({fileName:`Invoice-${item.customerOrderId}.pdf`,
								filePath:filepath});
						}
					} else {		
						if(item.documents.length > 0) {
							await createTheFile(htmlResult,`./brokerdocs/Invoice-${item.customerOrderId}.pdf`);
							const filepath = (`./brokerdocs/Invoice-${item.customerOrderId}.pdf`).replace('\\', '/');
							item.filesArray.push({fileName:`Invoice-${item.customerOrderId}.pdf`,
							filePath:filepath});							
							const docResult = await documentsPrint(item);						
							for (const doc of docResult) {
								item.filesArray.push({fileName: doc.fileName, filePath:doc.filePath});
								item.fileNames += `;${doc.fileName}`;
							}	
						} else {
							await createTheFile(htmlResult,`./brokerdocs/${item.loadNumber}-${item.refNumber}.pdf`);
							const filepath = (`./brokerdocs/${item.loadNumber}-${item.refNumber}.pdf`).replace('\\', '/');
							files.push({fileName:`${item.loadNumber}-${item.refNumber}.pdf`,
							filePath:`./brokerdocs/${item.loadNumber}-${item.refNumber}.pdf`}); 
							item.filesArray.push({fileName:`${item.loadNumber}-${item.refNumber}.pdf`,
							filePath:`./brokerdocs/${item.loadNumber}-${item.refNumber}.pdf`});							
						}
					}
				} else {
					const docResult = await documentsPrint(item);					
					for (const doc of docResult) {
						item.filesArray.push({fileName: doc.fileName, filePath:doc.filePath});
						item.fileNames += `;${doc.fileName}`;
					}							
				}
			}

			if(req.body.emails) {
				const sepFiles = [];
				const mergedFiles = [];					
				for (const item of invoices) {
					const filesArray = [];
					for (const file of item.filesArray) {
						files.push(file);
						sepFiles.push(file);
						filesArray.push(file.filePath ? file.filePath : file);
					}
					
					if (filesArray.length >= 1) {
						if (filesArray.length === 1) {
							const filePath = ('./brokerdocs/Invoice-Sample.pdf').replace('\\', '/');
							files.push({fileName:`Invoice-Sample`, filePath}); 
							filesArray.push(filePath);	
						}						
						try {
							if(req.body.mergeFiles) {
								const stream = await PDFMerge(filesArray, {output: `./brokerdocs/${item.loadNumber}-${item.refNumber}.pdf`});
								
								files.push({fileName:`${item.loadNumber}-${item.refNumber}.pdf`,
								filePath:`./brokerdocs/${item.loadNumber}-${item.refNumber}.pdf`}); 
								mergedFiles.push({fileName:`${item.loadNumber}-${item.refNumber}.pdf`,
								filePath:`./brokerdocs/${item.loadNumber}-${item.refNumber}.pdf`}); 
							} 
							item.userId = user.id;
							item.emails = '';

							for (let e = 0; e < req.body.emails.length; e++) {
								item.emails += `${req.body.emails[e]} ;`;
							}
							this.coInvoiceService.addCOInvoiceLog(item);
							this.activityLogService.addActivityLog({
								activityType: 'Invoice sent',
								description: JSON.stringify(item),
								module: 'COinvoice',
								module_Id: item.coInvoiceId,
								userId: req.body.userId,
							});

						} catch(e) {
							return res.status(500).send(this.getErrorResponse(e));
						}
					}
				}
				req.body.documents = mergedFiles.length > 0 ? mergedFiles : sepFiles;
				if (req.body.documents.length > 0) {
					try {
						await this.emailService.emailservice(req.body);

						for (const file of files) {		
							try {
								if(file.filePath !== './brokerdocs/Invoice-Sample.pdf') {
									fs.unlinkSync(file.filePath); 
								}  
							} catch (e) {
								const t = 'error';
							}                          			
						} 

						res.send(this.getSuccessResponse({ result:'Sent email successfully!' }));
					} catch (error) { 
						res.status(500).send(this.getSuccessResponse({ result:'Error in sending email to Broker' }));
					}

				} else {
					try {
						await this.emailService.emailservice(req.body);
						res.send(this.getSuccessResponse({ result:'Sent email successfully!' }));
					} catch (e) {
						res.send(this.getSuccessResponse({ result:"Couldn't send email." }));
					}					
				}
			}
			else if(!req.body.emails&&req.body.status!==''&&req.body.isSingleFile){
				const mergedFiles = [];
				for (const item of invoices) {
					const filesArray=[];
					for (const file of item.filesArray) {
						files.push(file);
						filesArray.push(file.filePath ? file.filePath : file);
					}
					const fileStream = await PDFMerge(filesArray, {output: 'Stream'});

					mergedFiles.push({stream:fileStream,fileName:`Invoice-${item.customerOrderId}.pdf`})
				}
				if(mergedFiles.length>0){
					zipFileStream(mergedFiles,res,`Invoices_${Date.now()}.zip`)
				}
				else {
					res.status(500).send('There are no documents or some thing went wrong. Please contact our customer support');
				}

				files.forEach((file:any)=>{
					if(file.filePath !== './brokerdocs/Invoice-Sample.pdf') {
						try {
							if(file.filePath !== './brokerdocs/Invoice-Sample.pdf') {
								fs.unlinkSync(file.filePath);
							}
						} catch(e) {
							const t = 'error';
						}
					}
				})
			}
			else {
				const filesArray = [];
				for (const item of invoices) {
					for (const file of item.filesArray) {
						files.push(file);
						filesArray.push(file.filePath ? file.filePath : file);
					}
				}
						
				if (filesArray.length >= 1) {
					if (filesArray.length === 1) {
						const filePath = ('./brokerdocs/Invoice-Sample.pdf').replace('\\', '/');
						files.push({fileName:`Invoice-Sample`, filePath}); 
						filesArray.push(filePath);	
					}					
					try {
						const stream = await PDFMerge(filesArray, {output: 'Stream'});
						for (const file of files) {
							if(file.filePath !== './brokerdocs/Invoice-Sample.pdf') { 
								try {
									if(file.filePath !== './brokerdocs/Invoice-Sample.pdf') {
										fs.unlinkSync(file.filePath);
									}
								} catch(e) {
									const t = 'error';
								}
							}
						}						
						stream.pipe(res);

					} catch(e) {
						res.status(500).send(this.getErrorResponse(e));
					}
				} else {
					if (outResult) {
						outResult.pipe(res);
					} else {			
						res.status(500).send('There are no documents or some thing went wrong. Please contact our customer support');		
					}
				}
			}			
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async updateBulkReadytoBillCOInvId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			const { invoiceIds } = req.body;
			
			for (const invoiceId of invoiceIds) {
				const invoice = {coInvoiceId: invoiceId, userId: user.id, readyToBill: req.body.readyToBill};
				const saveCOInvoice = await this.coInvoiceService.saveCOInvoice(invoice);
				this.activityLogService.addActivityLog({
					description: JSON.stringify(invoice),
					module: 'COinvoice',
					module_Id: invoice.coInvoiceId,
					userId: req.body.userId,
				});
			}
			res.send(this.getSuccessResponse({data: 'Updated successfully.'}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async updateBulkBillToCOInvId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			for (const invoice of req.body.invoices) {
				const updateInvoice = {
					coInvoiceId:invoice.coInvoice_Id,
					isQuickPay:invoice.isQuickPay,
					quickPayAmount:invoice.quickPayAmount,
					remitTo:req.body.remitTo,
					remitToAddress_Id:req.body.remitToAddress_Id,
					userId:req.body.userId


				} as any
				const coUpdate = {} as any;
				coUpdate.billTo_Id = req.body.remitTo_Id;
				if(req.body.remitTo === 'Company') {
					coUpdate.billToType = 'Broker';
					updateInvoice.factor_Id=null;
				} else if(req.body.remitTo === 'Factor') {
					coUpdate.billToType = 'Factor';
					updateInvoice.factor_Id=req.body.remitTo_Id;
				}
				coUpdate.userId = user.id;
				coUpdate.customerOrderId = invoice.customerOrder_Id;
				const saveWOInvoice = await this.coInvoiceService.saveCOInvoice(updateInvoice);
				await this.customerOrderService.saveCustomerOrder(coUpdate);
				this.activityLogService.addActivityLog({
					description: JSON.stringify(invoice),
					module: 'COInvoice',
					module_Id: invoice.coInvoice_Id,
					userId: req.body.userId,
				});
			}
			res.send(this.getSuccessResponse({data: 'Updated successfully.'}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}


	public async sendInvoiceAndOtherDocsToTriumph(req: express.Request, res: express.Response): Promise<any> {
		try {
			const files = [];
			const invoices = req.body.invoices;
			const writer = [];
			const csvFileName = `${moment().format('MMDDYYYYhhmma')}.csv`;
			const csvFilePath = `./brokerdocs/${csvFileName}`

			const batchLog = [];
			const user = req.user as any;
			req.body.userId = user.id;

			files.push({filePath: csvFilePath, fileName: csvFileName});

			for (const item of invoices) {
				writer.push({
					'DTR_NAME': item.customerName,
					'INVOICE#': item.loadNumber,
					'INV_DATE': item.invoicedDate ? moment(item.invoicedDate, moment.ISO_8601).format('MM/DD/YYYY') : moment().format('MM/DD/YYYY'),
					'PO': item.refNumber,
					// tslint:disable-next-line:object-literal-sort-keys
					'DESCR': item.description?item.description:'',
					'INVAMT': item.invoiceAmount
				});

				item.filesArray = [];
				item.fileNames = 'Invoice';
				item.documents = [];

				if (req.body.documents && req.body.documents.length > 0) {
					item.documents = req.body.documents;
				} else {
					const params = {containerId: item.customerOrderId, containerName: 'customerorder'};
					const documentResults = await this.documentService.getContainerDocuments(params);
					item.documents = documentResults ? documentResults.data[0] : [];
				}
				req.body.addAttachment = true;
				req.body.coInvoiceId = item.invoiceId;
				req.body.coId = item.customerOrderId;
				if (req.body.isIncludeInvoice && (item.status === '' || item.status === 5 || item.status === 11)) {
					let invoicesResult = {} as any;
					const stops = [];
					let amount = 0;

					const invPrintresult = await this.coInvoiceService.getCOInvPrintByInvId(Number(item.coInvoiceId));

					const invoice = invPrintresult.data[0];
					invoicesResult = invoice[0];
					invoicesResult.accountReceivables = [];
					if (invoicesResult.receivablesCount > 0) {
						const arResult = await this.coAccountReceivableService.getAccountReceivablesByCOInvoiceId(Number(item.coInvoiceId));
						invoicesResult.accountReceivables = arResult.data[0];
						invoicesResult.totalARAmount = 0;
						for (const i of invoicesResult.accountReceivables) {
							amount += i.Amount;
						}
						invoicesResult.totalARAmount = amount;
					}

					const rdResult = await this.coRateDetailService.getCORateDetailsByCOId(Number(item.customerOrderId));
					invoicesResult.rateDetails = rdResult.data[0];

					const stopResult = await this.coStopService.getCOStopsByCOId(Number(item.customerOrderId));

					for (const stop of stopResult.data[0]) {
						stop.stopItems = (stop.stopItems ? JSON.parse(`[ ${stop.stopItems} ]`) : []);
						stops.push(stop);
					}

					invoicesResult.stops = stops;
					invoicesResult.toTriump = true;


					const htmlResult = await this.pdfService.generatePdf(invoiceHTML(invoicesResult));
					if (item.documents.length > 0) {
						const fileLoaction = `./brokerdocs/Invoice-${item.customerOrderId}.pdf`;
						await createTheFile(htmlResult, fileLoaction)
						const filepath = fileLoaction.replace('\\', '/');
						item.filesArray.push(filepath);
						const docResult = await documentsPrint(item);
						for (const doc of docResult) {
							item.filesArray.push(doc.filePath);
							item.fileNames += `;${doc.fileName}`;
						}
						batchLog.push({invoice_Id: item.coInvoiceId, invoiceNumber: item.loadNumber, documents: item.fileNames});
					} else {
						const fileLocation = `./brokerdocs/${item.loadNumber}-${item.refNumber}_temp.pdf`;
						await createTheFile(htmlResult, fileLocation)
						item.filesArray.push(fileLocation);
						batchLog.push({invoice_Id: item.coInvoiceId, invoiceNumber: item.loadNumber, documents: 'Invoice'});
					}

					if (item.filesArray.length >= 1) {
						try {
							const fileLoaction = `./brokerdocs/${item.loadNumber}.pdf`;
							const stream = await PDFMerge(item.filesArray, {output: fileLoaction});
							files.push({
								fileName: `${item.loadNumber}.pdf`,
								filePath: fileLoaction
							});
							item.filesArray.forEach((file: any) => {
								fs.unlinkSync(file);
							})
						} catch (e) {
							return res.status(500).send(this.getErrorResponse(e));
						}
					}
				}
			}
			const csv = parse(writer);
			await createTheFile(stringToStream(csv), csvFilePath)
			const result = await this.triumphService.upload(files, user.companyId, true);

			const bLog = {} as any;
			bLog.companyId = user.companyId;
			bLog.userId = user.id;
			bLog.factor_Id = req.body.factor_Id;
			bLog.details = JSON.stringify(batchLog);
			const insertLogResult = await this.coInvoiceService.InsertFactorBatchLog(bLog);
			bLog.batchNumber=insertLogResult.data[0][0].batchNumber;
			bLog.message=result.message;
			const d = new Date();
			const issuedDate = `${d.getFullYear()}-${d.getMonth() +1}-${d.getDate()}`;
			for (const item of invoices) {
				const updateResult = await this.customerOrderService.saveCustomerOrder({
					customerOrderId: item.customerOrderId,
					status_Id: 11,
					userId: user.id
				});
				if (updateResult) {
					await this.coInvoiceService.saveCOInvoice({
						coInvoiceId:item.coInvoiceId,
						issuedDate,
						userId: user.id
					});
				}
			}
			res.send(bLog);
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async sendInvoiceAndOtherDocsToRTS(req: express.Request, res: express.Response): Promise<any> {
		try {

			const user = req.user as any;
			req.body.userId = user.id;

			const companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'Factor', 'RTS', true)

			if (companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length > 0
				&& companyIntegrationDetails.data[0]) {

				const ftpDetails = companyIntegrationDetails.data[0]

				const files = [];
				const invoices = req.body.invoices;
				const writer = [];
				const csvFileName = `${moment().format('MMDDYYYYhhmma')}.csv`;
				const csvFilePath = `./brokerdocs/${csvFileName}`

				const batchLog = [];

				for (const item of invoices) {

					// tslint:disable
					writer.push({
						'Client': ftpDetails.UserName,
						'Invoice#': item.loadNumber,
						'DebtorNo': item.customerName,
						'Debtor Name': item.customerName,
						'Load #': item.refNumber,
						'InvDate': item.invoicedDate ? moment(item.invoicedDate, moment.ISO_8601).format('MM/DD/YYYY') : moment().format('MM/DD/YYYY'),
						'InvAmt': item.invoiceAmount
					});

					item.filesArray = [];
					item.fileNames = 'Invoice';
					item.documents = [];

					if (req.body.documents && req.body.documents.length > 0) {
						item.documents = req.body.documents;
					} else {
						const params = {containerId: item.customerOrderId, containerName: 'customerorder'};
						const documentResults = await this.documentService.getContainerDocuments(params);
						item.documents = documentResults ? documentResults.data[0] : [];
					}

					req.body.addAttachment = true;
					req.body.coInvoiceId = item.invoiceId;
					req.body.coId = item.customerOrderId;

					if (req.body.isIncludeInvoice && (item.status === '' || item.status === 5 || item.status === 11)) {
						let invoicesResult = {} as any;
						const stops = [];
						let amount = 0;

						const invPrintresult = await this.coInvoiceService.getCOInvPrintByInvId(Number(item.coInvoiceId));

						const invoice = invPrintresult.data[0];
						invoicesResult = invoice[0];
						invoicesResult.accountReceivables = [];
						if (invoicesResult.receivablesCount > 0) {
							const arResult = await this.coAccountReceivableService.getAccountReceivablesByCOInvoiceId(Number(item.coInvoiceId));
							invoicesResult.accountReceivables = arResult.data[0];
							invoicesResult.totalARAmount = 0;
							for (const i of invoicesResult.accountReceivables) {
								amount += i.Amount;
							}
							invoicesResult.totalARAmount = amount;
						}

						const rdResult = await this.coRateDetailService.getCORateDetailsByCOId(Number(item.customerOrderId));
						invoicesResult.rateDetails = rdResult.data[0];

						const stopResult = await this.coStopService.getCOStopsByCOId(Number(item.customerOrderId));

						for (const stop of stopResult.data[0]) {
							stop.stopItems = (stop.stopItems ? JSON.parse(`[ ${stop.stopItems} ]`) : []);
							stops.push(stop);
						}

						invoicesResult.stops = stops;

						const htmlResult = await this.pdfService.generatePdf(invoiceHTML(invoicesResult));
						if (item.documents.length > 0) {
							const fileLoaction = `./brokerdocs/Invoice-${item.workOrderId}.pdf`;
							await createTheFile(htmlResult, fileLoaction)
							const filepath = fileLoaction.replace('\\', '/');
							item.filesArray.push(filepath);
							const docResult = await documentsPrint(item);
							for (const doc of docResult) {
								item.filesArray.push(doc.filePath);
								item.fileNames += `;${doc.fileName}`;
							}
							batchLog.push({
								invoice_Id: item.coInvoiceId,
								invoiceNumber: item.loadNumber,
								documents: item.fileNames
							});
						} else {
							const fileLocation = `./brokerdocs/${item.loadNumber}-${item.refNumber}_temp.pdf`;
							await createTheFile(htmlResult, fileLocation)
							item.filesArray.push(fileLocation);
							batchLog.push({
								invoice_Id: item.coInvoiceId,
								invoiceNumber: item.loadNumber,
								documents: 'Invoice'
							});
						}

						if (item.filesArray.length >= 1) {
							try {
								const fileLoaction = `./brokerdocs/${item.loadNumber}.pdf`;
								const stream = await PDFMerge(item.filesArray, {output: fileLoaction});
								files.push({
									fileName: `${item.loadNumber}.pdf`,
									filePath: fileLoaction
								});
								item.filesArray.forEach((file: any) => {
									fs.unlinkSync(file);
								})
							} catch (e) {
								return res.status(500).send(this.getErrorResponse(e));
							}
						}
					}

				}

				const csv = parse(writer);
				createTheFile(stringToStream(csv), csvFilePath)
				files.push({filePath: csvFilePath, fileName: csvFileName});
				const result = await this.rtsService.upload(files, ftpDetails);
				const bLog = {} as any;
				bLog.companyId = user.companyId;
				bLog.userId = user.id;
				bLog.factor_Id = req.body.factor_Id;
				bLog.details = JSON.stringify(batchLog);
				const insertLogResult = await this.coInvoiceService.InsertFactorBatchLog(bLog);
				bLog.batchNumber = insertLogResult.data[0][0].batchNumber;
				bLog.message = result.message;
				const d = new Date();
				const issuedDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
				for (const item of invoices) {
					const updateResult = await this.customerOrderService.saveCustomerOrder({
						customerOrderId: item.customerOrderId,
						status_Id: 11,
						userId: user.id
					});
					if (updateResult) {
						await this.coInvoiceService.saveCOInvoice({
							coInvoiceId: item.coInvoiceId,
							issuedDate,
							userId: user.id
						});
					}
				}
				res.send(bLog);
			}  else {
				res.status(500).send({ message : 'Company not integrated with RTS' })
			}

		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async sendInvoiceAndOtherDocsToOTR(req: express.Request, res: express.Response): Promise<any> {
		try {
			const files = [];
			const invoices = req.body.invoices;
			const writer = [];
			const csvFileName = `${moment().format('MMDDYYYYhhmma')}.csv`;
			const csvFilePath = `./brokerdocs/${csvFileName}`

			const batchLog = [];
			const user = req.user as any;
			req.body.userId = user.id;
			files.push({filePath: csvFilePath, fileName: csvFileName});
			for (const item of invoices) {
				writer.push({
					'Client': item.otrClientNumber,
					'Debtor Name': item.customerName,
					'DestinationCity': item.deliveryCity,
					'DestinationState': item.deliveryState,
					'InvDate': item.invoicedDate ? moment(item.invoicedDate, moment.ISO_8601).format('MM/DD/YYYY') : moment().format('MM/DD/YYYY'),
					'Invamt': item.invoiceAmount,
					'Invoice#': item.loadNumber,
					'MCNumber': item.mcNumber,
					'Pono': item.refNumber,
					'StartCity': item.pickupCity,
					'StartState': item.pickupState
				});

				item.filesArray = [];
				item.fileNames = 'Invoice';
				item.documents = [];

				if (req.body.documents && req.body.documents.length > 0) {
					item.documents = req.body.documents;
				} else {
					const params = {containerId: item.customerOrderId, containerName: 'customerorder'};
					const documentResults = await this.documentService.getContainerDocuments(params);
					item.documents = documentResults ? documentResults.data[0] : [];
				}
				req.body.addAttachment = true;
				req.body.coInvoiceId = item.invoiceId;
				req.body.coId = item.customerOrderId;
				if (req.body.isIncludeInvoice && (item.status === '' || item.status === 5 || item.status === 11)) {
					let invoicesResult = {} as any;
					const stops = [];
					let amount = 0;
					const invPrintresult = await this.coInvoiceService.getCOInvPrintByInvId(Number(item.coInvoiceId));

					const invoice = invPrintresult.data[0];
					invoicesResult = invoice[0];
					invoicesResult.accountReceivables = [];
					if (invoicesResult.receivablesCount > 0) {
						const arResult = await this.coAccountReceivableService.getAccountReceivablesByCOInvoiceId(Number(item.coInvoiceId));
						invoicesResult.accountReceivables = arResult.data[0];
						invoicesResult.totalARAmount = 0;
						for (const i of invoicesResult.accountReceivables) {
							amount += i.Amount;
						}
						invoicesResult.totalARAmount = amount;
					}

					const rdResult = await this.coRateDetailService.getCORateDetailsByCOId(Number(item.customerOrderId));
					invoicesResult.rateDetails = rdResult.data[0];

					const stopResult = await this.coStopService.getCOStopsByCOId(Number(item.customerOrderId));

					for (const stop of stopResult.data[0]) {
						stop.stopItems = (stop.stopItems ? JSON.parse(`[ ${stop.stopItems} ]`) : []);
						stops.push(stop);
					}

					invoicesResult.stops = stops;


					const htmlResult = await this.pdfService.generatePdf(invoiceHTML(invoicesResult));
					if (item.documents.length > 0) {
						const fileLoaction = `./brokerdocs/Invoice-${item.customerOrderId}.pdf`;
						await createTheFile(htmlResult, fileLoaction)
						const filepath = fileLoaction.replace('\\', '/');
						item.filesArray.push(filepath);
						const docResult = await documentsPrint(item);
						for (const doc of docResult) {
							item.filesArray.push(doc.filePath);
							item.fileNames += `;${doc.fileName}`;
						}
						batchLog.push({invoice_Id: item.coInvoiceId, invoiceNumber: item.loadNumber, documents: item.fileNames});
					} else {
						const fileLocation = `./brokerdocs/${item.loadNumber}-${item.refNumber}_temp.pdf`;
						await createTheFile(htmlResult, fileLocation)
						item.filesArray.push(fileLocation);
						batchLog.push({invoice_Id: item.coInvoiceId, invoiceNumber: item.loadNumber, documents: 'Invoice'});
					}

					if (item.filesArray.length >= 1) {
						try {
							const fileLoaction = `./brokerdocs/${item.loadNumber}-${item.refNumber}.pdf`;
							const stream = await PDFMerge(item.filesArray, {output: fileLoaction});
							files.push({
								fileName: `${item.loadNumber}-${item.refNumber}.pdf`,
								filePath: fileLoaction
							});
							deleteFiles(item.filesArray)
						} catch (e) {
							return res.status(500).send(this.getErrorResponse(e));
						}
					}
				}
			}
			const csv = parse(writer);
			createTheFile(stringToStream(csv), csvFilePath)
			const result = await this.otrService.upload(files, user.companyId, true);
			const bLog = {} as any;
			bLog.companyId = user.companyId;
			bLog.userId = user.id;
			bLog.factor_Id = req.body.factor_Id;
			bLog.details = JSON.stringify(batchLog);
			const insertLogResult = await this.coInvoiceService.InsertFactorBatchLog(bLog);
			bLog.batchNumber=insertLogResult.data[0][0].batchNumber;
			bLog.message=result.message;
			const d = new Date();
			const issuedDate = `${d.getFullYear()}-${d.getMonth() +1}-${d.getDate()}`;
			for (const item of invoices) {
				const updateResult = await this.customerOrderService.saveCustomerOrder({
					customerOrderId: item.customerOrderId,
					status_Id: 11,
					userId: user.id
				});
				if (updateResult) {
					await this.coInvoiceService.saveCOInvoice({
						coInvoiceId:item.coInvoiceId,
						issuedDate,
						userId: user.id
					});
				}
			}
			res.send(bLog);
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async sendInvoiceAndOtherDocsToWex(req: express.Request, res: express.Response): Promise<any> {
		try {
			const files = [];
			const invoices = req.body.invoices;
			const writer = [];
			const csvFileName = `${moment().format('MMDDYYYYhhmma')}.xlsx`;
			const csvFilePath = `./brokerdocs/${csvFileName}`

			const batchLog = [];
			const user = req.user as any;
			req.body.userId = user.id;

			files.push({filePath: csvFilePath, fileName: csvFileName});

			for (const item of invoices) {
				writer.push({
					'REFNO': item.refNumber,
					// tslint:disable-next-line:object-literal-sort-keys
					'AMOUNT': item.invoiceAmount,
					'NAME':item.customerName,
					'INV_DATE': item.invoicedDate ? moment(item.invoicedDate, moment.ISO_8601).format('MM/DD/YYYY') : moment().format('MM/DD/YYYY'),
					'INV_ID': item.loadNumber,
					'PO_NO': item.loadNumber
				});

				item.filesArray = [];
				item.fileNames = 'Invoice';
				item.documents = [];

				if (req.body.documents && req.body.documents.length > 0) {
					item.documents = req.body.documents;
				} else {
					const params = {containerId: item.customerOrderId, containerName: 'customerorder'};
					const documentResults = await this.documentService.getContainerDocuments(params);
					item.documents = documentResults ? documentResults.data[0] : [];
				}
				req.body.addAttachment = true;
				req.body.coInvoiceId = item.invoiceId;
				req.body.coId = item.customerOrderId;
				if (req.body.isIncludeInvoice && (item.status === '' || item.status === 5 || item.status === 11)) {
					let invoicesResult = {} as any;
					const stops = [];
					let amount = 0;

					const invPrintresult = await this.coInvoiceService.getCOInvPrintByInvId(Number(item.coInvoiceId));

					const invoice = invPrintresult.data[0];
					invoicesResult = invoice[0];
					invoicesResult.accountReceivables = [];
					if (invoicesResult.receivablesCount > 0) {
						const arResult = await this.coAccountReceivableService.getAccountReceivablesByCOInvoiceId(Number(item.coInvoiceId));
						invoicesResult.accountReceivables = arResult.data[0];
						invoicesResult.totalARAmount = 0;
						for (const i of invoicesResult.accountReceivables) {
							amount += i.Amount;
						}
						invoicesResult.totalARAmount = amount;
					}

					const rdResult = await this.coRateDetailService.getCORateDetailsByCOId(Number(item.customerOrderId));
					invoicesResult.rateDetails = rdResult.data[0];

					const stopResult = await this.coStopService.getCOStopsByCOId(Number(item.customerOrderId));

					for (const stop of stopResult.data[0]) {
						stop.stopItems = (stop.stopItems ? JSON.parse(`[ ${stop.stopItems} ]`) : []);
						stops.push(stop);
					}

					invoicesResult.stops = stops;

					const htmlResult = await this.pdfService.generatePdf(invoiceHTML(invoicesResult));
					if (item.documents.length > 0) {
						const fileLoaction = `./brokerdocs/Invoice-${item.customerOrderId}.pdf`;
						await createTheFile(htmlResult, fileLoaction)
						const filepath = fileLoaction.replace('\\', '/');
						item.filesArray.push(filepath);
						const docResult = await documentsPrint(item);
						for (const doc of docResult) {
							item.filesArray.push(doc.filePath);
							item.fileNames += `;${doc.fileName}`;
						}
						batchLog.push({invoice_Id: item.coInvoiceId, invoiceNumber: item.loadNumber, documents: item.fileNames});
					} else {
						const fileLocation = `./brokerdocs/${item.loadNumber}-${item.refNumber}_temp.pdf`;
						await createTheFile(htmlResult, fileLocation)
						item.filesArray.push(fileLocation);
						batchLog.push({invoice_Id: item.coInvoiceId, invoiceNumber: item.loadNumber, documents: 'Invoice'});
					}

					if (item.filesArray.length >= 1) {
						try {
							const fileLoaction = `./brokerdocs/${item.loadNumber}.pdf`;
							const stream = await PDFMerge(item.filesArray, {output: fileLoaction});
							files.push({
								fileName: `${item.loadNumber}.pdf`,
								filePath: fileLoaction
							});
							item.filesArray.forEach((file: any) => {
								fs.unlinkSync(file);
							})
						} catch (e) {
							return res.status(500).send(this.getErrorResponse(e));
						}
					}
				}
			}
			const worksheet = XLSX.utils.json_to_sheet(writer);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet);
			XLSX.writeFile(workbook, csvFilePath);
			const zipFileName = `${moment().format('MMDDYYYYhhmma')}.zip`;
			const zipFilePath = `./brokerdocs/${zipFileName}`;
			await createZipFile(files,zipFilePath);
			const result=await this.wexService.upload([{fileName:zipFileName,filePath:zipFilePath}],user.companyId,true);

			const bLog = {} as any;
			bLog.companyId = user.companyId;
			bLog.userId = user.id;
			bLog.factor_Id = req.body.factor_Id;
			bLog.details = JSON.stringify(batchLog);
			const insertLogResult = await this.coInvoiceService.InsertFactorBatchLog(bLog);
			bLog.batchNumber=insertLogResult.data[0][0].batchNumber;
			bLog.message=result.message;
			const d = new Date();
			const issuedDate = `${d.getFullYear()}-${d.getMonth() +1}-${d.getDate()}`;
			for (const item of invoices) {
				const updateResult = await this.customerOrderService.saveCustomerOrder({
					customerOrderId: item.customerOrderId,
					status_Id: 11,
					userId: user.id
				});
				if (updateResult) {
					await this.coInvoiceService.saveCOInvoice({
						coInvoiceId:item.coInvoiceId,
						issuedDate,
						userId: user.id
					});
				}
			}
			res.send(bLog);
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	public async getFactorLogList(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const user= req.user as any;

			req.body.companyId = user.companyId;
			const result = await this.coInvoiceService.getFactorLogList(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getfactorbatchlogLatest(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const user= req.user as any;

			const result = await this.coInvoiceService.getfactorbatchlogLatest(user);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default COInvoiceController;

const invoiceHTML = (result: any) => {
	const logourl = result.logoUrl ? `https://lircteksams.s3.amazonaws.com/${result.logoUrl}` : ``;
	let htmlString = '';
	htmlString += `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd"> <html lang="en" > <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta charset="UTF-8"> <title>Invoice</title> </head> <body style="color: #000 !important; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 1.42857143; background-color: #fff; margin: 20px;" bgcolor="#fff">
		<table style="width:100%;font-size:10px;font-family: Arial;"> <tr>${(result.showOnlyLogo ? `<td colspan="1" style="padding-right: 0px;" width="50%" valign="top"> <img style="align:top;max-height: 60px;" src="${logourl}"> </td>` : `<td style="padding-right: 0px;" valign="top"> <img style="align:top;max-height: 60px;" src="${logourl}"> </td> 
		<td style="padding-left: 0px;font-size:12px;text-align:left;" width="40%" valign="top">${(result.showCompanyName ? `<span > 
		<b style="font-size:18px;">${result.companyName}</b></span><br>` : '')} ${result.companyAddress1} &nbsp;${(result.companyAddress2 ? result.companyAddress2 : '')}<br> ${result.companyCity} , ${result.companyState}&nbsp; ${result.companyZip}
		${result.companyPhone ? `<br><b>Ph: </b>${result.companyPhone}` : ''} ${(result.ext ? `&nbsp;&nbsp; <b>EXT:</b>${result.ext}` : '')} &nbsp;&nbsp;&nbsp;${(result.companyFax ? `<br><b>Fax: </b>${result.companyFax}` : '')}
		${result.email ? `<br><b>Email: </b>${result.email}` : ''}  ${(result.mc ? `<br><b>MC: </b>${result.mc}` : '')}
		${(result.federalId ? `<br><b>Federal Id: </b>${result.federalId}` : '')}</td>`)}`;
		
	htmlString += ` <td align="left" style="font-size: 12px;text-align:right;"><b style="font-size: 28px;">INVOICE</b><br><b>Invoice # : </b>
		${result.invoiceNumber}<br><b>Issued Date : </b>${result.issuedDate}<br><b>Reference # : </b>${result.referenceNumber} ${(result.isFullLoad && !result.splitFullLoad && result.truckNumber ? `<br><b>Truck # : </b>${result.truckNumber}` : '')}  ${(result.isFullLoad && !result.splitFullLoad && result.showDriverName ? `<br><b>Driver Name : </b> ${(result.driver1Name ? result.driver1Name : '')}<br> ${(result.driver2Name ? result.driver2Name : '')}`  : '')} </td></tr></table>`;
		
	htmlString += ` <br><table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%;font-size:10px; "> <tr style="height:16px;"> <th style="font-size:12px;border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 2px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;" width="50%">Bill To:</th> <th style="font-size:12px;border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 2px; background: #eee; border-top: 1px solid #bbb; text-align: left;border-top-right-radius: 6px;" width="50%">Remit To:</b></p></th></tr><tr><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;"> <b style="font-size: 12px;">${result.customerName} </b><br>${result.customerAddress1} ${(result.customerAddress2 ? result.customerAddress2 :'')} <br> ${result.customerCity} ${result.customerState}  ${result.customerZip}</td> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;"><b style="font-size: 12px;">${(result.remitTo === 'Billing' ? `${result.companyName ? result.companyName : ''} <br> C/O ${result.remitToName ? result.remitToName : ''}` : (result.remitToName ? result.remitToName : ''))}</b><br> ${result.remitToAddress1} ${result.remitToAddress2 ? result.remitToAddress2 : ''} <br> ${result.remitToCity} ${result.remitToState}  ${result.remitToZip} </td></tr></table>
        ${stopsHTML(result.stops,result.isDate24HrFormat)}   
        ${(result.isFullLoad && !result.splitFullLoad && result.showDriverName && result.truckNumber ? `<br><table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%; font-size:11px;"> <tr> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;" width="55%">Drivers</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Trucks</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Trailers</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;border-top-right-radius: 6px;">Payment Terms</th> </tr></table>` : '')}        
		<br><br><table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%; font-size:11px;"> <tr> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;" width="55%">Description</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Units</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Per</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: right;border-top-right-radius: 6px;">Amount</th> </tr>
		${rateDetails(result.rateDetails)} 
		 ${accountReceivables(result.accountReceivables)} 
		<tr><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;" colspan="3" align="right" ><b style="font-size: 12px;">Remaining Balance</b></td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;" align="right"><b style="font-size: 12px;">$${(result.isFullyPaid ? (0.00).toFixed(2) : (result.amount - (result.totalARAmount > 0 ? result.totalARAmount : 0)).toFixed(2))}</b></td> </tr></table> ${(result.notes ? `<br><br><b>Notes:</b>&nbsp; ${result.notes}` : '')}  ${(result.remitTo === 'Factor' ? `<br><p>Notice of Assignment This Account has been assigned and must be paid only to <br> ${result.remitToName} <br> ${result.remitToAddress1}  ${result.remitToAddress2 ? result.remitToAddress2 : ''} <br> ${result.remitToCity} ${result.remitToState} ${result.remitToZip} <br> ${result.remitToName} must be promptly notified at ${(result.factorPhone ? result.factorPhone : `-`)}  of any claims or offsets against this invoice</p>`: '')} <footer><p style="text-align: end;">Powered by: <a target="blank" style="vertical-align: sub;" href="https://www.awako.ai/"><img style="height: 19px;" src="https://app.awako.ai/images/logos/logo-2.png"></a></p></footer></body></html>`;

	return htmlString;
};

// tslint:disable-next-line: cyclomatic-complexity
const stopsHTML = (stops: any,isDate24HrFormat: any) => {
	let htmlString = `<br>`;

	if (stops.length > 0) {
		htmlString += `<table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%;font-size:10px; ">`;
		htmlString += `<tr> <th style="font-size:12px;border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 2px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;border-top-right-radius: 6px;padding-top:2px;">Stops </th></tr>`;
		
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
		
		htmlString += `<tr> <td><b style="font-size: 12px;">${stop.stopNumber}. ${stop.name}</b>  &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp; <b style="font-size:10px;text-transform: uppercase;">${stop.stopType}</b> <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="padding-top:5px;font-size: 10px">${stop.address1} ${stop.address2 ? stop.address2 : ''}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${stop.city}, ${stop.state} ${stop.zip} </span> ${(stop.phone ? `<br><b>Ph: </b>${stop.phone}` : '')}</td><td style="width:45%; font-size: 11px;" valign="top"><b style="font-size: 12px;">${typeText} #: </b> ${(stop.poNumber ? stop.poNumber : '' )} ${( stop.appNumber ? `<br><b style="font-size: 12px;">Appt #: </b>${stop.appNumber}` : '')} <br><b style="font-size: 12px;">Date & Time: </b> ${moment(stop.fromDate).format('MM/DD/YYYY')}  ${((stop.toDate && (stop.toDate !== '0000-00-00 00:00:00')) ? `- ${moment(stop.toDate).format('MM/DD/YYYY')}` : '')}  ${((stop.fromTime && (stop.fromTime !== '0000-00-00 00:00:00')) ? `${(isDate24HrFormat ? moment(stop.fromTime).format('HH:mm') : moment(stop.fromTime).format('hh:mm a'))}` : '')}  ${((stop.toTime && (stop.toTime !== '0000-00-00 00:00:00')) ? `- ${(isDate24HrFormat ? moment(stop.toTime).format('HH:mm') : moment(stop.toTime).format('hh:mm a'))}` : '')}  ${(stop.shippingHours ? `<br><b>Shipping Hours: </b>${stop.shippingHours}` : '')}</td></tr>`;
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

const documentsPrint = async (invoice: any) => {

	const files = [] as any;

	if (invoice.documents.length > 0) {
		const documents  = handleDuplicateDocuments(invoice.documents);
		for (const item of documents) {

			if (item.url) {
				const url = `http://lircteksams.s3.amazonaws.com/${item.url}`;
				item.extName = url.substr(url.length - 4, 4);
				if (item.extName === '.pdf' || item.extName === '.PDF') {
					AWS.config.update({
						accessKeyId: ConfigService.configs.aws.AWSAccessKeyId,
						secretAccessKey: ConfigService.configs.aws.secretKey

					});
					const s3Bucket = new AWS.S3({
						params: {
							Bucket: ConfigService.configs.aws.bucket,
							Key: item.url,
							secretAccessKey: ConfigService.configs.aws.secretKey
						}
					});
					const params: any = {
						Key: item.url
					};				

					try {
						const res = await s3Bucket.getObject(params).promise();
						const stream:any = bufferToStream(res.Body);
						const filePath = (`./brokerdocs/${item.fileName.replace(' ','')}-${invoice.customerOrderId}.pdf`).replace('\\','/');
						await createTheFile(stream, filePath)
						files.push({filePath, fileName: item.fileName});
					} catch (err) {
						return err;
					}								
				}
			}
		}
		return files;
	} else {		
		return files;
	}
}; 
