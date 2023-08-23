import { BaseController } from './base_controller';
import express from 'express';
import RelayService from '../service/relay/relay.service';
import DriverLineItemService from '../service/driverlineitem/driverlineitem.service';
import OwnerOpLineItemService from '../service/owneroplineitem/owneroplineitem.service';
import CarrierLineItemService from '../service/carrierlineitem/carrierlineitem.service';
import DOStopsService from '../service/dostop/dostop.service';
import AddressService from '../service/address/address.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import WaypointService from '../service/waypoint/waypoint.service';
import WOStopService from '../service/wostop/wostop.service';
import MilesService from '../service/miles/miles.service';

export default class RelayController extends BaseController {
	private relayService: RelayService
	private driverLineItemService: DriverLineItemService;
	private ownerOpLineItemService: OwnerOpLineItemService;
	private carrierLineItemService: CarrierLineItemService;
	private doStopsService: DOStopsService;
	private addressService: AddressService;
	private waypointService: WaypointService;
	private activityLogService: ActivityLogService;
	private woStopService: WOStopService;
	private milesService: MilesService;
	constructor() {
		super();
		this.relayService = new RelayService();
		this.driverLineItemService = new DriverLineItemService();
		this.ownerOpLineItemService = new OwnerOpLineItemService();
		this.carrierLineItemService = new CarrierLineItemService();
		this.doStopsService = new DOStopsService();
		this.addressService = new AddressService();
		this.waypointService = new WaypointService();
		this.activityLogService = new ActivityLogService();
		this.woStopService = new WOStopService();
		this.milesService = new MilesService();
	}

