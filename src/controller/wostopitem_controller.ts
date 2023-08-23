import express from 'express';
import { BaseController } from './base_controller';
import WOStopItemService from '../service/wostopitem/wostopitem.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import PDFService from '../service/pdf/pdf.service';
import { parse } from 'json2csv';

class WOStopItemController extends BaseController {
	private woStopItemService: WOStopItemService;
	private activityLogService: ActivityLogService;
	private pdfService: PDFService;
	constructor() {
		super();
		this.woStopItemService = new WOStopItemService();
		this.activityLogService = new ActivityLogService();
		this.pdfService = new PDFService();
	}

	public async addWOStopItem(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.woStopItemService.addWOStopItem(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOStopItem', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveWOStopItem(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {woStopItemId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.woStopItemId = woStopItemId;

			const result = await this.woStopItemService.saveWOStopItem(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOStopItem',
				module_Id: req.body.woStopItemId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOStopItemsByWOId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const {woId} = req.params;
			const result = await this.woStopItemService.getWOStopItemsByWOId(Number(woId));
			res.send(this.getSuccessResponse(result.data));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
}

export default WOStopItemController;