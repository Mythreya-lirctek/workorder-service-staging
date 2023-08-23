import express from 'express';
import { BaseController } from './base_controller';
import CheckHQPayscheduleService from '../service/checkhq/payschedule.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class CheckHQPayscheduleController extends BaseController {
	private checkHQPayscheduleService: CheckHQPayscheduleService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.checkHQPayscheduleService = new CheckHQPayscheduleService();
		this.activityLogService = new ActivityLogService();
	}

	public async createPayschedule(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			
			const result = await this.checkHQPayscheduleService.createPayschedule(req.body);
			if(result.data) {
				req.body.payscheduleId = result.data ? result.data.data.id : null;
				
				this.activityLogService.addActivityLog({
					description: JSON.stringify(req.body),
					module: req.body.module,
					module_Id: req.body.module_Id,
					userId: req.body.userId,
				});
				
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async listPayschedules(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQPayscheduleService.listPayschedules(companyId);       
			if(result.data) {     
				res.send(this.getSuccessResponse(result.data ? result.data.data.results : []));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getPaySchedule(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {payscheduleId}  = req.params;
			
			const result = await this.checkHQPayscheduleService.getPaySchedule(payscheduleId);    
			if(result.data) {        
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updatePaySchedule(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {payscheduleId}  = req.params;
			
			const result = await this.checkHQPayscheduleService.updatePaySchedule(payscheduleId, req.body);   
			if(result.data) {         
				res.send(this.getSuccessResponse(result.data ? result.data.data: {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getPayDays(req: express.Request, res: express.Response): Promise<any> {
		try {			
			const result = await this.checkHQPayscheduleService.getPayDays(req.body);   
			if(result.data) {         
				res.send(this.getSuccessResponse(result.data ? result.data.data: {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default CheckHQPayscheduleController;