	public async addRelay(req: express.Request, res: express.Response): Promise<any> {
		const { dr1LineItems, dr2LineItems, owneropLineItems, carrierLineItems, alIds,
				startingAddress, endingAddress, trailerAddress, ...doRequest} = req.body;
		try {
			const user = req.user as any;
			doRequest.userId = user.id;
			doRequest.companyId = user.companyId;
			
			if (startingAddress && startingAddress.address1) {
				startingAddress.userId = user.id;    
				const startingAddResult = await this.addressService.addAddress(startingAddress);
				doRequest.startingLocation_Id = startingAddResult.data.insertId;            
			}
			
			if (endingAddress && endingAddress.address1) {
				endingAddress.userId = user.id;    
				const endingAddResult = await this.addressService.addAddress(endingAddress);
				doRequest.endingLocation_Id = endingAddResult.data.insertId;            
			}
			
			if (trailerAddress && trailerAddress.address1) {
				trailerAddress.userId = user.id;    
				const trailerAddResult = await this.addressService.addAddress(trailerAddress);
				doRequest.trailerLocation_Id = trailerAddResult.data.insertId;            
			}
			
			const addRelayResp = await this.relayService.addRelay(doRequest);
			const relayId = addRelayResp.data[0][0].id;
			if (!relayId) {
				throw new Error(`failed to create Relay ${JSON.stringify(addRelayResp.data[0])}`);
			}
			
			// Dispatch order created successfully proceed with dostops creations
			let stopsResponse;
			const processStopsDetails = [];
			const orderNumber = 1;
			let stops = await this.doStopsService.getStopsbyDOIdRelayId({do_Id: doRequest.dispatchOrder_Id, relay_Id: doRequest.previousRelay_Id});
			stops = stops.data;
			stops.push({
				address_Id: doRequest.facilityAddress_Id,
				dropContact_Id: doRequest.facilityId,
				dropDate: doRequest.toDate,
				dropTime: doRequest.toTime,
				pickupDate: doRequest.fromDate,
				pickupTime: doRequest.fromTime,				
				woStop_Id: null								
			});
			
			let stopNumber = doRequest.afterStopNumber;
			
			if (stops) {
				for (const item of stops) {
					item.userId = user.id;
					if (item.dropContact_Id && item.woStop_Id === null) {
						item.stopType = 'Delivery';
						item.workOrder = null;
						item.stopNumber = doRequest.afterStopNumber + 1;
						item.dispatchStatus = doRequest.dispatchStatus;
						item.contact_Id = item.dropContact_Id;
						item.dispatchOrder_Id = doRequest.dispatchOrder_Id;						
						item.relay_Id = doRequest.previousRelay_Id;
						item.fromDate = item.dropDate;
						item.fromTime = item.dropTime;
						const woStop = await this.woStopService.addStop(item);
						item.woStops_Id = woStop.data.insertId;
						const stopId = await this.doStopsService.addDOStop(item);
						processStopsDetails.push(stopId);	
						
						const waypoint = {
							address_Id: item.address_Id,
							dispatchOrder_Id: item.dispatchOrder_Id,
							doStops_Id: stopId.data.insertId,
							orderNumber: item.stopNumber,
							pickupDate: item.fromDate,
							relay_Id: doRequest.previousRelay_Id,								
							stopType: item.stopType,
							userId: user.id
							};
							
						const waypointResult = await this.waypointService.addWaypoint(waypoint);
										
						item.dispatchStatus = 1;
						item.stopNumber = 1;
						item.stopType = 'Pickup';
						item.relay_Id = relayId;
						item.dispatchOrder_Id = doRequest.dispatchOrder_Id;	
						item.fromDate = item.pickupDate;
						item.fromTime = item.pickupTime;
						const woStop2 = await this.woStopService.addStop(item);
						item.woStops_Id = woStop2.data.insertId;
						const doStop = await this.doStopsService.addDOStop(item)
						processStopsDetails.push();
						const waypoint1 = {
							address_Id: item.address_Id,
							dispatchOrder_Id: item.dispatchOrder_Id,
							doStops_Id: doStop.data.insertId,
							orderNumber: item.stopNumber,
							pickupDate: item.fromDate,
							relay_Id: relayId,								
							stopType: item.stopType,
							userId: user.id
							};
							
						const waypointResult1 = await this.waypointService.addWaypoint(waypoint1);
					} else {		
						if(item.stopNumber > stopNumber) {
							item.stopNumber = stopNumber + 1;
							item.relay_Id = relayId;
							item.userId = user.id;
							delete item.fromDate;
							delete item.fromTime;
							delete item.toDate;
							delete item.toTime;
							processStopsDetails.push(await this.doStopsService.saveDOStop(item));
							await this.waypointService.savewaypoint({doStops_Id: item.doStopId, userId: user.id, relay_Id: relayId});
							stopNumber = stopNumber + 1;
						}						
					}
				}
				stopsResponse = await Promise.all(processStopsDetails);
			}
			
			let wayPoints = await this.waypointService.getWaypointsbyDOIdRelayId(
				{
					do_Id: doRequest.dispatchOrder_Id, 
					relay_Id: doRequest.previousRelay_Id
				});
			wayPoints = wayPoints.data;
			if (wayPoints) {
				for (const item of wayPoints) {
					item.userId = user.id;
					if(item.orderNumber > doRequest.afterStopNumber) {
							item.orderNumber = orderNumber + 1;
					}
					item.relay_Id = relayId;
					await this.waypointService.savewaypoint(item);
				}
			}
			// add Driver1 Line items details
			let dr1LineItemsResponse;
			const processDR1LineItemsDetails = [];
			if (dr1LineItems) {
				for (const item of dr1LineItems) {
					item.userId = user.id;
					item.relay_Id = relayId;
					processDR1LineItemsDetails.push(this.driverLineItemService.addDriverLineItem(item));
				}
				dr1LineItemsResponse = await Promise.all(processDR1LineItemsDetails);
			}
			
			// add Driver2 Line items details
			let dr2LineItemsResponse;
			const processDR2LineItemsDetails = [];
			if (dr2LineItems) {
				for (const item of dr2LineItems) {
					item.userId = user.id;
					item.relay_Id = relayId;
					processDR2LineItemsDetails.push(this.driverLineItemService.addDriverLineItem(item));
				}
				dr2LineItemsResponse = await Promise.all(processDR2LineItemsDetails);
			}
			
			// add ownerop Line items details
			let owneropLineItemsResponse;
			const processowneropLineItemsDetails = [];
			if (owneropLineItems) {
				for (const item of owneropLineItems) {
					item.userId = user.id;
					item.relay_Id = relayId;
					processowneropLineItemsDetails.push(this.ownerOpLineItemService.addOwneropLineItem(item));
				}
				owneropLineItemsResponse = await Promise.all(processowneropLineItemsDetails);
			}
			
			// add carrier Line items details
			let carrierLineItemsResponse;
			const processCarrierLineItemsDetails = [];
			if (carrierLineItems) {
				for (const item of carrierLineItems) {
					item.userId = user.id;
					item.relay_Id = relayId;
					processCarrierLineItemsDetails.push(this.carrierLineItemService.addCarrierLineItem(item));
				}
				carrierLineItemsResponse = await Promise.all(processCarrierLineItemsDetails);
			}
			this.milesService.calculateDOMiles({dispatchOrderId: doRequest.dispatchOrder_Id, relay_Id: relayId, isFullTrip: 0}, user.id);
			
			if (doRequest.previousRelay_Id) {
				this.milesService.calculateDOMiles({dispatchOrderId: doRequest.dispatchOrder_Id, 
													isFullTrip: 0,
													relay_Id: doRequest.previousRelay_Id}, user.id);
			} else {
				this.milesService.calculateDOMiles({dispatchOrderId: doRequest.dispatchOrder_Id, relay_Id: null, isFullTrip: 0}, user.id);
			}
			
			if (doRequest.nextRelay_Id) {
				this.milesService.calculateDOMiles({dispatchOrderId: doRequest.dispatchOrder_Id, 
													isFullTrip: 0,
													relay_Id: doRequest.nextRelay_Id}, user.id);
			}
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'Relay',
				module_Id: relayId,
				userId: user.id,
			});

