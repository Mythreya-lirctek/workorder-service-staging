import express from 'express';
import { BaseController } from './base_controller';
import UploadRateconLogService from '../service/uploadrateconlog/uploadrateconlog.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import PDFService from '../service/pdf/pdf.service';
import { parse } from 'json2csv';

class AddressController extends BaseController {
	private uploadRateconLogService: UploadRateconLogService;
	private activityLogService: ActivityLogService;
	private pdfService: PDFService;
	constructor() {
		super();
		this.uploadRateconLogService = new UploadRateconLogService();
		this.activityLogService = new ActivityLogService();
		this.pdfService = new PDFService();
	}

	public async addUploadRateconLog(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			
			const result = await this.uploadRateconLogService.addUploadRateconLog(req.body);
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'UploadRateconLog',
				module_Id: result.data.insertId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }))
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	};

	public async saveUploadRateconLog(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const { uploadRateconLogId } = req.params;
			req.body.uploadRateconLogId = uploadRateconLogId;
			
			const result = await this.uploadRateconLogService.saveUploadRateconLog(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'UploadRateconLog',
				module_Id: uploadRateconLogId,
				userId: req.body.userId,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }))
		}
		catch (error) {
			res.status(500).send((error));
		}
	}
	
	public async getUploadRateconLog(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.uploadRateconLogService.getUploadRateconLog(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

}
export default AddressController;
