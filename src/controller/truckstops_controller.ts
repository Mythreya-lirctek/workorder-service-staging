import {BaseController} from './base_controller';
import {TruckStopsService} from '../service/truckstops/truckstops.service';
import CompanyService from '../service/checkhq/company.service';
import express from 'express';
import url from 'url';

export default class TruckstopsController extends BaseController {
	private truckStopsService:TruckStopsService;
	private companyService:CompanyService
	constructor() {
		super();
		this.truckStopsService= new TruckStopsService();
		this.companyService= new CompanyService();
	}
	public async getAccessToken(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.truckStopsService.getAccessToken(req);
			res.send(resp.data);
		} catch (error) {
			if (error.response) {
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getRefreshToken(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.truckStopsService.getRefreshToken(req);
			res.send(resp.data);
		} catch (error) {
			if (error.response) {
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async callback(req: express.Request, res: express.Response): Promise<void> {
		try {
			const urlParts = url.parse(req.url, true);
			const cookieDomain = process.env.NODE_ENV === 'development' ? 'localhost' : '.taraiwa.com';
			res.cookie('truck_stops_code', urlParts.query.code, {
				domain: cookieDomain
			});
			res.redirect(process.env.TRUCKSTOPS_REDIRECT_URL || 'https://sandbox.taraiwa.com/#/company/integration/loadboard');
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async webhook(_req: express.Request, res: express.Response): Promise<any> {
		try {

			res.send({message:'success'});
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async loginTruckStops(_req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.truckStopsService.loginTruckStops();
			res.send(resp.data);
		} catch (error) {
			if (error.response) {
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getLoad(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.truckStopsService.getLoad(req.body,req.body.accessToken);
			res.send(resp.data);
		} catch (error) {
			if (error.response) {
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

}