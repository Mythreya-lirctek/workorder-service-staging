import express from 'express';
import { BaseController } from './base_controller';
import WOInvoiceUnlockService from '../service/woinvoiceunlock/woinvoiceunlock.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class WOInvoiceUnlockController extends BaseController {
	private woInvoiceUnlockService: WOInvoiceUnlockService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.woInvoiceUnlockService = new WOInvoiceUnlockService();
		this.activityLogService = new ActivityLogService();
	}

	public async addWOInvoiceUnlock(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.woInvoiceUnlockService.addWOInvoiceUnlock(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOInvoiceUnlock', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveWOInvoiceUnlock(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {woInvoiceUnlockId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.woInvoiceUnlockId = woInvoiceUnlockId;

			const result = await this.woInvoiceUnlockService.saveWOInvoiceUnlock(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOInvoiceUnlock',
				module_Id: req.body.woInvoiceUnlockId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getUnlocksByWOInvoiceId(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {woInvoiceId} = req.params;
			req.body.woInvoiceId = woInvoiceId;

			const result = await this.woInvoiceUnlockService.getUnlocksByWOInvoiceId(req.body.woInvoiceId);
			res.send(this.getSuccessResponse(result));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default WOInvoiceUnlockController;