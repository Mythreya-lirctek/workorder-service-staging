import axios, { AxiosInstance } from 'axios';

class PayrollItemService {
	private client: AxiosInstance;
	constructor() {
		this.client = axios.create({
			baseURL: 'http://localhost:4019',
		});
	}
	public async getPayrollItem(payrollItemId: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/getPayrollItem/${payrollItemId}`
			);

			return result;
		} catch (error) {
			return error;
		}
	}
	public async getPayrollItems(payrollId: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/getPayrollItems/${payrollId}`
			);

			return result;
		} catch (error) {
			return error;
		}
	}
	public async updatePayrollItem(payrollItemId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(
				`/integrations/api/checkhq/updatePayrollItem/${payrollItemId}`,
				req
			);

			return result;
		} catch (error) {
			return error;
		}
	}
	public async deletePayrollItem(payrollItemId: any): Promise<any> {
		try {
			const result = await this.client.delete(
				`/integrations/api/checkhq/deletePayrollItem/${payrollItemId}`
			);

			return result;
		} catch (error) {
			return error;
		}
	}
	public async getPaperCheck(payrollItemId: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/getPaperCheck/${payrollItemId}`, {
					responseType : 'arraybuffer'
				}
			);

			return result;
		} catch (error) {
			return error;
		}
	}
}
export default PayrollItemService;
