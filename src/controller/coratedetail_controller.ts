import express from 'express';
import { BaseController } from './base_controller';
import ActivityLogService from '../service/activitylog/activitylog.service';
import CORateDetailService from '../service/coratedetail/coratedetail.service';


export default class CoratedController extends  BaseController{
	private activityLogService: ActivityLogService;
	private coRateDetailService: CORateDetailService;
	constructor() {
		super();
		this.activityLogService = new ActivityLogService();
		this.coRateDetailService = new CORateDetailService();
	}

	public async addCoRateDetail(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.coRateDetailService.addCoRateDetail(req.body);
			this.coRateDetailService.updateCOInvoiceamount(req.body.customerOrder_Id);
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'CoRateDetail', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async saveCoRateDetail(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const {id} = req.params;
			req.body.coRateDetailId =id;

			const result = await this.coRateDetailService.saveCoRateDetail(req.body);
			this.coRateDetailService.updateCOInvoiceamount(req.body.customerOrder_Id);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'CoRateDetail', 
				module_Id: id, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ result:'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCORateDetailsByCOId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { customerOrderId } = req.params;
			const result = await this.coRateDetailService.getCORateDetailsByCOId(Number(customerOrderId));
			res.send(this.getSuccessResponse({ data: result.data[0] }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

}
