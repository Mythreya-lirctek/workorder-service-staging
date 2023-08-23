import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class WOInvoiceService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public async saveWOInvoice(req: any): Promise<any> {
		let text = '';
		const driverFields: any = [
			'amount', 'notes', 'issuedDate', 'fullyPaidDesc', 'remitToAddress_Id', 'remitTo', 
			'isQuickPay', 'quickPayAmount', 'quickPayPCT','broker_Id', 'internalNotes', 
			'creditedAmount', 'debitedAmount', 'qbRefId', 'description_Id', 'factor_Id',
			 'readyToBill', 'quickBookLastSyncedAt', 'quickBookError','isFactorGotPaid', 'factorReceivedDate', 'factorReceivedAmount'];
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
		if (text && req.woInvoiceId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    woinvoice
                SET
                    ${text}
                WHERE
                    Id = ${req.woInvoiceId}
            `);
		} else if (text && req.workOrderId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    woinvoice
                SET
                    ${text}
                WHERE
				workOrder_Id = ${req.workOrderId}
            `);
		 } else {
			return null
		}
	}	
	
	public SendEmailToCustomer(workOrderId: number): Promise<DatabaseResponse> {
		return this.db.query(`
			CALL SendEmailToCustomer_snew(${workOrderId}
			);
		`);
	}
	
	public getWOInvPrintByInvId(woInvoiceId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL getWOInvPrintByInvId_snew(${woInvoiceId}
			);
		`);
	}
	
	public getWOInvoiceDetailsByInvId(woInvoiceId: number): Promise<any> {
		return this.databaseget.query(`
			call getWOInvoiceDetailsByInvId_snew(${woInvoiceId})
		`);
	}
	
	public getInvoiceSentLogs(woInvoiceId: number, companyId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			call getInvoiceSentLogsByWOInvId_snew(${woInvoiceId},${companyId});
		`);
	}

	public async updateDOandRelayStatusbyWOId(workOrderId: number,status:number): Promise<any> {
		return this.db.query(`
			CALL updateDOandRelayStatusbyWOId(
				${workOrderId},
				${status}
			);
		`);
	}
	
	public async addWOInvoiceLog(req: any): Promise<any> {
		return this.db.query(`
			Insert into woinvoicelog(WOInvoice_Id,Emails,Documents,IsMerged,DeliveredOn,createdAt,createdUserId)
			values(
				${req.woInvoiceId},
				${req.emails ? this.db.connection.escape(req.emails) : null},
				${req.fileNames ? this.db.connection.escape(req.fileNames) : null},
                ${req.isMerged ? req.isMerged : null},   
				UTC_TIMESTAMP,
				UTC_TIMESTAMP,
				${req.userId}
			)
		`);
	}

	public async getfactorbatchlogLatest(req: any): Promise<any> {
		return this.databaseget.query(`
			select date_format(convert_TZ(fl.createdat,'UTC', c.timezone),'%m/%d/%Y %h:%i %p') sentAt
			from factorbatchlog fl
			left join company c on c.Id = fl.company_Id
			where fl.company_Id = ${req.companyId} order by fl.createdAt desc limit 1
		`);
	}

	public async InsertFactorBatchLog(req: any): Promise<any> {
		return this.db.query(`
			CALL insertFactorBatchLog_snew(
				${req.companyId}, 
				${req.factor_Id}, 
				${this.db.connection.escape(req.details)}, 
				${req.userId})
		`);
	}

	public async getFactorLogList(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getFactorLogList_snew(
				${req.companyId}, 
				${req.fromDate ? this.db.connection.escape(req.fromDate) : null},
				${req.toDate ? this.db.connection.escape(req.toDate) : null},
				${req.pageSize ? req.pageSize : 50},
				${req.pageIndex ? req.pageIndex : 0}
			)
		`);
	}	public async getInvoiceToSyncToQuickBook(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getWOInvoiceInfobyDate_snew(
				${req.companyId}, 
				${req.fromDate ? this.db.connection.escape(req.fromDate) : null},
				${req.toDate ? this.db.connection.escape(req.toDate) : null},
				${req.pageSize ? req.pageSize : 50},
				${req.pageIndex ? req.pageIndex : 0}
			)
		`);
	}
} 

export default WOInvoiceService;