import express from 'express';
import { BaseController } from './base_controller';
import OwneropLineItemService from '../service/owneroplineitem/owneroplineitem.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import RelayService from '../service/relay/relay.service';
import DispatchOrderService from '../service/dispatchorder/dispatchorder.service';

class OwneropLineItemController extends BaseController {
	private owneropLineItemService: OwneropLineItemService;
	private relayService: RelayService;
	private dispatchOrderService: DispatchOrderService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.owneropLineItemService = new OwneropLineItemService();
		this.relayService = new RelayService();
		this.dispatchOrderService = new DispatchOrderService();
		this.activityLogService = new ActivityLogService();
	}

	public async addOwneropLineItem(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.owneropLineItemService.addOwneropLineItem(req.body);			
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'OwneropLineItem', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveOwneropLineItem(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {lineItemId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.lineItemId = lineItemId;

			const result = await this.owneropLineItemService.saveOwneropLineItem(req.body);			
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'OwneropLineItem',
				module_Id: lineItemId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default OwneropLineItemController;