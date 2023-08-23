import express from 'express';
import { BaseController } from './base_controller';
import SchedulePlanningNotesService from '../service/scheduleplanningnotes/scheduleplanningnotes.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class SchedulePlanningNotesController extends BaseController {
	private schedulePlanningNotesService: SchedulePlanningNotesService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.schedulePlanningNotesService = new SchedulePlanningNotesService();
		this.activityLogService = new ActivityLogService();
	}

	public async getScheduleNotesByTruckId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.schedulePlanningNotesService.getScheduleNotesByTruckId(req.body.truck_Id);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async addSchedulePlanningNotes(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			
			const result = await this.schedulePlanningNotesService.addSchedulePlanningNotes(req.body);
			
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'SchedulePlanningNotes', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveSchedulePlanningNotes(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {schedulePlanningNotesId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.schedulePlanningNotesId = schedulePlanningNotesId;

			const result = await this.schedulePlanningNotesService.saveSchedulePlanningNotes(req.body);
			
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'SchedulePlanningNotes',
				module_Id: schedulePlanningNotesId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
}

export default SchedulePlanningNotesController;