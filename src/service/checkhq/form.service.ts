import Database from '../database/database';
import axios, { AxiosInstance } from 'axios';

class FormService {
	private db: Database;
	private databaseget: Database;
	private client: AxiosInstance;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
		this.client = axios.create({
			baseURL: 'http://localhost:4019',
		});
	}
	public async getForm(formId: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/getForm/${formId}`
			);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async listForm(req: any): Promise<any> {
		try {
			const result = await this.client.post(
				`/integrations/api/checkhq/listForm`,
				req
			);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async renderForm(formId: any, req: any): Promise<any> {
		try {
			const result = await this.client.post(
				`/integrations/api/checkhq/renderForm/${formId}`,
				req,
				{
					responseType: req.type === 'pdf' ? 'arraybuffer' : 'json'
				}
			);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default FormService;
