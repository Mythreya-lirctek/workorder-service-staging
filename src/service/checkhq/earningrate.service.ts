import Database from '../database/database';
import axios, { AxiosInstance } from 'axios';

class EarningRateService {
	private db: Database;
	private databaseget: Database;
	private client: AxiosInstance;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
	}

	public async createEarningRate(req: any): Promise<any> {
		try {
			const result = await this.client.post('/integrations/api/checkhq/createEarningRate', req);
			if(req.module === 'Ownerop') {
				this.db.query(`update owneroperator set CheckHQId=${this.db.connection.escape(result.data.data.id)} where Id=${req.module_Id}`);
			} else if(req.module === 'Carrier') {
				this.db.query(`update carriers set CheckHQId=${this.db.connection.escape(result.data.data.id)} where Id=${req.module_Id}`);
			}
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async listEarningRates(earningRateId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/listEarningRates/${earningRateId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async getEarningRate(earningRateId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getearningRate/${earningRateId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async updateEarningRate(earningRateId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updateEarningRate/${earningRateId}`, req);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default EarningRateService;