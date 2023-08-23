import Database from '../database/database';
import axios, { AxiosInstance } from 'axios';

class WorkPlaceService {
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

	public async createWorkplace(req: any): Promise<any> {
		try {
			const result = await this.client.post('/integrations/api/checkhq/createWorkplace', req);
			this.db.query(`INSERT INTO workplace(Module_Id,Module,createdUserId,createdAt,CheckHQId) values(${req.module_Id}, ${this.db.connection.escape(req.module)}, ${req.userId},UTC_TIMESTAMP, ${this.db.connection.escape(result.data.data.id)})`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async listWorkplaces(companyId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/listWorkplaces/${companyId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async getWorkPlace(workPlaceId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getWorkPlace/${workPlaceId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async updateWorkPlace(workPlaceId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updateWorkPlace/${workPlaceId}`, req);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default WorkPlaceService;