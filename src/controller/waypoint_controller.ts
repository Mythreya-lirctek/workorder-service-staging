import express from 'express';
import { BaseController } from './base_controller';
import WayPointService from '../service/waypoint/waypoint.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import AddressService from '../service/address/address.service';

class WayPointController extends BaseController {
	private wayPointService: WayPointService;
	private activityLogService: ActivityLogService;
	private addressService: AddressService;
	constructor() {
		super();
		this.wayPointService = new WayPointService();
		this.activityLogService = new ActivityLogService();
		this.addressService = new AddressService();
	}
	
	public async addWayPoint(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			const { address } = req.body;
			if (address && !req.body.address_Id) {
				address.userId = user.id;
				const addressResult = await this.addressService.addAddress(address);
				req.body.address_Id = addressResult.data.insertId;
			}
			
			const result = await this.wayPointService.addWaypoint(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WayPoint', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async saveWayPoint(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {waypointId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.waypointId = waypointId;
			const { address } = req.body;
			
			if (address && req.body.address_Id > 0) {
				address.userId = user.id;
				address.addressId = req.body.address_Id;
				const addressResult = await this.addressService.saveAddress(address);
			}
			
			const result = await this.wayPointService.savewaypoint(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WayPoint',
				module_Id: waypointId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async updateWaypointAddress(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resultt = await this.wayPointService.updateWaypointAddress(req.body);
			res.send(this.getSuccessResponse({result: 'updated successfully'}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getWPstopsbyDORelayId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resultt = await this.wayPointService.getWPstopsbyDORelayId(req.body);
			res.send(this.getSuccessResponse(resultt.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default WayPointController;