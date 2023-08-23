import axios, { AxiosInstance } from 'axios';

class DocumentService {
	private client: AxiosInstance;
	constructor() {
		this.client = axios.create({
			baseURL: 'http://localhost:4019',
		});
	}
	public async listCompanyTaxDocument(fields: any): Promise<any> {
		try {
			const result = await this.client.post(
				`/integrations/api/checkhq/listCompanyTaxDocument`, fields);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async downloadCompanyTaxDocument(documentId: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/downloadCompanyTaxDocument/${documentId}`,{
					responseType: 'arraybuffer'
				}
			);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async listCompanyAuthorizationDocument(fields: any): Promise<any> {
		try {
			const result = await this.client.post(
				`/integrations/api/checkhq/listCompanyAuthorizationDocument`, fields);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async downloadCompanyAuthorizationDocument(
		documentId: any
	): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/downloadCompanyAuthorizationDocument/${documentId}`,{
					responseType: 'arraybuffer'
				}
			);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async listEmployeeTaxDocument(fields: any): Promise<any> {
		try {
			const result = await this.client.post(
				`/integrations/api/checkhq/listEmployeeTaxDocument`, fields);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async downloadEmployeeTaxDocument(documentId: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/downloadEmployeeTaxDocument/${documentId}`,{
					responseType: 'arraybuffer'
				}
			);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async listContractorTaxDocument(fields: any): Promise<any> {
		try {
			const result = await this.client.post(
				`/integrations/api/checkhq/listContractorTaxDocument`, fields);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async downloadContractorTaxDocument(documentId: any): Promise<any> {
		try {
			const result = await this.client.get(
				`/integrations/api/checkhq/downloadContractorTaxDocument/${documentId}`,{
					responseType: 'arraybuffer'
				}
			);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default DocumentService;
