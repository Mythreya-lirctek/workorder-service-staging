import express from 'express';
import { BaseController } from './base_controller';
import COStopItemService from '../service/costopitem/costopitem.service';
import COStopService from '../service/costop/costop.service';
import CORateDetailService from '../service/coratedetail/coratedetail.service';
import COCarrierLineItemService from '../service/cocarrierlineitem/cocarrierlineitem.service';
import CustomerOrderService from '../service/customerorder/customerorder.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import PDFService from '../service/pdf/pdf.service';
import { parse } from 'json2csv';
import coRateConfirmationHTML from '../service/pdf/templates/corateconfirmation.template';
import EmailService from '../service/email/email.service';


export default class CustomerOrderController extends BaseController {
	private coRateDetailService: CORateDetailService;
	private activityLogService: ActivityLogService;
	private coCarrierLineItemService: COCarrierLineItemService;
	private coStopItemService: COStopItemService;
	private coStopService: COStopService;
	private customerOrderService: CustomerOrderService;
	private pdfService: PDFService;
	private emailService:EmailService;

	constructor() {
		super();
		this.coRateDetailService = new CORateDetailService();
		this.coCarrierLineItemService = new COCarrierLineItemService();
		this.coStopItemService = new COStopItemService();
		this.coStopService = new COStopService();
		this.customerOrderService = new CustomerOrderService();	
		this.activityLogService = new ActivityLogService;
		this.pdfService = new PDFService();
		this.emailService=new EmailService();
	}
	
