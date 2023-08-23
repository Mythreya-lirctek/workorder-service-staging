import express from 'express';
import BenefitService from '../service/checkhq/benefit.service';
import { BaseController } from './base_controller';
class CheckHQCompanyBenefitController extends BaseController {
	private benefitService: BenefitService;
	constructor() {
		super();
		this.benefitService = new BenefitService();
	}

	public async createBenefit(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const result = await this.benefitService.createBenefit(req.body);
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
	public async getBenefit(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { benefitId } = req.params;
			const result = await this.benefitService.getBenefit(benefitId);
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
	public async listBenefit(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { Id } = req.params;
			const result = await this.benefitService.listBenefit(Id);
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
	public async updateBenefit(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { benefitId } = req.params;
			const result = await this.benefitService.updateBenefit(
				benefitId,
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
	public async deleteBenefit(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { benefitId } = req.params;
			const result = await this.benefitService.deleteBenefit(benefitId);
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
export default CheckHQCompanyBenefitController;
