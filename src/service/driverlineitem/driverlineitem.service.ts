import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class DriverLineItemService {
	private db: Database;
	constructor() {
		this.db = new Database();
	}
	
	public addDriverLineItem(req: any): Promise<any> {
		return this.db.query(`
			INSERT INTO driverlineitems(
				Driver_Id,
				Description_Id,
				Quantity,
				RatePer,
				Amount,
				DispatchOrder_Id,
				Relay_Id,
				Notes,
                createdAt,
                createdUserId
			)
			VALUES (
				${req.driver_Id},
				${req.description_Id},
				${req.quantity},
				${req.ratePer},
				${req.amount},
				${req.dispatchOrder_Id},
				${req.relay_Id ? req.relay_Id : null},
				'${req.notes}',
				UTC_TIMESTAMP,
				${req.userId}
			)
		`);
	}
	
	public async saveDriverLineItem(req : any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'driver_Id', 'description_Id', 'quantity', 'ratePer', 'amount', 'dispatchOrder_Id', 'relay_Id', 'notes', 'isDeleted'];
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
                    driverlineitems
                SET
                    ${text}
                WHERE
                    Id = ${req.lineItemId}
            `);
		} else if (text && req.relay_Id) { 
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    driverlineitems
                SET
                    ${text}
                WHERE
				relay_Id = ${req.relay_Id} ${req.oldDriver_Id ? ` and driver_Id = ${req.oldDriver_Id}` :''}
            `);
		} else if (text && req.dispatchOrder_Id) { 
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    driverlineitems
                SET
                    ${text}
                WHERE
				dispatchOrder_Id = ${req.dispatchOrder_Id} ${req.oldDriver_Id ? ` and driver_Id = ${req.oldDriver_Id}` :''}
            `);
		} else {
			return null
		}
	}
} 

export default DriverLineItemService;