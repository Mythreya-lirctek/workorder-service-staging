import express from 'express';
import { BaseController } from './base_controller';
import RateDetailService from '../service/ratedetail/ratedetail.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import WorkOrderService from '../service/workorder/workorder.service';
import WOInvoiceService from '../service/woinvoice/woinvoice.service';

class RateDetailController extends BaseController {
	private rateDetailService: RateDetailService;
	private activityLogService: ActivityLogService;
	private workOrderService: WorkOrderService;
	private woInvoiceService: WOInvoiceService;
	constructor() {
		super();
		this.rateDetailService = new RateDetailService();
		this.activityLogService = new ActivityLogService();
		this.workOrderService = new WorkOrderService();
		this.woInvoiceService = new WOInvoiceService();
	}

	public async addRateDetail(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.rateDetailService.addRateDetail(req.body);
			this.rateDetailService.updateWOInvoiceamount(req.body.workOrder_Id);	
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'RateDetail', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveRateDetail(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {rateDetailId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.rateDetailId = rateDetailId;

			const result = await this.rateDetailService.saveRateDetail(req.body);
			this.rateDetailService.updateWOInvoiceamount(req.body.workOrder_Id);	
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'RateDetail',
				module_Id: rateDetailId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getRateDetailsByWOId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { workOrderId } = req.params;
			const result = await this.rateDetailService.getRateDetailsByWOId(Number(workOrderId));
			res.send(this.getSuccessResponse({ data: result.data[0] }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default RateDetailController;