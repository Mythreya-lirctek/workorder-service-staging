import express from 'express';
import { BaseController } from './base_controller';
import COStopService from '../service/costop/costop.service';
import COStopItemService from '../service/costopitem/costopitem.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class COStopController extends BaseController {
	private coStopService: COStopService;
	private activityLogService: ActivityLogService;
	private coStopItemService: COStopItemService;
	constructor() {
		super();
		this.coStopService = new COStopService();
		this.activityLogService = new ActivityLogService();
		this.coStopItemService = new COStopItemService();
	}

	public async addCOStop(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			req.body.isCOStop = 1;
			const result = await this.coStopService.addCoStop(req.body);
			if(req.body.coStopItems && req.body.coStopItems.length > 0) {
				const stopItems = req.body.coStopItems;
				let stopItemsResponse;
				const processStopItemsDetails = [];
				for (const item of stopItems) {
					item.userId = user.id;
					item.coStops_Id = result.data.insertId;
					processStopItemsDetails.push(this.coStopItemService.addCOStopItem(item));
					const activityI = await this.activityLogService.addActivityLog({
						description: JSON.stringify(req.body),
						module: 'COStopItem', 
						module_Id: result.data.insertId, 
						userId: user.id 
					});
				}
				stopItemsResponse = await Promise.all(processStopItemsDetails);
			}
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COStop', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveCOStop(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {coStopId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.coStopId = coStopId;

			const result = await this.coStopService.saveCOStop(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'COStop',
				module_Id: coStopId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCOStopDetailsById(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {		
			const {coStopId} = req.params;

			req.body.coStopId = coStopId;
			const result = await this.coStopService.getCOStopDetailsById(
				Number(coStopId)
			);
			result.data[0].stopItems = result.data[0].stopItems ? JSON.parse(`[${result.data[0].stopItems}]`) : [];
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getStopsWithStopItemsByCoId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			const {coId} = req.params;
			req.body.companyId = user.companyId;
			const resultt = await this.coStopService.getStopsWithStopItemsByCoId(req.body);
			for (const stop of resultt.data[0]) {
				stop.coStopItems = (stop.coStopItems ? JSON.parse(`[ ${stop.coStopItems} ]`) : []);
				stop.facilityItem = (stop.facilityItem ? JSON.parse(`${stop.facilityItem}`) : null);
			}
			res.send(this.getSuccessResponse(resultt.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default COStopController;