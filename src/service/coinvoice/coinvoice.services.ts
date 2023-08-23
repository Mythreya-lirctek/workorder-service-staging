import Database from '../database/database';

export default class COInvoiceService {
	private database: Database;
	private databaseget: Database;
	constructor() {
	this.database = new Database();
	this.databaseget = new Database(true);
	}

	public async saveCOInvoice(req: any): Promise<any> {
		let text = '';
		const driverFields: any = [
			'amount', 'notes', 'issuedDate', 'fullyPaidDesc', 'remitToAddress_Id', 'remitTo', 'isQuickPay', 'quickPayAmount', 'quickPayPCT', 'customer_Id', 'internalNotes', 'creditedAmount', 'debitedAmount', 'description_Id', 'factor_Id','readyToBill'];
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
		if (text && req.coInvoiceId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    coinvoice
                SET
                    ${text}
                WHERE
                    Id = ${req.coInvoiceId}
            `);
		} else if (text && req.customerOrderId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    coinvoice
                SET
                    ${text}
                WHERE
				customerOrder_Id = ${req.customerOrderId}
            `);
		 } else {
			return null
		}
	}	

  public getCOInvoiceDetailsByInvId(invoiceId: any): Promise<any> {
	return this.databaseget.query(`
              CALL getCOInvoiceDetailsByInvId_snew(
                ${invoiceId}
              )
            `)
	}	
	public sendEmailToCOCustomer(customerOrderId: any): Promise<any> {
		return this.databaseget.query(`
				  CALL SendEmailToCOCustomer_snew(
					${customerOrderId}
				  )
				`)
		}
	
	public getInvoiceSentLogs(coInvoiceId: number, companyId: number): Promise<any> {
		return this.databaseget.query(`
			call getInvoiceSentLogsByCoInvId_snew(${coInvoiceId},${companyId});
		`);
	}
	
	public getCOInvPrintByInvId(coInvoiceId: number): Promise<any> {
		return this.databaseget.query(`
			call getCOInvPrintByInvId_snew(${coInvoiceId});
		`);
	}
	
	
	public async addCOInvoiceLog(req: any): Promise<any> {
		return this.database.query(`
			Insert into coinvoicelog(COInvoice_Id,Emails,Documents,DeliveredOn,createdAt,createdUserId)
			values(
				${req.coInvoiceId},
				${req.emails ? this.database.connection.escape(req.emails) : null},
				${req.fileNames ? this.database.connection.escape(req.fileNames) : null},
				UTC_TIMESTAMP,
				UTC_TIMESTAMP,
				${req.userId}
			)
		`);
	}

	public async InsertFactorBatchLog(req: any): Promise<any> {
		return this.database.query(`
			CALL insertCOFactorBatchlog(
				${req.companyId}, 
				${req.factor_Id}, 
				${this.database.connection.escape(req.details)}, 
				${req.userId})
		`);
	}

	public async getFactorLogList(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getCoFactorLogList(
				${req.companyId}, 
				${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
				${req.toDate ? this.database.connection.escape(req.toDate) : null},
				${req.pageSize ? req.pageSize : 50},
				${req.pageIndex ? req.pageIndex : 0}
			)
		`);
	}
	public async getfactorbatchlogLatest(req: any): Promise<any> {
		return this.databaseget.query(`
			select date_format(convert_TZ(fl.createdat,'UTC', c.timezone),'%m/%d/%Y %h:%i %p') sentAt
			from cofactorbatchlog fl
			left join company c on c.Id = fl.company_Id
			where fl.company_Id = ${req.companyId} order by fl.createdAt desc limit 1
		`);
	}
}