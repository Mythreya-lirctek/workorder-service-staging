import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class OwneropLineItemService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public addOwneropLineItem(req: any): Promise<any> {
		return this.db.query(`
			INSERT INTO owneroplineitems(
				Ownerop_Id,
				Description_Id,
				units,
				Per,
				Amount,
				DispatchOrder_Id,
				Relay_Id,
				Notes,
                createdAt,
                createdUserId
			)
			VALUES (
				${req.ownerop_Id},
				${req.description_Id},
				${req.units},
				${req.per},
				${req.amount},
				${req.dispatchOrder_Id},
				${req.relay_Id ? req.relay_Id : null},
				'${req.notes}',
				UTC_TIMESTAMP,
				${req.userId}
			)
		`);
	}
	
	public async saveOwneropLineItem(req : any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'ownerop_Id', 'description_Id', 'units', 'per', 'amount', 'dispatchOrder_Id', 'relay_Id', 'notes', 'isDeleted'];
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
                    owneroplineitems
                SET
                    ${text}
                WHERE
                    Id = ${req.lineItemId}
            `);
		} else if (text && req.relay_Id) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    owneroplineitems
                SET
                    ${text}
                WHERE
				relay_Id = ${req.relay_Id} ${req.oldOwnerop_Id ? ` and ownerop_Id = ${req.oldOwnerop_Id}` :''}
            `);
		} else if (text && req.dispatchOrder_Id) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    owneroplineitems
                SET
                    ${text}
                WHERE
				dispatchOrder_Id = ${req.dispatchOrder_Id} ${req.oldOwnerop_Id ? ` and ownerop_Id = ${req.oldOwnerop_Id}` :''}
            `); 
		} else {
			return null
		}
	}
	
	public async getOpLineItemsByRelayId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getOpLineItemsByRelayId_snew(${req.relay_Id},${req.ownerop_Id})`
		);
	}
	
	public async getOpLineItemsByDOId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getOpLineItemsByDOId_snew(${req.do_Id},${req.ownerop_Id})`
		);
	}
} 

export default OwneropLineItemService;