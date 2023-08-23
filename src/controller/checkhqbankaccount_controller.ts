import express from 'express';
import { BaseController } from './base_controller';
import CheckHQBankAccountService from '../service/checkhq/bankaccount.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class CheckHQBankAccountController extends BaseController {
	private checkHQBankAccountService: CheckHQBankAccountService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.checkHQBankAccountService = new CheckHQBankAccountService();
		this.activityLogService = new ActivityLogService();
	}

	public async createBankAccount(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			const result = await this.checkHQBankAccountService.createBankAccount(req.body);
			if(result.data) {
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getBankAccount(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {bankAccountId}  = req.params;
			
			const result = await this.checkHQBankAccountService.getBankAccount(bankAccountId);    
			if(result.data) {        
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updateBankAccount(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {bankAccountId}  = req.params;
			
			const result = await this.checkHQBankAccountService.updateBankAccount(bankAccountId, req.body); 
			if(result.data) {
				res.send(this.getSuccessResponse(result.data ? result.data.data: {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async listBankAccounts(req: express.Request, res: express.Response): Promise<any> {
		try {
			const result = await this.checkHQBankAccountService.listBankAccounts(req.body);     
			if(result.data) {       
				res.send(this.getSuccessResponse(result.data ? result.data.data.results : []));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async deleteBankAccount(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {bankAccountId}=req.params
			
			const result = await this.checkHQBankAccountService.deleteBankAccount(bankAccountId);     
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

export default CheckHQBankAccountController;