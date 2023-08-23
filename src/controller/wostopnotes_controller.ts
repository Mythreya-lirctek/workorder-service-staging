import express from 'express';
import { BaseController } from './base_controller';
import WOStopNotesService from '../service/wostopnotes/wostopnotes.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import PDFService from '../service/pdf/pdf.service';

class WOStopNotesController extends BaseController {
	private pdfService: PDFService;
	private woStopNotesService: WOStopNotesService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.woStopNotesService = new WOStopNotesService();
		this.activityLogService = new ActivityLogService();
		this.pdfService = new PDFService();
	}

	public async addWOStopNotes(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.woStopNotesService.addWOStopNotes(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOStopNotes', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveWOStopNotes(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {woStopNotesId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.woStopNotesId = woStopNotesId;

			const result = await this.woStopNotesService.saveWOStopNotes(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOStopNotes',
				module_Id: woStopNotesId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOStopNotesbyWOStopId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.woStopNotesService.getWOStopNotesbyWOStopId(req.body.woStops_Id);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
}

export default WOStopNotesController;

