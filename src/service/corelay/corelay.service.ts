import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

export default class DispatchorderService {
	private database: Database;

	constructor() {
		this.database = new Database();
	}

	public addCORelay(req: any): Promise<DatabaseResponse> {
		return this.database.query(`
			CALL AddCORelay_snew(
				${req.customerOrder_Id},
				${req.status_Id},
                ${req.carrier_Id ? req.carrier_Id : null},
				${req.userId},
				${req.companyId},
				${req.driverName ? this.database.connection.escape(req.driverName) : null},
				${req.driverPhone ? this.database.connection.escape(req.driverPhone) : null},
				${req.truckNum ? this.database.connection.escape(req.truckNum) : null},
				${req.trailerNum ? this.database.connection.escape(req.trailerNum) : null},
				${this.database.connection.escape(req.relayNumber)},
				${req.carrierRate ? req.carrierRate : null},
				${req.totalAmount ? req.totalAmount: null},
				${req.loadtype ? this.database.connection.escape(req.loadtype) : null},
				${req.notes ? this.database.connection.escape(req.notes) : null},
				${req.isBOLRequired ? req.isBOLRequired : 0},
				${req.carrierAmount ? req.carrierAmount : 0}
			);
		`)
	}
	
	public async saveCORelay(req: any): Promise<any> {
		let text = '';
		const relayFields: any = [
			'customerOrder_Id', 'relayNumber', 'status_Id', 'amount', 'carrier_Id', 'coCarrierSettlement_Id', 'carrierAmount',
			'carrierPayType','carrierRate','isDeleted','driverName','driverPhone','truckNum','trailerNum','isBOLReceived',
			'isBOLRequired','bolReceivedDate'];
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
                    corelay
                SET
                    ${text}
                WHERE
                    Id = ${req.relayId}
            `);
		} else {
			return null
		}
	}	
	
	public deleteCORelay(req: any): Promise<DatabaseResponse> {
		return this.database.query(`
			CALL deleteCORelay(
                ${req.nextRelayId},
                ${req.nextRelayPickupId},
                ${req.relayPickupId},
                ${req.previousDeliveryId},
                ${req.relayId},
				${req.previousRelayId},
				${req.customerOrder_Id},
                ${req.userId})
        `)
	}
}