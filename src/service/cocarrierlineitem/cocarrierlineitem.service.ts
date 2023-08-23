import Database from '../database/database';

class COCarrierLineItemService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public async addCoCarrierLineItem(req: any): Promise<any> {
		return this.db.query(`
			INSERT 
				INTO
					cocarrierlineitems(
						CustomerOrder_Id, Description_Id, Carrier_Id, Units, PER, Amount, 
						createdAt, createdUserId, CORelay_Id, Notes, IsAccepted, IsRejected,
						AcceptedDate, RejectedDate
					)
				VALUES(
					${req.customerOrder_Id ? req.customerOrder_Id : null},
					${req.description_Id ? req.description_Id : null},
					${req.carrier_Id ? req.carrier_Id : null},
					${req.units ? req.units : 0},
					${req.per ? req.per : 0},
					${req.amount ? req.amount : 0},
					UTC_TIMESTAMP,
					${req.userId ? req.userId : null},
					${req.coRelay_Id ? req.coRelay_Id : null},
					${req.notes ? this.db.connection.escape(req.notes) : null},
					${req.isAccepted ? req.isAccepted : 0},
					${req.isRejected ? req.isRejected : 0},
					${req.acceptedDate ? this.db.connection.escape(req.acceptedDate) : null},
					${req.rejectedDate ? this.db.connection.escape(req.rejectedDate) : null}
				)
		`)
	}
	
	public async saveCOCarrierLineItem(req : any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'carrier_Id', 'description_Id', 'units', 'per', 'amount', 'customerOrder_Id', 'coRelay_Id', 'notes', 'isDeleted', 'isAccepted', 'isRejected', 'acceptedDate', 'rejectedDate'];
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
                    cocarrierlineitems
                SET
                    ${text}
                WHERE
                    Id = ${req.lineItemId}
            `);
		} else {
			return null
		}
	}
	public async deleteCOCarrierLineItemByRelayId(relayId:any):Promise<any>{
		return this.db.query(`
		update cocarrierlineitems set IsDeleted=1 where CORelay_Id = ${relayId}
		`);
	}
	
	public async getCOCarrierLineItemsByCOId(coId: number): Promise<any> {
		return this.databaseget.query(`
		    CALL getCOCarrierlineitemsByCOId_snew (
			    ${coId}
			)`
		);
	}
	
	public async getCOCarrierLineItemsByRelayId(relayId: number): Promise<any> {
		return this.databaseget.query(`
            CALL getCOCarrierlineitemsByRelayId_snew (
                ${relayId}
			)`
		);
	}
} 

export default COCarrierLineItemService;