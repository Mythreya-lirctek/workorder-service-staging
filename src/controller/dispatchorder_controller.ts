import { BaseController } from './base_controller';
import express from 'express';
import DispatchOrderService from '../service/dispatchorder/dispatchorder.service';
import DriverLineItemService from '../service/driverlineitem/driverlineitem.service';
import OwnerOpLineItemService from '../service/owneroplineitem/owneroplineitem.service';
import CarrierLineItemService from '../service/carrierlineitem/carrierlineitem.service';
import DOStopsService from '../service/dostop/dostop.service';
import AddressService from '../service/address/address.service';
import WorkOrderService from '../service/workorder/workorder.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import PDFService from '../service/pdf/pdf.service';
import moment from 'moment';
import WaypointService from '../service/waypoint/waypoint.service';
import MilesService from '../service/miles/miles.service';
import WOStopService from '../service/wostop/wostop.service';
import AvailableLoadsService from '../service/availableloads/availableloads.service';
import SendNotificationService from '../service/sendnotification/sendnotification.service';
import EmailService from '../service/email/email.service';
import { parse } from 'json2csv';
import RelayService from '../service/relay/relay.service';

export default class DispatchOrderController extends BaseController {
	private dispatchOrderService: DispatchOrderService
	private driverLineItemService: DriverLineItemService;
	private ownerOpLineItemService: OwnerOpLineItemService;
	private carrierLineItemService: CarrierLineItemService;
	private doStopsService: DOStopsService;
	private addressService: AddressService;
	private workOrderService: WorkOrderService;
	private activityLogService: ActivityLogService;
	private pdfService: PDFService;
	private waypointService: WaypointService;
	private milesService: MilesService;
	private woStopService: WOStopService;
	private availableLoadsService: AvailableLoadsService;	
	private sendNotificationService: SendNotificationService;
	private emailService: EmailService;
	private relayService: RelayService;
	constructor() {
		super();
		this.dispatchOrderService = new DispatchOrderService();
		this.driverLineItemService = new DriverLineItemService();
		this.ownerOpLineItemService = new OwnerOpLineItemService();
		this.carrierLineItemService = new CarrierLineItemService();
		this.doStopsService = new DOStopsService();
		this.addressService = new AddressService();
		this.workOrderService = new WorkOrderService();
		this.activityLogService = new ActivityLogService();
		this.pdfService = new PDFService();
		this.waypointService = new WaypointService();
		this.milesService = new MilesService();
		this.woStopService = new WOStopService();
		this.availableLoadsService = new AvailableLoadsService();	
		this.sendNotificationService = new SendNotificationService();
		this.emailService = new EmailService();
		this.relayService = new RelayService();
	}

