import express from 'express';
import { BaseController } from './base_controller';
import CheckHQContractorService from '../service/checkhq/contractor.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class CheckHQContractorController extends BaseController {
	private checkHQContractorService: CheckHQContractorService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.checkHQContractorService = new CheckHQContractorService();
		this.activityLogService = new ActivityLogService();
	}

	public async createContractor(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			const result = await this.checkHQContractorService.createContractor(req.body);
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
	
	public async getContractor(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {contractorId}  = req.params;
			
			const result = await this.checkHQContractorService.getContractor(contractorId);  
			if(result.data) {          
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updateContractor(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {contractorId}  = req.params;
			
			const result = await this.checkHQContractorService.updateContractor(contractorId, req.body); 
			if(result.data) {
				res.send(this.getSuccessResponse(result.data ? result.data.data: {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async listContractors(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQContractorService.listContractors(companyId);    
			if(result.data) {        
				res.send(this.getSuccessResponse(result.data ? result.data.data.results : []));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async contractorOnboard(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQContractorService.contractorOnboard(companyId);    
			if(result.data) {        
				res.send(this.getSuccessResponse(result.data ? result.data.data : []));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async listContractorPayment(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {contractorId}  = req.params;
			
			const result = await this.checkHQContractorService.listContractorPayment(contractorId);    
			if(result.data) {        
				res.send(this.getSuccessResponse(result.data ? result.data.data : []));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getContractorPayment(req: express.Request, res: express.Response): Promise<any> {
		const {contractorId,payrollId,type}  = req.params;
		try {
			const result = await this.checkHQContractorService.getContractorPayment(contractorId, payrollId, type);
			if (result.data) {   
				res.set({ 'Content-type' : `application/${type}` })
				res.send(result.data ? type === 'pdf' ? Buffer.from(result.data) : result.data : []);
			} else {
				if (type === 'pdf') {
					res.status(500).send(this.getErrorResponse(JSON.parse(Buffer.from(result.response.data).toString('binary')).error));
				} else {
					res.status(500).send(this.getErrorResponse(result.response.data.error));
				}
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default CheckHQContractorController;