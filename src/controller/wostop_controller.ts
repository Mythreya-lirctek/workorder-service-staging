import express from 'express';
import { BaseController } from './base_controller';
import WOStopService from '../service/wostop/wostop.service';
import DOStopService from '../service/dostop/dostop.service';
import WOStopItemService from '../service/wostopitem/wostopitem.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import WayPointService from '../service/waypoint/waypoint.service';
import MilesService from '../service/miles/miles.service';

class WOStopController extends BaseController {
	private woStopService: WOStopService;
	private activityLogService: ActivityLogService;
	private woStopItemService: WOStopItemService;
	private doStopService: DOStopService;
	private wayPointService: WayPointService;
	private milesService: MilesService;
	constructor() {
		super();
		this.woStopService = new WOStopService();
		this.activityLogService = new ActivityLogService();
		this.woStopItemService = new WOStopItemService();
		this.doStopService = new DOStopService();
		this.wayPointService = new WayPointService();
		this.milesService = new MilesService();
	}

	public async addWOStop(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.woStopService.addStop(req.body);
			if(req.body.woStopItems && req.body.woStopItems.length > 0) {
				const stopItems = req.body.woStopItems;
				let stopItemsResponse;
				const processStopItemsDetails = [];
				for (const item of stopItems) {
					item.userId = user.id;
					item.woStops_Id = result.data.insertId;
					processStopItemsDetails.push(this.woStopItemService.addWOStopItem(item));
					const activityI = await this.activityLogService.addActivityLog({
						description: JSON.stringify(req.body),
						module: 'WOStopItem', 
						module_Id: result.data.insertId, 
						userId: user.id 
					});
				}
				stopItemsResponse = await Promise.all(processStopItemsDetails);
			}
			
			if(req.body.dispatchOrder_Id > 0) {
				req.body.woStops_Id = result.data.insertId;
				const dostop = await this.doStopService.addDOStop(req.body);
				const wayPoint = {
					address_Id: req.body.facilityItem.address_Id,
					dispatchOrder_Id: req.body.dispatchOrder_Id,
					doStops_Id: dostop.data.insertId,					
					orderNumber: req.body.stopNumber, 
					pickupDate: req.body.fromDate,
					relay_Id: req.body.relay_Id,
					stopType: req.body.stopType,
					userId: user.id
				}; 
				this.wayPointService.addWaypoint(wayPoint);
				this.milesService.calculateDOMiles({dispatchOrderId: req.body.dispatchOrder_Id, isFullTrip: 0,
													relay_Id: req.body.relay_Id ? req.body.relay_Id : null }, user.id);
			}
			
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOStop', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveWOStop(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {woStopId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.woStopId = woStopId;

			const result = await this.woStopService.saveWOStop(req.body);
			
			if(req.body.legStopNumber) {
				req.body.stopNumber = req.body.legStopNumber;
			}
			
			this.doStopService.saveDOStop(req.body);
			if(req.body.isDeleted) {
				this.wayPointService.updateWaypointsbyWOStops_Id({isDeleted: 1, woStopId});
			}
			
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOStop',
				module_Id: woStopId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOStopDetailsById(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {		
			const {woStopId} = req.params;
			
			req.body.woStopId = woStopId;
			const result = await this.woStopService.getWOStopDetailsById(
				Number(woStopId)
			);
			result.data[0].stopItems = result.data[0].stopItems ? JSON.parse(`[${result.data[0].stopItems}]`) : [];
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getStopsByWOId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resultt = await this.woStopService.getStopsByWOId(req.body.woId);
			for (const stop of resultt.data[0]) {
				stop.stopItems = (stop.stopItems ? JSON.parse(`[ ${stop.stopItems} ]`) : []);
			}
			res.send(this.getSuccessResponse(resultt.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getStopsWithStopItemsByWoId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const resultt = await this.woStopService.getStopsWithStopItemsByWoId(req.body);
			for (const stop of resultt.data[0]) {
				stop.woStopItems = (stop.woStopItems ? JSON.parse(`[ ${stop.woStopItems} ]`) : []);
				stop.facilityItem = (stop.facilityItem ? JSON.parse(`${stop.facilityItem}`) : null);
			}
			res.send(this.getSuccessResponse(resultt.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default WOStopController;