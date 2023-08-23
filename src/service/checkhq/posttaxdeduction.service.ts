import axios, { AxiosInstance } from 'axios';
class PostTaxDeductionService {
	private client: AxiosInstance;
	constructor() {
		this.client = axios.create({
			baseURL: 'http://localhost:4019',
		});
	}
	public async createPostTaxDeduction(req: any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/createPostTaxDeduction`,req);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async getPostTaxDeduction(postTaxDeductionId: any): Promise<any> {
		try {
			const result = this.client.get(`/integrations/api/checkhq/getPostTaxDeduction/${postTaxDeductionId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async updatePostTaxDeduction(
		postTaxDeductionId: any,
		req: any
	): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updatePostTaxDeduction/${postTaxDeductionId}`,req);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async listPostTaxDeduction(id: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/listPostTaxDeduction/${id}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async deletePostTaxDeduction(postTaxDeductionId: any): Promise<any> {
		try {
			const result = await this.client.delete(`/integrations/api/checkhq/deletePostTaxDeduction/${postTaxDeductionId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default PostTaxDeductionService;