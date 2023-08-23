import { BaseController } from './base_controller';
import express from 'express';
import ConfigService from '../service/config/config';
import {HeremapsService} from '../service/heremaps/heremaps.service';

class HeremapsController extends BaseController{

   	private heremapsService: HeremapsService;
	private hereMapsApiKey: string

	constructor() {
		super();
		this.hereMapsApiKey = ConfigService.configs.heremaps.apiKey
		this.heremapsService = new HeremapsService();
	}

	public async calculateRoute(req: express.Request, res: express.Response): Promise<any>{
		try {

			const { location } = req.body;
			const routeRequest = {} as any
			routeRequest.apiKey = this.hereMapsApiKey
			routeRequest.mode = 'fastest;truck'

			for (let i = 0; i < location.length; i++) {
				routeRequest[`waypoint${i}`] = `geo!${location[i].latitude},${location[i].longitude}`
			}

			const getRouteData = await this.heremapsService.calculateRoute(routeRequest)
			if (getRouteData.data && getRouteData.data.response){
				res.send(getRouteData.data.response)
			}else {
				res.send({message : 'Route Not Found'})
			}

		}catch (error) {
			res.status(500).send(error.message);
		}
	}


}
export default HeremapsController;