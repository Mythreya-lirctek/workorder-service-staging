import Database from '../database/database';
import axios, { AxiosInstance } from 'axios';

class EarningCodeService {
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

	public async createEarningCode(req: any): Promise<any> {
		try {
			const result = await this.client.post('/integrations/api/checkhq/createEarningCode', req);			
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async listEarningCodes(earningCodeId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/listEarningCodes/${earningCodeId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async getEarningCode(earningCodeId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getearningCode/${earningCodeId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async updateEarningCode(earningCodeId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updateEarningCode/${earningCodeId}`, req);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default EarningCodeService;