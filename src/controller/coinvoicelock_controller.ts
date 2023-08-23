import express from 'express';
import { BaseController } from './base_controller';
import ActivityLogService from '../service/activitylog/activitylog.service';
import COInvoiceLockService from '../service/coinvoicelock/coinvoicelock.services';

class COInvoiceLockController extends BaseController {
	private activityLogService: ActivityLogService;
	private coInvoiceLockService: COInvoiceLockService;
	constructor() {
		super();
		this.activityLogService = new ActivityLogService();
		this.coInvoiceLockService = new COInvoiceLockService();
	}
	
	public async addCoInvoiceUnlock(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.UnlockedBy = user.userName;

			const result = await this.coInvoiceLockService.addCoInvoiceUnlock(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'coInvoiceLock', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getUnlocksByCOInvoiceId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;

			const { coInvoiceId} =req.params;

			const result = await this.coInvoiceLockService.getUnlocksByCOInvoiceId(Number(coInvoiceId));
			res.send(this.getSuccessResponse(result.data));
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

}

export default COInvoiceLockController;