import express from 'express';
import PostTaxDeductionService from '../service/checkhq/posttaxdeduction.service';
import { BaseController } from './base_controller';

class CheckHQPostTaxDeductionController extends BaseController {
	private checkHQPostTaxDeductionService: PostTaxDeductionService;
	constructor() {
		super();
		this.checkHQPostTaxDeductionService = new PostTaxDeductionService();
	}
	public async createPostTaxDeduction(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const result =
				await this.checkHQPostTaxDeductionService.createPostTaxDeduction(
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
	public async getPostTaxDeduction(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { postTaxDeductionId } = req.params;
			const result =
				await this.checkHQPostTaxDeductionService.getPostTaxDeduction(
					postTaxDeductionId
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
	public async updatePostTaxDeduction(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { postTaxDeductionId } = req.params;
			const result =
				await this.checkHQPostTaxDeductionService.updatePostTaxDeduction(
					postTaxDeductionId,
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
	public async listPostTaxDeduction(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { id } = req.params;
			const result =
				await this.checkHQPostTaxDeductionService.listPostTaxDeduction(
					id
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
	public async deletePostTaxDeduction(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { postTaxDeductionId } = req.params;
			const result =
				await this.checkHQPostTaxDeductionService.deletePostTaxDeduction(
					postTaxDeductionId
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
}
export default CheckHQPostTaxDeductionController;