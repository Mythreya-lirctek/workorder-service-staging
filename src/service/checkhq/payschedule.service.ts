import Database from '../database/database';
import axios, { AxiosInstance } from 'axios';

class PayScheduleService {
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

	public async createPayschedule(req: any): Promise<any> {
		try {
			const result = await this.client.post('/integrations/api/checkhq/createPayschedule', req);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async listPayschedules(companyId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/listPayschedules/${companyId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async getPaySchedule(payScheduleId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getPaySchedule/${payScheduleId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async updatePaySchedule(payScheduleId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updatePaySchedule/${payScheduleId}`, req);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async getPayDays(req: any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/getPayDays`, req);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default PayScheduleService;