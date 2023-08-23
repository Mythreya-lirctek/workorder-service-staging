import express from 'express';
import { BaseController } from './base_controller';
import CoStopItemService from '../service/costopitem/costopitem.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
class COStopItemController extends BaseController {
	private coStopItemService: CoStopItemService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.coStopItemService = new CoStopItemService();
		this.activityLogService = new ActivityLogService();
	}

	public async addCOStopItem(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;

			const result = await this.coStopItemService.addCOStopItem(req.body);
			const activity = await this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COStopItem',
				module_Id: result.data.insertId,
				userId: user.id
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async saveCOStopItem(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {coStopItemId} = req.params;
			const user= req.user as any;
			req.body.userId = user.id;
			req.body.coStopItemId = coStopItemId;
			const result = await this.coStopItemService.saveCOStopItem(req.body);
			const activity = await this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COStopItem',
				module_Id: req.body.coStopItemId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getCOStopItemsByCOId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const {coId} = req.params;
			const result = await this.coStopItemService.getCOStopItemsByCOId(Number(coId));
			res.send(this.getSuccessResponse(result.data));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

}

export default COStopItemController;