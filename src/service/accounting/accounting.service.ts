import Database from '../database/database';

class AccoutingService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public async getWOUnPaidAndNotSentInvoices(request: any): Promise<any> {
		return this.databaseget.query(`
		CALL getWOUnPaidAndNotSentInvoices_snew(
			${request.companyId}, 
			${request.subCompany_Id ? request.subCompany_Id : null},
			${request.statusType ? this.db.connection.escape(request.statusType) : null},
			${request.fromDate ? this.db.connection.escape(request.fromDate) : null},
			${request.toDate ? this.db.connection.escape(request.toDate) : null},
			${request.invFromDate ? this.db.connection.escape(request.invFromDate) : null},
			${request.invToDate ? this.db.connection.escape(request.invToDate) : null},
			${request.brokerName ? this.db.connection.escape(request.brokerName) : null},
			${request.fromCity ? this.db.connection.escape(request.fromCity) : null},
			${request.toCity ? this.db.connection.escape(request.toCity) : null},
			${request.fromState ? this.db.connection.escape(request.fromState) : null},
			${request.toState ? this.db.connection.escape(request.toState) : null},
			${request.invoiceNumber ? this.db.connection.escape(request.invoiceNumber) : null},
			${request.driver_Id ? request.driver_Id : null},
			${request.truck_Id ? request.truck_Id : null},
			${request.referenceNumber ? this.db.connection.escape(request.referenceNumber) : null},
			${request.broker_Id ? request.broker_Id:null},
			${request.factor_Id ? request.factor_Id : null},
			${request.billto_Type ? this.db.connection.escape(request.billto_Type) : null},
			${request.isFactorGotPaid},
			${request.pageSize ? request.pageSize : 50},
			${request.isMainCompany ? request.isMainCompany : null},
			${request.pageIndex ? request.pageIndex : 0},
			${request.sortExpression ? this.db.connection.escape(request.sortExpression) : null},
			${request.sortDirection ? this.db.connection.escape(request.sortDirection) : null}
			)`
		);
	}
	
	public async getInvoiceDashboard(request: any): Promise<any> {
		return this.databaseget.query(`
		CALL getInvoiceDashboard_snew(
			${request.companyId},
			${request.subCompany_Id ? request.subCompany_Id : null},
			${request.fromDate ? this.db.connection.escape(request.fromDate) : null},
			${request.toDate ? this.db.connection.escape(request.toDate) : null},
			${request.invFromDate ? this.db.connection.escape(request.invFromDate) : null},
			${request.invToDate ? this.db.connection.escape(request.invToDate) : null},
			${request.brokerName ? this.db.connection.escape(request.brokerName) : null},
			${request.fromCity ? this.db.connection.escape(request.fromCity) : null},
			${request.toCity ? this.db.connection.escape(request.toCity) : null},
			${request.fromState ? this.db.connection.escape(request.fromState) : null},
			${request.toState ? this.db.connection.escape(request.toState) : null},
			${request.invoiceNumber ? this .db.connection.escape(request.invoiceNumber) : null},
			${request.driver_Id ? request.driver_Id :null},
			${request.truck_Id ? request.truck_Id : null},
			${request.isMainCompany ? request.isMainCompany : null},
			${request.refNumber ? this .db.connection.escape(request.refNumber) : null},
			${request.broker_Id ? request.broker_Id : null},
			${request.isFactorGotPaid ? request?.isFactorGotPaid : 0}
			)`
		);
	}
	
	public async getWOPendingInvoices(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getWOPendingInvoices_snew(
				${req.companyId},
				${req.fromDate ? this.db.connection.escape(req.fromDate) : null},
				${req.toDate ? this.db.connection.escape(req.toDate) : null},
				${req.fromDelDate ? this.db.connection.escape(req.fromDelDate) : null},
				${req.toDelDate ? this.db.connection.escape(req.toDelDate) : null},
				${req.brokerName ? this.db.connection.escape(req.brokerName) : null},
				${req.broker_Id ? req.broker_Id : null},
				${req.fromCity ? this.db.connection.escape(req.fromCity) : null}, 
				${req.toCity ? this.db.connection.escape(req.toCity) : null},
				${req.fromState ? this.db.connection.escape(req.fromState) : null}, 
				${req.toState ? this.db.connection.escape(req.toState) : null},
				${req.invoiceNumber ? this.db.connection.escape(req.invoiceNumber) : null},
				${req.driver_Id ? req.driver_Id : null},
				${req.truck_Id ? req.truck_Id : null},
				${req.refNumber ? this.db.connection.escape(req.refNumber) : null},
				${req.pageSize ? req.pageSize : 50},
				${req.pageIndex ? req.pageIndex : 0},
				${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
				${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}
			)`
		);
	}
	
	public async getWOPendingInvoicesGroupBy(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getWOPendingInvoicesGroupBy_snew(
				${req.companyId},
				${req.fromDate ? `'${req.fromDate}'` : null},
				${req.toDate ? `'${req.toDate}'` : null},
				${req.fromDelDate ? `'${req.fromDelDate}'` : null},
				${req.toDelDate ? `'${req.toDelDate}'` : null},
				${req.brokerName ? this.db.connection.escape(req.brokerName) : null},
				${req.fromCity ? this.db.connection.escape(req.fromCity) : null}, 
				${req.toCity ? this.db.connection.escape(req.toCity) : null},
				${req.fromState ? this.db.connection.escape(req.fromState) : null}, 
				${req.toState ? this.db.connection.escape(req.toState) : null},
				${req.invoiceNumber ? this.db.connection.escape(req.invoiceNumber) : null},
				${req.driver_Id ? req.driver_Id : null},
				${req.truck_Id ? req.truck_Id : null},
				${req.refNumber ? this.db.connection.escape(req.refNumber) : null},
				${req.pageSize ? req.pageSize : 50},
				${req.pageIndex ? req.pageIndex : 0},
				${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
				${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}
			)`
		);
	}
	
	public async getCreditedDebitedReport(req: any):
		Promise<any> {
		return this.databaseget.query(`
			CALL getCreditedDebitedReport_snew(
				${req.companyId},
				${req.subCompany_Id ? req.subCompany_Id : null},
				${req.fromDate ? `'${req.fromDate}'` : null},
				${req.toDate ? `'${req.toDate}'` : null},
				${req.brokerName ? this.db.connection.escape(req.brokerName) : null},
				${req.fromCity ? this.db.connection.escape(req.fromCity) : null}, 
				${req.toCity ? this.db.connection.escape(req.toCity) : null},
				${req.fromState ? this.db.connection.escape(req.fromState) : null}, 
				${req.toState ? this.db.connection.escape(req.toState) : null},
				${req.invoiceNumber ? this.db.connection.escape(req.invoiceNumber) : null},
				${req.pageSize ? req.pageSize : 50},
				${req.pageIndex ? req.pageIndex : 0},
				${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
				${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}
			)
		`);
	}
	
	public async getInvoicePaidReport(req: any):
		Promise<any> {			
		return this.databaseget.query(`
			CALL getInvoicePaidReport_snew(
				${req.companyId},
				${req.subCompany_Id ? req.subCompany_Id : null},
				${req.brokerName ? this.db.connection.escape(req.brokerName) : null},
				${req.paidFromDate ? `'${req.paidFromDate}'` : null},
				${req.paidToDate ? `'${req.paidToDate}'` : null},
				${req.issuedFromDate ? `'${req.issuedFromDate}'` : null},
				${req.issuedToDate ? `'${req.issuedToDate}'` : null},
				${req.invoiceNumber ? this.db.connection.escape(req.invoiceNumber) : null},
				${req.checkNumber ? this.db.connection.escape(req.checkNumber) : null},
				${req.refNumber ? this.db.connection.escape(req.refNumber) : null},
				${req.type ? this.db.connection.escape(req.type) : null},
				${req.woNumber ? this.db.connection.escape(req.woNumber) : null},
				${req.pickFromDate ? `'${req.pickFromDate}'` : null},
				${req.pickToDate ? `'${req.pickToDate}'` : null},
				${req.delFromDate ? `'${req.delFromDate}'` : null},
				${req.delToDate ? `'${req.delToDate}'` : null},
				${req.pageSize ? req.pageSize : null},
				${req.pageIndex ? req.pageIndex : 0},
				${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
				${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}
			)
		`);
	}
	
	public async getWOWeeklyInvoiceReport(req: any):
		Promise<any> {			
		return this.databaseget.query(`
			CALL getWOWeeklyInvoiceReport_snew(
				${req.companyId},
				${req.fromDate ? `'${req.fromDate}'` : null},
				${req.toDate ? `'${req.toDate}'` : null}
			)
		`);
	}
	
	public async getBrokerWiseInvoiceReport(req: any):
		Promise<any> {	
		return this.databaseget.query(`
			CALL getBrokerWiseInvoiceReport_snew(
				${req.companyId},
				${req.subCompany_Id ? req.subCompany_Id : null},
				${req.fromDate ? this.db.connection.escape(req.fromDate) : null},
				${req.toDate ? this.db.connection.escape(req.toDate) : null},
				${req.brokerName ? this.db.connection.escape(req.brokerName) : null},
				${req.fromCity ?this.db.connection.escape(req.fromCity) : null},
				${req.toCity ? this.db.connection.escape(req.toCity) : null},
				${req.fromState ? this.db.connection.escape(req.fromState) : null},
				${req.toState ? this.db.connection.escape(req.toState) : null},
				${req.broker_Id ? req.broker_Id : null},
				${req.factor_Id ? req.factor_Id : null},
				${req.billto_Type ? this.db.connection.escape(req.billto_Type) : null},
				${req.pageSize ? req.pageSize : null},
				${req.pageIndex ? req.pageIndex : 0},
				${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
				${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}
			)
		`);
	}
	
	public async getCheckPrintsByCompanyId(req: any):
		Promise<any> {
		return this.databaseget.query(`
			CALL getCheckPrintsByCompanyId_snew(
			${req.companyId},	
			${req.fromDate ? `'${req.fromDate}'`: null},
			${req.toDate ? `'${req.toDate}'` : null},
			${req.payTo ? this.db.connection.escape(req.payTo) : null},
			${req.bankAccount_Id ? req.bankAccount_Id : null},
			${req.isVoid},
			${req.checkNumber ? this.db.connection.escape(req.checkNumber) : null},
			${req.memo ? this.db.connection.escape(req.memo) : null},
			${req.type},
			${req.pageSize ? req.pageSize : 50},
			${req.pageIndex ? req.pageIndex : 0},
			${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
			${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}
			)
		`)
	}
	
	public async getWOARbyCusotmerName(req: any):
		Promise<any> {
		return this.databaseget.query(`
			CALL getWOARbyCusotmerName_snew(
			${req.companyId},
			${req.invoiceNumber ? this.db.connection.escape(req.invoiceNumber) :null},
			${req.brokerName ? this.db.connection.escape(req.brokerName) :null},
			${req.fromDate ? this.db.connection.escape(req.fromDate) :null},
			${req.toDate ? this.db.connection.escape(req.toDate) : null},
			${req.factor_Id ? req.factor_Id : null},
			${req.billto_Type ? this.db.connection.escape(req.billto_Type) : null},
			${req.pageSize ? req.pageSize : null},
			${req.pageIndex ? req.pageIndex : 0},
			${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
			${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}
			)
		`)
	}
	
	public async addWOInvoiceNotes(req : any): Promise<any> {
		return this.db.query(`
		INSERT INTO woinvoicenotes(WOInvoice_Id,Description,NotesDate,ContactPerson,MessageType,
			createdUserId,createdAt)
			VALUES(
				${req.woInvoice_Id},
				${this.db.connection.escape(req.description)},
				${this.db.connection.escape(req.notesDate)},
				${this.db.connection.escape(req.contactPerson)},
				${req.messageType ? this.db.connection.escape(req.messageType) : null},
				${req.userId ? req.userId : null},
				UTC_TIMESTAMP
			)
		`)
	}
	
	public async saveWOInvoiceNotes(req : any): Promise<any> {
		let text = '';
		const driverFields: any = [
			'woInvoice_Id','description','notesDate','contactPerson','messageType'];
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
		if (text && req.invoiceNoteId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
				woinvoicenotes
                SET
                    ${text}
                WHERE
                    Id = ${req.invoiceNoteId}
            `);
		} else {
			return null
		}
	}
	
	public async getWOInvoiceNotesById(invoiceNoteId : any): Promise<any> {
		return this.databaseget.query(`
			select
			description,
			notesDate,
			contactPerson,
			messageType
			from woinvoicenotes
			where Id = ${invoiceNoteId}
		`)
	}
	
	public async getWOInvoiceNotesByWOInvoiceId(req : any): Promise<any> {
		return this.databaseget.query(`
			select
			id,
			description,
			notesDate,
			contactPerson,
			messageType
			from woinvoicenotes
			where woinvoice_Id = ${req.woInvoice_Id}
		`)
	}
	
	public async saveCheckPrint(req : any): Promise<any> {
		let text = '';
		const stopFields: any = [
			'isDeleted'];
		Object.keys(req).map((key) => {
			if (stopFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
					checkprint
                SET
                    ${text}
                WHERE
                   id = ${req.checkPrintId}
            `);
		} else {
			return null
		}
	}
	
	public async getCheckPrintDetailsByCheckPrintId(checkPrintId: any):
		Promise<any> {
		return this.databaseget.query(`
			CALL getCheckPrintDetailsByCheckPrintId_snew(
			${checkPrintId}
			)
		`)
	}

	public async getBrokerDetailsReport(req: any):
		Promise<any> {
		return this.databaseget.query(`
			CALL getBrokerDetailsReport_snew(
				${req.companyId} , 
				${req.fromDate ? this.db.connection.escape(req.fromDate) : null} ,
				${req.toDate ? this.db.connection.escape(req.toDate) : null} , 
				${req.type ? this.db.connection.escape(req.type) : null} ,
				${req.brokerId ? req.brokerId : null}) 
		`)
	}
	
	public async getProfitAndLossReport(req: any):
		Promise<any> {
		return this.databaseget.query(`
			CALL getProfitAndLossReport_snew(
				${req.companyId} , 
				${req.subCompany_Id ? req.subCompany_Id : null},
				${req.fromDate ? this.db.connection.escape(req.fromDate) : null},
				${req.toDate ? this.db.connection.escape(req.toDate) : null}, 
				${req.type ? this.db.connection.escape(req.type) : null}
			)
		`)
	}

	public async getdetailsByInvoiceNumbers(req: any):
		Promise<any> {
		return this.databaseget.query(`
			CALL getdetailsByInvoiceNumbers(
				${req.companyId} , 
				${req.invoiceNumbers ? this.db.connection.escape(req.invoiceNumbers) : null},
				${req.refNumbers ? this.db.connection.escape(req.refNumbers) : null}
			)
		`)
	}
}
export default AccoutingService;