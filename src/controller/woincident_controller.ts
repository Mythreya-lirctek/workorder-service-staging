import express from 'express';
import { BaseController } from './base_controller';
import WOIncidentService from '../service/woincident/woincident.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import PDFService from '../service/pdf/pdf.service';
import { parse } from 'json2csv';

class WOIncidentController extends BaseController {
	private pdfService: PDFService;
	private woIncidentService: WOIncidentService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.woIncidentService = new WOIncidentService();
		this.activityLogService = new ActivityLogService();
		this.pdfService = new PDFService();
	}

	public async addWOIncident(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.woIncidentService.addWOIncident(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOIncident', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveWOIncident(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {woIncidentId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.woIncidentId = woIncidentId;

			const result = await this.woIncidentService.saveWOIncident(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOIncident',
				module_Id: woIncidentId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOIncidentsbyWOId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.woIncidentService.getWOincidentsbyWOId(req.body.workOrder_Id);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getWoIncidentsCount(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.woIncidentService.getWoIncidentsCount(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0]}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	
	public async getWOincidentsReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.woIncidentService.getWOincidentsReport(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	public async getWOincidentsReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.woIncidentService.getWOincidentsReport(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLHistoryReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['workOrderNumber', 'incidentDate','description', 'dueDate', 
				 'assignedTo','isClosed', 'closedBy', 'closedDate'];
				const opts = { fields };
				const csv = parse(result.data[0], opts);
				res.attachment('WOincidentsReport.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default WOIncidentController;

const exportHTMLHistoryReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Work Order incidents Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>workOrderNumber</td><td>Incident Date</td><td>Description</td><td>dueDate</td><td>assignedTo</td><td>isClosed</td><td>closedBy</td><td>Closed Date</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.workOrderNumber}</td><td>${item.incidentDate?item.incidentDate :''}</td><td>${item.description?item.description:''}</td><td>${item.dueDate?item.dueDate:''}</td><td>${item.assignedTo ? item.assignedTo : ''}</td><td>${item.isClosed?item.isClosed:''}</td><td>${item.closedBy ? item.closedBy : ''}</td><td>${item.closedDate?item.closedDate:''}</td></tr>`;	
		
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};
