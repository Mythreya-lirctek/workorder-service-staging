import express from 'express';
import { BaseController } from './base_controller';
import COCustomerCheckCallService from '../service/cocustomercheckcall/cocustomercheckcall.service';
import ActivityLogService from '../service/activitylog/activitylog.service';


class COCustomerCheckCallController extends BaseController {
	private coCustomerCheckCallService: COCustomerCheckCallService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.coCustomerCheckCallService = new COCustomerCheckCallService();
		this.activityLogService = new ActivityLogService();
	}

	public async addCOCustomerCheckCall(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.coCustomerCheckCallService.addCOCustomerCheckCall(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COCustomerCheckCall', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveCOCustomerCheckCall( req: express.Request,res: express.Response ): Promise<any> {
		try {
			const {coCustomerCheckCallId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.coCustomerCheckCallId = coCustomerCheckCallId;

			const result = await this.coCustomerCheckCallService.saveCOCustomerCheckCall(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COCustomerCheckCall',
				module_Id: coCustomerCheckCallId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCOCustomerCheckcalls(req: express.Request, res: express.Response): Promise<any> {
		try {
			const result = await this.coCustomerCheckCallService.getCOCustomerCheckcalls(req.body);
			res.send(this.getSuccessResponse(result.data));
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default COCustomerCheckCallController;