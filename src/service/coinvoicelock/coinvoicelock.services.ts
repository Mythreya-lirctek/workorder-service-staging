import Database from '../database/database';

export default class COInvoiceLockService {
	private database: Database;
	private databaseget: Database;
	constructor() {
	this.database = new Database();
	this.databaseget = new Database(true);
	}

  public addCoInvoiceUnlock(req: any): Promise<any> {
		return this.database.query(`
			INSERT INTO coinvoiceunlock(
                Reason,
                UnlockedBy,
                createdAt,
                createdUserId,
                COInvoice_Id )
			VALUES (
				${req.reason ? this.database.connection.escape(req.reason) : null},
        ${req.unlockBy ? this.database.connection.escape(req.unlockBy) : null},
        UTC_TIMESTAMP,
        ${req.userId ? req.userId : null},
        ${req.coInvoice_Id ? req.coInvoice_Id : null}
		    )
      `);
	}

  public getUnlocksByCOInvoiceId(coInvoiceId: number): Promise<any> {
		return this.databaseget.query(`
      select
      reason,
      Date_format(convert_tz(coi.createdAt,'UTC',c.timezone),"%m/%d/%Y %h:%i %p") sentOn,
      concat(u.FirstName,' ', u.LastName) sentBy
      from coinvoiceunlock coi
      left join user u on u.Id = coi.createdUserId
      left join company c on c.Id = u.company_Id
      where coi.coinvoice_Id = ${coInvoiceId}
      order by coi.Id desc
      ;
		`);
	}
}