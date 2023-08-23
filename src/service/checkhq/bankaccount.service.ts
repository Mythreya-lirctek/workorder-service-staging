import Database from '../database/database';
import axios, { AxiosInstance } from 'axios';

class BankAccountService {
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

	public async createBankAccount(req: any): Promise<any> {
		try {
			const result = await this.client.post('/integrations/api/checkhq/createBankAccount', req);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async listBankAccounts(req: any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/listBankAccounts`, req);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async getBankAccount(bankAccountId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getbankAccount/${bankAccountId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async updateBankAccount(bankAccountId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updateBankAccount/${bankAccountId}`, req);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async deleteBankAccount(bankAccountId: any): Promise<any> {
		try {
			const result = await this.client.delete(`/integrations/api/checkhq/deleteBankAccount/${bankAccountId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default BankAccountService;