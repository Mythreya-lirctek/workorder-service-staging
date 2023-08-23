import express from 'express';
import { BaseController } from './base_controller';
import CheckHQCompanyService from '../service/checkhq/company.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class CheckHQCompanyController extends BaseController {
	private checkHQCompanyService: CheckHQCompanyService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.checkHQCompanyService = new CheckHQCompanyService();
		this.activityLogService = new ActivityLogService();
	}

	public async createCompany(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			const result = await this.checkHQCompanyService.createCompany(req.body);
			if(result.data) {
				this.activityLogService.addActivityLog({
					description: JSON.stringify({'checkHQId': result.data ? result.data.data.id : null}),
					module: 'Company',
					module_Id: user.companyId,
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
	
	public async getCompany(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQCompanyService.getCompany(companyId);    
			if(result.data) {        
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updateCompany(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQCompanyService.updateCompany(companyId, req.body);   
			if(result.data) {         
				res.send(this.getSuccessResponse(result.data ? result.data.data: {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async companyOnboard(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQCompanyService.companyOnboard(companyId, req.body);   
			if(result.data) {         
				res.send(this.getSuccessResponse(result.data ? result.data.data: {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async listCompany(req:express.Request,res: express.Response): Promise<any> {
		try {
			const companyId=req.params
			const result = await this.checkHQCompanyService.listCompany();   
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

export default CheckHQCompanyController;