	public async addDispatchOrder(req: express.Request, res: express.Response): Promise<any> {
		const { dr1LineItems, dr2LineItems, owneropLineItems, carrierLineItems, stops, alIds,
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
			
			doRequest.dispatchNumber = doRequest.isLTL ? null: doRequest.doNum;
			const addDispatchorderResp = await this.dispatchOrderService.addDispatchOrder(doRequest);
			const dispatchOrderId = addDispatchorderResp.data[0][0].id;
			const dispatchNumber = addDispatchorderResp.data[0][0].DONum;
			if (!dispatchOrderId) {
				throw new Error(`failed to create Dispatch order ${JSON.stringify(addDispatchorderResp.data[0])}`);
			}
			
			if(!doRequest.isLTL) {
				// updating availableloads with the dispatchorder_Id				
				const availableLoad = { dispatchOrder_Id: dispatchOrderId, availableLoad_Id: doRequest.alId, userId: user.id };
				this.workOrderService.saveAvailableLoad(availableLoad);
				
				// Need to call status change API for LTL
					
				// Dispatch order created successfully proceed with dostops creations
				const wostops = await this.woStopService.getWOStopstoAddDOStops(doRequest.workOrderId);
				for (const stop of wostops.data) {
					stop.userId = user.id;
					stop.dispatchOrder_Id = dispatchOrderId;
					this.doStopsService.addDOStop(stop);
				}
			} else {
				// updating availableloads with the dispatchorder_Id		
				let alIdsResponse;
				const processALIdsDetails = [];
				if (alIds) {
					for (const item of alIds) {
						const availableLoad = { dispatchOrder_Id: dispatchOrderId, availableLoad_Id: item, userId: user.id}
						processALIdsDetails.push(this.workOrderService.saveAvailableLoad(availableLoad));
					}
					alIdsResponse = await Promise.all(processALIdsDetails);
				}

				if (stops) {
					for (const item of stops) {
						item.userId = user.id;
						item.dispatchOrder_Id = dispatchOrderId;
						if (item.dropContact_Id && item.woStop_Id === null) {
							item.stopType = 'Delivery';
							item.workOrder_Id = null;
							item.dispatchStatus = doRequest.dispatchStatus;
							item.contact_Id = item.dropContact_Id;
							item.dispatchOrder_Id = dispatchOrderId;
							const newDrop = await this.addDropStops(item);

							item.dispatchStatus = 1;
							item.stopNumber = 1;
							item.stopType = 'Pickup';
							item.dispatchOrder_Id = null;
							const newPick = await this.addDropStops(item);
							await this.availableLoadsService.InsertUpdateAL(item.availableLoad_Id, newPick, newDrop, user.id, item.newALNumber);
						} else {
							const stopId = await this.doStopsService.addDOStop(item);
							const waypoint = {
								address_Id: item.address_Id,
								dispatchOrder_Id: item.dispatchOrder_Id,
								doStops_Id: stopId.data.insertId,
								orderNumber: item.stopNumber,
								pickupDate: item.fromDate,                
								stopType: item.stopType,
								userId: user.id
								};
								
							const waypointResult = this.waypointService.addWaypoint(waypoint);
						}
					}
				}
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
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'DispatchOrder',
				module_Id: dispatchOrderId,
				userId: user.id,
			});

			if(req.body.driver1MilesBy === 'Promiles' || req.body.driver1MilesBy === 'promiles' || req.body.driver2MilesBy === 'Promiles') {
				this.milesService.calculateDOMiles({dispatchOrderId, relay_Id: null, isFullTrip: 0}, user.id);
			} else if(!req.body.carrier_Id && (req.body.driver1MilesBy === 'ELD' || req.body.driver2MilesBy === 'ELD')) {
				this.waypointService.getWaypointsbyDOIdRelayId({do_Id: dispatchOrderId, relay_Id: null});
				this.milesService.addDLItemsFromELD(req.body);
			} else if(req.body.carrier_Id > 0) {
				this.waypointService.getWaypointsbyDOIdRelayId({do_Id: dispatchOrderId, relay_Id: null});
			} else if(!req.body.driver1MilesBy) {
				this.milesService.calculateDOMiles({dispatchOrderId, relay_Id: null, isFullTrip: 0}, user.id);
			}

			if(doRequest.isLTL) {
				this.workOrderService.UpdateWObyDOId({dispatchOrder_Id: dispatchOrderId});
			}
			
			res.send(this.getSuccessResponse({dispatchNumber,dispatchOrder_Id: dispatchOrderId
			}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error, 500));
		}
	}
	public async autoDispatchWorkOrder(req: express.Request, res: express.Response):Promise<any>{
		try {
			const user = req.user as any;
			const result = await this.dispatchOrderService.getAutoDispatchLoads();
			const currentTimeStamp = moment().utc().unix();
			for (const  load of result.data[0]){
				if(load.autoDispatchType === 'Schedule Date Time' && load.autoDispatchDT && load.driverNotificationType){
					const dispatchTimestamp = moment(load.autoDispatchDT).unix();
					if(currentTimeStamp >= dispatchTimestamp){
						await this.dispatchAndSendNotification(load,load.driver1_Id,user.id, user?.companyId)
						if(load.driver2_Id && load.driver2_Id>0) {
							await this.dispatchAndSendNotification(load,load.driver2_Id,user.id, user?.companyId)
						}
					}
				}
				else if (load.autoDispatchType === 'After Prev. Load Delivered' && load.driverNotificationType){
					const driverLoadsCountResult = await this.dispatchOrderService.getPendingLoadsForDriver(load.driver1_Id)
					const loadsCountResult = driverLoadsCountResult.data.length ? driverLoadsCountResult.data[0] : []
					const driverLoadsCount = loadsCountResult.length ? loadsCountResult[0].loadCount : null;
					let driver2LoadCount = -1;
					if(load.driver2_Id && load.driver2_Id !== 0 ){
						const driver2LoadsCountResult = await this.dispatchOrderService.getPendingLoadsForDriver(load.driver2_Id)
						driver2LoadCount = driver2LoadsCountResult.data[0].loadCount
					}
					if(driverLoadsCount === 0 || (load.driver2_Id && load.driver2_Id !== 0 && driver2LoadCount === 0)){
						await this.dispatchAndSendNotification(load, load.driver1_Id,user.id, user?.companyId)
						if(load.driver2_Id && load.driver2_Id>0) {
							await this.dispatchAndSendNotification(load,load.driver2_Id,user.id, user?.companyId)
						}
					}
				}
			}
			res.send(this.getSuccessResponse({ result: 'Ran Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async GetStartLocandDriverId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.dispatchOrderService.GetStartLocandDriverId(req.body);
			res.send(this.getSuccessResponse({
				data: result.data[1][0] ? result.data[1][0] : {},
				startingAddress: result.data[0][0] ? result.data[0][0] : {}
					}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getCurrentLoadsByTruckId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.dispatchOrderService.getCurrentLoadsByTruckId(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async searchTripNumbers(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.dispatchOrderService.searchTripNumbers(
				req.body
			);
			res.send(this.getSuccessResponse(result.data));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getInfotoSendDispatch(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {			
			const result = await this.dispatchOrderService.getInfotoSendDispatch(
				req.body
			);
			res.send(this.getSuccessResponse(result.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getStopsbyDOIdRelayId(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {		
				
			let result = await this.doStopsService.getStopsbyDOIdRelayId(
					req.body
				);
			result = result.data;
			for (let i = 0; i < result.length; i++) {
				result[i].facilityItem = {					
					address1: result[i].address1, 
					address2: result[i].address2, 
					city: result[i].city, 
					name: result[i].facility,
					state: result[i].state,					
					zip:result[i].zip }				
			}
			res.send(this.getSuccessResponse(result));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async rateConPrint(req: express.Request, res: express.Response): Promise<any> {
		let lineItems = [];
		const stops = [];
		let result = await this.dispatchOrderService.getDORateConPrintDetails(
			req.body
		);
	
		result = result.data[0][0];

		if(req.body.sendToOwnerOp && result.ownerop_Id > 0) {
			if(req.body.relay_Id > 0) {
				const items = await this.ownerOpLineItemService.getOpLineItemsByRelayId(
					{ relay_Id:req.body.relay_Id,ownerop_Id: result.ownerop_Id }
				);
				lineItems = items.data[0];
			} else {
				const items = await this.ownerOpLineItemService.getOpLineItemsByDOId(
					{do_Id:req.body.do_Id,ownerop_Id: result.ownerop_Id }
				);
				lineItems = items.data[0];
			}				
		}
		if(result.carrierId > 0) {
			if(req.body.relay_Id > 0) {
				const items = await this.carrierLineItemService.getDOCarrierlineitemsByRelayId(
					{ relay_Id:req.body.relay_Id,carrier_Id: result.carrierId }
				);
				lineItems = items.data[0];
			} else {
				const items = await this.carrierLineItemService.getDOCarrierlineitemsByDOId(
					{do_Id:req.body.do_Id, carrier_Id: result.carrierId }
				);
				lineItems = items.data[0];
			}				
		}
		
		if(req.body.relay_Id > 0) {
			let items = await this.doStopsService.getDOStopsByRelayId(
				{ relay_Id:req.body.relay_Id }
			);
			items = items.data[0];
			
			for (const stop of items) {
				stop.stopItems = (stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : []);
				stops.push(stop);
			}
		} else {
			let items = await this.doStopsService.getDOStopsByDOId(
				{do_Id:req.body.do_Id }
			);
			items = items.data[0];
			for (const stop of items) {
				stop.stopItems = (stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : []);
				stops.push(stop);
			}
		}	
		
		const flatfee = lineItems.find((item : any) =>  {
			return item.name === 'Flat/Line Haul';
		});
		if (flatfee && flatfee.amount > 0 && result.dispatchPCT > 0) {
			lineItems.push({
				amount: parseFloat((flatfee.amount * result.dispatchPCT/100).toFixed(2)),
				name: 'DispatchFee',
				per: result.dispatchPCT,
				units: null
			});
		}
		
		result.stops = stops;
		result.lineItems = lineItems;
		const pdfResponse = await this.pdfService.generatePdf(rateConHTML(result));
		pdfResponse.pipe(res);
	}
	
	public async sendDispatchNotification(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		const user = req.user as any;
		req.body.companyId = user.companyId;
			 
		if (req.body.sendType === 'SMS') {
			const result = await this.dispatchOrderService.getDetailsToSendSMS(req.body);
			if (result.data[0] && result.data[0][0] && result.data[0][0].driver1Phone) {
				const message = smsHTML(result.data[0]);
				const phoneNumbers = [`+1${result.data[0][0].driver1Phone}`];
				
				if (result.data[0][0].driver2Phone) {
					phoneNumbers.push(`+1${result.data[0][0].driver2Phone}`)
				}
				
				const body = {
					// from: '',
					message,
					to:  phoneNumbers			
				}
				const attributes = {} as any;
				
				attributes.do_Id = {
					DataType: 'Number',
					StringValue: `${req.body.do_Id}`
				};
				
				if(req.body.relay_Id) {
					attributes.relay_Id = { DataType: 'Number',
												StringValue: `${req.body.relay_Id}`
											}
				}
			
				const response = await this.sendNotificationService.sendNotification({
					attributes, 
					body: JSON.stringify(body),
					sendType: req.body.sendType});
				this.activityLogService.addActivityLog({
					description: JSON.stringify(req.body),
					module: 'DriverNotificationSent',
					module_Id: req.body.relay_Id ? req.body.relay_Id : req.body.do_Id,
					userId: user.id });
				res.send(this.getSuccessResponse(response));
			} else {
				res.send(this.getSuccessResponse('Message could not sent successfully.'));
			}
		}
		else if (req.body.sendType === 'Email') {
			let lineItems = [];
			const stops = [];
			let result = await this.dispatchOrderService.getDORateConPrintDetails(
				req.body
			);
			
			result = result.data[0];
			result = result[0];
			if(req.body.sendToOwnerOp && result.ownerop_Id > 0) {
				if(req.body.relay_Id > 0) {
					const items = await this.ownerOpLineItemService.getOpLineItemsByRelayId(
						{ relay_Id:req.body.relay_Id,ownerop_Id: result.ownerop_Id }
					);
					lineItems = items.data[0];
				} else {
					const items = await this.ownerOpLineItemService.getOpLineItemsByDOId(
						{do_Id:req.body.do_Id,ownerop_Id: result.ownerop_Id }
					);
					lineItems = items.data[0];
				}				
			} 
			if(result.carrier_Id > 0) {
				if(req.body.relay_Id > 0) {
					const items = await this.carrierLineItemService.getDOCarrierlineitemsByRelayId(
						{ relay_Id:req.body.relay_Id,carrier_Id: result.carrier_Id }
					);
					lineItems = items.data[0];
				} else {
					const items = await this.carrierLineItemService.getDOCarrierlineitemsByDOId(
						{do_Id:req.body.do_Id, carrier_Id: result.carrier_Id }
					);
					lineItems = items.data[0];
				}				
			}
			
			if(req.body.relay_Id > 0) {
				let items = await this.doStopsService.getDOStopsByRelayId(
					{ relay_Id:req.body.relay_Id }
				);
				items = items.data[0];
				
				for (const stop of items) {
					stop.stopItems = (stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : []);
					stops.push(stop);
				}
			} else {
				let items = await this.doStopsService.getDOStopsByDOId(
					{do_Id:req.body.do_Id }
				);
				items = items.data[0];
				for (const stop of items) {
					stop.stopItems = (stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : []);
					stops.push(stop);
				}
			}	
			
			const flatfee = lineItems.find((item : any) =>  {
				return item.name === 'Flat/Line Haul';
			});
			if (flatfee && flatfee.amount > 0 && result.dispatchPCT > 0) {
				lineItems.push({
					amount: parseFloat((flatfee.amount * result.dispatchPCT/100).toFixed(2)),
					name: 'DispatchFee',
					per: result.dispatchPCT,
					units: null
				});
			}
			
			result.stops = stops;
			result.lineItems = lineItems;
			const pdfResponse = await this.pdfService.generatePdf(rateConHTML(result)) as any;
			const bodyBuffer = await pdfResponse.body();
			const emailRes = {} as any;
			emailRes.buffers = bodyBuffer;
			emailRes.body = req.body.message;
			emailRes.emails = req.body.toEmails;
			emailRes.fromEmail =req.body.fromEmail;
			emailRes.subject = req.body.subject;
			emailRes.fileName = 'Load Confirmation';
			emailRes.cc = req.body.cc;
			this.emailService.emailservice(emailRes);
			
			this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'DriverNotificationSent',
				module_Id: req.body.do_Id?req.body.do_Id:req.body.relay_Id,
				userId: user.id });
			res.send(this.getSuccessResponse({data: 'Sent successfully.'}));			
		}
		else if (req.body.sendType === 'Mobile') {
			const result = await this.dispatchOrderService.getDeviceTokensInfo(req.body);
			if(req.body.carrier_Id) {
				req.body.driver_Id = req.body.carrier_Id;
			}
			if(result.data[0].length > 0) {
			for (const item of result.data[0]) {
				let bodyR = {} as any;
				if(item.type === 'iOS') {
					bodyR = {
						deviceTokens: item.token,
						deviceType: item.type,
						payload:{
							'data': {
								'Driver_Id': (req.body.driver_Id ? req.body.driver_Id : ''),	
								'Role_Id': (item.role_Id ? item.role_Id : ''),
								'load_id': (req.body.load_Id ? req.body.load_Id : ''),
								'message': (req.body.message ? req.body.message : ''),				
								'modification_type': (req.body.modification_Type ? req.body.modification_Type : ''), // Type "1" for *New* , "2" for *Updated*, "0" for *Delete*
								'notification_type': (req.body.notification_Type ? req.body.notification_Type : ''), // Check the types in Block comment Above...				
								'relay_id': (req.body.relay_Id ? req.body.relay_Id : ''),								
								'settlement': (req.body.settlement ? req.body.settlement : ''),
								'status': (req.body.status ? req.body.status : '')
							},
							'notification':{
								'body': (req.body.body ? req.body.body : ''),
								'sound': 'default',
								'title': (req.body.title ? req.body.title : '')								
							}							
						}
					}
				} else {
					bodyR = {
						deviceTokens: item.token,
						deviceType: item.type,
						payload:{
							'data': {
								'Driver_Id': (req.body.driver_Id ? req.body.driver_Id : ''),
								'Role_Id': (item.role_Id ? item.role_Id : ''),
								'body': (req.body.body ? req.body.body : ''),								
								'load_id': ` ${(req.body.load_Id ? req.body.load_Id : '')}`,
								'message': (req.body.message ? req.body.message : ''),
								'modification_type': (req.body.modification_Type ? req.body.modification_Type : ''), // Type "1" for *New* , "2" for *Updated*, "0" for *Delete* 
								'notification_type': (req.body.notification_Type ? req.body.notification_Type : ''), // Type "1" for **loads** and type "2" for **Settlements**
								'relay_id': (req.body.relay_Id ? req.body.relay_Id : ''),								
								'settlement': (req.body.settlement ? req.body.settlement : ''),
								'status': (req.body.status ? req.body.status : ''),								
								'title': (req.body.title ? req.body.title : '')
							}
						}
					}
				}
				
				const attributesR = {} as any;
				
				attributesR.do_Id = {
					DataType: 'Number',
					StringValue: `${req.body.do_Id}`
				};
				
				if(req.body.relay_Id > 0) {
					attributesR.relay_Id = {
						DataType: 'Number',
						StringValue: `${req.body.relay_Id}`
					}; 
				}
				const response = await this.sendNotificationService.sendNotification({					
					attributes: attributesR, 
					body: JSON.stringify(bodyR),
					sendType: req.body.sendType});
			}
			this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'DriverNotificationSent',
				module_Id: req.body.do_Id?req.body.do_Id:req.body.relay_Id,
				userId: user.id });
			res.send(this.getSuccessResponse({ result: 'Sent Successfully' }));
			}
			else {
				res.send(this.getSuccessResponse({ result: 'No device tokens exists.' }));
			}
		}
	}

	
	public async saveDispatchOrder(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {dispatchOrderId} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.dispatchOrderId = dispatchOrderId;

			const {alIds, driver1LineItems, driver2LineItems, carrierLineItems, owneropLineItems,
			copyDriver1Lineitems, copyDriver2Lineitems,copyCarrierLineItems,copyOwneropLineItems,
			deleteDriver1Lineitems, deleteDriver2Lineitems, deleteCarrierLineItems, deleteOwneropLineItems} = req.body;
			
			if (req.body.startingAddress && req.body.startingLocation_Id && req.body.startingAddress.zip) {
				req.body.startingAddress.addressId = req.body.startingLocation_Id;
				req.body.startingAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.saveAddress(req.body.startingAddress);
			}
			
			if (req.body.startingAddress && !req.body.startingLocation_Id && req.body.startingAddress.zip) {
				req.body.startingAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.addAddress(req.body.startingAddress);
				req.body.startingLocation_Id = mainingAddressResult.data.insertId;
			}				
			
			if (req.body.endingAddress && req.body.endingLocation_Id && req.body.endingAddress.zip) {
				req.body.endingAddress.addressId = req.body.endingLocation_Id;
				req.body.endingAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.saveAddress(req.body.endingAddress);
			}
			
			if (req.body.endingAddress && !req.body.endingLocation_Id && req.body.endingAddress.zip) {
				req.body.endingAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.addAddress(req.body.endingAddress);
				req.body.endingLocation_Id = mainingAddressResult.data.insertId;
			}			
			
			if (req.body.trailerAddress && req.body.trailerLocation_Id && req.body.trailerAddress.zip) {
				req.body.trailerAddress.addressId = req.body.trailerLocation_Id;
				req.body.trailerAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.saveAddress(req.body.trailerAddress);
			}
			
			if (req.body.trailerAddress && !req.body.trailerLocation_Id && req.body.trailerAddress.zip) {
				req.body.trailerAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.addAddress(req.body.trailerAddress);
				req.body.trailerLocation_Id = mainingAddressResult.data.insertId;
			}			
			
			if(alIds && alIds.length){
				for (const alId of alIds) {
					await this.workOrderService.saveAvailableLoad({availableLoad_Id: alId, dispatchOrder_Id : dispatchOrderId, userId:user.id });
				}
			}

			if (deleteDriver1Lineitems && deleteDriver1Lineitems.length >0 ) {
				if(deleteDriver1Lineitems[0].driver_Id) {
					this.driverLineItemService.saveDriverLineItem({dispatchOrder_Id: dispatchOrderId, isDeleted: 1, 
						oldDriver_Id: deleteDriver1Lineitems[0].driver_Id, userId: user.id })
				}
			}

			if (deleteDriver2Lineitems && deleteDriver2Lineitems.length >0 ) {
				if(deleteDriver2Lineitems[0].driver_Id) {
					this.driverLineItemService.saveDriverLineItem({dispatchOrder_Id: dispatchOrderId, isDeleted: 1, 
						oldDriver_Id: deleteDriver2Lineitems[0].driver_Id, userId: user.id });
				}
			}

			if (deleteOwneropLineItems && deleteOwneropLineItems.length >0 ) {
				if(deleteOwneropLineItems[0].ownerop_Id) {
					this.ownerOpLineItemService.saveOwneropLineItem({dispatchOrder_Id: dispatchOrderId, isDeleted: 1, 
						oldOwnerop_Id: deleteOwneropLineItems[0].ownerop_Id, userId: user.id });
				}
			}

			if (deleteCarrierLineItems && deleteCarrierLineItems.length >0 ) {
				if(deleteCarrierLineItems[0].carrier_Id) {
					this.carrierLineItemService.saveCarrierLineItem({dispatchOrder_Id: dispatchOrderId, isDeleted: 1,
						oldCarrier_Id: deleteCarrierLineItems[0].carrier_Id, userId: user.id });
				}
			}

			if (copyDriver1Lineitems && copyDriver1Lineitems.length >0 ) {
				if(copyDriver1Lineitems[0].driver_Id) {
					this.driverLineItemService.saveDriverLineItem({dispatchOrder_Id: dispatchOrderId,  
						driver_Id: copyDriver1Lineitems[0].driver_Id, oldDriver_Id: copyDriver2Lineitems[0].oldDriver_Id, userId: user.id})
				}
			}

			if (copyDriver2Lineitems && copyDriver2Lineitems.length >0 ) {
				if(copyDriver2Lineitems[0].driver_Id) {
					this.driverLineItemService.saveDriverLineItem({dispatchOrder_Id: dispatchOrderId,
						driver_Id: copyDriver2Lineitems[0].driver_Id, oldDriver_Id: copyDriver2Lineitems[0].oldDriver_Id, userId: user.id});
				}
			}

			if (copyOwneropLineItems && copyOwneropLineItems.length >0 ) {
				if(copyOwneropLineItems[0].ownerop_Id) {
					this.ownerOpLineItemService.saveOwneropLineItem({dispatchOrder_Id: dispatchOrderId,  
						oldOwnerop_Id: copyOwneropLineItems[0].oldOwnerop_Id, ownerop_Id: copyOwneropLineItems[0].ownerop_Id, userId: user.id});
				}
			}

			if (copyCarrierLineItems && copyCarrierLineItems.length >0 ) {
				if(copyCarrierLineItems[0].carrier_Id) {
					this.carrierLineItemService.saveCarrierLineItem({carrier_Id: copyCarrierLineItems[0].carrier_Id, dispatchOrder_Id: dispatchOrderId, 
						 oldCarrier_Id: copyCarrierLineItems[0].oldCarrier_Id, userId: user.id});
				}
			}

			if(driver1LineItems	&& driver1LineItems.length > 0) {
				for (const item of driver1LineItems) {
					item.userId = user.id;
					item.dispatchOrder_Id = dispatchOrderId;
					await this.driverLineItemService.addDriverLineItem(item);
				}
			}	
			
			if(driver2LineItems	&& driver2LineItems.length > 0) {
				for (const item of driver2LineItems) {
					item.userId = user.id;
					item.dispatchOrder_Id = dispatchOrderId;
					await this.driverLineItemService.addDriverLineItem(item);
				}
			}	

			if(owneropLineItems	&& owneropLineItems.length > 0) {
				let oplineitems = await this.ownerOpLineItemService.getOpLineItemsByDOId({do_Id:dispatchOrderId, 
					ownerop_Id: owneropLineItems[0].ownerop_Id});

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
					item.dispatchOrder_Id = dispatchOrderId;
					if(item.lineItemId) {
						await this.ownerOpLineItemService.saveOwneropLineItem(item);
					} else {
						await this.ownerOpLineItemService.addOwneropLineItem(item);
					}
				}
			}
			
			if(carrierLineItems	&& carrierLineItems.length > 0) {
				let calineitems = await this.carrierLineItemService.getDOCarrierlineitemsByDOId({do_Id:dispatchOrderId});
				
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
					item.dispatchOrder_Id = dispatchOrderId;
					if(item.lineItemId) {
						await this.carrierLineItemService.saveCarrierLineItem(item);
					} else {
						await this.carrierLineItemService.addCarrierLineItem(item);
					}
				}
			}
			const result = await this.dispatchOrderService.saveDispatchOrder(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'DispatchOrder',
				module_Id: dispatchOrderId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async deleteDO(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const user= req.user as any;
			req.body.userId = user.id;
			
			const result = await this.dispatchOrderService.deleteDo(req.body);
			req.body.status_Id = 7;
			const resultWO = await this.workOrderService.saveWorkOrder(req.body);
			res.send(this.getSuccessResponse({ result: 'Deleted Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async calculateDOMiles(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const processedMiles = [];
			const doIds = req.body;
			const user = req.user as any;
			let response;
			if (req.body.dispatchOrderId > 0) {
				req.body.isFullTrip = 1;
				await this.waypointService.deleteWaypoints(req.body);
				const result = await this.milesService.calculateDOMiles(req.body, user.id);
				res.send(this.getSuccessResponse(result));
			} else if (doIds) {
				for (const doId of doIds) {
					req.body.dispatchOrderId = doId;
					await this.waypointService.deleteWaypoints(req.body);
					processedMiles.push(this.milesService.calculateDOMiles({dispatchOrderId: doId, relay_Id: null, isFullTrip: 1}, user.id));
				}
				response = await Promise.all(processedMiles);
				res.send(this.getSuccessResponse({ result: 'Miles Ran Successfully' }));
			}
			
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async addTerminaltoDO(req: express.Request, res: express.Response): Promise<any> {
		try {		
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;

			const {doStops} = req.body;
			const woIds = [];
			for(const stop of doStops) {
				stop.userId = user.id;
				stop.stopType = 'Delivery';
			
				const addedStop = await this.woStopService.addStop(stop);
				stop.woStops_Id = addedStop.data.insertId;
				stop.availableLoad_Id = stop.al_Id;
				const newDrop = await this.doStopsService.addDOStop(stop);
				
				stop.dispatchStatus = 1;
				stop.stopNumber = 1;
				stop.stopType = 'Pickup';
				stop.dispatchOrder_Id = null;

				const newPick =  await this.woStopService.addStop(stop);
				
				const aLoad = await this.availableLoadsService.getALById(stop);

				const { data: alNumbers } = await this.availableLoadsService.getALNumbers(stop.al_Id);
	
				let tCount = 0
				if(alNumbers.length ){
					alNumbers.forEach((element: any) => {
						if(element?.alNumber && element.alNumber[element.alNumber.length - 1] === 'T') {
							tCount += 1
						}
					});
				}
			
				const newAL = aLoad.data[0];
				delete newAL.id;
				newAL.origin_Id = newPick.data.insertId;
				woIds.push(newAL.workOrder_Id);
				newAL.alNumber = `${newAL.alNumber}-${tCount ? tCount + 1 : '1'}T`;
				newAL.al_Id = stop.al_Id;
				newAL.userId = user.id;
				newAL.dispatchOrder_Id = null;
				newAL.parentAvailableloads_Id = newAL.parentAvailableloads_Id ? newAL.parentAvailableloads_Id : stop.al_Id;
				
				const result = await this.workOrderService.saveAvailableLoad({ availableLoad_Id: newAL.al_Id,
					destination_Id: addedStop.data.insertId,
					parentDestination_Id: newAL.destination_Id,
					parentOrigin_Id: newAL.origin_Id,
					userId:newAL.userId 
				});

				if(result){
					await this.availableLoadsService.addAvailableLoad(newAL);
					await this.doStopsService.saveDOStop({dispatchOrder_Id: null, doStopId: newAL.destination_Id, userId: stop.userId});
				}
			}

			for(const id of woIds) {		
				await this.workOrderService.updateWOFromDobyWOId(id);           
			}

			res.send(this.getSuccessResponse({result: 'Added Terminal successfully!'}));
	
		} catch (error) { 
			res.status(500).send({result: 'Error occured while adding the terminal'});
		}
	}
	
	public async getWayPointsByDOIdRelayId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.waypointService.getWaypointsbyDOIdRelayId(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getAcceptedRejectedLogsById(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.dispatchOrderService.getAcceptedRejectedLogsById(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getLTLDORelayDetailsbyId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {doId} = req.params;
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.do_Id = doId;
			let result = await this.dispatchOrderService.getLTLDORelayDetailsbyId(req.body);
			result = result.data[0];
			for (const item of result) {
				item.carrierLineItems = (item.carrierLineItems ? JSON.parse(`[${item.carrierLineItems}]`) : []);
				item.driver1LineItems = (item.driver1LineItems ? JSON.parse(`[${item.driver1LineItems}]`) : []);
				item.driver2LineItems = (item.driver2LineItems ? JSON.parse(`[${item.driver2LineItems}]`) : []);
				item.ownerOpLineItems = (item.ownerOpLineItems ? JSON.parse(`[${item.ownerOpLineItems}]`) : []);
				item.stops = (item.stops ? JSON.parse(`[${item.stops}]`) : []);
				item.alLoads = (item.alLoads ? JSON.parse(`[${item.alLoads}]`) : []);
			}
			res.send(this.getSuccessResponse(result));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getroutebyDORelayID(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.dispatchOrderService.getroutebyDORelayID(req.body);
			res.send(this.getSuccessResponse(result.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getLatePickups(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.dispatchOrderService.getLatePickups(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}	
	
	public async getLatePickupsExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.dispatchOrderService.getLatePickups(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLLatePickReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['dispatchNumber', 'relayNumber', 'customer', 'truckNumber','driverName','fromDate', 'fromTime', 'checkInTime', 'delayReason'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('LatePicks.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getLateDeliverys(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			
			const result = await this.dispatchOrderService.getLateDeliverys(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}	
	
	public async getAdditionPickandDel(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resultt = await this.dispatchOrderService.getAdditionPickandDel(req.body);
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}	

	public async getOwneropAmount(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resultt = await this.dispatchOrderService.getOwneropAmount(req.body);
			res.send(this.getSuccessResponse(resultt.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}	

	public async getStateWideMilesByDORelayId(req: express.Request, res: express.Response): Promise<any> {
		try{
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.dispatchOrderService.getStatewidemilesbyDORelayId(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getCarrierAmount(req: express.Request, res: express.Response): Promise<any> {
		try {
			const resultt = await this.dispatchOrderService.getCarrierAmount(req.body);
			res.send(this.getSuccessResponse(resultt.data[0][0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}	
	
	public async getLateDeliverysExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.dispatchOrderService.getLateDeliverys(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLLateDelReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['dispatchNumber', 'relayNumber', 'customer', 'truckNumber','driverName','fromDate', 'fromTime', 'checkInTime', 'delayReason'];
				const opts = { fields };

				const csv = parse(result.data[0], opts);
				res.attachment('LateDeliverys.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getAutoDispatchData(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			const resultt = await this.dispatchOrderService.getAutoDispatchData();
			for (const load of resultt) {
				const result = await this.dispatchOrderService.getDeviceTokensInfo(load);
				for (const item of result.data[0]) {
					let bodyR = {} as any;
					if(item.type === 'iOS') {
						bodyR = {
							deviceTokens: item.token,
							deviceType: item.type,
							payload:{
								'data': {
									'Driver_Id': (load.driver1_Id ? load.driver1_Id : ''),	
									'Role_Id': (item.role_Id ? item.role_Id : ''),
									'load_id': (load.do_Id ? load.do_Id : ''),
									'message': `New Load Dispatched-${load.loadNumber}`,				
									'modification_type': 1, // Type "1" for *New* , "2" for *Updated*, "0" for *Delete*
									'notification_type': 1, // Check the types in Block comment Above...				
									'relay_id': (load.relay_Id ? load.relay_Id : ''),								
									'settlement': '',
									'status': 2
								},
								'notification':{
									'body': (req.body.body ? req.body.body : ''),
									'sound': 'default',
									'title': (req.body.title ? req.body.title : '')								
								}							
							}
						}
					} else {
						bodyR = {
							deviceTokens: item.token,
							deviceType: item.type,
							payload:{
								'data': {
									'Driver_Id': (load.driver1_Id ? load.driver1_Id : ''),
									'Role_Id': (item.role_Id ? item.role_Id : ''),
									'body': (req.body.body ? req.body.body : ''),								
									'load_id': ` ${(load.do_Id ? load.do_Id : '')}`,
									'message': `New Load Dispatched-${load.loadNumber}`,
									'modification_type': 1, // Type "1" for *New* , "2" for *Updated*, "0" for *Delete* 
									'notification_type': 1, // Type "1" for **loads** and type "2" for **Settlements**
									'relay_id': (load.relay_Id ? load.relay_Id : ''),								
									'settlement': (req.body.settlement ? req.body.settlement : ''),
									'status': 2,								
									'title': (req.body.title ? req.body.title : '')
								}
							}
						}
					}
					
					const attributesR = {} as any;
					
					attributesR.do_Id = {
						DataType: 'Number',
						StringValue: `${req.body.do_Id}`
					};
					
					if(req.body.relay_Id > 0) {
						attributesR.relay_Id = {
							DataType: 'Number',
							StringValue: `${req.body.relay_Id}`
						}; 
					}
					const response = await this.sendNotificationService.sendNotification({					
						attributes: attributesR, 
						body: JSON.stringify(bodyR),
						sendType: req.body.sendType});
				}
				if(load.relay_Id > 0 ) {
					this.relayService.saveRelay({userId: user.id, relayId: load.relay_Id, status_Id: 2});
				} else {
					this.dispatchOrderService.saveDispatchOrder({userId: user.id, dispatchOrderId: load.do_Id, status_Id: 2});
				}
			}
			res.send(this.getSuccessResponse({ result: 'Ran Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getDispatchOrderListByCompany(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.dispatchOrderService.getDispatchOrderListByCompany(req.body);
			res.send(this.getSuccessResponse({data:result.data[0],totalRecords:result.data[1][0].totalRecords}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getmilesbydorelayId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const result = await this.dispatchOrderService.getmilesbydorelayId(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async updateBulkApproveAmt(req: express.Request, res: express.Response): Promise<any> {
		try {
		const user = req.user as any;
		const userId = user.id;
			for (const item of req.body.legs) {
				let approvedOn = moment.utc().format('YYYY-MM-DD HH:mm:ss');
				if(!req.body.isAmountApproved) {
					approvedOn = '';
				}
				if(item.do_Id > 0) {
					this.dispatchOrderService.saveDispatchOrder({
						approvedBy: req.body.approvedBy,
						approvedOn,
						dispatchOrderId: item.do_Id,
						isAmountApproved: req.body.isAmountApproved,						
						userId
					});
				} else if(item.relay_Id > 0) {
					this.relayService.saveRelay({
						approvedBy: req.body.approvedBy,
						approvedOn,						
						isAmountApproved: req.body.isAmountApproved,
						relayId: item.relay_Id,
						userId
					});
				}
			}
			res.send(this.getSuccessResponse({result: 'Updated successfully.'}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async updateLTLTripStatus(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			if(req.body.status_Id === 7) {
				await this.workOrderService.UpdateWObyDOId({dispatchOrder_Id: req.body.dispatchOrder_Id});
				await this.availableLoadsService.updateALLoadbyDoId(req.body.dispatchOrder_Id);
				await this.workOrderService.UpdateWObyDOId({dispatchOrder_Id: req.body.dispatchOrder_Id});
				await this.dispatchOrderService.deleteDo({dispatchOrderId: req.body.dispatchOrder_Id});
			} else {
				await this.dispatchOrderService.saveDispatchOrder({
														dispatchOrderId: req.body.dispatchOrder_Id, 
														status_Id : req.body.status_Id, 
														userId: user.id});
				await this.workOrderService.UpdateWObyDOId({dispatchOrder_Id: req.body.dispatchOrder_Id});
			}
			res.send(this.getSuccessResponse({ result: 'Updated Successfully'}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async updateLegLoadAmount(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			let result = await this.dispatchOrderService.getWOloadamountwithLegmiles(req.body.woId);

			result = result.data[0];
			let miles = 0;

			for (const item of result) {
				miles += item.loadedMiles;
			} 

			const perMileAmount = result[0].loadAmount / miles;

			for (const item of result) {
				const loadAmount = (item.loadedMiles * perMileAmount).toFixed(2);

				if(item.relayId) {
					this.relayService.saveRelay({relayId: item.relayId, userId: user.id, amount: loadAmount});
				} else {
					this.dispatchOrderService.saveDispatchOrder({dispatchOrderId: item.doId, userId: user.id, totalAmount: loadAmount});
				}
			} 
			res.send(this.getSuccessResponse({ result: 'Updated Successfully'}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	private async dispatchAndSendNotification(load: any, driverId: any, userId:any, companyId?: number):Promise<any>{
		const changeStatusPayLoad = {
			dispatchOrder_Id: load.do_Id,
			relay_Id: load.relay_Id,
			status_Id: 2,
			userId,
			workOrder_Id: load.workOrder_Id,
		}
		await this.workOrderService.FLWOStatusChange(changeStatusPayLoad);

		if(load.driverNotificationType === 'email' && load.dispatchEmail){
			const emails = [load.dispatchEmail]
			if(load.driver1Email){
				emails.push(load.driver1Email)
			}
			 if(load.driver2Email){
				 emails.push(load.driver2Email)
			 }
			 if(load.owneropEmail){
				 emails.push(load.owneropEmail)
			 }
			 emails.push('pratheep@lirctek.com')
			const payload = {
				do_Id: load?.do_Id,
				fromEmail: load.dispatchEmail,
				message: 'Dear Customer, Please find the Attached Rate Confirmation Documents',
				relay_Id: load?.relay_Id ? load?.relay_Id : null,
				sendToOwnerOp:0,
				sendType: 'Email',
				subject:  `Load ${load.loadNumber} Dispatched`,
				toEmails: emails
			};
			let lineItems = [];
			const stops = [];
			let result = await this.dispatchOrderService.getDORateConPrintDetails(
				payload
			);

			result = result.data[0];
			result = result[0];
			if(payload.sendToOwnerOp && result.ownerop_Id > 0) {
				if(payload.relay_Id > 0) {
					const items = await this.ownerOpLineItemService.getOpLineItemsByRelayId(
						{ relay_Id:payload.relay_Id,ownerop_Id: result.ownerop_Id }
					);
					lineItems = items.data[0];
				} else {
					const items = await this.ownerOpLineItemService.getOpLineItemsByDOId(
						{do_Id:payload.do_Id,ownerop_Id: result.ownerop_Id }
					);
					lineItems = items.data[0];
				}
			}
			if(result.carrier_Id > 0) {
				if(payload.relay_Id > 0) {
					const items = await this.carrierLineItemService.getDOCarrierlineitemsByRelayId(
						{ relay_Id:payload.relay_Id,carrier_Id: result.carrier_Id }
					);
					lineItems = items.data[0];
				} else {
					const items = await this.carrierLineItemService.getDOCarrierlineitemsByDOId(
						{do_Id:payload.do_Id, carrier_Id: result.carrier_Id }
					);
					lineItems = items.data[0];
				}
			}

			if(payload.relay_Id > 0) {
				let items = await this.doStopsService.getDOStopsByRelayId(
					{ relay_Id:payload.relay_Id }
				);
				items = items.data[0];

				for (const stop of items) {
					stop.stopItems = (stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : []);
					stops.push(stop);
				}
			} else {
				let items = await this.doStopsService.getDOStopsByDOId(
					{do_Id:payload.do_Id }
				);
				items = items.data[0];
				for (const stop of items) {
					stop.stopItems = (stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : []);
					stops.push(stop);
				}
			}

			const flatfee = lineItems.find((item : any) =>  {
				return item.name === 'Flat/Line Haul';
			});

			if (flatfee && flatfee.amount > 0 && result.dispatchPCT > 0) {
				lineItems.push({
					amount: parseFloat((flatfee.amount * result.dispatchPCT/100).toFixed(2)),
					name: 'DispatchFee',
					per: result.dispatchPCT,
					units: null
				});
			}

			result.stops = stops;
			result.lineItems = lineItems;
			const pdfResponse = await this.pdfService.generatePdf(rateConHTML(result)) as any;
			const bodyBuffer = await pdfResponse.body();
			const emailRes = {} as any;
			emailRes.buffers = bodyBuffer;
			emailRes.body = payload.message;
			emailRes.emails = payload.toEmails;
			emailRes.fromEmail =payload.fromEmail;
			emailRes.subject = payload.subject;
			emailRes.fileName = 'Load Confirmation';
			this.emailService.emailservice(emailRes);
			this.activityLogService.addActivityLog({
				description: JSON.stringify(payload),
				module: 'DriverNotificationSent',
				module_Id: payload.do_Id?payload.do_Id:payload.relay_Id,
				userId });
		}
		else if (load.driverNotificationType === 'mobile'){
			const payload = {
				do_Id: load?.do_Id,
				driver_Id:`${driverId}`,
				relay_Id: load?.relay_Id ? load?.relay_Id : null
			};
			const result = await this.dispatchOrderService.getDeviceTokensInfo({
				...load,
				driver_Id: load?.driver1_Id
			});
			for (const item of result.data[0]) {
				let bodyR = {} as any;
				if(item.type === 'iOS') {
					bodyR = {
						deviceTokens: item.token,
						deviceType: item.type,
						payload:{
							'data': {
								'Driver_Id': `${driverId}`,
								'Role_Id': (item.role_Id ? `${item.role_Id}`: ''),
								'load_id': (load.do_Id ? `${load.do_Id}` : ''),
								'message': `New Load Dispatched-${load.loadNumber}`,
								'modification_type': '1',
								'notification_type': '1',
								'relay_id': (load.relay_Id ? load.relay_Id : ''),
								'settlement': '',
								'status': '2'
							},
							'notification':{
								'body': `New Load Dispatched-${load.loadNumber}`,
								'sound': 'default',
								'title': `Load ${load.loadNumber} Dispatched`
							}
						}
					}
				} else {
					bodyR = {
						deviceTokens: item.token,
						deviceType: item.type,
						payload:{
							'data': {
								'Driver_Id': `${driverId}`,
								'Role_Id': (item.role_Id ? `${item.role_Id}` : ''),
								'body': `New Load Dispatched-${load.loadNumber}`,
								'load_id': ` ${(load.do_Id ? `${load.do_Id }`: '')}`,
								'message': `New Load Dispatched-${load.loadNumber}`,
								'modification_type': '1',
								'notification_type': '1',
								'relay_id': (load.relay_Id ? `${load.relay_Id}` : ''),
								'settlement': null,
								'status': '2',
								'title': `Load ${load.loadNumber} Dispatched`
							}
						}
					}
				}

				const attributesR = {} as any;

				attributesR.do_Id = {
					DataType: 'Number',
					StringValue: `${payload.do_Id}`
				};

				if(payload.relay_Id > 0) {
					attributesR.relay_Id = {
						DataType: 'Number',
						StringValue: `${payload.relay_Id}`
					};
				}
				const response = await this.sendNotificationService.sendNotification({
					attributes: attributesR,
					body: JSON.stringify(bodyR),
					sendType: 'Mobile'});
				this.activityLogService.addActivityLog({
					description: JSON.stringify(payload),
					module: 'DriverNotificationSent',
					module_Id: payload.relay_Id ? payload.relay_Id : payload.do_Id,
					userId });

		}
		}
		else if (load.driverNotificationType === 'sms'){
			const payload = {
				companyId,
				do_Id: load?.do_Id,
				relay_Id: load?.relay_Id ? load?.relay_Id : null,
				sendType: 'SMS'
			};
			const result = await this.dispatchOrderService.getDetailsToSendSMS(payload);
			if (result.data[0] && result.data[0][0] && result.data[0][0].driver1Phone) {
				const message = smsHTML(result.data[0]);
				const phoneNumbers = [`+1${result.data[0][0].driver1Phone}`];

				if (result.data[0][0].driver2Phone) {
					phoneNumbers.push(`+1${result.data[0][0].driver2Phone}`)
				}

				const body = {
					// from: '',
					message,
					to:  phoneNumbers
				}
				const attributes = {} as any;

				attributes.do_Id = {
					DataType: 'Number',
					StringValue: `${payload.do_Id}`
				};

				if(payload.relay_Id) {
					attributes.relay_Id = { DataType: 'Number',
						StringValue: `${payload.relay_Id}`
					}
				}

				const response = await this.sendNotificationService.sendNotification({
					attributes,
					body: JSON.stringify(body),
					sendType: payload.sendType});
				this.activityLogService.addActivityLog({
					description: JSON.stringify(payload),
					module: 'DriverNotificationSent',
					module_Id: payload.relay_Id ? payload.relay_Id : payload.do_Id,
					userId });
				return true
			} else {
				return false
			}
		}
	}

	private async addDropStops(req: any): Promise<any> {
		const wostop = await this.woStopService.addStop(req);
		req.woStops_Id = wostop.data.insertId;
		if(req.dispatchOrder_Id) {
			const dostops = await this.doStopsService.addDOStop(req);
			const waypoint = {
				address_Id: req.address_Id,
				dispatchOrder_Id: req.dispatchOrder_Id,
				doStops_Id: dostops.data.insertId,
				orderNumber: req.stopNumber,
				pickupDate: req.fromDate,                
				stopType: req.stopType,
				userId: req.userId
				};
				
			const waypointResult = this.waypointService.addWaypoint(waypoint);
		}
		return wostop.data.insertId;
	}
}

const rateConHTML = (result: any) => {
	try {
		const logourl = result.logoUrl ? `https://lircteksams.s3.amazonaws.com/${result.logoUrl}` : '';
		let htmlString = '';
		htmlString += `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd"> <html lang="en" > <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta charset="UTF-8"> <title>Invoice</title> </head> <body style="color: #000 !important; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 1.42857143; background-color: #fff; margin: 20px;" bgcolor="#fff">
			<table width="100%" style="font-size:10px;"> <tr> <td style="padding-right:10px; font-size: 20px; font-weight: bold;font-family: Arial" align="center">${result.carrierId ? 'Carrier Load Confirmation -' : 'Load Confirmation -'}<span style="font-size: 20px;">${result.dispatchNumber}</span> </td> </tr> </table>
			<br><table style="width:100%;font-size:10px;font-family: Arial;"> <tr>${result.showOnlyLogo ? `<td colspan="1" style="padding-right: 0px;" width="50%" valign="top"> <img style="align:top;" src="${logourl}"> </td>` : `<td style="padding-right: 0px;" valign="top"> <img style="align:top;" src="${logourl}"> </td> <td style="padding-left: 0px;font-size:15px;text-align:left;" width="50%" valign="top"> <span > <b style="font-size:18px;">${result.companyName}</b></span><br>${result.address1}&nbsp;${result.address2 ? result.address2 : ''} <br>${result.city},${result.state}&nbsp;${result.zip}<br><b>Ph: </b>${result.companyPhone}&nbsp;&nbsp;&nbsp;<br><b>Fax: </b>${result.fax ? result.fax : ''}</td>`} <td align="left" width="25%" style="font-size: 15px;" valign="top"><b>Order #  : </b>${result.dispatchNumber}<br>${(result.tripNumber ? `<b>Trip #  : </b>${result.tripNumber}<br>` : '')}${result.miles ? `<b>Miles:  </b>${result.miles}` : ''}<br> ${result.stops.length > 0 ? `${result.stops[0].temperature ? `<b>Temp: </b><b>${result.stops[0].temperature}</b>` : ''}` : ''}`;
		if(!result.carrierId) {
			htmlString += `<br><b>Driver 1:</b>${result.driver1Name} ${result.driver2Name ? `<br><b>Driver 2:  </b>${result.driver2Name}` : ''}<br><b>Truck:  </b>${result.truck}<br>${result.trailer ? `<b>Trailer:  </b>${result.trailer}` : ''}`;
		}
		
		htmlString += '</td></tr></table>';
		if (result.carrierId) {
			htmlString += `<br> <table style="border-collapse: separate; border-spacing: 0; width: 100%; font-family: Arial;font-size: 15px;"> <tr> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;border-top-right-radius: 6px;" width="100%" colspan="3">Carrier Info</th> </tr> <tr> <td width="35%" style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;" valign="top"><b style="font-size: 15px;">${result.toName}</b> <br>${result.toAddress1} ${result.toAddress2 ? `${result.toAddress2}` : ''}<br> ${result.toCity}, ${result.toState} ${result.toZip}</td> <td width="25%" style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;font-size:15px;"> <b style="font-size: 12px">Contact: </b>${result.contactPerson ? result.contactPerson : ''}<br> <b style="font-size: 13px">Ph: </b>${result.toPhone ? result.toPhone : ''} <br> <b style="font-size: 12px">Fax: </b>${result.toFax? result.toFax : ''}<br> <b style="font-size: 12px">Email: </b>${result.toEmail ? result.toEmail : ''} </td> <td width="20%" style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;padding-top:0px;border-bottom-right-radius: 6px;" valign="top"> <b style="font-size: 12px">Driver : </b>${result.driverName ? result.driverName : ''} <br> <b style="font-size: 12px">Cell #: </b>${result.driverPhone? result.driverPhone : ''}<br> <b style="font-size: 12px">Truck: </b>${result.truckNum ? result.truckNum : ''}<br> <b style="font-size: 12px">Trailer: </b>${result.trailerNum ? result.trailerNum : ''} </td> </tr> </table>`;
		}

		htmlString += `${result.notes ? `<p style="font-size: 15px;"><b>Notes:&nbsp;${result.notes ? result.notes : ''} </b></p>` : ''}

		${stopsHTML(result.stops,result.isDate24HrFormat)} ${lineItemsHTML(result.lineItems)}`;

		if (result.carrierId) {

			htmlString += `<br><br><p style="font-size:11px;"><b>AUTHORIZED SIGNATURE:__________________________________   DATE:___________________
		<br>Please sign and fax back to ${result.fax}</b></p>`;
		};

		if (result.termsAndConditionsDO) {
			htmlString += `<p style="font-size: 13px;"><b style="font-size: 13px;">Terms & Conditions:</b><br>${result.termsAndConditionsDO}</p>`;
		} 
		htmlString += `</div></div><footer><p style="text-align: end;">Powered by: <a target="blank" style="vertical-align: sub;" href="https://www.awako.ai/"><img style="height: 19px;" src="https://app.awako.ai/images/logos/logo-2.png"></a></p></footer></body></html>`;

		return htmlString;
	} catch (e) {
		return 'Error occured while printing rate confirmation, please contact our customer support';
	}
};

const stopsHTML = (stops: any,isDate24HrFormat: any) => {
	let htmlString = '<br>';

	if (stops.length > 0) {
		htmlString += `<table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%;font-size:10px; ">`;
		htmlString += `<tr> <th style="font-size:12px;border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 2px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;border-top-right-radius: 6px;padding-top:2px;">Stops</b></p></th></tr>`;
		
		for (const stop of stops) {
			let typeText = `PU`;
			if(stop.stopType === 'Delivery') {
				typeText = 'CO';
			}
			
			if (stop !== (stops.length -1)) {
				htmlString += `<tr> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;"> <table style="width: 100%; max-width: 100%;font-size:10px;">`;
			} else {
				htmlString += `<tr> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;border-bottom-right-radius: 6px;"> <table style="width: 100%; max-width: 100%;font-size:10px;">`;
			}
			
			htmlString += `<tr> <td><b style="font-size: 12px;">${stop.stopNumber}. ${stop.facilityName}</b>  &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp; <b style="font-size:10px;text-transform: uppercase;">${stop.stopType}</b> <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="padding-top:5px;font-size: 10px">${stop.address1} ${stop.address2 ? stop.address2 : ''}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${stop.city}, ${stop.state} &nbsp; ${stop.zip}  </span> ${(stop.phone ? `<br><b>Ph: </b>${stop.phone}` : '')}</td><td style="width:45%; font-size: 11px;" valign="top"><b style="font-size: 12px;">${typeText} #: </b> ${(stop.poNumber ? stop.poNumber : '' )} ${( stop.appNumber ? `<br><b style="font-size: 12px;">Appt #: </b>${stop.appNumber}` : '')} <br><b style="font-size: 12px;">Date & Time: </b> ${moment(stop.fromDate).format('MM/DD/YYYY')}  ${((stop.toDate && (stop.toDate !== '0000-00-00 00:00:00')) ? `- ${moment(stop.toDate).format('MM/DD/YYYY')}` : '')}  ${((stop.fromTime && (stop.fromTime !== '0000-00-00 00:00:00')) ? `${(isDate24HrFormat ? moment(stop.fromTime).format('HH:mm') : moment(stop.fromTime).format('hh:mm a'))}` : '')}  ${((stop.toTime && (stop.toTime !== '0000-00-00 00:00:00')) ? `- ${(isDate24HrFormat ? moment(stop.toTime).format('HH:mm') : moment(stop.toTime).format('hh:mm a'))}` : '')}  ${(stop.shippingHours ? `<br><b>Shipping Hours: </b>${stop.shippingHours}` : '')}</td></tr>`;
			htmlString += `${stop.notes ? `<tr><td colspan="1"><br><b>Notes: </b> ${( stop.notes ? stop.notes : '')}</td></tr>` : ''}`;
			htmlString += `<tr> <td colspan="2"> <table width="100%" style="padding-top: 15px;padding-left: 10px;padding-right: 10px;padding-bottom: 10px;font-size:10px; border-spacing: 0;"> <tr> <td width="15%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>ItemNumber</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>PO#</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>CO#</b> </td> <td width="20%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Commodity</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Weight</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Pallets</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Count</b> </td> <td width="25%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;"> <b>Temp</b> </td> </tr>`;
			
			for (const item of stop.stopItems) {
				htmlString += `<tr><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.itemNumber ? item.itemNumber : '')} </td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.poNumber ? item.poNumber : '')} </td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.coNumber ? item.coNumber : '')} </td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.commodity ? item.commodity : '')} </td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.weight ? item.weight : '')}</td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.pallets ? item.pallets : '')}</td><td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(item.pieceCount ? item.pieceCount : '')}</td><td style="padding-left: 5px;">${(item.temperature ? item.temperature : '')}</tr>`;                
			}
			
			htmlString += `</table></td></tr>`;
			htmlString += `</table></td> </tr>`;
		}
		htmlString += `</table>`;
	}
  
	return htmlString;
};

const lineItemsHTML = (lineItems: any) => {
	let htmlString = '';
	let total = 0;

	if (lineItems.length > 0) {
		htmlString += `<br><table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%; font-size:15px;"> <tr> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;" width="55%">Description</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Units</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left; " width="15%">Per</th> <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; background: #eee; border-top: 1px solid #bbb; text-align: left;border-top-right-radius: 6px;">Amount</th> </tr>`;
		for (const item of lineItems) {
		htmlString += `<tr style="font-size: 15px"><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;">${item.name}</td> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${(item.units ? item.units : '')}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${item.per + (item.name==='DispatchFee' ? '%' : '')}</td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;" align="right">${(item.name==='DispatchFee' ? '-' : '')} $ ${(item.amount ? item.amount : 0).toFixed(2)}</td> </tr>`;
			if (item.name === 'DispatchFee') {
				total -= item.amount;
			} else {
				total += item.amount;
			}
		}
		htmlString += `<tr><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;" colspan="3" align="right" ><b style="font-size: 15px;">TOTAL</b></td><td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;" align="right"><b style="font-size: 15px;">$ ${(total ? total : 0).toFixed(2)}</b></td> </tr></table>`;
	}
	return htmlString;
};

const smsHTML = (result: any) => {
	let htmlString = `Trip# ${result[0].dispatchNumber}\n Truck #:${result[0].truck}\nTrailer #:${result[0].trailer ? result[0].trailer : ''}`;
	
	for (const stop of result) {
		htmlString += `\nStop${stop.stopNumber} : ${stop.stopType}\nPO#:${stop.poNumber?stop.poNumber : ''}\nD&T:${stop.fromDate}${(stop.fromTime ? ` ${stop.fromTime}` : '')}${(stop.toDate ? `- ${stop.toDate}` : '')}${(stop.toTime ? ` ${stop.toTime}` : '')}\n${stop.contactName} \n ${stop.address1} ${(stop.address2 ? stop.address2 : '')} ${stop.city} ${stop.state} ${stop.zip}\n${(stop.weight ? `Weight:${stop.weight}` :'')}${(stop.pieceCount ? `Piece Ct:${stop.pieceCount}` : '')}${(stop.pallets ? `Pallets:${stop.pallets}` : '')}${(stop.commodity ? `Commodity:${stop.commodity}` : '')}${(stop.trailerTemparature ? `Temp:${stop.trailerTemparature}` : '')}	${(stop.notes ? `Notes:${stop.notes}` : '')}`;
	}
	
	return htmlString;
}

const exportHTMLLatePickReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Late Pickup Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>dispatchNumber</td><td>relayNumber</td><td>customer </td><td>truckNumber </td><td>driverName</td><td>fromDate</td><td>fromTime</td><td>checkInTime</td><td>delayReason</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.dispatchNumber}</td><td>${item.relayNumber ? item.relayNumber : ''}</td><td>${item.customer?item.customer:null}</td><td>${item.truckNumber}</td><td>${item.driverName}</td><td>${item.fromDate ? item.fromDate : ''}</td><td>${item.fromTime ? item.fromTime : ''}</td><td>${item.checkInTime ? item.checkInTime : ''}</td><td>${item.delayReason ? item.delayReason : ''}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};

const exportHTMLLateDelReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `LAte Delivery Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>dispatchNumber</td><td>relayNumber</td><td>customer </td><td>truckNumber </td><td>driverName</td><td>fromDate</td><td>fromTime</td><td>checkInTime</td><td>delayReason</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.dispatchNumber}</td><td>${item.relayNumber ? item.relayNumber : ''}</td><td>${item.customer?item.customer:null}</td><td>${item.truckNumber}</td><td>${item.driverName}</td><td>${item.fromDate ? item.fromDate : ''}</td><td>${item.fromTime ? item.fromTime : ''}</td><td>${item.checkInTime ? item.checkInTime : ''}</td><td>${item.delayReason ? item.delayReason : ''}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};
