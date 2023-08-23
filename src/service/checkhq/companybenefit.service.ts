import Database from '../database/database';
import axios, { AxiosInstance } from 'axios';

class CompanyBenefitService {
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

	public async createCompanyBenefit(req: any): Promise<any> {
		try {
			const result = await this.client.post('/integrations/api/checkhq/createCompanyBenefit', req);
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
	
	public async listCompanyBenefits(companyBenefitId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/listCompanyBenefits/${companyBenefitId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async getCompanyBenefit(companyBenefitId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getcompanyBenefit/${companyBenefitId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async updateCompanyBenefit(companyBenefitId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updateCompanyBenefit/${companyBenefitId}`, req);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async deleteCompanyBenefit(companyBenefitId: any): Promise<any>{
		try {
			const result = await this.client.delete(`/integrations/api/checkhq/deleteCompanyBenefit/${companyBenefitId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default CompanyBenefitService;