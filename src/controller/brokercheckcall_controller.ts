import express from 'express';
import { BaseController } from './base_controller';
import BrokerCheckCallService from '../service/brokercheckcall/brokercheckcall.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import PDFService from '../service/pdf/pdf.service';
import { parse } from 'json2csv';

class BrokerCheckCallController extends BaseController {
	private brokerCheckCallService: BrokerCheckCallService;
	private activityLogService: ActivityLogService;
	private pdfService: PDFService;
	constructor() {
		super();
		this.brokerCheckCallService = new BrokerCheckCallService();
		this.activityLogService = new ActivityLogService();
		this.pdfService = new PDFService();
	}

	public async addBrokerCheckCall(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.brokerCheckCallService.addBrokerCheckCall(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'BrokerCheckCall', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveBrokerCheckCall(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {brokerCheckCallId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.brokerCheckCallId = brokerCheckCallId;

			const result = await this.brokerCheckCallService.saveBrokerCheckCall(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'BrokerCheckCall',
				module_Id: brokerCheckCallId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getBrokerCheckCallsbyWOId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.brokerCheckCallService.getBrokerCheckCallsbyWOId(req.body.workOrder_Id);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getBrokerCheckCallexistReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.brokerCheckCallService.getBrokerCheckCallexistReport(req.body);
			res.send(this.getSuccessResponse({data:result.data[0],totalRecords : result.data[1][0].totalRecords}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getBrokerCheckCallexistReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.brokerCheckCallService.getBrokerCheckCallexistReport(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLBrokerCheckCallExistReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['workOrderNumber','refNumber','pickupDate','deliveryDate','pickupFacility','deliveryFacility','status','callTime'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('brokerCheckcallexistReport.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getBrokerCheckCallNotexistReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.brokerCheckCallService.getBrokerCheckCallNotexistReport(req.body);
			res.send(this.getSuccessResponse({data:result.data[0],totalRecords:result.data[1][0].totalRecords}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getBrokerCheckCallNotexistReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.brokerCheckCallService.getBrokerCheckCallNotexistReport(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLBrokerCheckCallNotExistReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['workOrderNumber','refNumber','pickupDate','deliverypDate','pickupFacility','deliveryFacility','status'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('brokerCheckcallnotexistReport.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
}

export default BrokerCheckCallController;

const exportHTMLBrokerCheckCallExistReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `BrokerCheck Call Exist Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>workordernumber</td><td>refNumber</td><td>pickupDate</td><td>deliveryDate</td><td>pickupFacility</td><td>deliveryFacility</td><td>status</td><td>callTime</td></td>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.workordernumber ? item .workordernumber : ''}</td><td>${item.refNumber ? item .refNumber : ''}</td><td>${item.pickupDate ? item .pickupDate : ''}</td><td>${item.deliveryDate ? item .deliveryDate : ''}</td><td>${item.pickupFacility ? item .pickupFacility : ''}</td><td>${item.deliveryFacility ? item.deliveryFacility : ''}</td><td>${item.status ? item.status : ''}</td><td>${item.callTime ? item.callTime :''}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};

const exportHTMLBrokerCheckCallNotExistReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `BrokerCheck Call Not Exist Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>workordernumber</td><td>refNumber</td><td>pickupDate</td><td>deliveryDate</td><td>pickupFacility</td><td>deliveryFacility</td><td>status</td></td>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.workOrderNumber ? item .workOrderNumber : ''}</td><td>${item.refNumber ? item .refNumber : ''}</td><td>${item.pickupDate ? item .pickupDate : ''}</td><td>${item.deliveryDate ? item .deliveryDate : ''}</td><td>${item.pickupFacility ? item .pickupFacility : ''}</td><td>${item.deliveryFacility ? item.deliveryFacility : ''}</td><td>${item.status ? item.status : ''}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};
