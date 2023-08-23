import express from 'express';
import { BaseController } from './base_controller';
import CheckHQReportsService from '../service/checkhq/reports.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class CheckHQReportsController extends BaseController {
	private checkHQReportsService: CheckHQReportsService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.checkHQReportsService = new CheckHQReportsService();
		this.activityLogService = new ActivityLogService();
	}
	
	public async getPayrollJournal(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			const result = await this.checkHQReportsService.getPayrollJournal(companyId, req.body,req.headers);
			if(result.data) {
				res.set({
					'Content-type' : req.headers.accept
				})
				res.send(this.getSuccessResponseWithCsv((result.data ? result.data: {}),req.headers.accept));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getPayrollSummary(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			const result = await this.checkHQReportsService.getPayrollSummary(companyId, req.body,req.headers);
			if(result.data) {
				res.set({
					'Content-type' : req.headers.accept
				})
				res.send(this.getSuccessResponseWithCsv((result.data ? result.data: {}),req.headers.accept));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getContractorPaymentsReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQReportsService.getContractorPaymentsReport(companyId, req.body,req.headers);
			if(result.data) {
				res.set({
					'Content-type' : req.headers.accept
				})
				res.send(this.getSuccessResponseWithCsv((result.data ? result.data: {}),req.headers.accept));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getW2PreviewReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQReportsService.getW2PreviewReport(companyId, req.body,req.headers);
			if(result.data) {
				res.set({
					'Content-type' : req.headers.accept
				})
				res.send(this.getSuccessResponseWithCsv((result.data ? result.data: {}),req.headers.accept));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getW4ExemptStatusReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQReportsService.getW4ExemptStatusReport(companyId, req.body,req.headers);
			if(result.data) {
				res.set({
					'Content-type' : req.headers.accept
				})
				res.send(this.getSuccessResponseWithCsv((result.data ? result.data: {}),req.headers.accept));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getPaydays(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			const result = await this.checkHQReportsService.getPaydays(companyId, req.body,req.headers);
			if(result.data) {
				res.send(this.getSuccessResponse(result.data ? result.data.data: {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	private getSuccessResponseWithCsv(data: any, reponseType: any = 'application/json', statusCode: number = 200): any {
		if (reponseType.toLowerCase() === 'text/csv') {
			return  Buffer.from(data);
		} else {
			const result = (Array.isArray(data) || typeof data === 'string') ? data : {...data};
			return {
				data: result,
				status: statusCode
			};
		}
	}
}

export default CheckHQReportsController;