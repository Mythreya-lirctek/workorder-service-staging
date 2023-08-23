import { BaseController } from './base_controller';
import express from 'express';
import WorkorderService from '../service/workorder/workorder.service';
import RateDetailService from '../service/ratedetail/ratedetail.service';
import WOStopService from '../service/wostop/wostop.service';
import ContactService from '../service/contact/contact.service';
import WOStopItemService from '../service/wostopitem/wostopitem.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import { SQSService } from '../service/sqs/sqs.service';
import { SQS_QUEUES } from '../service/sqs/sqs.constants';
import DispatchOrderService from '../service/dispatchorder/dispatchorder.service';
import DriverLineItemService from '../service/driverlineitem/driverlineitem.service';
import OwnerOpLineItemService from '../service/owneroplineitem/owneroplineitem.service';
import CarrierLineItemService from '../service/carrierlineitem/carrierlineitem.service';
import DOStopsService from '../service/dostop/dostop.service';
import AddressService from '../service/address/address.service';
import { AvailableLoad, WorkorderStop, WorkorderCompanyFlags } from '../service/workorder/workorder.interface';
import PDFService from '../service/pdf/pdf.service';
import MilesService from '../service/miles/miles.service';
import { parse } from 'json2csv';
import EmailService from '../service/email/email.service';
import RelayService from '../service/relay/relay.service';
import WayPointService from '../service/waypoint/waypoint.service';
import moment from 'moment';
import COStopService from '../service/costop/costop.service';
import COStopItemService from '../service/costopitem/costopitem.service';
import _ from 'lodash';

export default class WorkorderController extends BaseController {
	private workorderService: WorkorderService
	private rateDetailService: RateDetailService;
	private woStopService: WOStopService;
	private contactService: ContactService;
	private woStopItemService: WOStopItemService;
	private activityLogService: ActivityLogService;
	private sqsService: SQSService;
	private dispatchOrderService: DispatchOrderService
	private driverLineItemService: DriverLineItemService;
	private ownerOpLineItemService: OwnerOpLineItemService;
	private carrierLineItemService: CarrierLineItemService;
	private doStopsService: DOStopsService;
	private addressService: AddressService;
	private pdfService: PDFService;
	private milesService: MilesService;
	private emailService: EmailService;
	private relayService: RelayService;
	private wayPointService: WayPointService;
	private coStopService: COStopService;
	private coStopItemService: COStopItemService;
	constructor() {
		super();
		this.workorderService = new WorkorderService();
		this.rateDetailService = new RateDetailService();
		this.woStopService = new WOStopService();
		this.contactService = new ContactService();
		this.woStopItemService = new WOStopItemService();
		this.activityLogService = new ActivityLogService();
		this.sqsService = new SQSService();
		this.dispatchOrderService = new DispatchOrderService();
		this.driverLineItemService = new DriverLineItemService();
		this.ownerOpLineItemService = new OwnerOpLineItemService();
		this.carrierLineItemService = new CarrierLineItemService();
		this.doStopsService = new DOStopsService();
		this.addressService = new AddressService();
		this.pdfService = new PDFService();
		this.milesService = new MilesService();
		this.emailService = new EmailService();
		this.relayService = new RelayService();
		this.wayPointService = new WayPointService();
		this.coStopService = new COStopService();
		this.coStopItemService = new COStopItemService();
	}

	public async createWorkOrder(req: express.Request, res: express.Response): Promise<any> {
		const {stops, rateDetails, companyFlags, availableLoads, ...workorderRequest} = req.body;
		try {
			const user = req.user as any;
			workorderRequest.userId = user.id;
			workorderRequest.companyId = user.companyId;
			
			const addWorkorderResp = await this.workorderService.addWorkorder(workorderRequest);
			const workOrderId = addWorkorderResp.data[0][0].id;
			if (!workOrderId) {
				throw new Error(`failed to create work order ${JSON.stringify(addWorkorderResp.data[0])}`);
			}
			// workorder created successfully proceed with stops creations
			const processStops = [];
			let stopsResponse;
			let rateDetailsResponse;
			const stopItems = [];
			if (stops) {
				for (const stop of stops) {
					stop.userId = user.id;
					stop.workOrder_Id = workOrderId;
					const addedStop =  await this.woStopService.addStop(stop);
					stop.id = addedStop.data.insertId;
					if(stop.woStopItems && stop.woStopItems.length > 0) {
						for (const item of stop.woStopItems) {
							item.userId = user.id;
							item.woStops_Id = addedStop.data.insertId;
							if(item.linkedWOStopsId) {
								const linkedStop = stops.find((s : any) =>  {
									return s.temp_id === item.linkedWOStopsId;
								});
								item.linkedWOStops_Id = linkedStop.id;
							} 
							const addedStopItem = await this.woStopItemService.addWOStopItem(item);
							item.id = addedStopItem.data.insertId;
							stopItems.push(item);
							processStops.push(addedStopItem);
						}						
					}
					stopsResponse = await Promise.all(processStops);
					processStops.push(addedStop);
				}
				stopsResponse = await Promise.all(processStops);

				for (const item of stopItems) {
					item.userId = user.id;
					if(item.linkedWOSIId) {
						const linkedStopItem = stopItems.find((s : any) =>  {
							return s.stopItemTempId === item.linkedWOSIId;
						});
						item.linkedWOSI_Id = linkedStopItem ? linkedStopItem.id : null;
					} 
					item.woStopItemId = item.id;
					const addedStopItem = await this.woStopItemService.saveWOStopItem(item);
				}
			}

			// add rate details
			const processRateDetails = [];
			if (rateDetails) {
				for (const rateDetail of rateDetails) {
					rateDetail.userId = user.id;
					rateDetail.workOrder_Id = workOrderId;
					processRateDetails.push(this.rateDetailService.addRateDetail(rateDetail));
				}
				rateDetailsResponse = await Promise.all(processRateDetails);
			}
			
			const woTemplate = {
				companyId: user.companyId,
				templateName: workorderRequest.templateName,
				userId: user.id,
				workOrder_Id: workOrderId
			};
			
			const template = await this.workorderService.addWOTemplate(woTemplate);
			this.activityLogService.addActivityLog({
				description: JSON.stringify(woTemplate),
				module: 'WOTemplate',
				module_Id: template.data.insertId,
				userId: user.id,
			});
			
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WorkOrder',
				module_Id: workOrderId,
				userId: user.id,
			});
			await this.queueCreateWorkorderMessage(workOrderId);
			
