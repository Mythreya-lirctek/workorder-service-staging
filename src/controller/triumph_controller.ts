import express from 'express';
import { BaseController } from './base_controller';
import TriumphService from '../service/triumph/triumph.service';

class TriumphController extends BaseController {
	private triumpService: TriumphService;
	constructor() {
		super();
		this.triumpService = new TriumphService();
	}
	public async upload(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			const response = await this.triumpService.upload(req,user.companyId);
			res.send(this.getSuccessResponse(response));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default TriumphController;