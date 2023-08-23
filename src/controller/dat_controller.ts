import express from 'express';
import { BaseController } from './base_controller';
import {DatService} from '../service/dat/dat.service';
import CompanyService from '../service/checkhq/company.service';

class DatController extends BaseController {
	private datService: DatService;
	private companyService:CompanyService
	constructor() {
		super();
		this.datService = new DatService();
		this.companyService= new CompanyService();
	}
	public async getOrganizationAccessToken(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const  integrationInfo = await this.companyService.getCompanyIntegration(req.body.companyId,'LoadBoard','DAT',true)
			if(integrationInfo.data.length){
				const response= await this.datService.getOrganizationAccessToken({
					password:integrationInfo.data[0].Password,
					username :integrationInfo.data[0].UserName
				});
				res.status(200).send({accessToken:response.data.accessToken})
			}
			else{
				res.status(500).send({message:'Company Not Integrated with Dat'})
			}
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getUserAccessToken(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.getUserAccessToken(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
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

	public async createLoad(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.createLoad(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.getLoads(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async deleteAsync(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.deleteAsync(req);
			res.send({message:'Deleted Successfully'});
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async delete(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.delete(req);
			res.send({message:'Deleted Successfully'});
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getLoadById(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.getLoadById(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async updateLoad(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.updateLoad(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async refreshLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.refreshLoads(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async refreshLoad(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.refreshLoad(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async createBid(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.createBid(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getBids(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.getBids(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async bulkUpdateBids(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.bulkUpdateBids(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getBid(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.getBid(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async updateBid(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.updateBid(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getBidCounts(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.getBidCounts(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async createNewAssetQuery(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.createNewAssetQuery(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getAssetQueriesByUser(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.getAssetQueriesByUser(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getAssetQueryById(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.getAssetQueryById(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async deleteAssetQueryById(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.deleteAssetQueryById(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getAssetsByQueryId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.getAssetsByQueryId(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async getDetailsInformationByMatchId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.getDetailsInformationByMatchId(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async rateLookUp(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resp = await this.datService.rateLookUp(req);
			res.send(resp.data);
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			}
			else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

}

export default DatController;