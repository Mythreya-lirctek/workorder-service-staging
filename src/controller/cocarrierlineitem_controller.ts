import express from 'express';
import { BaseController } from './base_controller';
import COCarrierLineItemService from '../service/cocarrierlineitem/cocarrierlineitem.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import RelayService from '../service/relay/relay.service';
import DispatchOrderService from '../service/dispatchorder/dispatchorder.service';

class CarrierLineItemController extends BaseController {
	private coCarrierLineItemService: COCarrierLineItemService;
	private activityLogService: ActivityLogService;
		private relayService: RelayService;
	private dispatchOrderService: DispatchOrderService;
	constructor() {
		super();
		this.coCarrierLineItemService = new COCarrierLineItemService();
		this.activityLogService = new ActivityLogService();
				this.relayService = new RelayService();
		this.dispatchOrderService = new DispatchOrderService();
	}

	public async addCOCarrierLineItem(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.coCarrierLineItemService.addCoCarrierLineItem(req.body);
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COCarrierLineItem', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveCOCarrierLineItem(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {lineItemId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.lineItemId = lineItemId;

			const result = await this.coCarrierLineItemService.saveCOCarrierLineItem(req.body);
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COCarrierLineItem',
				module_Id: lineItemId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default CarrierLineItemController;