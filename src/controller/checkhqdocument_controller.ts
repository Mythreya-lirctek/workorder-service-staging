import express from 'express';
import { BaseController } from './base_controller';
import CheckHQDocumentService from '../service/checkhq/document.service';

class CheckHQDocumentController extends BaseController {
	private checkHQDocumentService: CheckHQDocumentService;
	constructor() {
		super();
		this.checkHQDocumentService = new CheckHQDocumentService();
	}
	public async listCompanyTaxDocument(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const result =
			await this.checkHQDocumentService.listCompanyTaxDocument(req.body);
			if (result.data) {
				res.send(
					this.getSuccessResponse(result.data ? result.data.data : {})
				);
			} else {
				res.status(500).send(
					this.getErrorResponse(result.response.data.error)
				);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async downloadCompanyTaxDocument(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { documentId } = req.params;

			const result =
				await this.checkHQDocumentService.downloadCompanyTaxDocument(
					documentId
				);
			if (result.data) {
				res.set({
					'Content-Type': 'application/pdf'
				})
				res.send(result.data ? Buffer.from(result.data) : {});
			} else {
				const { error } = JSON.parse(Buffer.from(result.response.data).toString('binary'))
				res.status(500).send(this.getErrorResponse(error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async listCompanyAuthorizationDocument(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const result =
				await this.checkHQDocumentService.listCompanyAuthorizationDocument(req.body);
			if (result.data) {
				res.send(
					this.getSuccessResponse(result.data ? result.data.data : {})
				);
			} else {
				res.status(500).send(
					this.getErrorResponse(result.response.data.error)
				);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async downloadCompanyAuthorizationDocument(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { documentId } = req.params;

			const result =
				await this.checkHQDocumentService.downloadCompanyAuthorizationDocument(
					documentId
				);
			if (result.data) {
				res.set({
					'Content-Type': 'application/pdf'
				})
				res.send(result.data ? Buffer.from(result.data) : {});
			} else {
				const { error } = JSON.parse(Buffer.from(result.response.data).toString('binary'))
				res.status(500).send(this.getErrorResponse(error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async listEmployeeTaxDocument(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const result =
				await this.checkHQDocumentService.listEmployeeTaxDocument(req.body);
			if (result.data) {
				res.send(
					this.getSuccessResponse(result.data ? result.data.data : {})
				);
			} else {
				res.status(500).send(
					this.getErrorResponse(result.response.data.error)
				);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async downloadEmployeeTaxDocument(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { documentId } = req.params;

			const result =
				await this.checkHQDocumentService.downloadEmployeeTaxDocument(
					documentId
				);
			if (result.data) {
				res.set({
					'Content-Type': 'application/pdf'
				})
				res.send(result.data ? Buffer.from(result.data) : {});
			} else {
				const { error } = JSON.parse(Buffer.from(result.response.data).toString('binary'))
				res.status(500).send(this.getErrorResponse(error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async listContractorTaxDocument(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const result =
				await this.checkHQDocumentService.listContractorTaxDocument(req.body);
			if (result.data) {
				res.send(
					this.getSuccessResponse(result.data ? result.data.data : {})
				);
			} else {
				res.status(500).send(
					this.getErrorResponse(result.response.data.error)
				);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async downloadContractorTaxDocument(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const { documentId } = req.params;

			const result =
				await this.checkHQDocumentService.downloadContractorTaxDocument(
					documentId
				);
			if (result.data) {
				res.set({
					'Content-Type': 'application/pdf'
				})
				res.send(result.data ? Buffer.from(result.data) : {});
			} else {
				const { error } = JSON.parse(Buffer.from(result.response.data).toString('binary'))
				res.status(500).send(this.getErrorResponse(error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}
export default CheckHQDocumentController;
