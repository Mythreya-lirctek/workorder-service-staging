import express from 'express';
import { BaseController } from './base_controller';
import CheckHQEarningRateService from '../service/checkhq/earningrate.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class CheckHQEarningRateController extends BaseController {
	private checkHQEarningRateService: CheckHQEarningRateService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.checkHQEarningRateService = new CheckHQEarningRateService();
		this.activityLogService = new ActivityLogService();
	}

	public async createEarningRate(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			const result = await this.checkHQEarningRateService.createEarningRate(req.body);
			if(result.data) {
			
				this.activityLogService.addActivityLog({
					description: JSON.stringify({'checkHQId': result.data ? result.data.data.id : null}),
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
	
	public async getEarningRate(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {earningRateId}  = req.params;
			
			const result = await this.checkHQEarningRateService.getEarningRate(earningRateId);  
			if(result.data) {    
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updateEarningRate(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {earningRateId}  = req.params;
			
			const result = await this.checkHQEarningRateService.updateEarningRate(earningRateId, req.body); 
			if(result.data) {
				res.send(this.getSuccessResponse(result.data ? result.data.data: {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async listEarningRates(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQEarningRateService.listEarningRates(companyId); 
			if(result.data) {  
				res.send(this.getSuccessResponse(result.data ? result.data.data.results : []));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default CheckHQEarningRateController;