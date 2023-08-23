import express from 'express';
import PayrollService from '../service/checkhq/payroll.service';
import { BaseController } from './base_controller';
class CheckHQPayrollController extends BaseController {
	private payrollService: PayrollService;
	constructor() {
		super();
		this.payrollService = new PayrollService();
	}

	public async createPayroll(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const result = await this.payrollService.createPayroll(req.body);
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
	public async previewPayroll(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { payrollId, type } = req.params;
			const result = await this.payrollService.previewPayroll(payrollId,type);
			if (result.data) {
				res.set({
					'Content-type' : type === 'csv' ? 'text/csv' : `application/${type}`
				})
				res.send(result.data ? type === 'csv' ?  Buffer.from(result.data) : result.data : {});
			} else {
				if (type === 'csv') {
					res.status(500).send(this.getErrorResponse(JSON.parse(Buffer.from(result.response.data).toString('binary')).error));
				} else {
					res.status(500).send(this.getErrorResponse(result.response.data.error));
				}
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async reopenPendingPayroll(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { payrollId } = req.params;
			const result = await this.payrollService.reopenPendingPayroll(
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
	public async approvePayroll(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { payrollId } = req.params;
			const result = await this.payrollService.approvePayroll(payrollId);
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
	public async getPayroll(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { payrollId } = req.params;
			const result = await this.payrollService.getPayroll(payrollId);
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
	public async updatePayroll(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { payrollId } = req.params;
			const result = await this.payrollService.updatePayroll(
				payrollId,
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
	public async listPayroll(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { companyId } = req.params;
			const result = await this.payrollService.listPayroll(companyId);
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
	public async deletePayroll(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { payrollId } = req.params;
			const result = await this.payrollService.deletePayroll(payrollId);
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
	public async getPaperChecks(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { payrollId } = req.params;
			const result = await this.payrollService.getPaperChecks(payrollId);
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
}
export default CheckHQPayrollController;
