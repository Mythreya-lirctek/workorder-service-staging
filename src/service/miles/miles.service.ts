import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';
import axios, { AxiosInstance } from 'axios';
import DispatchOrderService from '../dispatchorder/dispatchorder.service';
import RelayService from '../relay/relay.service';
import DriverLineItemService from '../driverlineitem/driverlineitem.service';
import WayPointService from '../waypoint/waypoint.service';
import DOStopService from '../dostop/dostop.service';
import _ from 'lodash';

export default class MilesService {
	private database: Database;
	private databaseget: Database;
	private client: AxiosInstance;
	private dispatchOrderService: DispatchOrderService
	private driverLineItemService: DriverLineItemService;
	private wayPointService: WayPointService;
	private relayService: RelayService;
	private doStopService: DOStopService;
	constructor() {
		this.database = new Database();
		this.databaseget = new Database(true);
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
		this.dispatchOrderService = new DispatchOrderService();
		this.driverLineItemService = new DriverLineItemService();
		this.wayPointService = new WayPointService();
		this.relayService = new RelayService();
		this.doStopService = new DOStopService();
	}

	public async getDOInfoForMiles(dispatchOrderId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			SELECT
				do.Id as id,
				do.Company_Id as companyId,
				sa.Zip as startZip,
				sa.Latitude as startLatitude,
				sa.Longitude as startLongitude,
				ea.Zip as endZip,
                ea.Latitude as endLatitude,
                ea.Longitude as endLongitude,
				count(r.Id) as relays,
				do.Company_Id as companyId,
				do.Carrier_Id as carrierId,
				co.RunMiles as runMiles,
				co.IFTARouteMethod  as iftaRouteMethod
			FROM
				dispatchorder do 
				LEFT JOIN address sa on sa.Id = do.StartingLocation_Id 
				LEFT JOIN address ea on ea.Id = do.EndingLocation_Id 
				LEFT JOIN relay r on r.DispatchOrder_Id = do.Id and r.isdeleted = 0
				LEFT JOIN company co On co.Id = do.Company_Id 
			WHERE 
				do.Id = ${dispatchOrderId}
		`);
	}

	public async getEquipmentStopsByOrderId(orderId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL getEquipmentStopsByDOId(${orderId}, null);
		`);
	}

	public async getStopsZipsByOrderId(orderId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL getStopsZipByDOId(${orderId});
		`);
	}

	public async getRelayStopsByOrderRelayId(relayId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL getRelayStopsZipByRelayId(${relayId});
		`);
	}

	public async calculateDOMiles(req:any, userId: number): Promise<any> {
		const result: any = {};
		let dOResponse = {} as any;
		try {
			dOResponse = req.relay_Id ? await this.getRelayDetailsByOrderId(req.dispatchOrderId,req.relay_Id) 
										: await this.getDOInfoForMiles(req.dispatchOrderId);
			
			const dispatchOrder = dOResponse.data[0];
			dispatchOrder.dispatchOrderId = req.dispatchOrderId;
			dispatchOrder.relay_Id = req.relay_Id;
			dispatchOrder.isFullTrip = req.isFullTrip;
			dispatchOrder.userId = userId;
			if (dispatchOrder.runMiles && !dispatchOrder.carrierId) {
				const resultt = await this.getAddressesList(dispatchOrder);
				const runTrip = await this.getRunTrip(resultt);
				if(runTrip.message) {
					return runTrip;
				} else {
					this.updatelineitems((req.relay_Id ? req.relay_Id : req.dispatchOrderId),runTrip[0],(req.relay_Id ? 1 : 0),userId,req.dispatchOrderId);
					return runTrip
				}
			} else {
				return {message:'Your account is not subscribed to run the miles.'};
			}
		} catch (error) {
			return result.error = error;
		}
	}	
	
	public async getAddressesList(req: any): Promise<any> {
		const result = {} as any;
		if(req.relay_Id > 0) {
			const waypointsResponse = await this.wayPointService.getWaypointsbyDOIdRelayId({do_Id: req.dispatchOrderId, relay_Id: req.relay_Id});
			const waypoints = waypointsResponse.data[0];
			
			const equipmentStops = [] as any;
			if (waypoints.length > 0) {
				try {
					let sameStart = true;
					let	sameEnd = true;
					let	stopsCnt = 0;
					let	priorEqStopsCt = 0;
					let	laterEqStopsCt = 0;
					req.dispatchOrderLocations=[] as any
					req.wayPoints=waypoints;
					if (req.startZip) {
						req.dispatchOrderLocations.push({
							latitude:req.startLatitude,
							longitude:req.startLongitude,
							zip:req.startZip
						})
						sameStart = false;
					}

					for (let i = 0; i < equipmentStops.length; i++) {
						if (equipmentStops[i].isPriorStops === 1)
						{
							if (req.dispatchOrderLocations[req.dispatchOrderLocations.length - 1].zip !== equipmentStops[i].zip) {
								req.dispatchOrderLocations.push({
									latitude:equipmentStops[i].latitude,
									longitude:equipmentStops[i].longitude,
									zip:equipmentStops[i].zip
								})
								priorEqStopsCt += 1;
							}
						}
					}

					for (let i = 0; i < waypoints.length; i++) {
						if (i === 0) {
							req.dispatchOrderLocations.push({
								latitude:waypoints[i].latitude,
								longitude:waypoints[i].longitude,
								zip:waypoints[i].zip
							})
							stopsCnt += 1;
						}
						else {
							if (waypoints[i].Zip !== waypoints[i-1].zip) {
								req.dispatchOrderLocations.push({
									latitude:waypoints[i].latitude,
									longitude:waypoints[i].longitude,
									zip:waypoints[i].zip
								})
								stopsCnt += 1;
							}
						}
					}

					for (let i = 0; i < equipmentStops.length; i++) {
						if (equipmentStops[i].isPriorStops === 0)
						{
							if (req.dispatchOrderLocations[req.dispatchOrderLocations.length - 1].zip !== equipmentStops[i].zip) {
								req.dispatchOrderLocations.push({
									latitude:equipmentStops[i].latitude,
									longitude:equipmentStops[i].longitude,
									zip:equipmentStops[i].zip
								})
								laterEqStopsCt += 1;
							}
						}
					}

					if (req.endZip) {
						req.dispatchOrderLocations.push({
							latitude:req.endLatitude,
							longitude:req.endLongitude,
							zip:req.endZip
						})
						sameEnd = false;
					}
		
					result.dOrder = req;
					result.dOrder.sameStart = sameStart;
					result.dOrder.sameEnd = sameEnd;
					result.dOrder.stopsCount = stopsCnt;
					result.dOrder.priorEqStopsCt = priorEqStopsCt;
					result.dOrder.laterEqStopsCt = laterEqStopsCt;
					return result;
				} catch (e) {
					return null;
				}
			} else {
				return null;
			}
		} else if(req.isFullTrip) {			
			const waypointsResponse = await this.wayPointService.getWaypointsbyDOIdRelayId({do_Id: req.dispatchOrderId, relay_Id: null});
			const waypoints = waypointsResponse.data[0];
			const equipmentStopsResponse = await this.getEquipmentStopsByOrderId(req.dispatchOrderId);
			const equipmentStops = equipmentStopsResponse.data[0];
			if (waypoints.length > 0) {
				try {
					let sameStart = true;
					let	sameEnd = true;
					let	stopsCnt = 0;
					let	priorEqStopsCt = 0;
					let	laterEqStopsCt = 0;
					req.wayPoints=waypoints;
					req.dispatchOrderLocations=[] as any
					req.wayPoints=waypoints;
					if (req.startZip) {
						req.dispatchOrderLocations.push({
							latitude:req.startLatitude,
							longitude:req.startLongitude,
							zip:req.startZip
						})
						sameStart = false;
					}

					for (let i = 0; i < equipmentStops.length; i++) {
						if (equipmentStops[i].isPriorStops === 1)
						{
							if (req.dispatchOrderLocations[req.dispatchOrderLocations.length - 1].zip !== equipmentStops[i].zip) {
								req.dispatchOrderLocations.push({
									latitude:equipmentStops[i].latitude,
									longitude:equipmentStops[i].longitude,
									zip:equipmentStops[i].zip
								})
								priorEqStopsCt += 1;
							}
						}
					}

					for (let i = 0; i < waypoints.length; i++) {
						if (i === 0) {
							req.dispatchOrderLocations.push({
								latitude:waypoints[i].latitude,
								longitude:waypoints[i].longitude,
								zip:waypoints[i].zip
							})
							stopsCnt += 1;
						}
						else {
							if (waypoints[i].zip !== waypoints[i-1].zip) {
								req.dispatchOrderLocations.push({
									latitude:waypoints[i].latitude,
									longitude:waypoints[i].longitude,
									zip:waypoints[i].zip
								})
								stopsCnt += 1;
							}
						}
					}

					for (let i = 0; i < equipmentStops.length; i++) {
						if (equipmentStops[i].isPriorStops === 0)
						{
							if (req.dispatchOrderLocations[req.dispatchOrderLocations.length - 1].zip !== equipmentStops[i].zip) {
								req.dispatchOrderLocations.push({
									latitude:equipmentStops[i].latitude,
									longitude:equipmentStops[i].longitude,
									zip:equipmentStops[i].zip
								})
								laterEqStopsCt += 1;
							}
						}
					}

					if (req.endZip) {
						req.dispatchOrderLocations.push({
							latitude:req.endLatitude,
							longitude:req.endLongitude,
							zip:req.endZip
						})
						sameEnd = false;
					}
					result.dOrder = req;
					result.dOrder.sameStart = sameStart;
					result.dOrder.sameEnd = sameEnd;
					result.dOrder.stopsCount = stopsCnt;
					result.dOrder.priorEqStopsCt = priorEqStopsCt;
					result.dOrder.laterEqStopsCt = laterEqStopsCt;
					if(req.relays > 0) {
						const relays = await this.getRelaysByOrderIdForMiles(req.dispatchOrderId, req.relays);
						result.relays = relays;
					}	
					
					
					return result;
				} catch (e) {
					return null;
				}
			} else {
				return null;
			}				
		} else {
			const waypointsResponse = await this.wayPointService.getWaypointsbyDOIdRelayId({do_Id: req.dispatchOrderId, relay_Id: null});
			const waypoints = waypointsResponse.data[0];
			const equipmentStopsResponse = await this.getEquipmentStopsByOrderId(req.dispatchOrderId);
			const equipmentStops = equipmentStopsResponse.data[0];
			if (waypoints.length > 0) {
				try {
					let sameStart = true;
					let	sameEnd = true;
					let	stopsCnt = 0;
					let	priorEqStopsCt = 0;
					let	laterEqStopsCt = 0;
					req.dispatchOrderLocations = [] as any;
					req.wayPoints=waypoints;
					if (req.startZip) {
						req.dispatchOrderLocations.push({
							latitude:req.startLatitude,
							longitude:req.startLongitude,
							zip:req.startZip
						})
						sameStart = false;
					}

					for (let i = 0; i < equipmentStops.length; i++) {
						if (equipmentStops[i].isPriorStops === 1)
						{
							if (req.dispatchOrderLocations[req.dispatchOrderLocations.length - 1].zip !== equipmentStops[i].zip) {
								req.dispatchOrderLocations.push({
									latitude:equipmentStops[i].latitude,
									longitude:equipmentStops[i].longitude,
									zip:equipmentStops[i].zip
								})
								priorEqStopsCt += 1;
							}
						}
					}

					for (let i = 0; i < waypoints.length; i++) {
						if (i === 0) {
							req.dispatchOrderLocations.push({
								latitude:waypoints[i].latitude,
								longitude:waypoints[i].longitude,
								zip:waypoints[i].zip
							})
							stopsCnt += 1;
						}
						else {
							if (waypoints[i].zip !== waypoints[i-1].zip) {
								req.dispatchOrderLocations.push({
									latitude:waypoints[i].latitude,
									longitude:waypoints[i].longitude,
									zip:waypoints[i].zip
								})
								stopsCnt += 1;
							}
						}
					}

					for (let i = 0; i < equipmentStops.length; i++) {
						if (equipmentStops[i].isPriorStops === 0)
						{
							if (req.dispatchOrderLocations[req.dispatchOrderLocations.length - 1].zip !== equipmentStops[i].zip) {
								req.dispatchOrderLocations.push({
									latitude:equipmentStops[i].latitude,
									longitude:equipmentStops[i].longitude,
									zip:equipmentStops[i].zip
								})
								laterEqStopsCt += 1;
							}
						}
					}

					if (req.endZip) {
						req.dispatchOrderLocations.push({
							latitude:req.endLatitude,
							longitude:req.endLongitude,
							zip:req.endZip
						})
						sameEnd = false;
					}
					result.dOrder = req;
					result.dOrder.sameStart = sameStart;
					result.dOrder.sameEnd = sameEnd;
					result.dOrder.stopsCount = stopsCnt;
					result.dOrder.priorEqStopsCt = priorEqStopsCt;
					result.dOrder.laterEqStopsCt = laterEqStopsCt;
					return result;
				} catch (e) {
					return null;
				}
			} else {
				return null;
			}
		}
	}

	public async getRelayDetailsByOrderId(dispatchOrderId: number, relayId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			SELECT 
				r.id,
				sa.Zip as startZip,
				sa.Latitude as startLatitude,
				sa.Longitude as startLongitude,
				ea.Zip as endZip,
                ea.Latitude as endLatitude,
                ea.Longitude as endLongitude,
				r.Carrier_Id as carrierId,				
				do.Company_Id as companyId,
				co.RunMiles as runMiles,
				co.IFTARouteMethod  as iftaRouteMethod
			FROM 
				relay r 
				LEFT JOIN address sa on sa.Id = r.StartingLoc_Id 
				LEFT JOIN address ea on ea.Id = r.EndingLoc_Id
				left join dispatchorder do on do.Id = r.dispatchorder_Id
				left join company co on co.Id = do.company_Id
			WHERE 
				r.IsDeleted = 0 and r.DispatchOrder_Id = ${dispatchOrderId} ${relayId ? ` and r.Id = ${relayId}` : ''}
		`);
	}
	
	public async getRelaysByOrderIdForMiles(dispatchOrderId: number, relays: any): Promise<any> {
		if (relays) {
			const result = [] as any;
			const doRelaysResponse = await this.getRelayDetailsByOrderId(dispatchOrderId,null);
			const doRelays = doRelaysResponse.data[0];
			for (let i = 0; i < doRelays.length; i++) {
				const relay = doRelays[i];
				result.push(await this.getRelayStopZips(dispatchOrderId, relay));
			}
			return doRelays;
		}
		return [];
	}

	public async getRelayStopZips(dispatchOrderId: number, relay: any): Promise<any> {
		const relayZips = [];
		let sameRelayStart = true;
		let sameRelayEnd = true;
		let stopsRelayCnt = 0;
		const relayStopResponse = await this.wayPointService.getWaypointsbyDOIdRelayId({do_Id: dispatchOrderId, relay_Id: null});
		
		const relayStop = relayStopResponse.data[0];
		
		if (relay.startZip && relay.startZip !== relayStop.zip) {
			relayZips.push(relay.startZip);
			sameRelayStart = false;
		}

		for (let j = 0; j < relayStop.length; j++) {
			if (j === 0) {
				relayZips.push(relayStop[j].zip);
				stopsRelayCnt += 1;
			}
			else {
				if (relayStop[j].zip !== relayStop[j-1].zip) {
					relayZips.push(relayStop[j].zip);
					stopsRelayCnt += 1;
				}
			}
		}

		if (relay.endZip) {
			relayZips.push(relay.endZip);
			sameRelayEnd = false;
		}

		relay.zips = relayZips;
		relay.sameStart = sameRelayStart;
		relay.sameEnd = sameRelayEnd;
		relay.stopsCount = relayStop.length;
		return relay;
	}
	
	public async getRunTrip(req: any): Promise<any> {
		
		const tripLegs = [] as any;
		let addressstr = '';
		const locations = req.dOrder.dispatchOrderLocations;
		for (let i = 0; i < locations.length; i++) {
			tripLegs.push({
				Address: '',
				FlatRate: 0,
				Latitude: locations[i].latitude ? locations[i].latitude:0,
				LocationText: (locations[i].latitude && locations[i].longitude ? '' : locations[i].zip),
				Longitude: locations[i].longitude ? locations[i].longitude:0,
				PerMileRate: 0,
				Type: 'PROMILES'				
				
			});
			
			if((locations.length -1) === i) {
				addressstr += locations[i].zip;
			}
			else {
				addressstr += `${locations[i].zip},`;
			}
		}

		const payload = {
			'AllowRelaxRestrictions': false,
			'AvoidTollRoads': false,
			'BorderOpen': true,
			'FuelOptimizationParameters': {
				'DesiredEndGallons': 25,
				'DistanceOOR': 4,
				'MinimumGallonsToPurchase': 50,
				'MinimumTankGallonsDesired': 20,
				'StartGallons': 150,
				'UnitMPG': 5,
				'UnitTankCapacity': 180,
				'UseAllStopsNetwork': true
			},
			'GetDrivingDirections': true,
			'GetFuelOptimization': true,
			'GetMapPoints': true,
			'GetStateMileage': true,
			'GetTripSummary': true,
			'GetTruckStopsOnRoute': true,
			'IsHazmat': false,
			'RoutingMethod': 0,
			'TripLegs': tripLegs,
			'UnitMPG': 6,
			'VehicleType': 7
		}
		try {
			const runtrip = await this.client.post('/integrations/api/promiles/runtrip', payload);
			// zero means success else handle the  error
			if(runtrip.data.data.ResponseStatus && runtrip.data.data.ResponseStatus !== 0){
				const status = runtrip.data.data.ResponseStatus;
				const message = {proMilesCode:status,error:runtrip.data.data.ResponseMessage}
				throw  message
			}
			let index = 1;
			let dHMilesBefore= 0;
			let loadedMiles =0;
			let dHMilesAfter = 0;
			const load = req.dOrder;
			const legs = runtrip.data.data.TripSummary;
			let upToFirstStopMiles =  0;
			let upToFirstStopMinutes =  0;
			let dHMilesHours= 0;
			if (load.startZip) {
				try
				{
					dHMilesBefore += parseFloat(legs[index].LegMiles);
					upToFirstStopMiles += dHMilesBefore;
					dHMilesHours += (legs[index].LegMinutes ? legs[index].LegMinutes :0)
					upToFirstStopMinutes += dHMilesHours;

				}
				catch(err)
				{
					dHMilesBefore += 0; 
				}
				index += 1;
			}

			if (load.priorEqStopsCt > 0) {
				for (let i = 0; i < (load.priorEqStopsCt - 1); i++) {
					const miles = parseFloat(legs[index].LegMiles);
					loadedMiles += miles;
					upToFirstStopMiles +=  miles;
					index += 1;
				}
			}
			if(load.wayPoints&&load.wayPoints.length>0){
				await this.updateMilesToWayPoints(load.wayPoints[0],upToFirstStopMiles,upToFirstStopMinutes,load.userId);
			}
			if (load.stopsCount > 0) {
				for (let i = 0; i < (load.stopsCount - 1); i++) {
					try{
						const  miles =  (legs[index].LegMiles ? parseFloat(legs[index].LegMiles) : 0);
						const  hours =  (legs[index].LegMinutes ? legs[index].LegMinutes : 0);
						loadedMiles += miles;
						if(load.wayPoints&&load.wayPoints.length>i+1){
							await this.updateMilesToWayPoints(load.wayPoints[i+1],miles,hours,load.userId);
						}
					}
					catch(err)
					{
						loadedMiles += 0;
					}
					index += 1;
				}
			}

			if (load.laterEqStopsCt > 0) {
				for (let i = 0; i < (load.laterEqStopsCt - 1); i++) {
					loadedMiles += parseFloat(legs[index].LegMiles);
					index += 1;
				}
			}

			if (load.endZip) {
				try
				{
					dHMilesAfter += parseFloat(legs[index].LegMiles);
				}
				catch(err)
				{
					dHMilesAfter += 0; 
				}
				index += 1;
			}

			if (req.dOrder.relay_Id > 0) {
				this.relayService.saveRelay({				
					deadHeadedAfter: dHMilesAfter,
					deadHeadedBefore: dHMilesBefore,
					isMilesRan: 1,	
					loadedMiles,				
					relayId: req.dOrder.relay_Id,
					tripMinutes:runtrip.data.data.TripMinutes ? runtrip.data.data.TripMinutes : 0,
					userId: req.dOrder.userId
				});
			} else {
				this.dispatchOrderService.saveDispatchOrder({				
					deadHeadedAfter: dHMilesAfter,
					deadHeadedBefore: dHMilesBefore,
					dispatchOrderId: req.dOrder.dispatchOrderId,
					isMilesRan: 1,	
					loadedMiles,
					tripMinutes:runtrip.data.data.TripMinutes ? runtrip.data.data.TripMinutes : 0,
					userId: req.dOrder.userId				
				});
			}
			const taxSummaryDelete = await this.database.query(`call deletetaxandstatetaxsummary(${req.dOrder.relay_Id >0 ? req.dOrder.relay_Id : req.dOrder.dispatchOrderId}, '${req.dOrder.relay_Id >0 ? 'Relay' : 'DispatchOrder'}')`) as any;
			const taxSummary = await this.database.query(`INSERT INTO taxsummary(TotalMiles, DispatchOrder_Id, Relay_Id, createdAt, createdUserId, Addresses) 
			values(${runtrip.data.data.TripDistance}, ${req.dOrder.dispatchOrderId} , ${req.dOrder.relay_Id},UTC_TIMESTAMP,${req.dOrder.userId},'${addressstr}')`) as any;
			const stateTaxSummary = runtrip.data.data.JurisdictionMileage;
			
			const grouped = _.groupBy(stateTaxSummary, 'State') as any;
			
			for (const item in grouped) {
				if (grouped[item].length > 0) {
					const stateMiles = grouped[item];
					let miles =0;
					for (let i =0; i < stateMiles.length; i++) {
						miles += stateMiles[i].TotalMiles;
					}
					this.database.query(`INSERT INTO statetaxsummary(StateAbbreviation,TotalMiles,TaxSummary_Id,createdAt, createdUserId)
					values('${item}',${miles},${taxSummary.data.insertId},UTC_TIMESTAMP,${req.dOrder.userId})`);
				}
			}
			
			try {
				const replacer = new RegExp("'", 'g')
				const routeDirections = JSON.stringify(runtrip.data.data.DrivingDirections).replace(replacer,'');
				const route = this.database.query(`INSERT INTO route(Directions, DispatchOrder_Id, Relay_Id, createdAt, createdUserId, MapPoints) 
				values('${routeDirections}', ${req.dOrder.dispatchOrderId} , ${req.dOrder.relay_Id},UTC_TIMESTAMP,${req.dOrder.userId},'${JSON.stringify(runtrip.data.data.MapPoints)}')`) as any;
				return [{
					deadHeadedAfter: dHMilesAfter,
					deadHeadedBefore: dHMilesBefore,
					dispatchOrderId: req.dOrder.dispatchOrderId,
					loadedMiles,
					relay_Id: req.dOrder.relay_Id
				}];
			} catch (e) {
				return {'message': 'Unable to run Miles.'};
			}
		} catch (e) {
			if (req.dOrder.relay_Id > 0) {
				this.relayService.saveRelay({				
					isMilesRan: 0,			
					promilesErr: typeof  e ==='object' ? JSON.stringify(e) : e.toString(),
					relayId: req.dOrder.relay_Id,
					userId: req.dOrder.userId
				});
			} else {
				this.dispatchOrderService.saveDispatchOrder({	
					dispatchOrderId: req.dOrder.dispatchOrderId,
					isMilesRan: 0,
					promilesErr:  typeof  e ==='object' ? JSON.stringify(e) : e.toString(),
					userId: req.dOrder.userId				
				});
			}
			if(e.proMilesCode){
				// 2 BAD_TRIP_LOCATION	 //5 ENGINE_ERROR Mostly due location
				if(e.proMilesCode===2 || e.proMilesCode===5){
					return {'message': `Please check provided location information is valid in order to  calculate miles  ${e.error}`,
						proMilesCode:e.proMilesCode
					};
				}
				else {
					return {'message': `Unable to run Miles ${e.error}.`,proMilesCode:e.proMilesCode};
				}
			}
			return {'message': 'Unable to run Miles.'};

		}
	}

	public async updateMilesToWayPoints(wayPoint:any,miles:any,legMinutes:any,userId:any):Promise<any>{
		try {
			await this.wayPointService.savewaypoint({
				legMinutes,
				miles,
				userId,
				waypointId:wayPoint.id,
			});
		}
		catch (e) {
			return null
		}

	}
	
	public async updatelineitems(id: any, miles: any, isRelay: any, userId: any,dispatchOrderId: number): Promise<any> {
		try {
			let lineitems = [] as any;
			if (isRelay === 0) {
				lineitems = await this.databaseget.query(`SELECT dl.*, do.Driver1_Id, do.Driver2_Id, do.Driver1Rate, do.Driver2Rate, 
				c.SplitDriverMiles,d.Name DescriptionName, d1.EmptyMilesRate D1EmptyRate, d2.EmptyMilesRate D2EmptyRate,
				d1.LoadedMilesRate D1LoadedRate, d2.LoadedMilesRate D2LoadedRate, do.Driver1Settlement_Id, do.Driver2Settlement_Id 
				FROM dispatchorder do LEFT JOIN driverlineitems dl ON dl.DispatchOrder_Id = do.Id and dl.Relay_Id IS NULL and dl.isdeleted = 0
				LEFT JOIN description d ON d.Id = dl.Description_Id LEFT JOIN company c ON c.Id = do.Company_Id 
				LEFT JOIN driver d1 on d1.Id = do.Driver1_Id LEFT JOIN driver d2 on d2.Id = do.Driver2_Id WHERE do.Id = ${id}`);
				
				lineitems = lineitems.data as any;
				if (lineitems.length > 0 && !lineitems[0].Driver1Settlement_Id) {
					const driver1LIItems = _.find(lineitems, (item: any) => {
						return item.DescriptionName === 'Flat Amount' && item.Driver1_Id === item.Driver_Id;
					});
					
					if (driver1LIItems === undefined) {
					
						const driver1LI = _.find(lineitems, (item: any) => { 
											return item.Driver_Id === item.Driver1_Id && (item.DescriptionName === 'Per Mile Amount' || item.DescriptionName === 'Loaded Miles Amount');
										});
						
						const updateDO = {} as any;

						if (driver1LI !== undefined) {
							let emptyMiles = 0;
							if (lineitems[0].D1EmptyRate > 0) {
								updateDO.quantity = miles.loadedMiles;
								emptyMiles = miles.deadHeadedAfter + miles.deadHeadedBefore;
							} else {                         
								updateDO.quantity = miles.loadedMiles + miles.deadHeadedAfter + miles.deadHeadedBefore;
							}
						
							if (driver1LI.Driver2_Id && driver1LI.SplitDriverMiles) {
								updateDO.quantity = Number((updateDO.quantity / 2).toFixed(2));
								emptyMiles = Number((emptyMiles /2 ).toFixed(2));
							}

							updateDO.ratePer = driver1LI.Driver1Rate;
							updateDO.amount = (updateDO.quantity * driver1LI.Driver1Rate);

							if(driver1LI.D1LoadedRate > 0) {
								updateDO.ratePer = driver1LI.D1LoadedRate;
								updateDO.amount = (updateDO.quantity * driver1LI.D1LoadedRate);
							}

							updateDO.lineItemId = driver1LI.Id;
							updateDO.userId = userId;
							this.driverLineItemService.saveDriverLineItem(updateDO);
							
							if(lineitems[0].D1EmptyRate > 0) {
							
								const driver1LIEmpty = _.find(lineitems, (item: any) => { 
												return item.Driver_Id === item.Driver1_Id && item.DescriptionName === 'Empty Miles Amount';
											});
								if (driver1LIEmpty !== undefined) {
									const emptymilesUpdate = {} as any;

									emptymilesUpdate.quantity = emptyMiles;
									emptymilesUpdate.ratePer = lineitems[0].D1EmptyRate;
									emptymilesUpdate.amount = (emptyMiles * lineitems[0].D1EmptyRate);

									emptymilesUpdate.lineItemId = driver1LIEmpty.Id;
									emptymilesUpdate.userId = userId;
									this.driverLineItemService.saveDriverLineItem(emptymilesUpdate);
									
								} else {
									let insertString = `INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES`; 
									
									insertString += `(${lineitems[0].Driver1_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D1EmptyRate},${(emptyMiles * lineitems[0].D1EmptyRate).toFixed(2)},${id} ,null,UTC_TIMESTAMP,${userId})`;
									
									insertString += ';\n';
									this.database.query(insertString);
								}
							}
							
						} else {
							let insertString = 'INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES'; 
							let quantity = 0;
							let emptyMiles = 0;
							
							if (lineitems[0].D1EmptyRate > 0) {
								quantity = (miles.loadedMiles).toFixed(2);
								emptyMiles = ( miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}
							else {
								quantity = (miles.loadedMiles + miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}

							if (lineitems[0].Driver2_Id && lineitems[0].SplitDriverMiles) {
								quantity = Number((quantity / 2).toFixed(2));
								emptyMiles = Number((emptyMiles /2).toFixed(2));
							}

							let ratePer = lineitems[0].Driver1Rate;
							let amount = (quantity * lineitems[0].Driver1Rate).toFixed(2);

							if(lineitems[0].D1LoadedRate > 0) {
								ratePer = lineitems[0].D1LoadedRate;
								amount = (quantity * ratePer).toFixed(2);
							}

							insertString += `(${lineitems[0].Driver1_Id},${(lineitems[0].D1EmptyRate > 0 ? "(select Id from description where name = 'Loaded Miles Amount')" : '6')},${quantity},${ratePer},${amount},${id},null,UTC_TIMESTAMP,${userId})`;
											
							if(lineitems[0].D1EmptyRate > 0) {
							
								const driver1LIEmpty = _.find(lineitems, (item: any) => { 
												return item.Driver_Id === item.Driver1_Id && item.DescriptionName === 'Empty Miles Amount';
											});
								if (driver1LIEmpty !== undefined) {
									const emptymilesUpdate = {} as any;

									emptymilesUpdate.quantity = emptyMiles;
									emptymilesUpdate.ratePer = lineitems[0].D1EmptyRate;
									emptymilesUpdate.amount = (emptyMiles * lineitems[0].D1EmptyRate);

									emptymilesUpdate.lineItemId = driver1LIEmpty.Id;
									emptymilesUpdate.userId = userId;
									this.driverLineItemService.saveDriverLineItem(emptymilesUpdate);
									
								} else {
									let dinsertString = `INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES`; 
									
									dinsertString += `(${lineitems[0].Driver1_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D1EmptyRate},${(emptyMiles * lineitems[0].D1EmptyRate).toFixed(2)},${id} ,null,UTC_TIMESTAMP,${userId})`;
									
									dinsertString += ';\n';
									this.database.query(dinsertString);
								}
							} else {
								insertString += `,(${lineitems[0].Driver1_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D1EmptyRate},${(emptyMiles * lineitems[0].D1EmptyRate).toFixed(2)},${id},null,UTC_TIMESTAMP,${userId})`;
							}
							
							insertString += ';\n';
							
							this.database.query(insertString);
						}
					}
				}
				
				if (lineitems.length > 0 && !lineitems[0].Driver2Settlement_Id) {
					const driver2LIItems = _.find(lineitems, (item: any) => { 
						return item.DescriptionName === 'Flat Amount' && item.Driver2_Id === item.Driver_Id;
					});
					if (driver2LIItems === undefined) {
					
						const driver2LI = _.find(lineitems, (item: any) => { 
										return item.Driver_Id === item.Driver2_Id && (item.DescriptionName === 'Per Mile Amount' || item.DescriptionName === 'Loaded Miles Amount' );
									});
						
						if (driver2LI !== undefined) {
							const updateDO2 = {} as any;
							
							let emptyMiles = 0;
							
							if (lineitems[0].D2EmptyRate > 0) {
								updateDO2.quantity = (miles.loadedMiles).toFixed(2);
								emptyMiles = ( miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}
							else {                                
								updateDO2.quantity = (miles.loadedMiles + miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}
							

							if (driver2LI.Driver2_Id && driver2LI.SplitDriverMiles) {
								updateDO2.quantity = (updateDO2.quantity / 2).toFixed(2);
								emptyMiles = Number((emptyMiles /2 ).toFixed(2));
							}
							
							updateDO2.ratePer = driver2LI.Driver2Rate;
							updateDO2.amount = (updateDO2.quantity * driver2LI.Driver2Rate).toFixed(2);
							
							if(driver2LI.D2LoadedRate > 0) {
								updateDO2.ratePer = driver2LI.D2LoadedRate;
								updateDO2.amount = (updateDO2.quantity * driver2LI.D2LoadedRate).toFixed(2);
							}

							updateDO2.lineItemId = driver2LI.Id;
							updateDO2.userId = userId;
							this.driverLineItemService.saveDriverLineItem(updateDO2);
							
							if(lineitems[0].D2EmptyRate > 0) {
							
								const driver2LIEmpty = _.find(lineitems, (item: any) => { 
												return item.Driver_Id === item.Driver2_Id && item.DescriptionName === 'Empty Miles Amount';
											});
								if (driver2LIEmpty !== undefined) {
									const emptymilesUpdate = {} as any;

									emptymilesUpdate.quantity = emptyMiles;
									emptymilesUpdate.ratePer = lineitems[0].D2EmptyRate;
									emptymilesUpdate.amount = (emptyMiles * lineitems[0].D2EmptyRate).toFixed(2);
									
									emptymilesUpdate.lineItemId = driver2LIEmpty.Id;
									emptymilesUpdate.userId = userId;
									this.driverLineItemService.saveDriverLineItem(emptymilesUpdate);
								} else {
									let insertString = 'INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES'; 
									
									insertString += `(${lineitems[0].Driver2_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D2EmptyRate},${(emptyMiles * lineitems[0].D2EmptyRate).toFixed(2)},${id},null,UTC_TIMESTAMP,${userId})`;
									
									insertString += ';\n';
									this.database.query(insertString);
								}
							}
						} else if (lineitems[0].Driver2_Id) {
							let insertString = 'INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES'; 
							
							let quantity = 0;
							let emptyMiles = 0;
							
							if (lineitems[0].D2EmptyRate > 0) {
								quantity = (miles.loadedMiles).toFixed(2);
								emptyMiles = ( miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}
							else {
								quantity = (miles.loadedMiles + miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}

							if (lineitems[0].Driver2_Id && lineitems[0].SplitDriverMiles) {
								quantity = Number((quantity / 2).toFixed(2));
								emptyMiles = Number((emptyMiles /2).toFixed(2));
							}

							let ratePer = lineitems[0].Driver2Rate;
							let amount = (quantity * lineitems[0].Driver2Rate).toFixed(2);

							if(lineitems[0].D2LoadedRate > 0) {
								ratePer = lineitems[0].D2LoadedRate;
								amount = (quantity * ratePer).toFixed(2);
							}

							insertString += `(${lineitems[0].Driver2_Id},${(lineitems[0].D2EmptyRate > 0 ? "(select Id from description where name = 'Loaded Miles Amount')" : '6')},${quantity},${ratePer},${amount},${id},null,UTC_TIMESTAMP,${userId})`;
							if(lineitems[0].D2EmptyRate > 0) {
							
								const driver2LIEmpty = _.find(lineitems, (item: any) => { 
												return item.Driver_Id === item.Driver2_Id && item.DescriptionName === 'Empty Miles Amount';
											});
								if (driver2LIEmpty !== undefined) {
									const emptymilesUpdate = {} as any;

									emptymilesUpdate.quantity = emptyMiles;
									emptymilesUpdate.ratePer = lineitems[0].D2EmptyRate;
									emptymilesUpdate.amount = (emptyMiles * lineitems[0].D2EmptyRate).toFixed(2);
									
									emptymilesUpdate.lineItemId = driver2LIEmpty.Id;
									emptymilesUpdate.userId = userId;
									this.driverLineItemService.saveDriverLineItem(emptymilesUpdate);
								} else {
									let dinsertString = 'INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES'; 
									
									dinsertString += `(${lineitems[0].Driver2_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D2EmptyRate},${(emptyMiles * lineitems[0].D2EmptyRate).toFixed(2)},${id},null,UTC_TIMESTAMP,${userId})`;
									
									dinsertString += ';\n';
									this.database.query(dinsertString);
								}
							} else { 
								insertString += `,(${lineitems[0].Driver2_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D2EmptyRate},${(emptyMiles * lineitems[0].D2EmptyRate).toFixed(2)},${id},null,UTC_TIMESTAMP,${userId})`;
							}
							
							insertString += ';\n';
							this.database.query(insertString);
						}
					}
				}
			} else {
				lineitems = await this.databaseget.query(`SELECT dl.*, do.Driver1_Id, do.Driver2_Id, do.Driver1Rate, do.Driver2Rate, c.SplitDriverMiles,d.Name DescriptionName, d1.EmptyMilesRate D1EmptyRate, d2.EmptyMilesRate D2EmptyRate,d1.LoadedMilesRate D1LoadedRate, d2.LoadedMilesRate D2LoadedRate, do.Driver1Settlement_Id, do.Driver2Settlement_Id FROM relay do left join dispatchorder dor on dor.id = do.dispatchorder_Id LEFT JOIN driverlineitems dl ON dl.relay_Id = do.Id and dl.isdeleted = 0 LEFT JOIN description d ON d.Id = dl.Description_Id LEFT JOIN company c ON c.Id = dor.Company_Id LEFT JOIN driver d1 on d1.Id = do.Driver1_Id LEFT JOIN driver d2 on d2.Id = do.Driver2_Id WHERE do.Id = ${id}`);
				lineitems = lineitems.data as any;
				if (lineitems.length > 0 && !lineitems[0].Driver1Settlement_Id) {
					const driver1LIItems = _.find(lineitems, (item: any) => {
						return item.DescriptionName === 'Flat Amount' && item.Driver1_Id === item.Driver_Id;
					});
					if (driver1LIItems === undefined) {
					
						const driver1LI = _.find(lineitems, (item: any) => { 
											return item.Driver_Id === item.Driver1_Id && (item.DescriptionName === 'Per Mile Amount' || item.DescriptionName === 'Loaded Miles Amount' );
										});
						
						const updateDO = {} as any;

						if (driver1LI !== undefined) {
							let emptyMiles = 0;
							if (lineitems[0].D1EmptyRate > 0) {
								updateDO.quantity = miles.loadedMiles;
								emptyMiles = miles.deadHeadedAfter + miles.deadHeadedBefore;
							} else {                         
								updateDO.quantity = miles.loadedMiles + miles.deadHeadedAfter + miles.deadHeadedBefore;
							}
						
							if (driver1LI.Driver2_Id && driver1LI.SplitDriverMiles) {
								updateDO.quantity = Number((updateDO.quantity / 2).toFixed(2));
								emptyMiles = Number((emptyMiles /2 ).toFixed(2));
							}

							updateDO.ratePer = driver1LI.Driver1Rate;
							updateDO.amount = (updateDO.quantity * driver1LI.Driver1Rate);

							if(driver1LI.D1LoadedRate > 0) {
								updateDO.ratePer = driver1LI.D1LoadedRate;
								updateDO.amount = (updateDO.quantity * driver1LI.D1LoadedRate);
							}

							updateDO.lineItemId = driver1LI.Id;
							updateDO.userId = userId;
							this.driverLineItemService.saveDriverLineItem(updateDO);
							
							if(lineitems[0].D1EmptyRate > 0) {
							
								const driver1LIEmpty = _.find(lineitems, (item: any) => { 
												return item.Driver_Id === item.Driver1_Id && item.DescriptionName === 'Empty Miles Amount';
											});
								if (driver1LIEmpty !== undefined) {
									const emptymilesUpdate = {} as any;

									emptymilesUpdate.quantity = emptyMiles;
									emptymilesUpdate.ratePer = lineitems[0].D1EmptyRate;
									emptymilesUpdate.amount = (emptyMiles * lineitems[0].D1EmptyRate);

									emptymilesUpdate.lineItemId = driver1LIEmpty.Id;
									emptymilesUpdate.userId = userId;
									this.driverLineItemService.saveDriverLineItem(emptymilesUpdate);
									
								} else {
									let insertString = `INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES`; 
									
									insertString += `(${lineitems[0].Driver1_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D1EmptyRate},${(emptyMiles * lineitems[0].D1EmptyRate).toFixed(2)},${dispatchOrderId},${id},UTC_TIMESTAMP,${userId})`;
									
									insertString += ';\n';
									this.database.query(insertString);
								}
							}
							
						} else {
							let insertString = 'INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES'; 
							let quantity = 0;
							let emptyMiles = 0;
							if (lineitems[0].D1EmptyRate > 0) {
								quantity = (miles.loadedMiles).toFixed(2);
								emptyMiles = ( miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}
							else {
								quantity = (miles.loadedMiles + miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}

							if (lineitems[0].Driver2_Id && lineitems[0].SplitDriverMiles) {
								quantity = Number((quantity / 2).toFixed(2));
								emptyMiles = Number((emptyMiles /2).toFixed(2));
							}

							let ratePer = lineitems[0].Driver1Rate;
							let amount = (quantity * lineitems[0].Driver1Rate).toFixed(2);

							if(lineitems[0].D1LoadedRate > 0) {
								ratePer = lineitems[0].D1LoadedRate;
								amount = (quantity * ratePer).toFixed(2);
							}

							insertString += `(${lineitems[0].Driver1_Id},${(lineitems[0].D1EmptyRate > 0 ? "(select Id from description where name = 'Loaded Miles Amount')" : '6')},${quantity},${ratePer},${amount},${dispatchOrderId},${id},UTC_TIMESTAMP,${userId})`;
							
							if(lineitems[0].D1EmptyRate > 0) {
							
								const driver1LIEmpty = _.find(lineitems, (item: any) => { 
												return item.Driver_Id === item.Driver1_Id && item.DescriptionName === 'Empty Miles Amount';
											});
								if (driver1LIEmpty !== undefined) {
									const emptymilesUpdate = {} as any;

									emptymilesUpdate.quantity = emptyMiles;
									emptymilesUpdate.ratePer = lineitems[0].D1EmptyRate;
									emptymilesUpdate.amount = (emptyMiles * lineitems[0].D1EmptyRate);

									emptymilesUpdate.lineItemId = driver1LIEmpty.Id;
									emptymilesUpdate.userId = userId;
									this.driverLineItemService.saveDriverLineItem(emptymilesUpdate);
									
								} else {
									let dinsertString = `INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES`; 
									
									dinsertString += `(${lineitems[0].Driver1_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D1EmptyRate},${(emptyMiles * lineitems[0].D1EmptyRate).toFixed(2)},${dispatchOrderId},${id},UTC_TIMESTAMP,${userId})`;
									
									dinsertString += ';\n';
									this.database.query(dinsertString);
								}
							} else { 
								insertString += `,(${lineitems[0].Driver1_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D1EmptyRate},${(emptyMiles * lineitems[0].D1EmptyRate).toFixed(2)},${dispatchOrderId},${id},UTC_TIMESTAMP,${userId})`;
							}
							
							insertString += ';\n';
						
							this.database.query(insertString);
						}
					}
				}
				
				if (lineitems.length > 0 && !lineitems[0].Driver2Settlement_Id) {
					const driver2LIItems = _.find(lineitems, (item: any) => { 
						return item.DescriptionName === 'Flat Amount' && item.Driver2_Id === item.Driver_Id;
					});
					if (driver2LIItems === undefined) {
					
						const driver2LI = _.find(lineitems, (item: any) => { 
										return item.Driver_Id === item.Driver2_Id && (item.DescriptionName === 'Per Mile Amount' || item.DescriptionName === 'Loaded Miles Amount' );
									});
						
						if (driver2LI !== undefined) {
							const updateDO2 = {} as any;
							
							let emptyMiles = 0;
							
							if (lineitems[0].D2EmptyRate > 0) {
								updateDO2.quantity = (miles.loadedMiles).toFixed(2);
								emptyMiles = ( miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}
							else {                                
								updateDO2.quantity = (miles.loadedMiles + miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}
							

							if (driver2LI.Driver2_Id && driver2LI.SplitDriverMiles) {
								updateDO2.quantity = (updateDO2.quantity / 2).toFixed(2);
								emptyMiles = Number((emptyMiles /2 ).toFixed(2));
							}
							
							updateDO2.ratePer = driver2LI.Driver2Rate;
							updateDO2.amount = (updateDO2.quantity * driver2LI.Driver2Rate).toFixed(2);
							
							if(driver2LI.D2LoadedRate > 0) {
								updateDO2.ratePer = driver2LI.D2LoadedRate;
								updateDO2.amount = (updateDO2.quantity * driver2LI.D2LoadedRate).toFixed(2);
							}

							updateDO2.lineItemId = driver2LI.Id;
							updateDO2.userId = userId;
							this.driverLineItemService.saveDriverLineItem(updateDO2);
							
							if(lineitems[0].D2EmptyRate > 0) {
							
								const driver2LIEmpty = _.find(lineitems, (item: any) => { 
												return item.Driver_Id === item.Driver2_Id && item.DescriptionName === 'Empty Miles Amount';
											});
								if (driver2LIEmpty !== undefined) {
									const emptymilesUpdate = {} as any;

									emptymilesUpdate.quantity = emptyMiles;
									emptymilesUpdate.ratePer = lineitems[0].D2EmptyRate;
									emptymilesUpdate.amount = (emptyMiles * lineitems[0].D2EmptyRate).toFixed(2);
									
									emptymilesUpdate.lineItemId = driver2LIEmpty.Id;
									emptymilesUpdate.userId = userId;
									this.driverLineItemService.saveDriverLineItem(emptymilesUpdate);
								} else {
									let insertString = 'INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES'; 
									
									insertString += `(${lineitems[0].Driver2_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D2EmptyRate},${(emptyMiles * lineitems[0].D2EmptyRate).toFixed(2)},${dispatchOrderId},${id},UTC_TIMESTAMP,${userId})`;
									
									insertString += ';\n';
									this.database.query(insertString);
								}
							}
						} else if (lineitems[0].Driver2_Id) {
							let insertString = 'INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES'; 
							
							let quantity = 0;
							let emptyMiles = 0;
							
							if (lineitems[0].D2EmptyRate > 0) {
								quantity = (miles.loadedMiles).toFixed(2);
								emptyMiles = ( miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}
							else {
								quantity = (miles.loadedMiles + miles.deadHeadedAfter + miles.deadHeadedBefore).toFixed(2);
							}

							if (lineitems[0].Driver2_Id && lineitems[0].SplitDriverMiles) {
								quantity = Number((quantity / 2).toFixed(2));
								emptyMiles = Number((emptyMiles /2).toFixed(2));
							}

							let ratePer = lineitems[0].Driver2Rate;
							let amount = (quantity * lineitems[0].Driver2Rate).toFixed(2);

							if(lineitems[0].D2LoadedRate > 0) {
								ratePer = lineitems[0].D2LoadedRate;
								amount = (quantity * ratePer).toFixed(2);
							}

							insertString += `(${lineitems[0].Driver2_Id},${(lineitems[0].D2EmptyRate > 0 ? "(select Id from description where name = 'Loaded Miles Amount')" : '6')},${quantity},${ratePer},${amount},${dispatchOrderId},${id},UTC_TIMESTAMP,${userId})`;
							if(lineitems[0].D2EmptyRate > 0) {
							
								const driver2LIEmpty = _.find(lineitems, (item: any) => { 
												return item.Driver_Id === item.Driver2_Id && item.DescriptionName === 'Empty Miles Amount';
											});
								if (driver2LIEmpty !== undefined) {
									const emptymilesUpdate = {} as any;

									emptymilesUpdate.quantity = emptyMiles;
									emptymilesUpdate.ratePer = lineitems[0].D2EmptyRate;
									emptymilesUpdate.amount = (emptyMiles * lineitems[0].D2EmptyRate).toFixed(2);
									
									emptymilesUpdate.lineItemId = driver2LIEmpty.Id;
									emptymilesUpdate.userId = userId;
									this.driverLineItemService.saveDriverLineItem(emptymilesUpdate);
								} else {
									let dinsertString = 'INSERT INTO driverlineitems(Driver_Id,Description_Id,Quantity,RatePer,Amount,DispatchOrder_Id,Relay_Id, createdAt, createduserId)VALUES'; 
									
									dinsertString += `(${lineitems[0].Driver2_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D2EmptyRate},${(emptyMiles * lineitems[0].D2EmptyRate).toFixed(2)},${dispatchOrderId},${id},UTC_TIMESTAMP,${userId})`;
									
									dinsertString += ';\n';
									this.database.query(dinsertString);
								}
							} else { 
								insertString += `,(${lineitems[0].Driver2_Id},(select Id from description where name = 'Empty Miles Amount'),${emptyMiles},${lineitems[0].D2EmptyRate},${(emptyMiles * lineitems[0].D2EmptyRate).toFixed(2)},${dispatchOrderId},${id},UTC_TIMESTAMP,${userId})`;
							}
							
							insertString += ';\n';
							this.database.query(insertString);
						}
					}
				}
			}  
		} catch (e) {
			return 'Error occured updating lineitems.';
		}
	};
	
	public async addDLItemsFromELD(req: any): Promise<any> {
		if(req.driver1_Id && req.driver1MilesBy === 'ELD') {
			const dhbMiles = 0;
			const dhaMiles = 0;
			const loadedMiles = 0;
			const stops = await this.doStopService.getStopsbyDOIdRelayId({do_Id: req.do_Id, relay_Id: req.relay_Id ? req.relay_Id : null})
			if(req.StartedOn) {
				
				const dhb = await this.databaseget.query(`call getDriveMilesfromEvents(${req.driver1_Id}, ${req.startedOn}, ${stops[0].fromTime})`)
			}
			
		}
	}

	public async getDateTimebyId(dispatchOrderId: number, relayId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			SELECT 
				r.id,
				sa.Zip as startZip,
				sa.Latitude as startLatitude,
				sa.Longitude as startLongitude,
				ea.Zip as endZip,
                ea.Latitude as endLatitude,
                ea.Longitude as endLongitude,
				r.Carrier_Id as carrierId,				
				do.Company_Id as companyId,
				co.RunMiles as runMiles,
				co.IFTARouteMethod  as iftaRouteMethod
			FROM 
				relay r 
				LEFT JOIN address sa on sa.Id = r.StartingLoc_Id 
				LEFT JOIN address ea on ea.Id = r.EndingLoc_Id
				left join dispatchorder do on do.Id = r.dispatchorder_Id
				left join company co on co.Id = do.company_Id
			WHERE 
				r.IsDeleted = 0 and r.DispatchOrder_Id = ${dispatchOrderId} ${relayId ? ` and r.Id = ${relayId}` : ''}
		`);
	}
}
