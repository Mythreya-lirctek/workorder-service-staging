import {BaseController} from './base_controller';
import express from 'express';
import {FourKitesService} from '../service/fourkites/fourkites.service';
import {parse} from 'json2csv';
import EmailService from '../service/email/email.service';
import moment from 'moment';
import CompanyService from '../service/checkhq/company.service';


class FourKitesController extends BaseController {
	private fourKitesService: FourKitesService;
	private  emailService:EmailService;
	private companyService:CompanyService

	constructor() {
		super();
		this.fourKitesService = new FourKitesService();
		this.emailService=new EmailService();
		this.companyService = new CompanyService()
	}

	public async  getDataToSendToFourKites(_req: express.Request, res: express.Response): Promise<any> {
		try {
			const dataToSendToFourKites = await this.fourKitesService.getDataToSendToFourKites()
			for ( const value of dataToSendToFourKites.data[0]){
				let dataInfo = [] as any;
				let loads = [];
				try {
					loads = value.Loads ? JSON.parse(`[${value.Loads}]`) : [] ;
				} catch (e) {
					loads = [];
				}
				if(loads.length > 0) {
					if(value.IsELD) {
						dataInfo=loads.map((load:any)=>{
							const location = load.Location.split(',');
							return  {
								'Brokered Load': '',
								'City': location[0],
								'Delivered At': load.DeliveryDateTime,
								'Driver Phone': load.DriverPhone,
								'External ID': (load.FourKitesID ? load.FourKitesID : ''),
								'Identifier 1': (load.RefNumber ? load.RefNumber : ''),
								'Identifier 2': '',
								'Latitude': load.lattitude,
								'Located At': (load.EventTime ? new Date(load.EventTime * 1000) : ''),
								'Longitude': load.longitude,
								'State': location[1],
								'Trailer Number': (load.TrailerNumber ? load.TrailerNumber : ''),
								'Truck Number': load.TruckNumber
							};
						}
						)

					} else {
						dataInfo=loads.map((load:any)=>{
								const location = load.Location.split(',');
								return  {
									'Delivered At': load.DeliveryDateTime,
									'External ID': (load.FourKitesID ? load.FourKitesID : ''),
									'Identifier 1': (load.RefNumber ? load.RefNumber : ''),
									'Identifier 2': '',
									'Trailer Number': (load.TrailerNumber ? load.TrailerNumber : ''),
									'Truck Number': load.TruckNumber
								}
							}
						)

					}
					const csv = dataInfo.length>0?parse(dataInfo):'';
					await this.emailService.sendGPSTrackerForTrucksByCustomer({
						'body': 'Please find the attached file.',
						'csv': csv,
						'document': `File${moment().format('MM-DD-YYYY Hmm')}`,
						'emails': 'files@emailintegrations.fourkites.com;chitra@lirctek.com;pratheep@lirctek.com;',
						'fromEmail':value.Email,
						'subject':  `${value.Name} Location File`
					})
				}
			}
			res.send(this.getSuccessResponse({data: 'Sent successfully.'}));

		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async createLoad(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'fourKites', true)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].ApiKey !== null) {
				req.headers.apiKey = companyIntegrationDetails.data[0].ApiKey
				const result = await this.fourKitesService.createLoad(req)
				if (result.data) {
					res.send(result.data);
				} else {
					res.status(500).send({message: 'Unable to create load'});
				}
			} else {
				res.status(500).send({message: 'Unable to get fourkites api key'});
			}
		}catch(error) {
			if (error.response && error.response.status && error.response.data){
				res.status(error.response.status === 401 ? 406 : error.response.status).send(error.response.data);
			}else {
				res.status(500).send(error.message);
			}
		}
	}

	public async createEasyLoad(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'fourKites', true)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].ApiKey !== null) {
				req.headers.apiKey = companyIntegrationDetails.data[0].ApiKey
				const result = await this.fourKitesService.createEasyLoad(req)
				if (result.data) {
					res.send(result.data);
				} else {
					res.status(500).send({message: 'Unable to create load'});
				}
			} else {
				res.status(500).send({message: 'Unable to get fourkites api key'});
			}
		}catch(error) {
			if (error.response && error.response.status && error.response.data){
				res.status(error.response.status === 401 ? 406 : error.response.status).send(error.response.data);
			}else {
				res.status(500).send(error.message);
			}
		}
	}

	public async updateLoad(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'fourKites', true)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].ApiKey !== null) {
				req.headers.apiKey = companyIntegrationDetails.data[0].ApiKey
				const result = await this.fourKitesService.updateLoad(req)
				if (result.data) {
					res.send(result.data);
				} else {
					res.status(500).send({message: 'Unable to create load'});
				}
			} else {
				res.status(500).send({message: 'Unable to get fourkites api key'});
			}
		}catch(error) {
			if (error.response && error.response.status && error.response.data){
				res.status(error.response.status === 401 ? 406 : error.response.status).send(error.response.data);
			}else {
				res.status(500).send(error.message);
			}
		}
	}

	public async deleteLoad(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'fourKites', true)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].ApiKey !== null) {
				req.headers.apiKey = companyIntegrationDetails.data[0].ApiKey
				const result = await this.fourKitesService.deleteLoad(req)
				if (result.data) {
					res.send(result.data);
				} else {
					res.status(500).send({message: 'Unable to create load'});
				}
			} else {
				res.status(500).send({message: 'Unable to get fourkites api key'});
			}
		}catch(error) {
			if (error.response && error.response.status && error.response.data){
				res.status(error.response.status === 401 ? 406 : error.response.status).send(error.response.data);
			}else {
				res.status(500).send(error.message);
			}
		}
	}

	public async getShipments(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'fourKites', true)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].ApiKey !== null) {
				req.headers.apiKey = companyIntegrationDetails.data[0].ApiKey
				const result = await this.fourKitesService.getShipments(req)
				if (result.data) {
					res.send(result.data);
				} else {
					res.status(500).send({message: 'Unable to create load'});
				}
			} else {
				res.status(500).send({message: 'Unable to get fourkites api key'});
			}
		}catch(error) {
			if (error.response && error.response.status && error.response.data){
				res.status(error.response.status === 401 ? 406 : error.response.status).send(error.response.data);
			}else {
				res.status(500).send(error.message);
			}
		}
	}

	public async getShipmentDetails(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'fourKites', true)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].ApiKey !== null) {
				req.headers.apiKey = companyIntegrationDetails.data[0].ApiKey
				const result = await this.fourKitesService.getShipmentDetails(req)
				if (result.data) {
					res.send(result.data);
				} else {
					res.status(500).send({message: 'Unable to create load'});
				}
			} else {
				res.status(500).send({message: 'Unable to get fourkites api key'});
			}
		}catch(error) {
			if (error.response && error.response.status && error.response.data){
				res.status(error.response.status === 401 ? 406 : error.response.status).send(error.response.data);
			}else {
				res.status(500).send(error.message);
			}
		}
	}

	public async getShipmentEUrl(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'fourKites', true)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].ApiKey !== null) {
				req.headers.apiKey = companyIntegrationDetails.data[0].ApiKey
				const result = await this.fourKitesService.getShipmentEUrl(req)
				if (result.data) {
					res.send(result.data);
				} else {
					res.status(500).send({message: 'Unable to create load'});
				}
			} else {
				res.status(500).send({message: 'Unable to get fourkites api key'});
			}
		}catch(error) {
			if (error.response && error.response.status && error.response.data){
				res.status(error.response.status === 401 ? 406 : error.response.status).send(error.response.data);
			}else {
				res.status(500).send(error.message);
			}
		}
	}

	public async getStopEUrl(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'fourKites', true)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].ApiKey !== null) {
				req.headers.apiKey = companyIntegrationDetails.data[0].ApiKey
				const result = await this.fourKitesService.getStopEUrl(req)
				if (result.data) {
					res.send(result.data);
				} else {
					res.status(500).send({message: 'Unable to create load'});
				}
			} else {
				res.status(500).send({message: 'Unable to get fourkites api key'});
			}
		}catch(error) {
			if (error.response && error.response.status && error.response.data){
				res.status(error.response.status === 401 ? 406 : error.response.status).send(error.response.data);
			}else {
				res.status(500).send(error.message);
			}
		}
	}

	public async getAssetList(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'fourKites', true)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].ApiKey !== null) {
				req.headers.apiKey = companyIntegrationDetails.data[0].ApiKey
				const result = await this.fourKitesService.getAssetList(req)
				if (result.data) {
					res.send(result.data);
				} else {
					res.status(500).send({message: 'Unable to create load'});
				}
			} else {
				res.status(500).send({message: 'Unable to get fourkites api key'});
			}
		}catch(error) {
			if (error.response && error.response.status && error.response.data){
				res.status(error.response.status === 401 ? 406 : error.response.status).send(error.response.data);
			}else {
				res.status(500).send(error.message);
			}
		}
	}

	public async createPurchaseOrder(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'fourKites', true)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].ApiKey !== null) {
				req.headers.apiKey = companyIntegrationDetails.data[0].ApiKey
				const result = await this.fourKitesService.createPurchaseOrder(req)
				if (result.data) {
					res.send(result.data);
				} else {
					res.status(500).send({message: 'Unable to create load'});
				}
			} else {
				res.status(500).send({message: 'Unable to get fourkites api key'});
			}
		}catch(error) {
			if (error.response && error.response.status && error.response.data){
				res.status(error.response.status === 401 ? 406 : error.response.status).send(error.response.data);
			}else {
				res.status(500).send(error.message);
			}
		}
	}

	public async updatePurchaseOrder(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'fourKites', true)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].ApiKey !== null) {
				req.headers.apiKey = companyIntegrationDetails.data[0].ApiKey
				const result = await this.fourKitesService.updatePurchaseOrder(req)
				if (result.data) {
					res.send(result.data);
				} else {
					res.status(500).send({message: 'Unable to create load'});
				}
			} else {
				res.status(500).send({message: 'Unable to get fourkites api key'});
			}
		}catch(error) {
			if (error.response && error.response.status && error.response.data){
				res.status(error.response.status === 401 ? 406 : error.response.status).send(error.response.data);
			}else {
				res.status(500).send(error.message);
			}
		}
	}

}
export default FourKitesController;