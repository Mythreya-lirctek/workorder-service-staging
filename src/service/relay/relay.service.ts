import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

export default class DispatchorderService {
	private database: Database;

	constructor() {
		this.database = new Database();
	}

	public addRelay(req: any): Promise<DatabaseResponse> {
		return this.database.query(`
			CALL AddRelay_snew(
				${req.dispatchOrder_Id},
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
				${this.database.connection.escape(req.relayNumber)},
				${req.trip_Id ? req.trip_Id : null},
				${req.carrierRate ? req.carrierRate : null},
				${req.totalAmount ? req.totalAmount: null},
				${req.loadtype ? this.database.connection.escape(req.loadtype) : null},
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
				${req.driverNotificationType ? this.database.connection.escape(req.driverNotificationType) : null}
			);
		`)
	}
	
	public async saveRelay(req: any): Promise<any> {
		let text = '';
		const relayFields: any = [
			'dispatchOrder_Id', 'relayNumber', 'truck_Id', 'startingLoc_Id', 'endingLoc_Id','status_Id', 'driver1_Id', 'driver2_Id',
			'deadHeadedBefore', 'deadHeadedAfter', 'loadedMiles', 'amount', 'carrier_Id', 'driver1Settlement_Id', 'driver2Settlement_Id',
			'ownerOpSettlement_Id','carrierSettlement_Id', 'driver1Amount', 'driver2Amount','ownerOpAmount', 'carrierAmount',
			'driver1PayType','driver2PayType','ownerOpPayType','carrierPayType','driver1Rate','driver2Rate','ownerOpRate',
			'carrierRate','trailer_Id','isDeleted','driverViewedOn','driverName','driverPhone','truckNum','trailerNum','isBOLReceived',
			'isBOLRequired','bolReceivedDate','driver2ViewedOn','dropTrialerDelLOC','trip_Id','loadType','notes','acceptedDate',
			'ownerOp_Id','trailerLocation_Id', 'isAutoDispatch', 'autoDispatchType', 'autoDispatchDT','isMilesRan',
			'driver1MilesBy','driver2MilesBy','promilesErr','startedOn','endedOn','isAmountApproved','approvedBy','approvedOn','driverNotificationType','tripMinutes',
			'isMLoadAmount'
		];
		Object.keys(req).map((key) => {
			if (relayFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.database.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.relayId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    relay
                SET
                    ${text}
                WHERE
                    Id = ${req.relayId}
            `);
		} else {
			return null
		}
	}	
	
	public deleteRelay(req: any): Promise<DatabaseResponse> {
		return this.database.query(`
			CALL deleteRelay(
                ${req.nextRelayId},
                ${req.nextRelayPickupId},
                ${req.relayPickupId},
                ${req.relayDeliveryId},
                ${req.previousDeliveryId},
                ${req.relayId},
				${req.previousRelayId},
				${req.dispatchOrder_Id},
                ${req.userId})
        `)
	}
}