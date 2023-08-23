import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

export default class WOInvoiceUnlockService {
	private database: Database;
	private databaseget: Database;
	constructor() {
		this.database = new Database();
		this.databaseget = new Database(true);
	}
	
	public async addWOInvoiceUnlock(req : any): Promise<any> {
		return this.database.query(`
		INSERT INTO woinvoiceunlock(WOInvoice_Id,Reason,createdUserId,
			createdAt)
			VALUES(
				${req.woInvoice_Id},
				${req.reason ? this.database.connection.escape(req.reason) : null},
                ${req.userId },
                UTC_TIMESTAMP
			)
		`)
	}
	
	public async saveWOInvoiceUnlock(req: any): Promise<any> {
		let text = '';
		const driverFields: any = [
			'woInvoice_Id', 'reason'];
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
		if (text && req.woInvoiceUnlockId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    woinvoiceunlock
                SET
                    ${text}
                WHERE
                    Id = ${req.woInvoiceUnlockId}
            `);
		} else {
			return null
		}
	}
	
	
	public getUnlocksByWOInvoiceId(woInvoiceId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
            select
            reason,
            Date_format(convert_tz(woi.createdAt,'UTC',c.timezone),"%m/%d/%Y %h:%i %p") sentOn,
			concat(u.FirstName,' ', u.LastName) sentBy
			from woinvoiceunlock woi
			left join user u on u.Id = woi.createdUserId
			left join company c on c.Id = u.company_Id
			where woi.Woinvoice_Id = ${woInvoiceId}
			order by woi.Id desc
			;
		`);
	}
}