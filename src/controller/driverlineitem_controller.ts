import express from 'express';
import { BaseController } from './base_controller';
import DriverLineItemService from '../service/driverlineitem/driverlineitem.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class DriverLineItemController extends BaseController {
	private driverLineItemService: DriverLineItemService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.driverLineItemService = new DriverLineItemService();
		this.activityLogService = new ActivityLogService();
	}

	public async addDriverLineItem(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.driverLineItemService.addDriverLineItem(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'DriverLineItem', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveDriverLineItem(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {lineItemId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.lineItemId = lineItemId;

			const result = await this.driverLineItemService.saveDriverLineItem(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'DriverLineItem',
				module_Id: lineItemId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default DriverLineItemController;