import axios, { AxiosInstance } from 'axios';
class ContractorPaymentService {
	private client: AxiosInstance;
	constructor () {
		this.client = axios.create({
			baseURL: 'http://localhost:4019',
		});
	}
	public async getContractorPayment(contractorPaymentId: string): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getContractorPayment/${contractorPaymentId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async updateContractorPayment(contractorPaymentId: string, req: any): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updateContractorPayment/${contractorPaymentId}`, req);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async deleteContractorPayment(contractorPaymentId: string): Promise<any> {
		try {
			const result = await this.client.delete(`/integrations/api/checkhq/deleteContractorPayment/${contractorPaymentId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async getContractorPaymentPaperCheck(contractorPaymentId: string): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getContractorPaymentPaperCheck/${contractorPaymentId}`, {
				responseType : 'arraybuffer'
			});
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default ContractorPaymentService