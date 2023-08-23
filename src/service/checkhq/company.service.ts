import Database from '../database/database';
import axios, { AxiosInstance } from 'axios';

class CompanyService {
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

	public async createCompany(req: any): Promise<any> {
		try {
			const result = await this.client.post('/integrations/api/checkhq/createCompany', req);
			this.db.query(`update company set CheckHQId=${this.db.connection.escape(result.data.data.id)} where Id=${req.companyId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async getCompanyIntegration(companyId: number, integrationType:string, partner:string, isBrokerage:boolean = false): Promise<any> {
		if (partner == null ){
			return this.databaseget.query(`select * from companyintegrations where Company_Id=${companyId} and IntegrationType='${integrationType}' and IsBrokerage=${isBrokerage ? 1:0 }`);
		} else {
			return this.databaseget.query(`select * from companyintegrations where Company_Id=${companyId} and IntegrationType='${integrationType}' and  Partner = '${partner}' and IsBrokerage=${isBrokerage ? 1:0 }`);
		}
	}
	
	public async getCompany(req: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getCompany/${req}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async getSamsaraToken(companyId: number): Promise<any> {
		return this.databaseget.query(`select samsaraToken from company where Id=${companyId}`);
	}


	public async updateCompany(companyId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updateCompany/${companyId}`, req);
			return result;
		} catch (e) {
			return e;
		}
	}

	public async companyOnboard(companyId: any, req: any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/companies/${companyId}/onboard`, req);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async listCompany(): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/companies/listCompany`);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default CompanyService;