	public async validateRefnoCusComIdInCO(req: express.Request, res: express.Response): Promise<any> {
		try {			
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const {customerId, refNumber } = req.params;
			req.body.customerId = customerId;
			req.body.refNumber = refNumber;
			
			const result = await this.customerOrderService.validateRefnoCusComIdInCO(req.body);
			res.send(this.getSuccessResponse(result.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async addCustomerOrderInfo(req: express.Request, res: express.Response): Promise<any> {	     
	try {	
	const { customerOrder, stops, rateDetails, carrierLineItems } = req.body.customerOrderInfo;

		const user = req.user as any;
		customerOrder.companyId = user.companyId;
		customerOrder.userId = user.id;
		
		let isExisted = await this.customerOrderService.validateRefnoCusComIdInCO(customerOrder);
		isExisted = isExisted.data[0][0];
	
		if (isExisted['0'] === 0) {
		let createdCO = await this.customerOrderService.addCustomerOrder(customerOrder);
		createdCO = createdCO.data[0][0];      				

		let rateDetailsResponse;
		const processRateDetails = [];
		if (rateDetails) {
		for (const rateDetail of rateDetails) {
			rateDetail.userId = user.id;
			rateDetail.customerOrder_Id = createdCO.cid;
			processRateDetails.push(this.coRateDetailService.addCoRateDetail(rateDetail));
		}
		rateDetailsResponse = await Promise.all(processRateDetails);
		}      

		let carrierLineItemsResponse;
		const processCarrierLineItemsDetails = [];
		if (carrierLineItems) {
		for (const item of carrierLineItems) {
			item.userId = user.id;
			item.customerOrder_Id = createdCO.cid;
			item.carrier_Id = customerOrder.carrier_Id;
			processCarrierLineItemsDetails.push(this.coCarrierLineItemService.addCoCarrierLineItem(item));
		}
		carrierLineItemsResponse = await Promise.all(processCarrierLineItemsDetails);
		}

		let stopsResponse;
		const processStops = [];      
		if (stops) {
		for (const stop of stops) {
		stop.userId = user.id;
		stop.customerOrder_Id = createdCO.cid;     
		stop.isCOStop = 1;     

		const addedStop =  await this.coStopService.addCoStop(stop);
		if(stop.coStopItems && stop.coStopItems.length > 0) {				
			for (const item of stop.coStopItems) {
			item.userId = user.id;
			item.coStops_Id = addedStop.data.insertId;
			const addedStopItem = this.coStopItemService.addCOStopItem(item);            				
			processStops.push(addedStopItem);
			}          
		}
		stopsResponse = await Promise.all(processStops);
		processStops.push(addedStop);
		}
		stopsResponse = await Promise.all(processStops);
		}

		res.send(this.getSuccessResponse({ id: createdCO.cid, coNum: createdCO.cnum, message: 'Load Added successfully!' }));
		
		}            
		else {          
		res.send(this.getSuccessResponse({ result: 'Load Already Exists in the system.' }));
		}
	} catch (e) {         
		res.status(500).send(this.getErrorResponse(e));
	}
  }
  public async getCoListLoad(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.customerOrderService.getCoListLoad(req.body);
			res.send(this.getSuccessResponse({data:result.data[0],totalRecords: result.data[1][0].totalRecords}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCoListLoadsGroupby(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;

			const result = await this.customerOrderService.getCoListLoadsGroupby(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

		
	public async getCOLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.customerOrderService.getCOLoads(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getCOALLLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;

			const lane1Req = req.body;	
			lane1Req.status = 'unassigned';			
			const lane1Data = await this.customerOrderService.getCOLoads(lane1Req);
			
			const lane2Req = req.body;	
			lane2Req.status = 'dispatched';	
			const lane2Data = await this.customerOrderService.getCOLoads(lane2Req);
			
			const lane3Req = req.body;	
			lane3Req.status = 'in transit';			
			const lane3Data = await this.customerOrderService.getCOLoads(lane3Req);
			
			const lane4Req = req.body;	
			lane4Req.status = 'delivered';	
			const lane4Data = await this.customerOrderService.getCOLoads(lane4Req);
			
			const result = {} as any;
			
			result.lane1Data = { data: lane1Data.data[0], totalRecords: lane1Data.data[1][0].totalRecords};
			result.lane2Data = { data: lane2Data.data[0], totalRecords: lane2Data.data[1][0].totalRecords};
			result.lane3Data = { data: lane3Data.data[0], totalRecords: lane3Data.data[1][0].totalRecords};
			result.lane4Data = { data: lane4Data.data[0], totalRecords: lane4Data.data[1][0].totalRecords};
			
			res.send(this.getSuccessResponse({ data: result}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getCOLoadsgroupby(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;

			const result = await this.customerOrderService.getCOLoadsgroupby(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCOAllLoadsgroupby(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const lane1Req = req.body;
			lane1Req.columnName = req.body.lane1Groupby;			
			lane1Req.status = 'unassigned';			
			const lane1Data = await this.customerOrderService.getCOLoadsgroupby(lane1Req);
			
			const lane2Req = req.body;
			lane2Req.columnName = req.body.lane2Groupby;			
			lane2Req.status = 'dispatched';			
			const lane2Data = await this.customerOrderService.getCOLoadsgroupby(lane2Req);
			
			const lane3Req = req.body;
			lane3Req.columnName = req.body.lane3Groupby;			
			lane3Req.status = 'in transit';			
			const lane3Data = await this.customerOrderService.getCOLoadsgroupby(lane3Req);
			
			const lane4Req = req.body;
			lane4Req.columnName = req.body.lane1Groupby;			
			lane4Req.status = 'delivered';			
			const lane4Data = await this.customerOrderService.getCOLoadsgroupby(lane4Req);
			
			const result = {} as any;
			
			result.lane1Data = lane1Data.data[0];
			result.lane2Data = lane2Data.data[0];
			result.lane3Data = lane3Data.data[0];
			result.lane4Data = lane4Data.data[0];
			
			res.send(this.getSuccessResponse({ data: result }));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCOListLoadsExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
						
			const result = await this.customerOrderService.getCoListLoad(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLCOListReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['coNumber','referenceNumber','customerName', 'carrierName','equipmentType','pickupCity','pickupState', 'deliveryCity', 'deliveryState','pickupFromDate','deliveryFromDate','statusName'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('COList.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getCarrierAmountBrokerage(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resultt = await this.customerOrderService.getCarrierAmountBrokerage(req.body);
			res.send(this.getSuccessResponse(resultt.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async saveCustomerOrder(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {customerOrderId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.customerOrderId = customerOrderId;

			const result = await this.customerOrderService.saveCustomerOrder(req.body);
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'CustomerOrder',
				module_Id: customerOrderId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCOdetailsbyCOId(req: express.Request, res: express.Response): Promise<any> {
		try {			
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const {coId } = req.params;
			req.body.coId = coId;
			
			const coDetails = [] as any;
			const legs = [] as any;
			
			let result = await this.customerOrderService.getCOdetailsbyCOId(req.body);
			result = result.data;
			try {
				result[0][0].stops = result[0][0] ? JSON.parse(`[${result[0][0].stops}]`) : [];
			} catch(e) {
				result[0][0].stops = [];
			}
			
			for (const item of result[1]) {
				try {
					item.stops =  item ? JSON.parse(`[${item.stops}]`) : [];
				} catch(e) {
					item.stops = [];
				}
				legs.push(item);
			}
			result[0][0].legs = legs;
			res.send(this.getSuccessResponse(result[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
 	}
	 
	 public async COStatusChange(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {			
			const user= req.user as any;
			req.body.userId = user.id;
			const result = await this.customerOrderService.COStatusChange(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'CustomerOrder',
				module_Id: req.body.customerOrder_Id,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async sendRateConfirmation(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const user= req.user as any;
			req.body.userId = user.id;
			const rateConformationPdf = await this.generateRateConfirmationPdf(req.body);
			let companyInfo =  await this.customerOrderService.getCompanyInfoById(user.companyId);
			if(companyInfo.data.length>0&&rateConformationPdf){
				companyInfo=companyInfo.data[0];
				const logoUrl = (companyInfo.logoUrl ? `<img class="left fixedwidth" border="0" src="https://lircteksams.s3.amazonaws.com/${companyInfo.logoUrl}" alt="Logo" title="Logo"style="text-decoration: none; -ms-interpolation-mode: bicubic;border: none; width: auto; height: 60px; display: block;"></img>` : '')
				const toEmail = req.body.from;
				const coId =  req.body.co_Id;
				const bodyHtml =`<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="X-UA-Compatible" content="IE=edge"><link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css"><style type="text/css">body{margin:0;padding:0;-webkit-print-color-adjust:exact}a{color:white}table,td,tr{vertical-align:top;border-collapse:collapse}*{line-height:inherit}a[x-apple-data-detectors=true]{color:inherit !important;text-decoration:none !important}</style><style type="text/css" id="media-query">@media (max-width: 670px){.block-grid,.col{min-width:320px !important;max-width:100% !important;display:block !important}.block-grid{width:100% !important}.col{width:100% !important}.col>div{margin:0 auto}img.fullwidth,img.fullwidthOnMobile{max-width:100% !important}.no-stack .col{min-width:0 !important;display:table-cell !important}.no-stack.two-up .col{width:50% !important}.no-stack .col.num4{width:33% !important}.no-stack .col.num8{width:66% !important}.no-stack .col.num4{width:33% !important}.no-stack .col.num3{width:25% !important}.no-stack .col.num6{width:50% !important}.no-stack .col.num9{width:75% !important}.video-block{max-width:none !important}.mobile_hide{min-height:0px;max-height:0px;max-width:0px;display:none;overflow:hidden;font-size:0px}.desktop_hide{display:block !important;max-height:none !important}}</style></head><body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #F6F5FF;"><table class="nl-container" style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #F6F5FF; width: 100%;" cellpadding="0" cellspacing="0" role="presentation" width="100%" bgcolor="#F6F5FF" valign="top"><tbody><tr style="vertical-align: top;" valign="top"><td style="word-break: break-word; vertical-align: top;" valign="top"><div style="background-color:transparent;"><div class="block-grid " style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:25px; padding-bottom:5px; padding-right: 20px; padding-left: 20px;"><div class="img-container left fixedwidth" align="left" style="padding-right: 5px;padding-left: 5px;display: flex;"><div style="width: 40%;"> <a href="#" target="_blank" style="outline:none" tabindex="-1">${logoUrl}</a></div><div style="width: 60%;text-align: right;font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif;color: #454562"><h2 style="margin-bottom: 5px;">${companyInfo.name}</h2><p style="font-size: 12px; line-height: 2.2; word-break: break-word; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; mso-line-height-alt: 14px; margin: 0;"> <span style="font-size: 12px;">${companyInfo.address1}</span></p><p style="font-size: 12px; line-height: 2.2; word-break: break-word; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; mso-line-height-alt: 14px; margin: 0;"> <span style="font-size: 12px;">${companyInfo.city}, ${companyInfo.state}-${companyInfo.zip}</span></p></div><div style="font-size:1px;line-height:5px">&nbsp;</div></div></div></div></div></div></div></div><div style="background-color:transparent;"><div class="block-grid " style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:0px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;"><div class="img-container center autowidth fullwidth" align="center"><img class="center autowidth fullwidth" align="center" border="0" src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/556/Top.png" alt="Image" title="Image" style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 100%; max-width: 650px; display: block;" width="650"></div></div></div></div></div></div></div><div style="background-color:transparent;"><div class="block-grid " style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #FFFFFF;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 30px; padding-left: 30px;"><div style="color:#454562;font-family:Roboto, Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;"><div style="line-height: 1.2; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; font-size: 12px; color: #454562; mso-line-height-alt: 14px;"><p style="line-height: 1.2; text-align: center; font-size: 34px; word-break: break-word; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; mso-line-height-alt: 41px; margin: 0;"> <span style="font-size: 30px;text-transform: uppercase;">${req.body.subject }</span></p></div></div><table class="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" role="presentation" valign="top"><tbody><tr style="vertical-align: top;" valign="top"><td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top"><table class="divider_content" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 3px solid #BBBBBB; width: 100%;" align="center" role="presentation" valign="top"><tbody><tr style="vertical-align: top;" valign="top"><td style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top"><span></span></td></tr></tbody></table></td></tr></tbody></table><table class="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" role="presentation" valign="top"><tbody><tr style="vertical-align: top;" valign="top"><td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 1px; padding-right: 10px; padding-bottom: 1px; padding-left: 10px;" valign="top"><table class="divider_content" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 10px; width: 100%;" align="center" role="presentation" height="10" valign="top"><tbody><tr style="vertical-align: top;" valign="top"><td style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" height="10" valign="top"><span></span></td></tr></tbody></table></td></tr></tbody></table><div style="color:#555555;font-family:Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif;line-height:1.5;padding-top:0px;padding-right:10px;padding-bottom:10px;padding-left:10px;"><div style="font-size: 14px; line-height: 1.5; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; color: #555555; mso-line-height-alt: 21px;"><p style="font-size: 14px; line-height: 1.5; word-break: break-word; text-align: left; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; mso-line-height-alt: 21px; margin: 0;">${req.body.body}</p></div></div></div></div></div></div></div></div>
					<div style="background-color:transparent;"><div class="block-grid " style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #FFFFFF;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 30px; padding-left: 30px;"><table class="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" role="presentation" valign="top"><tbody><tr style="vertical-align: top;" valign="top"><td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top"><table class="divider_content" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 10px; width: 100%;" align="center" role="presentation" height="10" valign="top"><tbody><tr style="vertical-align: top;" valign="top"><td style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" height="10" valign="top"><span></span></td></tr></tbody></table></td></tr></tbody></table></div></div></div></div></div></div><div style="background-color:transparent;"><div class="block-grid " style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #6C63FF;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:#6C63FF;background-image:url(https://d1oco4z2z1fhwp.cloudfront.net/templates/default/556/bg_cta.jpg);background-position:top center;background-repeat:no-repeat"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:10px; padding-bottom:10px; padding-right: 30px; padding-left: 30px;"><div style="color:#555555;font-family:Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;"><div style="font-size: 14px; line-height: 1.2; color: #555555; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; mso-line-height-alt: 17px;"><p style="font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 17px; margin: 0;"> &nbsp;</p><p style="font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 17px; margin: 0;"> <span style="font-size: 14px; color: #ffffff;"><strong>Any Questions?&nbsp; &nbsp; &nbsp; &nbsp;</strong><span style="font-size: 16px;">Email:</span><strong style="color:white">&nbsp;${(companyInfo.email ? companyInfo.email : '-')}&nbsp; &nbsp; or&nbsp;&nbsp; </strong><span style="font-size: 16px;">Call:</span><strong>&nbsp;${(companyInfo.phone ? companyInfo.phone : '-')}</strong></span></p></div></div></div></div></div></div></div></div><div style="background-color:transparent;"><div class="block-grid " style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:0px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;"><div class="img-container center autowidth fullwidth" align="center" style="padding-right: 0px;padding-left: 0px;"><img class="center autowidth fullwidth" align="center" border="0" src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/556/Btm_blu.png" alt="Image" title="Image" style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 100%; max-width: 650px; display: block;" width="650"></div></div></div></div></div></div></div><div style="background-color:transparent;"><div class="block-grid " style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:35px; padding-bottom:25px; padding-right: 25px; padding-left: 25px;"><div class="img-container center fixedwidth" align="center" style="padding-right: 0px;padding-left: 0px;"><a href="https://awako.ai/" target="_blank" style="outline:none" tabindex="-1"> <img class="center fixedwidth" align="center" border="0" src="https://app.awako.ai/images/logos/logo-2.png" alt="Image" title="Image" style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: none; width: 100%; max-width: 360px; display: block;" width="360"></a></div><table class="social_icons" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;" valign="top"><tbody><tr style="vertical-align: top;" valign="top"><td style="word-break: break-word; vertical-align: top; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top"><table class="social_table" align="center" cellpadding="0" cellspacing="0" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-tspace: 0; mso-table-rspace: 0; mso-table-bspace: 0; mso-table-lspace: 0;" valign="top"><tbody><tr style="vertical-align: top; display: inline-block; text-align: center;" align="center" valign="top"><td style="word-break: break-word; vertical-align: top; padding-bottom: 5px; padding-right: 3px; padding-left: 3px;" valign="top"><a href="https://www.facebook.com/pages/category/Computer-Company/Lirctek-126284402102499/" target="_blank"><img width="32" height="32" src="https://d2fi4ri5dhpqd1.cloudfront.net/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" alt="Facebook" title="Facebook" style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: none; display: block;"></a></td><td style="word-break: break-word; vertical-align: top; padding-bottom: 5px; padding-right: 3px; padding-left: 3px;" valign="top"><a href="https://twitter.com/LiRCTek" target="_blank"><img width="32" height="32" src="https://d2fi4ri5dhpqd1.cloudfront.net/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" alt="Twitter" title="Twitter" style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: none; display: block;"></a></td><td style="word-break: break-word; vertical-align: top; padding-bottom: 5px; padding-right: 3px; padding-left: 3px;" valign="top"><a href="https://www.linkedin.com/company/28533711/admin/" target="_blank"><img width="32" height="32" src="https://d2fi4ri5dhpqd1.cloudfront.net/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" alt="LinkedIn" title="LinkedIn" style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: none; display: block;"></a></td></tr></tbody></table></td></tr></tbody></table></div></div></div></div></div></div><div style="background-color:#FFFFFF;"><div class="block-grid " style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:15px; padding-right: 20px; padding-left: 20px;"><div style="color:#6B6B6B;font-family:Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;"><div style="font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.2; color: #6B6B6B; mso-line-height-alt: 14px;">
					<p style="font-size: 12px; line-height: 1.2; text-align: center; word-break: break-word; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; mso-line-height-alt: 14px; margin: 0;"> <span style="font-size: 12px;">6518 Lonetree Blvd Suite# 1050,Rocklin CA 95765</span></p><p style="font-size: 14px; line-height: 1.2; text-align: center; word-break: break-word; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; mso-line-height-alt: 17px; margin: 0;"> &nbsp;</p><p style="font-size: 14px; line-height: 1.2; text-align: center; word-break: break-word; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; mso-line-height-alt: 17px; margin: 0;"> PH: <strong>(916) 378 4747&nbsp;</strong>&nbsp;&nbsp;Email:&nbsp;<strong>info@etruckingsoft.com&nbsp;</strong>&nbsp;&nbsp;Website:&nbsp;<strong>www.awako.ai&nbsp;</strong></p><p style="font-size: 14px; line-height: 1.2; text-align: center; word-break: break-word; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; mso-line-height-alt: 17px; margin: 0;"> &nbsp;</p><p style="font-size: 14px; line-height: 1.2; text-align: center; word-break: break-word; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; mso-line-height-alt: 17px; margin: 0;"> All rights reserved.&nbsp; &nbsp; Made with&nbsp;<span style="font-size: 14px; color: #c059ff;">❤</span>&nbsp;</p></div></div></div></div></div></div></div></div></td></tr></tbody></table></body></html>`;
				if(req.body.emails){
					const bodyBuffer = await rateConformationPdf.body();
					const message = {
						body:bodyHtml,
						buffers:bodyBuffer,
						emails:req.body.emails.split(';'),
						fileName:'RateConfirmation.pdf',
						fromEmail:toEmail,
						subject:req.body.subject

					}
					this.emailService.emailservice(message);
					this.customerOrderService.addCoRateConSentLog(
						{
							coRelay_Id:req.body.coRelay_Id,
							co_Id:coId,
							emails:req.body.emails
						}
					)
					res.send(this.getSuccessResponse({message: 'Email sent successfully' , status: 'Success'}));
				}
			}
			else {
				res.status(500).send(this.getSuccessResponse({message: 'Email not sent successfully' , status: 'Failed'}));
			}

		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async rateConPrint(req: express.Request, res: express.Response): Promise<any> {
		try{
			const rateConformationPdf = await this.generateRateConfirmationPdf(req.body);
			rateConformationPdf.pipe(res)
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}

	}

	public async getCOCustomerSummary(req: express.Request, res: express.Response): Promise<any> {
		try {			
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.customerOrderService.getCOCustomerSummary(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
			
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getCOCarrierSummary(req: express.Request, res: express.Response): Promise<any> {
		try {			
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.customerOrderService.getCOCarrierSummary(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
			
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	private async generateRateConfirmationPdf(req:any):Promise<any>{
		const result = {} as any;
		const coRateDetails = await  this.customerOrderService.getCORateConPrintDetails(req);
		result.rateCon = coRateDetails.data[0][0];
		result.lineItems = [];
		if (result.rateCon.carrierId > 0) {
			if (req.coRelay_Id) {
				const coCarrierLineItemsByRelayId = await this.customerOrderService.getCOCarrierlineitemsByRelayId(req);
				result.lineItems = coCarrierLineItemsByRelayId.data[0];

			}
			else {
				const coCarrierLineItemsByCoId = await this.customerOrderService.getCOCarrierlineitemsByCOId(req);
				result.lineItems = coCarrierLineItemsByCoId.data[0];
			}
		}
		if (req.coRelay_Id) {
			const coCarrierLineItemsByRelayId = await this.customerOrderService.getCOStopsByRelayId(req);
			const stopResult = coCarrierLineItemsByRelayId.data[0];
			for (const stop of stopResult){
				try {
					stop.stopItems = (stop.stopItems ? JSON.parse(`[${stop.stopItems}]`):[]);
				} catch (e) {
					stop.stopItems = [];
				}
			}
			result.stops = stopResult;


		}
		else {
			const coCarrierLineItemsByCoId = await this.customerOrderService.getCOStopsByCOId(req.co_Id);
			const stopResult = coCarrierLineItemsByCoId.data[0];
			for (const stop of stopResult){
				try {
					stop.stopItems = (stop.stopItems ? JSON.parse(`[${stop.stopItems}]`):[]);
				} catch (e) {
					stop.stopItems = [];
				}
			}
			result.stops = stopResult;
		}
		if (result.lineItems.length > 0) {
			const flatfee = result.lineItems.find( (item:any)=>{
				return (item.name === 'Flat/Line Haul');
			});

			if (flatfee && flatfee.amount > 0 && result.rateCon.dispatchPCT > 0) {
				result.lineItems.push({
					amount: parseFloat((flatfee.amount * result.rateCon.dispatchPCT / 100).toFixed(2)),
					name: 'DispatchFee',
					per: result.rateCon.dispatchPCT,
					units: null
				});
			}
		}
		const  rateConfirmation = coRateConfirmationHTML(result);
		const pdfResponse = await this.pdfService.generatePdf(rateConfirmation);

		return pdfResponse;

	}


}


const exportHTMLCOListReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `CO List Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>coNumber</td><td>ReferenceNumber</td><td>customerName</td><td>carrierName</td><td>equipmentType</td><td>pickupcity</td><td>pickupstate</td><td>deliveryCity</td><td>deliveryState</td><td>pickupFromdate</td><td>deliveryFromdate</td><td>statusName</tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.coNumber ? item.coNumber : ''}</td><td>${item.referenceNumber ? item.referenceNumber : ''}</td><td>${item.customerName ? item.customerName : ''}</td><td>${item.carrierName ? item.carrierName : ''}</td><td>${item.equipmentType ? item.equipmentType : ''}</td><td>${item.pickupCity ? item.pickupCity : ''}</td><td> ${item.pickupState ? item.pickupState : ''}</td><td>${item.deliveryCity ? item.deliveryCity :''} </td><td>${item.deliveryState ? item.deliveryState : ''}</td><td>${item.pickupFromDate ? item.pickupFromDate : ''}</td><td>${item.deliveryFromDate ? item.deliveryFromDate : ''}</td><td>${item.statusName ? item.statusName : ''}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};

