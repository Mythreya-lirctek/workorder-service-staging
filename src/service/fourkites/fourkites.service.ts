import Database from '../database/database';
import moment from 'moment';
import axios, {AxiosInstance} from 'axios';

export class FourKitesService {
	private databaseget: Database;
	private client: AxiosInstance;
	constructor() {
		this.databaseget = new Database(true);
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
	}
	public async  getDataToSendToFourKites():Promise<any>{
		return this.databaseget.query(`CALL getdatatosendtoFourkites(
		   '${moment().format('YYYY-MM-DD')}'
		)`)
	}

	public async createLoad(req: any): Promise<any>{
		return this.client.post(`/integrations/api/fourkites/createLoad`, req.body,{
			headers:{ 'Content-Type': 'application/json', 'authorization' : req.headers.apiKey}
		});
	}

	public async createEasyLoad(req: any): Promise<any>{
		return this.client.post(`/integrations/api/fourkites/createEasyLoad`, req.body,{
			headers:{ 'Content-Type': 'application/json', 'authorization' : req.headers.apiKey}
		});
	}

	public async updateLoad(req: any): Promise<any>{
		const { loadId } = req.params;
		return this.client.post(`/integrations/api/fourkites/updateLoad/${loadId}`, req.body,{
			headers:{ 'Content-Type': 'application/json', 'authorization' : req.headers.apiKey}
		});
	}

	public async deleteLoad(req: any): Promise<any>{
		return this.client.post(`/integrations/api/fourkites/deleteLoad`, req.body,{
			headers:{ 'Content-Type': 'application/json', 'authorization' : req.headers.apiKey}
		});
	}

	public async getShipments(req: any): Promise<any>{
		return this.client.post(`/integrations/api/fourkites/getShipments`, req.body,{
			headers:{ 'Content-Type': 'application/json', 'authorization' : req.headers.apiKey}
		});
	}

	public async getShipmentDetails(req: any): Promise<any>{
		const { shipmentId } = req.params;
		return this.client.get(`/integrations/api/fourkites/getShipmentDetails/${shipmentId}`,{
			headers:{ 'Content-Type': 'application/json', 'authorization' : req.headers.apiKey}
		});
	}

	public async getShipmentEUrl(req: any): Promise<any>{
		const { shipmentId } = req.params;
		return this.client.get(`/integrations/api/fourkites/getShipmentEUrl/${shipmentId}`, {
			headers:{ 'Content-Type': 'application/json', 'authorization' : req.headers.apiKey}
		});
	}

	public async getStopEUrl(req: any): Promise<any>{
		return this.client.post(`/integrations/api/fourkites/getStopEUrl`, req.body,{
			headers:{ 'Content-Type': 'application/json', 'authorization' : req.headers.apiKey}
		});
	}

	public async getAssetList(req: any): Promise<any>{
		const { carrierId } = req.params;
		return this.client.get(`/integrations/api/fourkites/getAssetList/${carrierId}`, {
			headers:{ 'Content-Type': 'application/json', 'authorization' : req.headers.apiKey}
		});
	}

	public async createPurchaseOrder(req: any): Promise<any>{
		return this.client.post(`/integrations/api/fourkites/createPurchaseOrder`, req.body,{
			headers:{ 'Content-Type': 'application/json', 'authorization' : req.headers.apiKey}
		});
	}

	public async updatePurchaseOrder(req: any): Promise<any>{
		const { purchaseOrderId } = req.params;
		return this.client.post(`/integrations/api/fourkites/updatePurchaseOrder/${purchaseOrderId}`, req.body,{
			headers:{ 'Content-Type': 'application/json', 'authorization' : req.headers.apiKey}
		});
	}
}