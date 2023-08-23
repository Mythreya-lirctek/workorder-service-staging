import express from 'express';
import { NylasEmailService } from '../service/nylas/nylasemail.service';
import { BaseController } from './base_controller';

class NylasEmailController extends BaseController{

   	private nylasEmailService: NylasEmailService;

	constructor() {
		super();
		this.nylasEmailService = new NylasEmailService();
	}

	public async login(req: express.Request, res: express.Response): Promise<void> {
		try{
			const result = await this.nylasEmailService.login(req.body)
			if(result.data) {
				res.send(this.getSuccessResponse(result.data));
			}else {
				res.status(500).send(result.response.data);
			}

		}catch(error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async webhookGet(req: express.Request, res: express.Response): Promise<void>{
		try {
			const challenge = req.query.challenge
			res.status(200).send(challenge)
		}catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async webhookPost(_req: express.Request, res: express.Response): Promise<void>{
		try {
			res.status(200).end()
		}catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async userCallback(req: express.Request, res: express.Response): Promise<void> {
		try {
			const cookieDomain = process.env.NODE_ENV === 'development' ? 'localhost' : '.taraiwa.com';
			const result = await this.nylasEmailService.getAccessToken({'code': req.query.code})
			res.cookie('nylas_access_code', result.data.data.accessToken, {
				domain: cookieDomain
			});
			res.redirect(process.env.NYLAS_USER_REDIRECT_URI || 'https://localhost:9000/#/users/profile');
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async companyIntegrationsCallback(req: express.Request, res: express.Response): Promise<void> {
		try {
			const cookieDomain = process.env.NODE_ENV === 'development' ? 'localhost' : '.taraiwa.com';
			const result = await this.nylasEmailService.getAccessToken({'code': req.query.code})
			res.cookie('nylas_access_code', result.data.data.accessToken, {
				domain: cookieDomain
			});
			res.redirect(process.env.NYLAS_COMPANY_REDIRECT_URI || 'https://localhost:9000/#/company/integration/email');
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getAccessToken(req: express.Request, res: express.Response): Promise<void> {
		try{
			const result = await this.nylasEmailService.getAccessToken(req.body)
			if(result.data) {
				res.send(this.getSuccessResponse(result.data));
			}else {
				res.status(result.response.data.statusCode).send(result.response.data)
			}
		}catch(error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async sendEmail(req: express.Request, res: express.Response): Promise<void> {
		try{
			const result = await this.nylasEmailService.sendEmail(req.body)
			if(result.data) {
				res.send(this.getSuccessResponse(result.data));
			}else {
				res.status(result.response.data.statusCode).send(result.response.data)
			}
		}catch(error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getThreads(req: express.Request, res: express.Response): Promise<void> {
		try{
			const result = await this.nylasEmailService.getThreads(req.body)
			if(result.data) {
				res.send(this.getSuccessResponse(result.data));
			}else {
				res.status(result.response.data.statusCode).send(result.response.data)
			}
		}catch(error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getThreadById(req: express.Request, res: express.Response): Promise<void> {
		try{
			const result = await this.nylasEmailService.getThreadById(req.body)
			if(result.data) {
				res.send(this.getSuccessResponse(result.data));
			}else {
				res.status(result.response.data.statusCode).send(result.response.data)
			}
		}catch(error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getMessageById(req: express.Request, res: express.Response): Promise<void> {
		try{
			const result = await this.nylasEmailService.getMessageById(req.body)
			if(result.data) {
				res.send(this.getSuccessResponse(result.data));
			}else {
				res.status(result.response.data.statusCode).send(result.response.data)
			}
		}catch(error) {
			res.status(500).send(this.getErrorResponse(error))
		}
	}

	public async sendAttachment(req: express.Request, res: express.Response): Promise<void> {
		try{
			const result = await this.nylasEmailService.sendAttachment(req)
			if(result.data) {
				res.send(this.getSuccessResponse(result.data));
			}else {
				res.status(result.response.data.statusCode).send(result.response.data)
			}
		}catch(error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async deleteAttachment(req: express.Request, res: express.Response): Promise<void> {
		try{
			const result = await this.nylasEmailService.deleteAttachment(req.body)
			if(result.data) {
				res.send(this.getSuccessResponse(result.data));
			}else {
				res.status(result.response.data.statusCode).send(result.response.data)
			}
		}catch(error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async readAttachment(req: express.Request, res: express.Response): Promise<void> {
		try{
			const result = await this.nylasEmailService.readAttachment(req.body)
			if(result.data) {
				res.send(this.getSuccessResponse(result.data));
			}else {
				res.status(result.response.data.statusCode).send(result.response.data)
			}
		}catch(error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}
export default NylasEmailController;