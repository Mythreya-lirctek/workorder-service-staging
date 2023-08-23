import express from 'express';
import CheckHQFormService from '../service/checkhq/form.service';
import { BaseController } from './base_controller';

class CheckHQFormController extends BaseController {
	private checkHQFormService: CheckHQFormService;
	constructor() {
		super();
		this.checkHQFormService = new CheckHQFormService();
	}
	public async getForm(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { formId } = req.params;
			const result = await this.checkHQFormService.getForm(formId);
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
	public async listForm(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const result = await this.checkHQFormService.listForm(req.body);
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
	public async renderForm(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { formId } = req.params;
			const { type } = req.body
			const result = await this.checkHQFormService.renderForm(
				formId,
				req.body
			);
			if (result.data) {
				res.set({'Content-type' : `application/${type}`})
				res.send(result.data ? type === 'pdf' ? Buffer.from(result.data) : result.data : {});
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
export default CheckHQFormController;
