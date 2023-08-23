import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class COInvoiceService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public async saveCOInvoice(req: any): Promise<any> {
		let text = '';
		const driverFields: any = [
			'amount', 'notes', 'issuedDate', 'fullyPaidDesc', 'remitToAddress_Id', 'remitTo', 'isQuickPay', 'quickPayAmount', 'broker_Id', 'internalNotes', 'creditedAmount', 'debitedAmount', 'qbRefId', 'description_Id', 'factor_Id','readyToBill'];
		Object.keys(req).map((key) => {
			if (driverFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.coInvoiceId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    coinvoice
                SET
                    ${text}
                WHERE
                    Id = ${req.coInvoiceId}
            `);
		} else if (text && req.workOrderId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    coinvoice
                SET
                    ${text}
                WHERE
				workOrder_Id = ${req.workOrderId}
            `);
		 } else {
			return null
		}
	}	
	
	public async addCOInvoiceLog(req: any): Promise<any> {
		return this.db.query(`
			Insert into coinvoicelog(COInvoice_Id,Emails,Documents,DeliveredOn,createdAt,createdUserId)
			values(
				${req.coInvoiceId},
				${req.emails ? this.db.connection.escape(req.emails) : null},
				${req.fileNames ? this.db.connection.escape(req.fileNames) : null},
				UTC_TIMESTAMP,
				UTC_TIMESTAMP,
				${req.userId}
			)
		`);
	}
	
	public async updateCORelayStatusbyCOId(customerOrderId: number): Promise<any> {
		return this.db.query(`
			update corelay set status_Id = 11 where customerorder_Id = ${customerOrderId} and isdeleted = 0
		`);
	}
} 

export default COInvoiceService;