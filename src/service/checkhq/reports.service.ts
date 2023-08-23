import Database from '../database/database';
import axios, { AxiosInstance,AxiosRequestConfig } from 'axios';

class ReportsService {
	private db: Database;
	private databaseget: Database;
	private client: AxiosInstance;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
		this.client.interceptors.request.use((config): AxiosRequestConfig => {
			config.responseType = (config.headers.accept && config.headers.accept.toLowerCase() === 'text/csv') ? 'arraybuffer':'json'
			return config;
		});
	}
	
	public async getPayrollJournal(companyId: any, req: any,header:any): Promise<any> {
		const result = await this.client.post(`/integrations/api/checkhq/reports/${companyId}/payrollJournal`, req,{
			headers:header
		});
		return result;
	}

	public async getPayrollSummary(companyId: any, req: any,header:any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/reports/${companyId}/payrollSummary`, req,{
				headers:header
			});
			return result;
		} catch (e) {
			return e;
		}
	}

	public async getContractorPaymentsReport(companyId: any, req: any,header:any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/reports/${companyId}/contractorPayments`, req,{
				headers:header
			});
			return result;
		} catch (e) {
			return e;
		}
	}

	public async getW2PreviewReport(companyId: any, req: any,header:any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/reports/${companyId}/w2Preview`, req,{
				headers:header
			});
			return result;
		} catch (e) {
			return e;
		}
	}

	public async getW4ExemptStatusReport(companyId: any, req: any,header:any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/reports/${companyId}/w4ExemptionStatus`, req,{
				headers:header
			});
			return result;
		} catch (e) {
			return e;
		}
	}
	public async getPaydays(companyId: any, req: any,header:any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/reports/${companyId}/paydays`, req,{
				headers:header
			});
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default ReportsService;