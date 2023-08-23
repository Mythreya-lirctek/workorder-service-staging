import express from 'express';
import { BaseController } from './base_controller';
import {Project44Service} from '../service/project44/project44.service';
import CompanyService from '../service/checkhq/company.service';
import moment from 'moment';

class Project44Controller extends BaseController{

   	private project44Service: Project44Service;
	private companyService:CompanyService

	constructor() {
		super();
		this.project44Service = new Project44Service();
		this.companyService = new CompanyService()
	}

	public async registerClientApplication(req: express.Request, res: express.Response): Promise<void> {
		try{

			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'project44', false);

			if(companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length >0) {

				res.send({ message : 'Project44 account created for this carrier' })

			} else {

				const result = await this.project44Service.registerClientApplication(req.body);
				if(result.data
					&& result.data.name
					&& result.data.id
					&& result.data.secret) {

					req.body.clientId = result.data.id;
					req.body.clientSecret = result.data.secret;

					const tokenResult = await this.project44Service.grantAccessToken(req.body)

					if (tokenResult.data
						&& tokenResult.data.access_token
						&& tokenResult.data.expires_in) {

						req.body.accessToken = tokenResult.data.access_token
						req.body.expiresOn = tokenResult.data.expires_in
						await this.project44Service.insertProject44Credentials(req.body);
						res.send({ message : 'Client application successfully registered'});

					} else {
						await this.project44Service.insertProject44Credentials(req.body);
						res.send({ message : 'Client application registered but unable to get access token'});
					}
				}else {
					res.status(500).send(result.response.data);
				}

			}

		}catch(error) {
			if (error.response.status){
				res.status(error.response.status).send(error.response.data);
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async generateClientSecret(req: express.Request, res: express.Response): Promise<void> {
		try {

			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'project44', false);

			if(companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length >0
				&& companyIntegrationDetails.data[0].UserName
				&& companyIntegrationDetails.data[0].Password
				&& companyIntegrationDetails.data[0].ClientId) {

				req.body.userName = companyIntegrationDetails.data[0].UserName;
				req.body.password = companyIntegrationDetails.data[0].Password;
				req.body.clientId = companyIntegrationDetails.data[0].ClientId;

				const result = await this.project44Service.generateClientSecret(req.body)
				if (result.data
					&& result.data.id
					&& result.data.secret){

					req.body.clientId = result.data.id;
					req.body.clientSecret = result.data.secret;

					await this.project44Service.updateProject44Credentials(req.body);

					res.send(result.data)

				} else {
					res.status(500).send({ message : 'Unable to get secret key from clientId' })
				}

			} else {
				res.status(500).send({ message : 'No clientId for the selected company, please create client application' })
			}

		} catch(error) {
			if (error.response.status){
				res.status(error.response.status).send(error.response.data);
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async grantAccessToken(req: express.Request, res: express.Response): Promise<void> {
		try {

			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'visibility', 'project44', false);

			if(companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length >0
				&& companyIntegrationDetails.data[0].ClientSecret
				&& companyIntegrationDetails.data[0].ClientId) {

				req.body.clientSecret = companyIntegrationDetails.data[0].ClientSecret;
				req.body.clientId = companyIntegrationDetails.data[0].ClientId;

				const tokenResult = await this.project44Service.grantAccessToken(req.body)

				if (tokenResult.data
					&& tokenResult.data.access_token
					&& tokenResult.data.expires_in) {

					req.body.accessToken = tokenResult.data.access_token
					req.body.expiresOn = tokenResult.data.expires_in
					await this.project44Service.updateProject44Credentials(req.body);
					res.send({ message : 'Access token updated successfully'});

				} else {
					res.send({ message : 'Unable to get access token'});
				}

			} else {
				res.send({ message : 'Client application not registered'})
			}

		} catch(error) {
			if (error.response.status){
				res.status(error.response.status).send(error.response.data);
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async createShipment(req: express.Request, res: express.Response): Promise<any> {

		const user = req.user as any;
		req.body.companyId = user.companyId;
		req.body.userId = user.id;

		try {

			const { coId, coRelayId, MCNumber, trackVia } = req.body;
			let credentials = await this.getCredentials(req.body)

			if (credentials.clientId
				&& credentials.clientSecret
				&& credentials.expiresOn
				&& credentials.accessToken){

				credentials = await this.generateNewAccessToken(credentials)
				const loadDetails = await this.project44Service.getCustomerOrderLoadDetailsForCreatingOrder(coId, coRelayId)

				if (loadDetails.data
					&& loadDetails.data.length > 0
					&& loadDetails.data[0]
					&& loadDetails.data[0].length >0
					&& loadDetails.data[0][0]){

					const stopDetails = loadDetails.data[0][0].stops ? JSON.parse(`[${loadDetails.data[0][0].stops}]`) : [];

					const stops = [] as any
					if (stopDetails.length > 0) {
						for (const stopData of stopDetails) {
							const stopValue = {
								'appointmentWindow': {
									'endDateTime': moment(stopData.fromDate).format('YYYY-MM-DDTHH:mm:ss'),
									'localTimeZoneIdentifier': 'UTC',
									'startDateTime': moment(stopData.fromDate).format('YYYY-MM-DDTHH:mm:ss'),

								},
								'location': {
									'address': {
										'addressLines': [
											stopData.facilityItem.address1 ? stopData.facilityItem.address1 : '',
										],
										'city': stopData.facilityItem.city ? stopData.facilityItem.city : '',
										'country': 'US',
										'postalCode': stopData.facilityItem.zip ? stopData.facilityItem.zip : '',
										'state': stopData.facilityItem.state ? stopData.facilityItem.state : ''
									},
									'contact': {
										'companyName' : stopData.facilityItem.name
									}
								},
								'stopNumber': stopData.stopNumber
							}
							stops.push(stopValue)
						}
					}

					const data = {
						'carrierIdentifier': {
							'type': 'MC_NUMBER',
							'value': MCNumber
						},
						'equipmentIdentifiers': [
							{
								'shouldDelete': false,
								'type': 'MOBILE_PHONE_NUMBER',
								'value': trackVia.mobile ? trackVia.mobile : null
							}
						],
						'shipmentIdentifiers': [
							{
								'type': 'ORDER',
								'value': loadDetails.data[0][0].carrier_Id ? loadDetails.data[0][0].carrier_Id.toString() : null,
							}
						],
						'shipmentStops': stops
					}

					if (stops.length > 1) {
						const request = {
							accessToken : credentials.accessToken,
							data
						}
						const response = await this.project44Service.createTlShipment(request)
						if (response.data) {
							const id = response.data.id;
							await this.project44Service.updateOrderId(id, coId, coRelayId)
							res.send({ message : 'Successfully created the load', data : response.data})
						} else {
							res.status(500).send({'message': 'Unable to create LT Shipment'});
						}

					} else {
						res.status(500).send({ 'message' : 'Selected stop has lessthan 2 stops, Minimum 2 stops required' });
					}

				} else {
					res.status(500).send({message : 'Unable to get Load for the give CO_ID/CO_RELAY_ID'});
				}

			} else {
				res.status(500).send({message : 'Unable to get Project44 Credentials'});
			}

		}  catch(error) {
			if (error.response.status){
				res.status(error.response.status).send(error.response.data);
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async updateShipment(req: express.Request, res: express.Response): Promise<any> {
		try {

			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			const { coId, coRelayId, MCNumber } = req.body;
			let credentials = await this.getCredentials(req.body)

			if (credentials.clientId
				&& credentials.clientSecret
				&& credentials.expiresOn
				&& credentials.accessToken){

				credentials = await this.generateNewAccessToken(credentials)
				const loadDetails = await this.project44Service.getCustomerOrderLoadDetailsForCreatingOrder(coId, coRelayId)

				if (loadDetails.data
					&& loadDetails.data.length > 0
					&& loadDetails.data[0]
					&& loadDetails.data[0].length >0
					&& loadDetails.data[0][0]
					&& loadDetails.data[0][0].visibilityOrderId){

					const stopDetails = loadDetails.data[0][0].stops ? JSON.parse(`[${loadDetails.data[0][0].stops}]`) : [];

					const stops = [] as any
					if (stopDetails.length > 0) {
						for (const stopData of stopDetails) {
							const stopValue = {
								'appointmentWindow': {
									'endDateTime': moment(stopData.fromDate).format('YYYY-MM-DDTHH:mm:ss'),
									'localTimeZoneIdentifier': 'UTC',
									'startDateTime': moment(stopData.fromDate).format('YYYY-MM-DDTHH:mm:ss'),

								},
								'location': {
									'address': {
										'addressLines': [
											stopData.facilityItem.address1 ? stopData.facilityItem.address1 : '',
										],
										'city': stopData.facilityItem.city ? stopData.facilityItem.city : '',
										'country': 'US',
										'postalCode': stopData.facilityItem.zip ? stopData.facilityItem.zip : '',
										'state': stopData.facilityItem.state ? stopData.facilityItem.state : ''
									},
									'contact': {
										'companyName' : stopData.facilityItem.name
									}
								},
								'stopNumber': stopData.stopNumber
							}
							stops.push(stopValue)
						}
					}

					const data = {
						'carrierIdentifier': {
							'type': 'MC_NUMBER',
							'value': MCNumber
						},
						'shipmentIdentifiers': [
							{
								'type': 'ORDER',
								'value': loadDetails.data[0][0].carrier_Id ? loadDetails.data[0][0].carrier_Id.toString() : null,
							}
						],
						'shipmentStops': stops
					}

					if (stops.length > 1) {
						const request = {
							accessToken : credentials.accessToken,
							data,
							shipmentId : loadDetails.data[0][0].visibilityOrderId
						}
						const response = await this.project44Service.updateTlShipment(request)
						if (response.data) {
							res.send({ message : 'Successfully updated the load', data : response.data})
						} else {
							res.status(500).send({'message': 'Unable to update LT Shipment'});
						}

					} else {
						res.status(500).send({ 'message' : 'Selected stop has lessthan 2 stops, Minimum 2 stops required' });
					}

				} else {
					res.status(500).send({message : 'Unable to get Load for the give CO_ID/CO_RELAY_ID'});
				}

			} else {
				res.status(500).send({message : 'Unable to get Project44 Credentials'});
			}

		}  catch(error) {
			if (error.response.status){
				res.status(error.response.status).send(error.response.data);
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async deleteShipment(req: express.Request, res: express.Response): Promise<any> {
		try {

			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			const { coId, coRelayId } = req.body;
			let credentials = await this.getCredentials(req.body)

			if (credentials.clientId
				&& credentials.clientSecret
				&& credentials.expiresOn
				&& credentials.accessToken){

				credentials = await this.generateNewAccessToken(credentials)
				const loadDetails = await this.project44Service.getCustomerOrderLoadDetailsForCreatingOrder(coId, coRelayId)

				if (loadDetails.data
					&& loadDetails.data.length > 0
					&& loadDetails.data[0]
					&& loadDetails.data[0].length >0
					&& loadDetails.data[0][0]
					&& loadDetails.data[0][0].visibilityOrderId){

					const request = {
						accessToken : credentials.accessToken,
						shipmentId : loadDetails.data[0][0].visibilityOrderId
					}
					const response = await this.project44Service.deleteTlShipment(request)
					if (response.data) {
						await this.project44Service.updateOrderId(null, coId, coRelayId)
						res.send({ message : 'Successfully deleted the load', data : response.data})
					} else {
						res.status(500).send({'message': 'Unable to delete LT Shipment'});
					}

				} else {
					res.status(500).send({message : 'Unable to get Load for the give CO_ID/CO_RELAY_ID'});
				}

			} else {
				res.status(500).send({message : 'Unable to get Project44 Credentials'});
			}

		}  catch(error) {
			if (error.response.status){
				res.status(error.response.status).send(error.response.data);
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async getEventHistory(req: express.Request, res: express.Response): Promise<any> {
		try {

			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			const { coId, coRelayId } = req.body;
			let credentials = await this.getCredentials(req.body)

			if (credentials.clientId
				&& credentials.clientSecret
				&& credentials.expiresOn
				&& credentials.accessToken) {

				credentials = await this.generateNewAccessToken(credentials)
				const loadDetails = await this.project44Service.getCustomerOrderLoadDetailsForCreatingOrder(coId, coRelayId)

				if (loadDetails.data
					&& loadDetails.data.length > 0
					&& loadDetails.data[0]
					&& loadDetails.data[0].length > 0
					&& loadDetails.data[0][0]
					&& loadDetails.data[0][0].visibilityOrderId) {

					const request = {
						accessToken : credentials.accessToken,
						shipmentId : loadDetails.data[0][0].visibilityOrderId
					}

					const response = await this.project44Service.getEventHistory(request)
					if (response.data) {
						res.send(response.data)
					} else {
						res.status(500).send({'message': 'Unable to get shipment updates'});
					}

				} else {
					res.status(500).send({message : 'Unable to get Load for the give CO_ID/CO_RELAY_ID'});
				}

			} else {
				res.status(500).send({message : 'Unable to get Project44 Credentials'});
			}

		}  catch(error) {
			if (error.response.status){
				res.status(error.response.status).send(error.response.data);
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async getPositionHistory(req: express.Request, res: express.Response): Promise<any> {
		try {

			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			const { coId, coRelayId } = req.body;
			let credentials = await this.getCredentials(req.body)

			if (credentials.clientId
				&& credentials.clientSecret
				&& credentials.expiresOn
				&& credentials.accessToken) {

				credentials = await this.generateNewAccessToken(credentials)
				const loadDetails = await this.project44Service.getCustomerOrderLoadDetailsForCreatingOrder(coId, coRelayId)

				if (loadDetails.data
					&& loadDetails.data.length > 0
					&& loadDetails.data[0]
					&& loadDetails.data[0].length > 0
					&& loadDetails.data[0][0]
					&& loadDetails.data[0][0].visibilityOrderId) {

					const request = {
						accessToken : credentials.accessToken,
						shipmentId : loadDetails.data[0][0].visibilityOrderId
					}

					const response = await this.project44Service.getPositionHistory(request)
					if (response.data) {
						res.send(response.data)
					} else {
						res.status(500).send({'message': 'Unable to get shipment updates'});
					}

				} else {
					res.status(500).send({message : 'Unable to get Load for the give CO_ID/CO_RELAY_ID'});
				}

			} else {
				res.status(500).send({message : 'Unable to get Project44 Credentials'});
			}

		}  catch(error) {
			if (error.response.status){
				res.status(error.response.status).send(error.response.data);
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	private async getCredentials(request : any) : Promise<any>{

		const { companyId } = request;

		try {
			const companyIntegrationDetails = await this.companyService.getCompanyIntegration(companyId,
				'visibility', null, false);

			if (companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length>0
				&& companyIntegrationDetails.data[0].Partner
				&& companyIntegrationDetails.data[0].Partner === 'project44'
				&& companyIntegrationDetails.data[0].UserName
				&& companyIntegrationDetails.data[0].Password
				&& companyIntegrationDetails.data[0].AccessToken
				&& companyIntegrationDetails.data[0].ClientSecret
				&& companyIntegrationDetails.data[0].ClientId
				&& companyIntegrationDetails.data[0].ExpiresOn){

				return {
					accessToken : companyIntegrationDetails.data[0].AccessToken,
					clientId : companyIntegrationDetails.data[0].ClientId,
					clientSecret : companyIntegrationDetails.data[0].ClientSecret,
					expiresOn : companyIntegrationDetails.data[0].ExpiresOn,
					password : companyIntegrationDetails.data[0].Password,
					userName : companyIntegrationDetails.data[0].UserName
				}

			} else {
				return { message : 'Unable to get Project44 Credentials' }
			}
		} catch (e) {
			return { message : 'Unable to get Project44 Credentials' }
		}
	}

	private async generateNewAccessToken(req: any) : Promise<any> {
		try {

			if(req.clientSecret
				&& req.clientId) {

				const tokenResult = await this.project44Service.grantAccessToken(req)

				if (tokenResult.data
					&& tokenResult.data.access_token
					&& tokenResult.data.expires_in) {

					req.accessToken = tokenResult.data.access_token
					req.expiresOn = tokenResult.data.expires_in
					await this.project44Service.updateProject44Credentials(req);

					return {
						accessToken : req.accessToken,
						clientId : req.clientId,
						clientSecret : req.clientSecret,
						expiresOn : req.expiresOn
					}

				} else {
					return
				}

			} else {
				return
			}

		} catch (e){
			return
		}
	}
}
export default Project44Controller;