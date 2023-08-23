import axios, { AxiosInstance } from 'axios';

class PayrollService {
	private client: AxiosInstance;
	constructor() {
		this.client = axios.create({
			baseURL: 'http://localhost:4019',
		});
	}
	public async createPayroll(req: any): Promise<any> {
		try {
			const result = await this.client.post(
				`/integrations/api/checkhq/createPayroll`,
				req
			);

			return result;
		} catch (error) {
			return error;
		}
	}
	public async previewPayroll(payrollId: any,type:any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/previewPayroll/${payrollId}/${type}`, {
					responseType : type === 'csv' ? 'arraybuffer' : 'json'
				}
			);
			return result;
		} catch (error) {
			return error;
		}
	}
	public async reopenPendingPayroll(payrollId: any): Promise<any> {
		try {
			const result = await this.client.post(
				`/integrations/api/checkhq/reopenPendingPayroll/${payrollId}`
			);
			return result;
		} catch (error) {
			return error;
		}
	}
	public async approvePayroll(payrollId: any): Promise<any> {
		try {
			const result = await this.client.post(
				`/integrations/api/checkhq/approvePayroll/${payrollId}`
			);
			return result;
		} catch (error) {
			return error;
		}
	}
	public async getPayroll(payrollId: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/getPayroll/${payrollId}`
			);
			return result;
		} catch (error) {
			return error;
		}
	}
	public async updatePayroll(payrollId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(
				`/integrations/api/checkhq/updatePayroll/${payrollId}`,
				req
			);
			return result;
		} catch (error) {
			return error;
		}
	}
	public async listPayroll(companyId: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/listPayroll/${companyId}`
			);
			return result;
		} catch (error) {
			return error;
		}
	}
	public async deletePayroll(payrollId: any): Promise<any> {
		try {
			const result = await this.client.delete(
				`/integrations/api/checkhq/deletePayroll/${payrollId}`
			);
			return result;
		} catch (error) {
			return error;
		}
	}
	public async getPaperChecks(payrollId: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/getPaperChecks/${payrollId}`
			);
			return result;
		} catch (error) {
			return error;
		}
	}
}
export default PayrollService;