			res.send(this.getSuccessResponse({relay_Id: relayId
			}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error, 500));
		}
	}    
	
	public async saveRelay(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {relayId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.relayId = relayId;

			const {driver1LineItems, driver2LineItems, carrierLineItems, owneropLineItems,
				copyDriver1Lineitems, copyDriver2Lineitems,copyCarrierLineItems,copyOwneropLineItems,
				deleteDriver1Lineitems, deleteDriver2Lineitems, deleteCarrierLineItems, deleteOwneropLineItems} = req.body;
			
			if (req.body.startingAddress && req.body.startingLocation_Id) {
				req.body.startingAddress.addressId = req.body.startingLocation_Id;
				req.body.startingAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.saveAddress(req.body.startingAddress);
			}			
			
			if (req.body.startingAddress && !req.body.startingLocation_Id && req.body.startingAddress.zip) {
				req.body.startingAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.addAddress(req.body.startingAddress);
				req.body.startingLoc_Id = mainingAddressResult.data.insertId;
			}	
			
			if (req.body.endingAddress && req.body.endingLocation_Id) {
				req.body.endingAddress.addressId = req.body.endingLocation_Id;
				req.body.endingAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.saveAddress(req.body.endingAddress);
			}
			
			if (req.body.endingAddress && !req.body.endingLocation_Id && req.body.endingAddress.zip) {
				req.body.endingAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.addAddress(req.body.endingAddress);
				req.body.endingLoc_Id = mainingAddressResult.data.insertId;
			}	
			
			if (req.body.trailerAddress && req.body.trailerLocation_Id) {
				req.body.trailerAddress.addressId = req.body.trailerLocation_Id;
				req.body.trailerAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.saveAddress(req.body.trailerAddress);
			}
			
			if (req.body.trailerAddress && !req.body.trailerLocation_Id && req.body.trailerAddress.zip) {
				req.body.trailerAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.addAddress(req.body.trailerAddress);
				req.body.trailerLocation_Id = mainingAddressResult.data.insertId;
			}	

			if (deleteDriver1Lineitems && deleteDriver1Lineitems.length >0 ) {
				if(deleteDriver1Lineitems[0].driver_Id) {
					this.driverLineItemService.saveDriverLineItem({isDeleted: 1, oldDriver_Id: deleteDriver1Lineitems[0].driver_Id,
						relay_Id: relayId, userId: user.id })
				}
			}

			if (deleteDriver2Lineitems && deleteDriver2Lineitems.length >0 ) {
				if(deleteDriver2Lineitems[0].driver_Id) {
					this.driverLineItemService.saveDriverLineItem({isDeleted: 1, oldDriver_Id: deleteDriver2Lineitems[0].driver_Id,
						relay_Id: relayId, userId: user.id });
				}
			}

			if (deleteOwneropLineItems && deleteOwneropLineItems.length >0 ) {
				if(deleteOwneropLineItems[0].ownerop_Id) {
					this.ownerOpLineItemService.saveOwneropLineItem({isDeleted: 1, oldOwnerop_Id: deleteOwneropLineItems[0].ownerop_Id, 
						relay_Id: relayId, userId: user.id });
				}
			}

			if (deleteCarrierLineItems && deleteCarrierLineItems.length >0 ) {
				if(deleteCarrierLineItems[0].carrier_Id) {
					this.carrierLineItemService.saveCarrierLineItem({isDeleted: 1,oldCarrier_Id: deleteCarrierLineItems[0].carrier_Id, 
						relay_Id: relayId, userId: user.id });
				}
			}

			if (copyDriver1Lineitems && copyDriver1Lineitems.length >0 ) {
				if(copyDriver1Lineitems[0].driver_Id) {
					this.driverLineItemService.saveDriverLineItem({driver_Id: copyDriver1Lineitems[0].driver_Id, 
						oldDriver_Id: copyDriver2Lineitems[0].oldDriver_Id, 
						relay_Id: relayId, userId: user.id})
				}
			}

			if (copyDriver2Lineitems && copyDriver2Lineitems.length >0 ) {
				if(copyDriver2Lineitems[0].driver_Id) {
					this.driverLineItemService.saveDriverLineItem({driver_Id: copyDriver2Lineitems[0].driver_Id, 
						oldDriver_Id: copyDriver2Lineitems[0].oldDriver_Id, 
						relay_Id: relayId, userId: user.id});
				}
			}

			if (copyOwneropLineItems && copyOwneropLineItems.length >0 ) {
				if(copyOwneropLineItems[0].ownerop_Id) {
					this.ownerOpLineItemService.saveOwneropLineItem({oldOwnerop_Id: copyOwneropLineItems[0].oldOwnerop_Id,
						ownerop_Id: copyOwneropLineItems[0].ownerop_Id, 
						relay_Id: relayId, userId: user.id});
				}
			}

			if (copyCarrierLineItems && copyCarrierLineItems.length >0 ) {
				if(copyCarrierLineItems[0].carrier_Id) {
					this.carrierLineItemService.saveCarrierLineItem({carrier_Id: copyCarrierLineItems[0].carrier_Id,  
						oldCarrier_Id: copyCarrierLineItems[0].oldCarrier_Id, 
						relay_Id: relayId, userId: user.id});
				}
			}

			if(driver1LineItems	&& driver1LineItems.length > 0) {
				for (const item of driver1LineItems) {
					item.userId = user.id;
					item.relay_Id = relayId;
					await this.driverLineItemService.addDriverLineItem(item);
				}
			}	
			
			if(driver2LineItems	&& driver2LineItems.length > 0) {
				for (const item of driver2LineItems) {
					item.userId = user.id;
					item.relay_Id = relayId;
					await this.driverLineItemService.addDriverLineItem(item);
				}
			}	

			if(owneropLineItems	&& owneropLineItems.length > 0) {
				let oplineitems = await this.ownerOpLineItemService.getOpLineItemsByRelayId({ 
					ownerop_Id: owneropLineItems[0].ownerop_Id,
					relay_Id: relayId});

				oplineitems = oplineitems.data[0];
				const flatfee = oplineitems.find((item : any) =>  {
					return item.name === 'Flat/Line Haul';
				});

				const flatItemId = flatfee ? flatfee.id : null;
				for (const item of owneropLineItems) {
					if(flatfee && (item.description_Id === flatfee.description)) {
						item.lineItemId = flatItemId;
					}
					item.userId = user.id;
					item.relay_Id = relayId;
					if(item.lineItemId) {
						await this.ownerOpLineItemService.saveOwneropLineItem(item);
					} else {
						await this.ownerOpLineItemService.addOwneropLineItem(item);
					}
				}
			}
			
			if(carrierLineItems	&& carrierLineItems.length > 0) {
				let calineitems = await this.carrierLineItemService.getDOCarrierlineitemsByRelayId({relay_Id: relayId});
				
				calineitems = calineitems.data[0];
				const flatfee = calineitems.find((item : any) =>  {
					return item.name === 'Flat/Line Haul';
				});

				const flatItemId = flatfee ? flatfee.id : null;
				for (const item of carrierLineItems) {
					if(flatfee && (item.description_Id === flatfee.description)) {
						item.lineItemId = flatItemId;
					}
					item.userId = user.id;
					item.relay_Id = relayId;
					if(item.lineItemId) {
						await this.carrierLineItemService.saveCarrierLineItem(item);
					} else {
						await this.carrierLineItemService.addCarrierLineItem(item);
					}
				}
			}
			
			const result = await this.relayService.saveRelay(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'Relay',
				module_Id: relayId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	
	public async deleteRelay(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {relayId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.relayId = relayId;
			
			const result = this.relayService.deleteRelay(req.body);
			
			if (req.body.previousRelay_Id) {
				this.milesService.calculateDOMiles({dispatchOrderId: req.body.dispatchOrder_Id, 
													isFullTrip: 0,
													relay_Id: req.body.previousRelay_Id}, user.id);
			} else {
				this.milesService.calculateDOMiles({dispatchOrderId: req.body.dispatchOrder_Id, relay_Id: null, isFullTrip: 0}, user.id);
			}
			
			if (req.body.nextRelayId) {
				this.milesService.calculateDOMiles({dispatchOrderId: req.body.dispatchOrder_Id, 
													isFullTrip: 0,
													relay_Id: req.body.nextRelayId}, user.id);
			}
			
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'Relay',
				module_Id: relayId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Deleted Successfully' }));            
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}