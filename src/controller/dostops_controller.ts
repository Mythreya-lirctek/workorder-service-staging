import express from 'express';
import { BaseController } from './base_controller';
import DOStopsService from '../service/dostop/dostop.service';
import WOStopsService from '../service/wostop/wostop.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class DOStopsController extends BaseController {
	private doStopsService: DOStopsService;
	private woStopsService: WOStopsService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.doStopsService = new DOStopsService();
		this.woStopsService = new WOStopsService();
		this.activityLogService = new ActivityLogService();
	}

	public async addDOStop(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.doStopsService.addDOStop(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'DOStop', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveDOStop(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {doStopId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.doStopId = doStopId;

			const result = await this.doStopsService.saveDOStop(req.body);
			if (req.body.contact_Id) {
				this.woStopsService.saveWOStop({userId: user.id, woStopId: req.body.woStops_Id, contact_Id: req.body.contact_Id})
			}
			if(req.body.nextWOStop_Id) {
				this.woStopsService.saveWOStop({userId: user.id, woStopId: req.body.nextWOStop_Id, contact_Id: req.body.contact_Id});
			}
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'DOStop',
				module_Id: doStopId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getDOStopInfoByDOStopId(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {		
			const {doStopId} = req.params;
			
			req.body.doStopId = doStopId;
			const result = await this.doStopsService.getDOStopInfoByDOStopId(
				Number(doStopId)
			);
			res.send(this.getSuccessResponse(result.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getDoStopsbyDOIdRelayId(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {	
			const result = await this.doStopsService.getDoStopsbyDOIdRelayId(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
}

export default DOStopsController;