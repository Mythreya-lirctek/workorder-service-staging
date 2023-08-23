import express from 'express';
import { BaseController } from './base_controller';
import CheckHQCompanyBenefitService from '../service/checkhq/companybenefit.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class CheckHQCompanyBenefitController extends BaseController {
	private checkHQCompanyBenefitService: CheckHQCompanyBenefitService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.checkHQCompanyBenefitService = new CheckHQCompanyBenefitService();
		this.activityLogService = new ActivityLogService();
	}

	public async createCompanyBenefit(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			const result = await this.checkHQCompanyBenefitService.createCompanyBenefit(req.body);
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
	
	public async getCompanyBenefit(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyBenefitId}  = req.params;
			
			const result = await this.checkHQCompanyBenefitService.getCompanyBenefit(companyBenefitId);    
			if(result.data) {        
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updateCompanyBenefit(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyBenefitId}  = req.params;
			
			const result = await this.checkHQCompanyBenefitService.updateCompanyBenefit(companyBenefitId, req.body); 
			if(result.data) {
				res.send(this.getSuccessResponse(result.data ? result.data.data: {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async listCompanyBenefits(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQCompanyBenefitService.listCompanyBenefits(companyId);   
			if(result.data) {         
				res.send(this.getSuccessResponse(result.data ? result.data.data.results : []));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async deleteCompanyBenefit(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyBenefitId}  = req.params;
			
			const result = await this.checkHQCompanyBenefitService.deleteCompanyBenefit(companyBenefitId);   
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

export default CheckHQCompanyBenefitController;