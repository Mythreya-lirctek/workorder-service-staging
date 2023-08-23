import axios, { AxiosInstance } from 'axios';
class BenefitService {
	private client: AxiosInstance;
	constructor() {
		this.client = axios.create({
			baseURL: 'http://localhost:4019',
		});
	}

	public async createBenefit(req: any): Promise<any> {
		try {
			const result = await this.client.post(
				`/integrations/api/checkhq/createBenefit`,
				req
			);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async getBenefit(benefitId: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/getBenefit/${benefitId}`
			);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async listBenefit(id: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/listBenefit/${id}`
			);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async updateBenefit(benefitId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(
				`/integrations/api/checkhq/updateBenefit/${benefitId}`,
				req
			);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async deleteBenefit(benefitId: any): Promise<any> {
		try {
			const result = await this.client.delete(
				`/integrations/api/checkhq/deleteBenefit/${benefitId}`
			);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default BenefitService;
