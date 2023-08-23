import express from 'express';
import { BaseController } from './base_controller';
import PayScheduleService from '../service/payschedule/payschedule.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class PayScheduleController extends BaseController {
	private payScheduleService: PayScheduleService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.payScheduleService = new PayScheduleService();
		this.activityLogService = new ActivityLogService();
	}

	public async addPaySchedule(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const paySchedules = req.body.paySchedules;
			for (const item of paySchedules) {
				item.payScheduleCHId = req.body.payScheduleCHId;
				item.userId = user.id;
				const result = await this.payScheduleService.addPaySchedule(item);
				const activity = await this.activityLogService.addActivityLog({
					description: JSON.stringify(item),
					module: 'PaySchedule', 
					module_Id: result.data.insertId, 
					userId: user.id 
				});
			}
			res.send(this.getSuccessResponse({ result: 'Added Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async savePaySchedule(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {			
			const user= req.user as any;
			req.body.userId = user.id;
			
			const paySchedules = req.body.paySchedules;
			for (const item of paySchedules) {
				item.payScheduleCHId = req.body.payScheduleCHId;
				item.userId = user.id;
				if(item.id > 0 ) {
					item.payScheduleId = item.id;
					const result = await this.payScheduleService.savePaySchedule(item);
					const activity = await this.activityLogService.addActivityLog({
						description: JSON.stringify(req.body),
						module: 'PaySchedule',
						module_Id: item.id,
						userId: user.id,
					});
				} else {		
					const result = await this.payScheduleService.addPaySchedule(item);
					const activity = await this.activityLogService.addActivityLog({
						description: JSON.stringify(item),
						module: 'PaySchedule', 
						module_Id: result.data.insertId, 
						userId: user.id 
					});
				}
			}
			
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getPaySchedulebyId(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {		
			const {payScheduleId} = req.params;
			
			req.body.payScheduleId = payScheduleId;
			const result = await this.payScheduleService.getPaySchedulebyId(
				req.body
			);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getPayScheduleDetails(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {		
			const result = await this.payScheduleService.getPayScheduleDetails(
				req.body
			);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
}

export default PayScheduleController;