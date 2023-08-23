import express from 'express';
import { BaseController } from './base_controller';
import COCarrierCheckCallService from '../service/cocarriercheckcall/cocarriercheckcall.service';
import ActivityLogService from '../service/activitylog/activitylog.service';


class COCarrierCheckCallController extends BaseController {
	private coCarrierCheckCallService: COCarrierCheckCallService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.coCarrierCheckCallService = new COCarrierCheckCallService();
		this.activityLogService = new ActivityLogService();
	}

	public async addCOCarrierCheckCall(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.coCarrierCheckCallService.addCOCarrierCheckCall(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COCarrierCheckCall', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveCOCarrierCheckCall(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {coCarrierCheckCallId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.coCarrierCheckCallId = coCarrierCheckCallId;

			const result = await this.coCarrierCheckCallService.saveCOCarrierCheckCall(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COCarrierCheckCall',
				module_Id: coCarrierCheckCallId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCOCarrierCheckcalls(req: express.Request, res: express.Response): Promise<any> {
		try {
			const result = await this.coCarrierCheckCallService.getCOCarrierCheckcalls(req.body);
			res.send(this.getSuccessResponse(result.data));
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default COCarrierCheckCallController;