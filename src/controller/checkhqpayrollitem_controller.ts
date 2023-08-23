import express from 'express';
import PayrollItemService from '../service/checkhq/payrollitem.service';
import { BaseController } from './base_controller';
class CheckHQPayrollItemController extends BaseController {
	private payrollItemService: PayrollItemService;
	constructor() {
		super();
		this.payrollItemService = new PayrollItemService();
	}
	
	public async getPayrollItem(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { payrollItemId } = req.params;
			const result = await this.payrollItemService.getPayrollItem(
				payrollItemId
			);
			if (result.data) {
				res.send(
					this.getSuccessResponse(result.data ? result.data.data : {})
				);
			} else {
				res.status(500).send(
					this.getErrorResponse(result.response.data.error)
				);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getPayrollItems(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { payrollId } = req.params;
			const result = await this.payrollItemService.getPayrollItems(
				payrollId
			);
			if (result.data) {
				res.send(
					this.getSuccessResponse(result.data ? result.data.data : {})
				);
			} else {
				res.status(500).send(
					this.getErrorResponse(result.response.data.error)
				);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updatePayrollItem(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { payrollItemId } = req.params;
			const result = await this.payrollItemService.updatePayrollItem(
				payrollItemId,
				req.body
			);
			if (result.data) {
				res.send(
					this.getSuccessResponse(result.data ? result.data.data : {})
				);
			} else {
				res.status(500).send(
					this.getErrorResponse(result.response.data.error)
				);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async deletePayrollItem(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { payrollItemId } = req.params;
			const result = await this.payrollItemService.deletePayrollItem(
				payrollItemId
			);
			if (result.data) {
				res.send(
					this.getSuccessResponse(result.data ? result.data.data : {})
				);
			} else {
				res.status(500).send(
					this.getErrorResponse(result.response.data.error)
				);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getPaperCheck(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { payrollItemId } = req.params;
			const result = await this.payrollItemService.getPaperCheck(
				payrollItemId
			);
			if (result.data) {
				res.set({ 'Content-type' : `application/pdf` })
				res.send(
					result.data ? Buffer.from(result.data) : {}
				);
			} else {
				const { error } = JSON.parse(Buffer.from(result.response.data).toString('binary'))
				res.status(500).send(this.getErrorResponse(error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}
export default CheckHQPayrollItemController;
