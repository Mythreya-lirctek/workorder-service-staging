import express from 'express';
import { BaseController } from './base_controller';
import CheckHQEarningCodeService from '../service/checkhq/earningcode.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class CheckHQEarningCodeController extends BaseController {
	private checkHQEarningCodeService: CheckHQEarningCodeService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.checkHQEarningCodeService = new CheckHQEarningCodeService();
		this.activityLogService = new ActivityLogService();
	}

	public async createEarningCode(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			const result = await this.checkHQEarningCodeService.createEarningCode(req.body);
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
	
	public async getEarningCode(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {earningCodeId}  = req.params;
			
			const result = await this.checkHQEarningCodeService.getEarningCode(earningCodeId);  
			if(result.data) {    
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updateEarningCode(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {earningCodeId}  = req.params;
			
			const result = await this.checkHQEarningCodeService.updateEarningCode(earningCodeId, req.body); 
			if(result.data) {
				res.send(this.getSuccessResponse(result.data ? result.data.data: {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async listEarningCodes(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQEarningCodeService.listEarningCodes(companyId); 
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

export default CheckHQEarningCodeController;