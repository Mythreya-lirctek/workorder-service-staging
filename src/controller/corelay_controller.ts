import { BaseController } from './base_controller';
import express from 'express';
import CORelayService from '../service/corelay/corelay.service';
import COCarrierLineItemService from '../service/cocarrierlineitem/cocarrierlineitem.service';
import COStopService from '../service/costop/costop.service';
import AddressService from '../service/address/address.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

export default class RelayController extends BaseController {
	private coRelayService: CORelayService;
	private coCarrierLineItemService: COCarrierLineItemService;
	private coStopService: COStopService;
	private addressService: AddressService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.coRelayService = new CORelayService();
		this.coCarrierLineItemService = new COCarrierLineItemService();
		this.coStopService = new COStopService();
		this.addressService = new AddressService();
		this.activityLogService = new ActivityLogService();
	}

	public async addCORelay(req: express.Request, res: express.Response): Promise<any> {
		const { carrierLineItems, ...doRequest} = req.body;
		try {
			const user = req.user as any;
			doRequest.userId = user.id;
			doRequest.companyId = user.companyId;
			
			const addRelayResp = await this.coRelayService.addCORelay(doRequest);
			const relayId = addRelayResp.data[0][0].id;
			if (!relayId) {
				throw new Error(`failed to create Relay ${JSON.stringify(addRelayResp.data[0])}`);
			}
			
			// Dispatch order created successfully proceed with dostops creations
			let stopsResponse;
			const processStopsDetails = [];
			const orderNumber = 1;
			let stops = await this.coStopService.getStopsbyCOIdRelayId({co_Id: doRequest.customerOrder_Id, coRelay_Id: doRequest.previousRelay_Id});
			stops = stops.data;
			stops.push({
				address_Id: doRequest.facilityAddress_Id,
				coStop_Id: null,
				dropContact_Id: doRequest.facilityId,
				dropDate: doRequest.toDate,
				dropTime: doRequest.toTime,
				pickupDate: doRequest.fromDate,
				pickupTime: doRequest.fromTime
			});
			
			let stopNumber = doRequest.afterStopNumber;
			
			if (stops) {
				for (const item of stops) {
					item.userId = user.id;
					if (item.dropContact_Id && item.coStop_Id === null) {
						item.stopType = 'Delivery';
						item.customerOrder = null;
						item.stopNumber = doRequest.afterStopNumber + 1;
						item.dispatchStatus = doRequest.dispatchStatus;
						item.contact_Id = item.dropContact_Id;
						item.customerOrder_Id = doRequest.customerOrder_Id;
						item.coRelay_Id = doRequest.previousRelay_Id;
						item.fromDate = item.dropDate;
						item.fromTime = item.dropTime;
						item.isCOStop = 0;
						const coStop = await this.coStopService.addCoStop(item);
						item.coStops_Id = coStop.data.insertId;
										
						item.dispatchStatus = 1;
						item.stopNumber = 1;
						item.stopType = 'Pickup';
						item.coRelay_Id = relayId;
						item.customerOrder_Id = doRequest.customerOrder_Id;
						item.fromDate = item.pickupDate;
						item.fromTime = item.pickupTime;
						item.isCOStop = 0;
						const coStop2 = await this.coStopService.addCoStop(item);
						item.coStops_Id = coStop2.data.insertId;
					} else {		
						if(item.stopNumber > stopNumber) {
							item.stopNumber = stopNumber + 1;
							item.coRelay_Id = relayId;
							item.userId = user.id;
							delete item.fromDate;
							delete item.fromTime;
							delete item.toDate;
							delete item.toTime;
							processStopsDetails.push(this.coStopService.saveCOStop(item));
							stopNumber = stopNumber + 1;
						}						
					}
				}
				stopsResponse = await Promise.all(processStopsDetails);
			}
			
			// add carrier Line items details
			let carrierLineItemsResponse;
			const processCarrierLineItemsDetails = [];
			if (carrierLineItems) {
				for (const item of carrierLineItems) {
					item.userId = user.id;
					item.coRelay_Id = relayId;
					processCarrierLineItemsDetails.push(this.coCarrierLineItemService.addCoCarrierLineItem(item));
				}
				carrierLineItemsResponse = await Promise.all(processCarrierLineItemsDetails);
			}
			
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'CORelay',
				module_Id: relayId,
				userId: user.id,
			});

			res.send(this.getSuccessResponse({relay_Id: relayId
			}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error, 500));
		}
	}    
	
	public async saveCORelay(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {relayId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			req.body.relayId = relayId;
			
			const result = await this.coRelayService.saveCORelay(req.body);

			if(req.body.status_Id && req.body.status_Id === 7){
				await this.coCarrierLineItemService.deleteCOCarrierLineItemByRelayId(relayId)
			}
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'CORelay',
				module_Id: relayId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	
	public async deleteCORelay(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {relayId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.relayId = relayId;
			
			const result = this.coRelayService.deleteCORelay(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'CORelay',
				module_Id: relayId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Deleted Successfully' }));            
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}