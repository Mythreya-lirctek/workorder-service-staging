import Database from '../database/database';
import axios, { AxiosInstance } from 'axios';

class ContractorService {
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

	public async createContractor(req: any): Promise<any> {
		try {
			const result = await this.client.post('/integrations/api/checkhq/createContractor', req);
			if(req.module === 'ownerop') {
				this.db.query(`update owneroperator set CheckHQId=${this.db.connection.escape(result.data.data.id)} where Id=${req.module_Id}`);
			} else if(req.module === 'carrier') {
				this.db.query(`update carriers set CheckHQId=${this.db.connection.escape(result.data.data.id)} where Id=${req.module_Id}`);
			}
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async listContractors(contractorId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/listContractors/${contractorId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async getContractor(contractorId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getcontractor/${contractorId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async updateContractor(contractorId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updateContractor/${contractorId}`, req);
			return result;
		} catch (e) {
			return e;
		}
	}

	public async contractorOnboard(contractorId: any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/contractor/${contractorId}/onboard`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async listContractorPayment(contractorId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/listContractorPayment/${contractorId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async getContractorPayment(contractorId: any, payrollId: any, type: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getContractorPayment/${contractorId}/${payrollId}/${type}`, {
				responseType : type === 'pdf' ? 'arraybuffer' : 'json'
			});
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default ContractorService;