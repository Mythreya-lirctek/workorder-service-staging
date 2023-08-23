import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

export default class DispatchorderService {
	private database: Database;
	private databaseget: Database;
	constructor() {
		this.database = new Database();
		this.databaseget = new Database(true);
	}

	public addDispatchOrder(req: any): Promise<DatabaseResponse> {
		return this.database.query(`
			CALL AddDispatchOrder_snew(
				${req.status_Id},
				${req.truck_Id ? req.truck_Id : null},
				${req.trailer_Id ? req.trailer_Id : null},
				${req.driver1_Id ? req.driver1_Id : null},
				${req.driver2_Id ? req.driver2_Id : null},
				${req.carrier_Id ? req.carrier_Id : null},
				${req.chassisNum ? this.database.connection.escape(req.chassisNum) : null},
				${req.userId},
				${req.companyId},
				${req.driver1PayType ? this.database.connection.escape(req.driver1PayType) : null},
				${req.driver2PayType ? this.database.connection.escape(req.driver2PayType) : null},
				${req.ownerOpPayType ? this.database.connection.escape(req.ownerOpPayType) : null},
				${req.ownerOpRate ? req.ownerOpRate : null},
				${req.driver1Rate ? req.driver1Rate : null},
				${req.driver2Rate ? req.driver2Rate : null},
				${req.driverName ? this.database.connection.escape(req.driverName) : null},
				${req.driverPhone ? this.database.connection.escape(req.driverPhone) : null},
				${req.truckNum ? this.database.connection.escape(req.truckNum) : null},
				${req.trailerNum ? this.database.connection.escape(req.trailerNum) : null},
				${this.database.connection.escape(req.doNum)},
				${req.trip_Id ? req.trip_Id : null},
				${req.carrierRate ? req.carrierRate : null},
				${req.totalAmount ? req.totalAmount: null},
				${req.loadType ? this.database.connection.escape(req.loadType) : null},
				${req.notes ? this.database.connection.escape(req.notes) : null},
				${req.dropTrialerDelLOC ? req.dropTrialerDelLOC : 0},
				${req.ownerOp_Id ? req.ownerOp_Id : null},
				${req.isBOLRequired ? req.isBOLRequired : 0},
				${req.startingLocation_Id ? req.startingLocation_Id : null},
				${req.endingLocation_Id ? req.endingLocation_Id : null},
				${req.trailerLocation_Id ? req.trailerLocation_Id : null},
				${req.isAutoDispatch ? req.isAutoDispatch : 0},
				${req.autoDispatchType ? this.database.connection.escape(req.autoDispatchType) : null},
				${req.autoDispatchDT ? this.database.connection.escape(req.autoDispatchDT) : null},
				${req.driver1MilesBy ? this.database.connection.escape(req.driver1MilesBy) : null},
				${req.driver2MilesBy ? this.database.connection.escape(req.driver2MilesBy) : null},
				${req.startedOn ? this.database.connection.escape(req.startedOn) : null},
				${req.endedOn ? this.database.connection.escape(req.endedOn) : null},
				${req.driverNotificationType ? this.database.connection.escape(req.driverNotificationType) : null}
			);
		`)
	}
	
