import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class CarrierLineItemService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public addCarrierLineItem(req: any): Promise<any> {
		return this.db.query(`
			INSERT INTO docarrierlineitems(
				Carrier_Id,
				Description_Id,
				units,
				per,
				Amount,
				DispatchOrder_Id,
				Relay_Id,
				Notes,
                createdAt,
                createdUserId
			)
			VALUES (
				${req.carrier_Id},
				${req.description_Id},
				${req.units},
				${req.per},
				${req.amount},
				${req.dispatchOrder_Id},
				${req.relay_Id ? req.relay_Id : null},
				${req.notes ? this.db.connection.escape(req.notes) : null},
				UTC_TIMESTAMP,
				${req.userId}
			)
		`);
	}
	
	public async saveCarrierLineItem(req : any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'carrier_Id', 'description_Id', 'units', 'per', 'amount', 'dispatchOrder_Id', 'relay_Id', 'notes', 'isDeleted'];
		Object.keys(req).map((key) => {
			if (lineFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.lineItemId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    docarrierlineitems
                SET
                    ${text}
                WHERE
                    Id = ${req.lineItemId}
            `);
		} else if (text && req.relay_Id) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    docarrierlineitems
                SET
                    ${text}
                WHERE
				relay_Id = ${req.relay_Id} ${req.oldCarrier_Id ? ` and carrier_Id = ${req.oldCarrier_Id}` :''}
            `);
		} else if (text && req.dispatchOrder_Id) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    docarrierlineitems
                SET
                    ${text}
                WHERE
				dispatchOrder_Id = ${req.dispatchOrder_Id}${req.oldCarrier_Id ? ` and carrier_Id = ${req.oldCarrier_Id}` :''}
            `);
		} else {
			return null
		}
	}
	
	public async getDOCarrierlineitemsByRelayId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDOCarrierlineitemsByRelayId_snew(${req.relay_Id})`
		);
	}
	
	public async getDOCarrierlineitemsByDOId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDOCarrierlineitemsByDOId_snew(${req.do_Id})`
		);
	}

} 

export default CarrierLineItemService;