import express from 'express';
import { BaseController } from './base_controller';
import CurrentLocationService from '../service/currentlocation/currentlocation.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import PDFService from '../service/pdf/pdf.service';

class CurrentLocationController extends BaseController {
	private currentLocationService: CurrentLocationService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.currentLocationService = new CurrentLocationService();
		this.activityLogService = new ActivityLogService();
	}

	public async addCurrentLocation(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.currentLocationService.addCurrentLocation(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'CurrentLocation', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveCurrentLocation(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {currentLocationId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.currentLocationId = currentLocationId;

			const result = await this.currentLocationService.saveCurrentLocation(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'CurrentLocation',
				module_Id: currentLocationId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCurrentLocationsbyWOId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.currentLocationService.getCurrentLocationbyWOId(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
}

export default CurrentLocationController;
