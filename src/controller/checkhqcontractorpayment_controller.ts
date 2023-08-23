import express from 'express';
import CheckHQContractorPaymentService from '../service/checkhq/contractorpayment.service';
import { BaseController } from './base_controller';

class CheckHQContractorPaymentController extends BaseController {
	private checkHQContractorPaymentService: CheckHQContractorPaymentService;
	
	constructor () {
		super();
		this.checkHQContractorPaymentService = new CheckHQContractorPaymentService();
	}

	public async getContractorPayment(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { contractorPaymentId } = req.params;
			const result = await this.checkHQContractorPaymentService.getContractorPayment(contractorPaymentId);
			if (result.data) {
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async updateContractorPayment(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { contractorPaymentId } = req.params;
			const result = await this.checkHQContractorPaymentService.updateContractorPayment(contractorPaymentId,req.body);
			if (result.data) {
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async deleteContractorPayment(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { contractorPaymentId } = req.params;
			const result = await this.checkHQContractorPaymentService.deleteContractorPayment(contractorPaymentId);
			if (result.data) {
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getContractorPaymentPaperCheck(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { contractorPaymentId } = req.params;
			const result = await this.checkHQContractorPaymentService.getContractorPaymentPaperCheck(contractorPaymentId);
			if (result.data) {
				res.set({ 'Content-type' : 'application/pdf' })
				res.send(result.data ? Buffer.from(result.data) : {});
			} else {
				const { error } = JSON.parse(Buffer.from(result.response.data).toString('binary'))
				res.status(500).send(this.getErrorResponse(error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}
export default CheckHQContractorPaymentController