	public async saveDispatchOrder(req: any): Promise<any> {
		let text = '';
		const driverFields: any = [
			'dispatchNumber', 'truck_Id', 'startingLocation_Id', 'endingLocation_Id','status_Id', 'driver1_Id', 'driver2_Id',
			'deadHeadedBefore', 'deadHeadedAfter', 'loadedMiles', 'totalAmount', 'carrier_Id', 'driver1Settlement_Id', 'driver2Settlement_Id',
			'ownerOpSettlement_Id','carrierSettlement_Id', 'driver1Amount', 'driver2Amount','ownerOpAmount', 'carrierAmount',
			'driver1PayType','driver2PayType','ownerOpPayType','carrierPayType','driver1Rate','driver2Rate','ownerOpRate',
			'carrierRate','trailer_Id','isDeleted','driverViewedOn','driverName','driverPhone','truckNum','trailerNum','isBOLReceived',
			'isBOLRequired','bolReceivedDate','driver2ViewedOn','dropTrialerDelLOC','trip_Id','loadType','notes','acceptedDate',
			'ownerOp_Id','trailerLocation_Id', 'isAutoDispatch', 'autoDispatchType', 'autoDispatchDT',
			'isMilesRan','driver1MilesBy','driver2MilesBy','promilesErr','startedOn','endedOn','isAmountApproved','approvedBy','approvedOn','driverNotificationType','tripMinutes',
			'isMLoadAmount'
		];
		Object.keys(req).map((key) => {
			if (driverFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.database.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.dispatchOrderId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    dispatchorder
                SET
                    ${text}
                WHERE
                    Id = ${req.dispatchOrderId}
            `);
		} else {
			return null
		}
	}	
	
	public async GetStartLocandDriverId(req: any):
		Promise<any> {
		return this.databaseget.query(`
		CALL GetStartLocandDriverId_snew(${req.truck_Id},
			${req.companyId} ,
			${this.database.connection.escape(req.pickupDate)},
			${this.database.connection.escape(req.deliveryDate)}
			)
		`)
	}
	
	public async getCurrentLoadsByTruckId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getCurrentLoadsByTruckId_snew(
			${req.companyId},
			${req.truck_Id}
			)`
		);
	}
	
	public async searchTripNumbers(req: any): Promise<any> {
		return this.databaseget.query(`
		select id, tripNumber
		from trips where 
		company_Id = ${req.companyId}
		and tripnumber like concat( ${req.searchVal ? this.database.connection.escape(req.searchVal) : null},'%')
			`
		);
	}

	public async getInfotoSendDispatch(req: any): Promise<any> {
		return this.databaseget.query(`CALL getInfotoSendDispatch(${req.do_Id},${req.relay_Id ? req.relay_Id : null})`
		);
	}

	public async getDeviceTokensInfo(req: any): Promise<any> {
		return this.databaseget.query(`CALL getDeviceTokensInfo(
			${req.do_Id},
			${req.relay_Id ? req.relay_Id : null}, 
			${req.driver_Id ? req.driver_Id : null}, 
			${req.ownerOp_Id ? req.ownerOp_Id : null}, 
			${req.carrier_Id ? req.carrier_Id : null})`
		);
	}

	public async getDORateConPrintDetails(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDORateConPrintDetails_snew(${req.do_Id},${req.relay_Id ? req.relay_Id : null})`
		);
	}
	
	public async deleteDo(req: any): Promise<any> {
		return this.database.query(`
		CALL DeleteDO(${req.dispatchOrderId})`
		);
	}
	
	public async getDetailsToSendSMS(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDetailsToSendSMS_snew(${req.do_Id}, ${req.relay_Id ? req.relay_Id : null}, ${req.companyId})`
		);
	}
	
	public async getSendSMSPhoneNumber(): Promise<any> {
		return this.databaseget.query(`
		CALL getSendSMSPhoneNumber()`
		);
	}
	
	public async getWayPointsByDOIdRelayId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getWayPointsByDOIdRelayId_snew(${req.do_Id}, ${req.relay_Id})`
		);
	}
	
	public async getAcceptedRejectedLogsById(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getAcceptedRejectedLogsById_snew(${req.do_Id}, ${req.relay_Id}, ${this.database.connection.escape(req.type)})`
		);
	}
	
	public async getLTLDORelayDetailsbyId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getLTLDORelayDetailsbyId_snew(${req.do_Id}, ${req.companyId})`
		);
	}
	
	public async getroutebyDORelayID(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getroutebyDORelayID_snew(${req.do_Id}, ${req.relay_Id})`
		);
	}
	
	public async getLatePickups(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getLatePickups_snew(
			${req.companyId},
			${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
			${req.toDate ? this.database.connection.escape(req.toDate) : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.truck_Id ? req.truck_Id : null},
			${req.driver_Id ? req.driver_Id : null},
			${req.customer_Id ? req.customer_Id : null},
			${req.pageSize},
			${req.pageIndex},
			${this.database.connection.escape(req.sortExpression)},
			${this.database.connection.escape(req.sortDirection)}
		)`
		);
	}
	
	public async getLateDeliverys(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getLateDeliverys_snew(
			${req.companyId},
			${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
			${req.toDate ? this.database.connection.escape(req.toDate) : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.truck_Id ? req.truck_Id : null},
			${req.driver_Id ? req.driver_Id : null},
			${req.customer_Id ? req.customer_Id : null},
			${req.pageSize},
			${req.pageIndex},
			${this.database.connection.escape(req.sortExpression)},
			${this.database.connection.escape(req.sortDirection)}
		)`
		);
	}		
	
	public async getAdditionPickandDel(req: any): Promise<any> {
		return this.database.query(`
		CALL getAdditionPickandDel_snew(
			${req.doId}
		)`
		);
	}	

	public async getOwneropAmount(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getOwneropAmount_snew(
			${req.do_Id},
			${req.relay_Id}
		)`
		);
	}	

	public async getCarrierAmount(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getCarrierAmount_snew(
			${req.do_Id},
			${req.relay_Id}
		)`
		);
	}
	
	public getStatewidemilesbyDORelayId(req: any): Promise<any> {
		return this.databaseget.query(`
			call getStatewidemilesbyDORelayId_snew(
				${req.do_Id},
				${req.relay_Id ? req.relay_Id : null}
			)
		`)
	} 
	
	public async getAutoDispatchData(): Promise<any> {
		return this.databaseget.query(`
		CALL getAutoDispatchData(
		)`
		);
	}

	public async getDispatchOrderListByCompany(req:any): Promise<any> {
		return this.databaseget.query(`
			CALL getDispatchOrderListByCompany_snew(
				${req.companyId},
				${req.status_Id ? req.status_Id : null},
				${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
				${req.toDate ? this.database.connection.escape(req.toDate) : null},
				${req.truck_Id ? req.truck_Id : null},
				${req.driver_Id ? req.driver_Id : null},
				${req.trailerNum ? this.database.connection.escape(req.trailerNum) : null},
				${req.carrier_Id ? req.carrier_Id : null},
				${req.doNum ? this.database.connection.escape(req.doNum) : null},
				${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
				${req.toCity ? this.database.connection.escape(req.toCity) : null},
				${req.fromState ? this.database.connection.escape(req.fromState) : null},
				${req.toState ? this.database.connection.escape(req.toState) : null},
				${req.customerName ? this.database.connection.escape(req.customerName) : null},
				${req.refNum ? this.database.connection.escape(req.refNum) : null},
				${req.loadsType ? this.database.connection.escape(req.loadsType) : null},
				${req.isDefault},
				${req.terminal_Id ? req.terminal_Id : null},
				${req.dispatcher_Id ? req.dispatcher_Id : null},
				${req.alNumber ? this.database.connection.escape(req.alNumber) : null},
				${req.deliveryFromDate ? this.database.connection.escape(req.deliveryFromDate) : null},
				${req.deliveryToDate ? this.database.connection.escape(req.deliveryToDate) : null},
				${req.pageSize ? req.pageSize : 50},
				${req.pageIndex ? req.pageIndex : 0},
				${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
				${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)`
		);
	}

	public async getmilesbydorelayId(req: any): Promise<any> {
		let query = `
		select loadedMiles,deadheadedAfter, deadheadedBefore from dispatchorder where Id = ${req.do_Id}`;

		if (req.relay_Id > 0) {
			query = `select loadedMiles,deadheadedAfter, deadheadedBefore from relay where Id = ${req.relay_Id}`;
		}
		return this.databaseget.query(`${query}`
		);
	}

	public getAutoDispatchLoads(): Promise<any> {
		return this.databaseget.query(`
		 	call getAutoDispatchData()
		`)
	}

	public async getPendingLoadsForDriver(driverId:any):Promise<any>{
		return  this.databaseget.query(`
		 	call getDriverActiveLoadsCount(${driverId})
		`)
	}

	public async getWOloadamountwithLegmiles(woId:any):Promise<any>{
		return  this.databaseget.query(`
		 	call getWOloadamountwithLegmiles(${woId})
		`)
	}
}