			if(workorderRequest.isAssigned || workorderRequest.isDispatched) {
				const { dr1LineItems, dr2LineItems, owneropLineItems, carrierLineItems, alIds,
					startingAddress, endingAddress, trailerAddress, ...doRequest} = req.body.doInfo;
					
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
				doRequest.doNum = addWorkorderResp.data[0][0].woNumber;
				
				const addDispatchorderResp = await this.dispatchOrderService.addDispatchOrder(doRequest);
				const dispatchOrderId = addDispatchorderResp.data[0][0].id;
				if (!dispatchOrderId) {
					throw new Error(`failed to create Dispatch order ${JSON.stringify(addDispatchorderResp.data[0])}`);
				}
				
				// updating availableloads with the dispatchorder_Id				
				const availableLoad = { dispatchOrder_Id: dispatchOrderId, availableLoad_Id: addWorkorderResp.data[0][0].alId, userId: user.id}
				this.workorderService.saveAvailableLoad(availableLoad);
					
				
				// Dispatch order created successfully proceed with dostops creations
				const wostops = await this.woStopService.getWOStopstoAddDOStops(workOrderId);
				for (const stop of wostops.data) {
					stop.userId = user.id;
					stop.dispatchOrder_Id = dispatchOrderId;
					this.doStopsService.addDOStop(stop);
				}
				
				// add Driver1 Line items details
				let dr1LineItemsResponse;
				const processDR1LineItemsDetails = [];
				if (dr1LineItems) {
					for (const item of dr1LineItems) {
						item.userId = user.id;
						item.dispatchOrder_Id = dispatchOrderId;
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
						item.dispatchOrder_Id = dispatchOrderId;
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
						item.dispatchOrder_Id = dispatchOrderId;
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
						item.dispatchOrder_Id = dispatchOrderId;
						processCarrierLineItemsDetails.push(this.carrierLineItemService.addCarrierLineItem(item));
					}
					carrierLineItemsResponse = await Promise.all(processCarrierLineItemsDetails);
				}
				
				const doActivity = this.activityLogService.addActivityLog({
					activityType: 'Dispatch Order Created ',
					description: JSON.stringify(req.body),
					module: 'DispatchOrder',
					module_Id: dispatchOrderId,
					userId: user.id,
				});
				this.milesService.calculateDOMiles({dispatchOrderId, relay_Id: null, isFullTrip: 0}, user.id);
				if(doRequest.carrier_Id > 0) {
					this.wayPointService.getWaypointsbyDOIdRelayId({do_Id: dispatchOrderId, relay_Id: null});
				}
				addWorkorderResp.data[0][0].do_Id = dispatchOrderId;
				res.send(this.getSuccessResponse(addWorkorderResp.data[0][0]
					));			
			} else {
			
				res.send(this.getSuccessResponse(addWorkorderResp.data[0][0]
				));	
			}
		 } catch (error) {
			res.status(500).send(this.getErrorResponse(error, 500));
		}
	}

	public async addLTLWorkorderInfo(req: express.Request, res: express.Response): Promise<any> {
		const {stops, rateDetails, availableLoads, companyFlags, ...workorderRequest} = req.body;
		try {
			const user = req.user as any;
			workorderRequest.userId = user.id;
			workorderRequest.companyId = user.companyId;
			
			const addWorkorderResp = await this.workorderService.addLTLWorkorder(workorderRequest);
			const workOrderId = addWorkorderResp.data[0][0].id;
			if (!workOrderId) {
				throw new Error(`failed to create work order ${JSON.stringify(addWorkorderResp.data[0])}`);
			}
			// workorder created successfully proceed with stops creations
			const processStops = [];
			let stopsResponse;
			let rateDetailsResponse;
			const stopItems = [];
			if (stops) {
				for (const stop of stops) {
					stop.userId = user.id;
					stop.workOrder_Id = workOrderId;
					const addedStop = await this.woStopService.addStop(stop);
					stop.id = addedStop.data.insertId;
					if(stop.woStopItems && stop.woStopItems.length > 0) {
						for (const item of stop.woStopItems) {
							item.userId = user.id;
							item.woStops_Id = addedStop.data.insertId;
							if(item.linkedWOStopsId) {
								const linkedStop = stops.find((s : any) =>  {
									return s.temp_id === item.linkedWOStopsId;
								});
								item.linkedWOStops_Id = linkedStop.id;
							} 
							const addedStopItem = await this.woStopItemService.addWOStopItem(item);
							item.id = addedStopItem.data.insertId;
							stopItems.push(item);
							processStops.push(addedStopItem);
						}						
					}
					stopsResponse = await Promise.all(processStops);
					processStops.push(addedStop);
				}
				stopsResponse = await Promise.all(processStops);

				for (const item of stopItems) {
					item.userId = user.id;
					if(item.linkedWOSIId) {
						const linkedStopItem = stopItems.find((s : any) =>  {
							return s.stopItemTempId === item.linkedWOSIId;
						});
						item.linkedWOSI_Id = linkedStopItem ? linkedStopItem.id : null;
					} 
					item.woStopItemId = item.id;
					const addedStopItem = await this.woStopItemService.saveWOStopItem(item);
				}
			}

			await this.createAvailableLoads(addWorkorderResp.data[0][0], stops,stopItems, availableLoads, workorderRequest.isLTL, user.id);

			// add rate details
			const processRateDetails = [];
			if (rateDetails) {
				for (const rateDetail of rateDetails) {
					rateDetail.userId = user.id;
					rateDetail.workOrder_Id = workOrderId;
					processRateDetails.push(this.rateDetailService.addRateDetail(rateDetail));
				}
				rateDetailsResponse = await Promise.all(processRateDetails);
			}
			const activity = this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WorkOrder',
				module_Id: workOrderId,
				userId: user.id,
			});
			const availableLoadsResponse = await this.workorderService.getAvailableLoad(workOrderId);
			const alIds = [];
			for (const item of availableLoadsResponse.data) {
				alIds.push(item.id)
			}
			res.send(this.getSuccessResponse({
				alIds,
				workorder: addWorkorderResp.data[0][0]
			}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error, 500));
		}
	}
	
	public async getDBLoadsgroupby(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.workorderService.getDBLoadsgroupby(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0] }));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getDBAllLoadsgroupby(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const lane1Req = req.body;
			lane1Req.groupbyColumn = req.body.lane1Groupby;			
			lane1Req.statusName = 'unassigned';			
			const lane1Data = await this.workorderService.getDBLoadsgroupby(lane1Req);
			
			const lane2Req = req.body;
			lane2Req.groupbyColumn = req.body.lane2Groupby;			
			lane2Req.statusName = 'dispatched';			
			const lane2Data = await this.workorderService.getDBLoadsgroupby(lane2Req);
			
			const lane3Req = req.body;
			lane3Req.groupbyColumn = req.body.lane3Groupby;			
			lane3Req.statusName = 'in transit';			
			const lane3Data = await this.workorderService.getDBLoadsgroupby(lane3Req);
			
			const lane4Req = req.body;
			lane4Req.groupbyColumn = req.body.lane4Groupby;			
			lane4Req.statusName = 'delivered';			
			const lane4Data = await this.workorderService.getDBLoadsgroupby(lane4Req);
			
			const result = {} as any;
			
			result.lane1Data = lane1Data.data[0];
			result.lane2Data = lane2Data.data[0];
			result.lane3Data = lane3Data.data[0];
			result.lane4Data = lane4Data.data[0];
			
			res.send(this.getSuccessResponse({ data: result }));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getDBLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.workorderService.getDBLoads(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getDBAllLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const lane1Req = req.body;	
			lane1Req.statusName = 'unassigned';			
			const lane1Data = await this.workorderService.getDBLoads(lane1Req);
			
			const lane2Req = req.body;	
			lane2Req.statusName = 'dispatched';	
			const lane2Data = await this.workorderService.getDBLoads(lane2Req);
			
			const lane3Req = req.body;	
			lane3Req.statusName = 'in transit';			
			const lane3Data = await this.workorderService.getDBLoads(lane3Req);
			
			const lane4Req = req.body;	
			lane4Req.statusName = 'delivered';	
			const lane4Data = await this.workorderService.getDBLoads(lane4Req);
			
			const result = {} as any;
			
			result.lane1Data = { data: lane1Data.data[0], totalRecords: lane1Data.data[1][0].totalRecords};
			result.lane2Data = { data: lane2Data.data[0], totalRecords: lane2Data.data[1][0].totalRecords};
			result.lane3Data = { data: lane3Data.data[0], totalRecords: lane3Data.data[1][0].totalRecords};
			result.lane4Data = { data: lane4Data.data[0], totalRecords: lane4Data.data[1][0].totalRecords};
			
			res.send(this.getSuccessResponse({ data: result}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
  
	public async ValidateRefnoCusConId(req: express.Request, res: express.Response): Promise<any> {
		try {			
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const {customerId, refNumber } = req.params;
			req.body.customerId = customerId;
			req.body.refNumber = refNumber;
			
			const result = await this.workorderService.ValidateRefnoCusConId(req.body);
			res.send(this.getSuccessResponse(result.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getFLBWorkorderdetails(req: express.Request, res: express.Response): Promise<any> {
		try {			
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const {workOrderId } = req.params;
			req.body.workOrderId = workOrderId;
			
			const woDetails = [] as any;
			let legs = [] as any;
			
			let result = await this.workorderService.getFLBWorkorderdetails(req.body);
			result = result.data;
			try {
				result[0][0].stops = result[0][0] ? JSON.parse(`[${result[0][0].stops}]`) : [];
			} catch(e) {
				result[0][0].stops = [];
			}
						
			legs = result[1] ? (result[1][0].id > 0 ? result[1] : []) : [];
			if(legs.length > 0) {
				try {
					legs[0].stops =  legs[0] ? JSON.parse(`[${legs[0].stops}]`) : [];
					legs[0].startingAddress =  legs[0] ? JSON.parse(`${legs[0].startingAddress}`) : {};
					legs[0].endingAddress =  legs[0] ? JSON.parse(`${legs[0].endingAddress}`) : {};
					legs[0].trailerAddress =  legs[0] ? JSON.parse(`${legs[0].trailerAddress}`) : {};
				} catch(e) {
					legs[0].stops = [];
				}
			}
			
			for (const item of result[2]) {
				try {
					item.stops =  item ? JSON.parse(`[${item.stops}]`) : [];
					item.startingAddress =  item ? JSON.parse(`${item.startingAddress}`) : {};
					item.endingAddress =  item ? JSON.parse(`${item.endingAddress}`) : {};
					item.trailerAddress =  item ? JSON.parse(`${item.trailerAddress}`) : {};
				} catch(e) {
					item.stops = [];
				}
				legs.push(item);
			}
			result[0][0].legs = legs;
			res.send(this.getSuccessResponse(result[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
 	}
	
	public async getDBListLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.workorderService.getDBListLoads(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getDBListLoadsExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;

			const result = await this.workorderService.getDBListLoads(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLWOListReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['woNumber', 'woRefNumber','customerName', 'pickupFacility','pickupCity','pickupState','pickupFromDate','pickupFromTime','deliveryFromDate', 'deliveryFromTime', 'deliveryCity', 'deliveryState', 'truckNumber','trailerNumber','driverName','driver1Phone','status'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('WOList.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}	
	
	public async getDBLTLListLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			let alGroupbyLoads = [];
			const loads = [] as any;
			
			const result = await this.workorderService.getDBLTLListLoads(req.body);
			alGroupbyLoads = _.groupBy(result.data[0], 'woId') as any;
			for(const item in alGroupbyLoads) {
				if(item) {
					const al = alGroupbyLoads[item];
					const alLoadss = [] as any;
					al[0].alLoads = [] as any;
					for(const i of al) {					
						alLoadss.push({
							alId: i.alId,
							alNumber: i.alNumber,
							alStatus: i.alStatus,
							carrierName: i.carrierName,						
							childCount: i.childCount,
							deliverCity: i.deliverCity,
							deliveryFacilityId: i.deliveryFacilityId,
							deliveryFromDate: i.deliveryFromDate,
							deliveryFromTime: i.deliveryFromTime,
							deliveryState: i.deliveryState,
							deliveryToDate: i.deliveryToDate,
							deliveryToTime: i.deliveryFromTime,
							doId: i.doId,
							driver1: i.driverName,
							driver2: i.driver2,
							driver2Phone: i.driver2Phone,
							driverPhone: i.driver1Phone,							
							driverViewedOn: i.driverViewedOn,
							gpsTrialerTrackURL: i.gpsTrialerTrackURL,							
							gpsTruckTrackURL: i.gpsTruckTrackURL,							
							length: i.length,
							pallets: i.pallets,
							parentAvailableloads_Id: i.parentAvailableloads_Id,
							pickupCity: i.pickupCity,
							pickupFacilityId: i.pickupFacilityId,
							pickupFromDate: i.pickupFromDate,
							pickupFromTime: i.pickupFromTime,
							pickupState: i.pickupState,
							pickupToDate: i.pickupToDate,
							pickupToTime: i.pickupToTime,
							pieceCount: i.pieceCount,
							trailerNumber: i.trailerNumber,
							tripNumber: i.dispatchNumber,
							truckNumber: i.truckNumber,
							weight: i.weight,
							workorderId: i.woId
						});
					} 
					al[0].alLoads = alLoadss;
					loads.push(al[0]);
				}
			}
			res.send(this.getSuccessResponse({ data: loads, totalRecords: result.data[1][0].totalRecords}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getDBLTLListLoadsExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
						
			const result = await this.workorderService.getDBLTLListLoads(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLWOListReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['woNumber', 'woRefNumber','customerName', 'pickupFacility','pickupCity','pickupState','pickupFromDate','pickupFromTime','deliveryFromDate', 'deliveryFromTime', 'deliveryCity', 'deliveryState', 'truckNumber','trailerNumber','driverName','driver1Phone','status'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('WOList.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getDBLTLLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.workorderService.getDBLTLLoads(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async getDBAllLTLLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const lane1Req = req.body;	
			lane1Req.statusName = 'unassigned';			
			const lane1Data = await this.workorderService.getDBLTLLoads(lane1Req);
			
			const lane2Req = req.body;	
			lane2Req.statusName = 'dispatched';	
			const lane2Data = await this.workorderService.getDBLTLLoads(lane2Req);
			
			const lane3Req = req.body;	
			lane3Req.statusName = 'in transit';			
			const lane3Data = await this.workorderService.getDBLTLLoads(lane3Req);
			
			const lane4Req = req.body;	
			lane4Req.statusName = 'delivered';	
			const lane4Data = await this.workorderService.getDBLTLLoads(lane4Req);
			
			const result = {} as any;
			
			result.lane1Data = { data: lane1Data.data[0], totalRecords: lane1Data.data[1][0].totalRecords};
			result.lane2Data = { data: lane2Data.data[0], totalRecords: lane2Data.data[1][0].totalRecords};
			result.lane3Data = { data: lane3Data.data[0], totalRecords: lane3Data.data[1][0].totalRecords};
			result.lane4Data = { data: lane4Data.data[0], totalRecords: lane4Data.data[1][0].totalRecords};
			
			res.send(this.getSuccessResponse({ data: result}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getDBLTLLoadsgroupby(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getDBLTLLoadsgroupby(req.body);		
			
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getDBAllLTLLoadsgroupby(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;

			const lane1Req = req.body;
			lane1Req.groupbyColumn = req.body.lane1Groupby;			
			lane1Req.statusName = 'unassigned';		
			const lane1Data = await this.workorderService.getDBLTLLoadsgroupby(lane1Req);

			const lane2Req = req.body;
			lane2Req.groupbyColumn = req.body.lane2Groupby;			
			lane2Req.statusName = 'dispatched';			
			const lane2Data = await this.workorderService.getDBLTLLoadsgroupby(lane2Req);

			const lane3Req = req.body;
			lane3Req.groupbyColumn = req.body.lane3Groupby;			
			lane3Req.statusName = 'in transit';			
			const lane3Data = await this.workorderService.getDBLTLLoadsgroupby(lane3Req);

			const lane4Req = req.body;
			lane4Req.groupbyColumn = req.body.lane4Groupby;			
			lane4Req.statusName = 'delivered';			
			const lane4Data = await this.workorderService.getDBLTLLoadsgroupby(lane4Req);

			const result = {} as any;

			result.lane1Data = lane1Data.data[0];
			result.lane2Data = lane2Data.data[0];
			result.lane3Data = lane3Data.data[0];
			result.lane4Data = lane4Data.data[0];

			res.send(this.getSuccessResponse({ data: result }));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async saveWorkOrder(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {workOrderId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.workOrderId = workOrderId;

			const result = await this.workorderService.saveWorkOrder(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WorkOrder',
				module_Id: workOrderId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async FLWOStatusChange(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {			
			const user= req.user as any;
			req.body.userId = user.id;
			if(req.body.status_Id === 7 ) {
				const result = await this.dispatchOrderService.deleteDo({dispatchOrderId: req.body.dispatchOrder_Id});
				const resultWO = await this.workorderService.saveWorkOrder({status_Id : 7, userId: user.id, workOrderId: req.body.workOrder_Id});
				const resultWOA = await this.workorderService.saveAvailableLoad({
					dispatchOrder_Id : null,
					userId: user.id, 
					workOrder_Id: req.body.workOrder_Id});
			} else {
				req.body.workOrderId = req.body.workOrder_Id;
				const result = await this.workorderService.FLWOStatusChange(req.body);
			}
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WorkOrder',
				module_Id: req.body.workOrder_Id,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getLTLWODetailsByWOId(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {			
			const data = [];
			const alLoads = [];
			const user= req.user as any;
			req.body.userId = user.id;
			
			const {workOrderId } = req.params;
			req.body.workOrderId = workOrderId;
			
			const result = await this.workorderService.getLTLWODetailsByWOId(req.body);
			if(result.data[0][0]) {
				result.data[0][0].stops = result.data[0][0].stops ? JSON.parse(`[${result.data[0][0].stops} ]`) : [];
			}
			data.push(result.data[0][0]);
			for (const item of result.data[1]) {
				try {
					item.alItems =  item.alItems ? JSON.parse(`[${item.alItems}]`) : [];
				} catch(e) {
					item.alItems = [];
				}
				alLoads.push(item);
			}
			data.push(alLoads);
			res.send(this.getSuccessResponse(data));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async copyLoadToOtherCompany(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {	
			const user= req.user as any;
			req.body.userId = user.id;
			
			if(req.body.workOrder_Id > 0) {
				if(req.body.loadType === 'workorder' && !req.body.isBrokerage) {
					const result = await this.workorderService.copyWOtoWOtoOtherCompany(req.body);
					const workOrderId = result.data[0] ? result.data[0][0].wo_Id : null;
					if(workOrderId > 0) {
						let stops = await this.woStopService.getStopsByWOId(req.body.workOrder_Id) as any;
						stops = stops.data[0] as any;
						for (const stop of stops) {
							stop.userId = user.id;
							let contact = await this.contactService.validateContact({
								address1: stop.address1,
								address2: stop.address2,
								city: stop.city,
								companyId: req.body.toCompany_Id,
								contactType: 'Facility',
								name: stop.facilityName,
								state: stop.state,
								zip: stop.zip,
							});
							contact = contact.data[0].length > 0 ? contact.data[0][0].id : null;

							if (!contact) {
								stop.companyId = req.body.toCompany_Id;
								const address = await this.addressService.addAddress(stop);
								stop.address_Id = address.data ? address.data.insertId: null;

								stop.name = stop.facilityName;
								stop.contactType = 'Facility';
								contact = await this.contactService.addContact(stop);
								contact = contact.data.insertId;
							}

							stop.workOrder_Id = workOrderId;
							stop.contact_Id = contact;
							stop.fromDate = moment(stop.fromDate).format('YYYY-MM-DD HH:MM:SS');
							stop.fromTime = stop.fromTime ? moment(stop.fromTime).format('YYYY-MM-DD HH:MM:SS') : null;
							stop.toDate = stop.toDate ? moment(stop.toDate).format('YYYY-MM-DD HH:MM:SS') : null;
							stop.toTime = stop.toTime ? moment(stop.toTime).format('YYYY-MM-DD HH:MM:SS') : null;
							const addStop = await this.woStopService.addStop(stop);
							if(addStop.data && addStop.data.insertId) {
								stop.stopItems = stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : [];

								for (const item of stop.stopItems) {
									item.woStops_Id = addStop.data ? addStop.data.insertId : null;
									item.userId = user.id;
									this.woStopItemService.addWOStopItem(item);
								}
							}
						}
						res.send(this.getSuccessResponse(result.data[0][0]));
					} else {
						res.send(this.getSuccessResponse({message: 'Load already exists.'}));
					}
				} else if(req.body.loadType === 'workorder' && req.body.isBrokerage) {
					const result = await this.workorderService.copyWOtoCOtoOtherCompany(req.body);
					const customerOrderId = result.data[0] ? result.data[0][0].co_Id : null;
					if(customerOrderId > 0) {
						let stops = await this.woStopService.getStopsByWOId(req.body.workOrder_Id) as any;
						stops = stops.data[0] as any;
						for (const stop of stops) {
							stop.userId = user.id;
							let contact = await this.contactService.validateContact({
								address1: stop.address1,
								address2: stop.address2,
								city: stop.city,
								companyId: req.body.toCompany_Id,
								contactType: 'Facility',
								name: stop.facilityName,
								state: stop.state,
								zip: stop.zip,
							});
							contact = contact.data[0].length > 0 ? contact.data[0][0].id : null;

							if (!contact) {
								stop.companyId = req.body.toCompany_Id;
								const address = await this.addressService.addAddress(stop);
								stop.address_Id = address.data ? address.data.insertId: null;

								stop.name = stop.facilityName;
								stop.contactType = 'Facility';
								contact = await this.contactService.addContact(stop);
								contact = contact.data.insertId;
							}

							stop.customerOrder_Id = customerOrderId;
							stop.contact_Id = contact;
							stop.fromDate = moment(stop.fromDate).format('YYYY-MM-DD HH:MM:SS');
							stop.fromTime = stop.fromTime ? moment(stop.fromTime).format('YYYY-MM-DD HH:MM:SS') : null;
							stop.toDate = stop.toDate ? moment(stop.toDate).format('YYYY-MM-DD HH:MM:SS') : null;
							stop.toTime = stop.toTime ? moment(stop.toTime).format('YYYY-MM-DD HH:MM:SS') : null;
							stop.isCOStop = 1;
							
							const addStop = await this.coStopService.addCoStop(stop);

							if(addStop.data && addStop.data.insertId) {
								stop.stopItems = stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : [];

								for (const item of stop.stopItems) {
									item.coStops_Id = addStop.data ? addStop.data.insertId : null;
									item.userId = user.id;
									this.coStopItemService.addCOStopItem(item);
								}
							}
						}
						res.send(this.getSuccessResponse(result.data[0][0]));
					} else {
						res.send(this.getSuccessResponse({message: 'Load already exists.'}));
					}
				} else if(req.body.loadType === 'customerorder' && !req.body.isBrokerage) {
					const result = await this.workorderService.copyCOtoWOtoOtherCompany(req.body);
					
					const workOrderId = result.data[0] ? result.data[0][0].wo_Id : null;
					if(workOrderId > 0) {
						let stops = await this.coStopService.getCOStopsByCOId(req.body.workOrder_Id) as any;
						stops = stops.data[0] as any;
						for (const stop of stops) {
							stop.userId = user.id;
							let contact = await this.contactService.validateContact({
								address1: stop.address1,
								address2: stop.address2,
								city: stop.city,
								companyId: req.body.toCompany_Id,
								contactType: 'Facility',
								name: stop.name,
								state: stop.state,
								zip: stop.zip,
							});
							contact = contact.data[0].length > 0 ? contact.data[0][0].id : null;

							if (!contact) {
								stop.companyId = req.body.toCompany_Id;
								const address = await this.addressService.addAddress(stop);
								stop.address_Id = address.data ? address.data.insertId: null;

								stop.contactType = 'Facility';
								contact = await this.contactService.addContact(stop);
								contact = contact.data.insertId;
							}

							stop.workOrder_Id = workOrderId;
							stop.contact_Id = contact;
							stop.fromDate = moment(stop.fromDate).format('YYYY-MM-DD HH:MM:SS');
							stop.fromTime = stop.fromTime ? moment(stop.fromTime).format('YYYY-MM-DD HH:MM:SS') : null;
							stop.toDate = stop.toDate ? moment(stop.toDate).format('YYYY-MM-DD HH:MM:SS') : null;
							stop.toTime = stop.toTime ? moment(stop.toTime).format('YYYY-MM-DD HH:MM:SS') : null;
							
							const addStop = await this.woStopService.addStop(stop);

							if(addStop.data && addStop.data.insertId) {
								stop.stopItems = stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : [];

								let ordernumber = 1;
								for (const item of stop.stopItems) {
									item.woStops_Id = addStop.data ? addStop.data.insertId : null;
									item.userId = user.id;
									item.orderNumber = ordernumber;
									this.woStopItemService.addWOStopItem(item);
									ordernumber += 1;
								}
							}
						}
						res.send(this.getSuccessResponse(result.data[0][0]));
					} else {
						res.send(this.getSuccessResponse({message: 'Load already exists.'}));
					}
				} else if(req.body.loadType === 'customerorder' && req.body.isBrokerage) {
					const result = await this.workorderService.copyCOtoCOtoOtherCompany(req.body);
					const customerOrderId = result.data[0] ? result.data[0][0].co_Id : null;
					if(customerOrderId > 0) {
						let stops = await this.coStopService.getCOStopsByCOId(req.body.workOrder_Id) as any;
						stops = stops.data[0] as any;
						for (const stop of stops) {
							stop.userId = user.id;
							let contact = await this.contactService.validateContact({
								address1: stop.address1,
								address2: stop.address2,
								city: stop.city,
								companyId: req.body.toCompany_Id,
								contactType: 'Facility',
								name: stop.name,
								state: stop.state,
								zip: stop.zip,
							});
							contact = contact.data[0].length > 0 ? contact.data[0][0].id : null;

							if (!contact) {
								stop.companyId = req.body.toCompany_Id;
								const address = await this.addressService.addAddress(stop);
								stop.address_Id = address.data ? address.data.insertId: null;

								stop.contactType = 'Facility';
								contact = await this.contactService.addContact(stop);
								contact = contact.data.insertId;
							}

							stop.customerOrder_Id = customerOrderId;
							stop.contact_Id = contact;
							stop.fromDate = moment(stop.fromDate).format('YYYY-MM-DD HH:MM:SS');
							stop.fromTime = stop.fromTime ? moment(stop.fromTime).format('YYYY-MM-DD HH:MM:SS') : null;
							stop.toDate = stop.toDate ? moment(stop.toDate).format('YYYY-MM-DD HH:MM:SS') : null;
							stop.toTime = stop.toTime ? moment(stop.toTime).format('YYYY-MM-DD HH:MM:SS') : null;
							stop.isCOStop = 1;
							
							const addStop = await this.coStopService.addCoStop(stop);

							if(addStop.data && addStop.data.insertId) {
								stop.stopItems = stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : [];

								for (const item of stop.stopItems) {
									item.coStops_Id = addStop.data ? addStop.data.insertId : null;
									item.userId = user.id;
									this.coStopItemService.addCOStopItem(item);
								}
							}
						}
						res.send(this.getSuccessResponse(result.data[0][0]));
					} else {
						res.send(this.getSuccessResponse({message: 'Load already exists.'}));
					}
				}
			} else {
				res.send(this.getSuccessResponse({message:'Specific Load Id was not received successfully.'}));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async copyWOtoMultipleWO(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			const result = await this.workorderService.copyWOtoMultipleWO(req.body);
			
			res.send(this.getSuccessResponse({result:'Copied successfully.'}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async copyWOtoCO(req: express.Request, res: express.Response): Promise<any> {
		try {
			const result = await this.workorderService.copyWOtoCO(req.body);
			const stops = result.data[1];
			for (const stop of stops){
				const woStopId = stop.id;
				const coId = stop.coId;
				const stopInsertResult = await this.coStopService.copyWoStopToCoStop(woStopId,coId);
				const coStopId = stopInsertResult.data.insertId;
				await this.coStopItemService.copyWoStopItemsToCoStopItems(woStopId,coStopId);
			}
			res.send(this.getSuccessResponse(result.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getWorkorderReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getWorkorderReport(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getWorkorderReportSummary(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getWorkorderReportSummary(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0]}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getWorkorderWithNoLineItems(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getWorkorderWithNoLineItems(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWorkOrderPaymentHistory(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getWorkOrderPaymentHistory(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOStatusLogByWOId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getWOStatusLogByWOId(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getWorkorderReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
						
			const result = await this.workorderService.getWorkorderReport(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(workorderReportExportHTML(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['woNumber', 'relayNumber','customerName', 'referenceNumber','status',
				'carrierName','driver1', 'pickupCity', 'pickupFromDate', 'pickupFromTime',
				'deliveryCity','deliveryFromDate', 'deliveryFromTime', 
				'truckNumber','trailerNumber','grossAmount','loadAmount',
				'driverlineitemTotal','ownerOpAmount', 'carrierlineitemTotal','commisionAmount','dispatchFee','netAmount'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('workorderReport.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWorkorderWithNoLineItemsExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
						
			const result = await this.workorderService.getWorkorderWithNoLineItems(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(workorderWithNoLineItemsExportHTML(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['woNumber', 'customerName','referenceNumber','driver1',
				'driver2','carrierName', 'truckNumber',
				'trailerNumber','pickupFacility','pickupFromDate','pickupFromTime','delFacility','deliveryFromDate',
				'deliveryFromTime','pickupCity','pickupState','deliveryCity','deliveryState','loadAmount','status','isBolReceived','bolReceivedDate',
				];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('workorderWithNoLineItems.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}	

	public async getWeeklyScheduleReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getWeeklyScheduleReport(req.body);
			res.send(this.getSuccessResponse(result.data));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWeeklyScheduleReportExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;

			const result = await this.workorderService.getWeeklyScheduleReport(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLWeeklyReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['woNumber', 'woRefNumber','customerName', 'pickupFacility','pickupCity','pickupState','pickupFromDate','pickupFromTime','deliveryFromDate', 'deliveryFromTime', 'deliveryCity', 'deliveryState', 'truckNumber','trailerNumber','driverName','driver1Phone','status'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('WOList.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getwoStatusSentLogbyWoId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const {workOrderId} = req.params;
			const result = await this.workorderService.getwoStatusSentLogbyWoId(workOrderId);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updateWOFromDobyWOId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const {workOrderId} = req.params;
			if(req.body.doId > 0) {
				const doData = {dispatchOrderId: req.body.doId, status_Id: req.body.status_Id, userId: user.id} as any;
				// set carrierId and truck_Id to null if load is unassigned
				if(doData.status_Id === 7){
					doData.carrier_Id = null;
					doData.truck_Id = null;
				}
				this.dispatchOrderService.saveDispatchOrder(doData);
			} else if(req.body.relayId > 0) {
				const  relayData = {relayId: req.body.relayId, status_Id: req.body.status_Id, userId: user.id} as any;
				// set carrierId and truck_Id to null if load is unassigned
				if(relayData.status_Id === 7){
					relayData.carrier_Id = null;
					relayData.truck_Id = null;
				}
				this.relayService.saveRelay(relayData);
			}
			const result = await this.workorderService.updateWOFromDobyWOId(Number(workOrderId));
			res.send(this.getSuccessResponse({result: 'Updated Successfully!'}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getInfotoSendStatustoCustomer(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getInfotoSendStatustoCustomer(req.body);
			
			if(req.body.emails && result.data[0][0].sendStatusEmail && result.data[0][0].sendBrokerStatusEmail) {	
				const body = {} as any;		
				body.subject = `Load# - ${result.data[0][0].refNumber}, Status - ${result.data[0][0].status}`;
				body.emails = req.body.emails;
				body.body = statusEmailHTML(result.data[0]);
				body.status = result.data[0][0].status;
				body.userId = user.id;
				body.workOrder_Id = result.data[0][0].workorder_Id;
				await this.emailService.emailservice(body);   
				this.workorderService.addwoStatusSentLog(body);
				res.send(this.getSuccessResponse({ result: 'Email Sent Successfully' }));                      
			} else {
				const data = result.data[0]
				res.send(this.getSuccessResponse({result:statusEmailHTML(result.data[0]), subject : `Load# - ${result.data[0][0].refNumber}, Status - ${result.data[0][0].status}`, emails: result.data[0][0].email}));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOGlobalSearch(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getWOGlobalSearch(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async searchWOTemplate(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.searchWOTemplate(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getwoListbyCustomerId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getwoListbyCustomerId(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	
	public async getwoListbyCustomerIdExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;

			const result = await this.workorderService.getwoListbyCustomerId(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLWeeklyReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['woNumber', 'woRefNumber','customerName', 'pickupFacility','pickupCity','pickupState','pickupFromDate','pickupFromTime','deliveryFromDate', 'deliveryFromTime', 'deliveryCity', 'deliveryState', 'truckNumber','trailerNumber','driverName','driver1Phone','status'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('WOListCustomer.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getDBCListLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getDBCListLoads(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getwodetailsforcustomer(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.workorderService.getwodetailsforcustomer(req.body);
			result.data[0][0].stops = result.data[0][0].stops ? JSON.parse(`[${result.data[0][0].stops}]`) : [];
			res.send(this.getSuccessResponse( result.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getDashboardAnalytics(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.workorderService.getDashboardAnalytics(req.body);
			res.send(this.getSuccessResponse(result.data));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getWOTemplates(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.workorderService.getWOTemplates(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async addWOTemplate(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			const template = await this.workorderService.addWOTemplate(req.body);
			this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'WOTemplate',
				module_Id: template.data.insertId,
				userId: user.id,
			});
			
			res.send(this.getSuccessResponse({ id: template.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getDashboardPLICount(req: express.Request, res: express.Response): Promise<any> {
		const user = req.user as any;
		req.body.companyId = user.companyId;
		try {
			const result = await this.workorderService.getDashboardPLICount(req.body);
			res.send(this.getSuccessResponse({ data: [...result.data[0], ...result.data[1], ...result.data[2]] }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getETAlocationbyWO(req: express.Request, res: express.Response): Promise<any> {
		const user = req.user as any;
		req.body.companyId = user.companyId;
		try {
			const result = await this.workorderService.getETAlocationbyWO(req.body);
			res.send(this.getSuccessResponse({ data: result.data}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getAvailableUnits(req: express.Request, res: express.Response): Promise<any> {
		const user = req.user as any;
		req.body.companyId = user.companyId;
		try {
			const result = await this.workorderService.getAvailableUnits(req.body);
			res.send(this.getSuccessResponse({ data: result.data}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getWOCustomerSummary(req: express.Request, res: express.Response): Promise<any> {
		const user = req.user as any;
		req.body.companyId = user.companyId;
		try {
			const result = await this.workorderService.getWOCustomerSummary(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getWOLTLGlobalSearch(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			let alGroupbyLoads = [];
			const loads = [] as any;

			const result = await this.workorderService.getWOLTLGlobalSearch(req.body);
			alGroupbyLoads = _.groupBy(result.data[0], 'woId') as any;
			for(const item in alGroupbyLoads) {
				if(item) {
					const al = alGroupbyLoads[item];
					const alLoadss = [] as any;
					al[0].alLoads = [] as any;
					for(const i of al) {					
						alLoadss.push({
							alId: i.alId,
							alNumber: i.alNumber,
							alStatus: i.alStatus,
							carrierName: i.carrierName,						
							childCount: i.childCount,
							deliverCity: i.deliverCity,
							deliveryFacilityId: i.deliveryFacilityId,
							deliveryFromDate: i.deliveryFromDate,
							deliveryFromTime: i.deliveryFromTime,
							deliveryState: i.deliveryState,
							deliveryToDate: i.deliveryToDate,
							deliveryToTime: i.deliveryFromTime,
							doId: i.doId,
							driver1: i.driverName,
							driver2: i.driver2,
							driver2Phone: i.driver2Phone,
							driverPhone: i.driver1Phone,							
							driverViewedOn: i.driverViewedOn,
							gpsTrialerTrackURL: i.gpsTrialerTrackURL,							
							gpsTruckTrackURL: i.gpsTruckTrackURL,							
							length: i.length,
							pallets: i.pallets,
							parentAvailableloads_Id: i.parentAvailableloads_Id,
							pickupCity: i.pickupCity,
							pickupFacilityId: i.pickupFacilityId,
							pickupFromDate: i.pickupFromDate,
							pickupFromTime: i.pickupFromTime,
							pickupState: i.pickupState,
							pickupToDate: i.pickupToDate,
							pickupToTime: i.pickupToTime,
							pieceCount: i.pieceCount,
							trailerNumber: i.trailerNumber,
							tripNumber: i.dispatchNumber,
							truckNumber: i.truckNumber,
							weight: i.weight,
							workorderId: i.woId
						});
					} 
					al[0].alLoads = alLoadss;
					loads.push(al[0]);
				}
			}
			res.send(this.getSuccessResponse({ data: loads, totalRecords: result.data[1][0].totalRecords }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
  
	private async queueCreateWorkorderMessage(workorderId: number): Promise<void> {
		const queueUrl = await this.sqsService.getQueueUrl({
			QueueName: SQS_QUEUES.CREATE_WORKORDER
		});

		await this.sqsService.sendMessage({
			MessageAttributes: {
				'workorder': {
					DataType: 'Number',
					StringValue: `${workorderId}`
				}
			},
			MessageBody: `${workorderId}`,
			QueueUrl: queueUrl.QueueUrl
		});
	}

	private async createAvailableLoads(
		workOrder: any,
		stops: any[],
		stopItems:any[],
		availableLoads: AvailableLoad[],
		isLTL: any, userId: any): Promise<any> {
		// Add available loads
		if (availableLoads) {
			let loadIndex = 0;
			for (const availableLoad of availableLoads) {
				const pickStop = stops.find((stop: any) => {
					return availableLoad.pickupStopId === stop.temp_id;
				});				
				const dropStop = stops.find((stop: any) => {
					return availableLoad.deliveryStopId === stop.temp_id;
				});
				loadIndex = loadIndex + 1;
				availableLoad.alNumber = !isLTL ?  `${workOrder.woNumber}` : `${workOrder.woNumber}-${loadIndex}`;
				availableLoad.origin_Id = pickStop.id;
				availableLoad.destination_Id = dropStop.id;
				availableLoad.workorderId = workOrder.id;
				availableLoad.pallets = availableLoad.pallets || 0;
				availableLoad.pieceCount = availableLoad.pieceCount || 0;
				availableLoad.weight = availableLoad.weight || 0;
				availableLoad.length = availableLoad.length  || 0;
				availableLoad.userId = userId;
				const availableLoadResp = await this.workorderService.addAvailableLoad(availableLoad) as any;
				for (const stopItem of availableLoad.stopItems) {
					if(stopItem.stopItemTempId) {
						const linkedStopItem = stopItems.find((s : any) =>  {
							return s.stopItemTempId === stopItem.stopItemTempId;
						});
						stopItem.woStopItems_Id=linkedStopItem ? linkedStopItem.id : null;
					}
					stopItem.availableLoadId = availableLoadResp.data.insertId;
					stopItem.pallets = stopItem.pallets || 0;
					stopItem.pieceCount = stopItem.pieceCount || 0;
					stopItem.weight = stopItem.weight || 0;
					stopItem.length = stopItem.length || 0;
					stopItem.userId = userId;
					await this.workorderService.addAvailableLoadLineItem(stopItem);
				}
			}
		}
	}
}

const exportHTMLWOListReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `WO List Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>WONumber</td><td>woRefNumber</td><td>customerName </td><td>p.Facility</td><td>p.Location</td><td>p.Date</td><td>d. Date</td><td>d.Location</td><td>truck#</td><td>trailer#</td><td>driverName</td><td>driverPhone</td><td>status</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.woNumber ? item.woNumber : ''}</td><td>${item.woRefNumber ? item.woRefNumber : ''}</td><td>${item.customerName ? item.customerName : ''}</td><td>${item.pickupFacility ? item.pickupFacility : ''}</td><td>${item.pickupCity ? item.pickupCity : ''} ${item.pickupState ? item.pickupState : ''}</td><td>${item.pickupFromDate ? item.pickupFromDate : ''} ${item.pickupFromTime ? item.pickupFromTime : ''}</td><td>${item.deliveryFromDate ? item.deliveryFromDate : ''} ${item.deliveryFromTime ? item.deliveryFromTime : ''}</td><td>${item.deliveryCity ? item.deliveryCity : ''} ${item.deliveryState ? item.deliveryState : ''}</td><td>${item.truckNumber ? item.truckNumber : ''}</td><td>${item.trailerNumber ? item.trailerNumber : ''}</td><td>${item.driverName ? item.driverName : ''}</td><td>${item.driver1Phone ? item.driver1Phone : ''}</td><td>${item.status ? item.status : ''}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};

const workorderReportExportHTML = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Workorder Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>Wo Number</td><td>Customer Name</td><td>Reference Number</td><td>Status</td><td>Carrier Name</td><td>Driver</td><td>Pickup City</td><td>Pickup From Date</td><td>pickup From Time</td><td>Delivery City</td><td>Delivery From Date</td><td>Delivery From Time</td><td>Truck Number</td><td>Trailer Number</td><td>Sliptloads</td><td>Gross Amount</td><td>Load Amount</td><td>Driverlineitem Total</td><td>OwnerOp Amount</td><td>Carrierlineitem Total</td><td>Commision Amount</td><td>Dispatch Fee</td><td>Net Amount</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.woNumber ? item.woNumber : ''}</td><td>${item.customerName ? item.customerName : ''}</td><td>${item.referenceNumber ? item.referenceNumber : ''}</td><td>${item.status ? item.status : ''}</td><td>${item.carrierName ? item.carrierName : ''}</td><td>${item.driver1 ? item.driver1 : ''}</td><td>${item.pickupCity ? item.pickupCity : ''}</td><td>${item.pickupFromDate ? item.pickupFromDate : ''}</td><td>${item.pickupFromTime ? item.pickupFromTime : ''}</td><td>${item.deliveryCity ? item.deliveryCity : ''}</td><td>${item.deliveryFromDate ? item.deliveryFromDate : ''}</td><td>${item.deliveryFromTime ? item.deliveryFromTime : ''}</td><td>${item.truckNumber ? item.truckNumber : ''}</td><td>${item.trailerNumber ? item.trailerNumber : ''}</td><td>${item.sliptloads ? item.sliptloads : ''}</td><td>${item.grossAmount ? item.grossAmount : ''}</td><td>${item.loadAmount ? item.loadAmount : ''}</td><td>${item.driverlineitemTotal ? item.driverlineitemTotal : ''}</td><td>${item.ownerOpAmount ? item.ownerOpAmount : ''}</td><td>${item.carrierlineitemTotal ? item.carrierlineitemTotal : ''}</td><td>${item.commisionAmount ? item.commisionAmount : ''}</td><td>${item.dispatchFee ? item.dispatchFee : ''}</td><td>${item.netAmount ? item.netAmount : ''}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	return htmlString;
};

const exportHTMLWeeklyReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Workorder Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>truckNumber</td><td>driver1</td><td>driver2</td><td>cxName</td><td>deliveryCity</td><td>deliveryState</td><td>status</td><td>notes</td><td>amount</td><td>Delivery State</td><td>Delivery From Date</td><td>Delivery From Time</td><td>Truck Number</td><td>Trailer Number</td><td>Sliptloads</td><td>Gross Amount</td><td>Load Amount</td><td>Driverlineitem Total</td><td>OwnerOp Amount</td><td>Carrierlineitem Total</td><td>Commision Amount</td><td>Dispatch Fee</td><td>Net Amount</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.woNumber ? item.woNumber : ''}</td><td>${item.customerName ? item.customerName : ''}</td><td>${item.referenceNumber ? item.referenceNumber : ''}</td><td>${item.status ? item.status : ''}</td><td>${item.carrierName ? item.carrierName : ''}</td><td>${item.driver1 ? item.driver1 : ''}</td><td>${item.pickupCity ? item.pickupCity : ''}</td><td>${item.pickupState ? item.pickupState : ''}</td><td>${item.pickupFromDate ? item.pickupFromDate : ''}</td><td>${item.pickupFromTime ? item.pickupFromTime : ''}</td><td>${item.deliveryCity ? item.deliveryCity : ''}</td><td>${item.deliveryState ? item.deliveryState : ''}</td><td>${item.deliveryFromDate ? item.deliveryFromDate : ''}</td><td>${item.deliveryFromTime ? item.deliveryFromTime : ''}</td><td>${item.truckNumber ? item.truckNumber : ''}</td><td>${item.trailerNumber ? item.trailerNumber : ''}</td><td>${item.sliptloads ? item.sliptloads : ''}</td><td>${item.grossAmount ? item.grossAmount : ''}</td><td>${item.loadAmount ? item.loadAmount : ''}</td><td>${item.driverlineitemTotal ? item.driverlineitemTotal : ''}</td><td>${item.ownerOpAmount ? item.ownerOpAmount : ''}</td><td>${item.carrierlineitemTotal ? item.carrierlineitemTotal : ''}</td><td>${item.commisionAmount ? item.commisionAmount : ''}</td><td>${item.dispatchFee ? item.dispatchFee : ''}</td><td>${item.netAmount ? item.netAmount : ''}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	return htmlString;
};

const workorderWithNoLineItemsExportHTML = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Workorder With No Line Items<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += `<td>Wo Number</td><td>Customer Name</td><td>Reference Number</td><td>Driver1</td><td>Driver2</td><td>Carrier Name</td><td>Truck Number</td><td>Trailer Number</td><td>Pickup Facility</td><td>Pickup FromDate</td><td>Pickup From Time</td><td>Del Facility</td><td>Delivery From Date</td><td>Delivery From Time</td><td>Load Amount</td><td>Status</td><td>Is Bol Received</td><td>Bol Received Date</td><td>Pickup City</td><td>Pickup State</td><td>Delivery City</td><td>Delivery State</td></tr>`;
	
	for (const item of result) {
		htmlString += `<tr><td>${item.woNumber ? item.woNumber : ''}</td><td>${item.customerName ? item.customerName : ''}</td><td>${item.referenceNumber ? item.referenceNumber : ''}</td><td>${item.driver1 ? item.driver1 : ''}</td><td>${item.driver2 ? item.driver2 : ''}</td><td>${item.carrierName ? item.carrierName : ''}</td><td>${item.truckNumber ? item.truckNumber : ''}</td><td>${item.trailerNumber ? item.trailerNumber : ''}</td><td>${item.pickupFacility ? item.pickupFacility : ''}</td><td>${item.pickupFromDate ? item.pickupFromDate : ''}</td><td>${item.pickupFromTime ? item.pickupFromTime : ''}</td><td>${item.delFacility ? item.delFacility : ''}</td><td>${item.deliveryFromDate ? item.deliveryFromDate : ''}</td><td>${item.deliveryFromTime ? item.deliveryFromTime : ''}</td><td>${item.loadAmount ? item.loadAmount : ''}</td><td>${item.status ? item.status : ''}</td><td>${item.isBolReceived ? item.isBolReceived : ''}</td><td>${item.bolReceivedDate ? item.bolReceivedDate : ''}</td><td>${item.pickupCity ? item.pickupCity : ''}</td><td>${item.pickupState ? item.pickupState : ''}</td><td>${item.deliveryCity ? item.deliveryCity : ''}</td><td>${item.deliveryState ? item.deliveryState : ''}</td></tr>`;
	}

	htmlString += `</tr></table></body></html>`;
	return htmlString;
};

const statusEmailHTML = (result: any) => {
	let htmlString = '<div> <br /> ';    
	for (const item of result) {
		htmlString += `Load Status: ${item.status},${item.driver1Name ? `<br /> Driver: ${item.driver1Name}` : ''} ${item.truckNumber ? `<br /> Truck: ${item.truckNumber}` : ''} ${(item.gpsTruckTrackURL ? `<br />GPS Truck Track Link: ${item.gpsTruckTrackURL}` : '')} <br /> ${(item.trailerNumber ? `Trailer: ${item.trailerNumber}` : '')}<br /> ${(item.gpsTrailerTrackURL ? `<br /> GPS Truck Track Link:${item.gpsTrailerTrackURL}` : '')}`; 
	
		const stops = item.stops ? JSON.parse(`[ ${item.stops} ]`) : [];
		
		let j = 0;
		for (const stop of stops) {
			j++;
			htmlString += `Stop # ${j}: ${stop.facility}, ${stop.city},${stop.state} ${(stop.arrivedOn ? ` - Checked in: ${stop.arrivedOn}` : '')} ${(stop.loadedORUnLoadedDate ? ` - Checked Out:${stop.loadedORUnLoadedDate}` : '')} <br />`;  
			
		}
		htmlString += '<br/>';
	}

	htmlString += '</div>';
   return htmlString;
};
