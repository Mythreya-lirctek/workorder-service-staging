import express from 'express';
import { BaseController } from './base_controller';
import CheckHQWorkplaceService from '../service/checkhq/workplace.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class CheckHQWorkplaceController extends BaseController {
	private checkHQWorkplaceService: CheckHQWorkplaceService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.checkHQWorkplaceService = new CheckHQWorkplaceService();
		this.activityLogService = new ActivityLogService();
	}

	public async createWorkplace(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			
			const result = await this.checkHQWorkplaceService.createWorkplace(req.body);
			if(result.data) {
				req.body.workplaceId = result.data ? result.data.data.id : null;
				
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
	
	public async listWorkplaces(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQWorkplaceService.listWorkplaces(companyId);       
			if(result.data) {     
				res.send(this.getSuccessResponse(result.data ? result.data.data.results : []));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWorkPlace(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {workPlaceId}  = req.params;
			
			const result = await this.checkHQWorkplaceService.getWorkPlace(workPlaceId);    
			if(result.data) {        
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updateWorkPlace(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {workPlaceId}  = req.params;
			
			const result = await this.checkHQWorkplaceService.updateWorkPlace(workPlaceId, req.body);   
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

export default CheckHQWorkplaceController;