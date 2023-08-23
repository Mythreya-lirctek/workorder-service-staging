import Database from '../database/database';

export default class COAccountingService {
	private database: Database;
	private databaseget: Database;
	constructor() {
	this.database = new Database();
	this.databaseget = new Database(true);
	}

  public getCOBrokerWiseInvoiceReport(req: any): Promise<any> {
	  return this.databaseget.query(`
          CALL getCOBrokerWiseInvoiceReport_snew(
            ${req.companyId},
            ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
            ${req.toDate ? this.database.connection.escape(req.toDate) : null},  
            ${req.brokerName ? this.database.connection.escape(req.brokerName) : null},
            ${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
            ${req.toCity ? this.database.connection.escape(req.toCity) : null},
            ${req.fromState ? this.database.connection.escape(req.fromState) : null},
            ${req.toState ? this.database.connection.escape(req.toState) : null},
            ${req.customerOrderNumber ? this.database.connection.escape(req.customerOrderNumber) : null},
            ${req.pageSize ? req.pageSize : 50},
            ${req.pageIndex ? req.pageIndex : 0},
            ${this.database.connection.escape(req.sortExpression) },
            ${this.database.connection.escape(req.sortDirection) }
          )
        `)
  }

  public getCOCustoumerDetailsReport(req: any): Promise<any> {
	  return this.databaseget.query(`
              CALL getCOcustumerDetailsReport_snew(
                ${req.companyId},
                ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
                ${req.toDate ? this.database.connection.escape(req.toDate) : null}, 
                ${req.type ? this.database.connection.escape(req.type) : null},
                ${req.customer_Id ? req.customer_Id : null}
              )
            `)
	}
  
  public async getCOInvoiceNotesByCOInvoiceId(coInvoiceId : any): Promise<any> {
		return this.databaseget.query(`
    select
            id,
            description,
            notesDate,
            contactPerson,
            messageType
            from coinvoicenotes
            where coinvoice_Id = ${coInvoiceId}
    `)
	}

  public getCOInvoiceNotesReport(req: any): Promise<any> {
	  return this.databaseget.query(`
          CALL getCOInvoiceNotesReport_snew(
            ${req.companyId},
            ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
            ${req.toDate ? this.database.connection.escape(req.toDate) : null},  
            ${req.brokerName ? this.database.connection.escape(req.brokerName) : null},
            ${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
            ${req.toCity ? this.database.connection.escape(req.toCity) : null},
            ${req.fromState ? this.database.connection.escape(req.fromState) : null},
            ${req.toState ? this.database.connection.escape(req.toState) : null},
            ${req.invoiceNum ? this.database.connection.escape(req.invoiceNum) : null},
            ${req.customerOrderNumber ? this.database.connection.escape(req.customerOrderNumber) : null},
            ${req.pageSize ? req.pageSize : 50},
            ${req.pageIndex ? req.pageIndex : 0},
            ${this.database.connection.escape(req.sortExpression) },
            ${this.database.connection.escape(req.sortDirection) }
          )
        `)
	}
  
  public getCOInvoiceDashboard(req: any): Promise<any> {
	  return this.databaseget.query(`
            CALL getCOInvoiceDashboard_snew(
              ${req.companyId},
              ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
              ${req.toDate ? this.database.connection.escape(req.toDate) : null},
              ${req.invFromDate ? this.database.connection.escape(req.invFromDate) : null},
              ${req.invToDate ? this.database.connection.escape(req.invToDate) : null},   
              ${req.customerName ? this.database.connection.escape(req.customerName) : null},
              ${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
              ${req.toCity ? this.database.connection.escape(req.toCity) : null},
              ${req.fromState ? this.database.connection.escape(req.fromState) : null},
              ${req.toState ? this.database.connection.escape(req.toState) : null},
              ${req.carrier_Id ? req.carrier_Id : null},
              ${req.invoiceNum ? this.database.connection.escape(req.invoiceNum) : null}, 
              ${req.referenceNumber ? this.database.connection.escape(req.referenceNumber) : null}
              )
          `)
  }

  public getCOARbyCusotmerName(req: any): Promise<any> {
	  return this.databaseget.query(`
            CALL getCOARByCustomerName_snew(
              ${req.companyId},
              ${this.database.connection.escape(req.invoiceNumber)},
              ${req.customerName ? this.database.connection.escape(req.customerName) : null},
              ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
              ${req.toDate ? this.database.connection.escape(req.toDate) : null},
              ${req.factor_Id ? req.factor_Id :null},
              ${req.pageSize ? req.pageSize : 50},
              ${req.pageIndex ? req.pageIndex : 0},
              ${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
              ${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}   
            )
          `)
  }

  public getCOInvoicePaidReport(req: any): Promise<any> {
	return this.databaseget.query(`
            CALL getCOInvoicePaidReport_snew(
              ${req.companyId},
              ${req.customerName ? this.database.connection.escape(req.customerName) : null},
              ${req.paidFromDate ? this.database.connection.escape(req.paidFromDate) : null},
              ${req.paidToDate ? this.database.connection.escape(req.paidToDate) : null},
              ${req.issuedFromDate ? this.database.connection.escape(req.issuedFromDate) : null},
              ${req.issuedToDate ? this.database.connection.escape(req.issuedToDate) : null},
              ${req.invoiceNumber ? this.database.connection.escape(req.invoiceNumber) : null},
              ${req.checkNumber ? this.database.connection.escape(req.checkNumber) : null},
              ${req.refNumber ? this.database.connection.escape(req.refNumber) : null},
              ${req.type ? this.database.connection.escape(req.type) : null},
              ${req.coNum ? this.database.connection.escape(req.coNum) : null},
              ${req.pageSize ? req.pageSize : 50},
              ${req.pageIndex ? req.pageIndex : 0},
              ${this.database.connection.escape(req.sortExpression) },
              ${this.database.connection.escape(req.sortDirection) }
            )
          `)
	}
  
  public getCOUnPaidAndNotSentInvoices(req: any): Promise<any> {
	return this.databaseget.query(`
          CALL getCOUnPaidAndNotSentInvoices_snew(
            ${req.companyId},
            ${this.database.connection.escape(req.status)},
            ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
            ${req.toDate ? this.database.connection.escape(req.toDate) : null},
            ${req.invFromDate ? this.database.connection.escape(req.invFromDate) : null},
			${req.invToDate ? this.database.connection.escape(req.invToDate) : null},  
            ${req.brokerName ? this.database.connection.escape(req.brokerName) : null},
            ${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
            ${req.toCity ? this.database.connection.escape(req.toCity) : null},
            ${req.fromState ? this.database.connection.escape(req.fromState) : null},
            ${req.toState ? this.database.connection.escape(req.toState) : null},
            ${req.invoiceNum ? this.database.connection.escape(req.invoiceNum) : null},
            ${req.customerOrderNumber ? this.database.connection.escape(req.customerOrderNumber) : null},
            ${req.carrier_Id ? req.carrier_Id : null},
			${req.referenceNumber ? this.database.connection.escape(req.referenceNumber) : null},
			${req.broker_Id ? req.broker_Id:null},
			${req.factor_Id ? req.factor_Id : null},
			${req.billto_Type ? this.database.connection.escape(req.billto_Type) : null},
            ${req.pageSize ? req.pageSize : 50},
            ${req.pageIndex ? req.pageIndex : 0},
            ${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
            ${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}     
          )
        `)
	}

  public async addCOInvoiceNotes(req : any): Promise<any> {
		return this.database.query(`
		INSERT INTO coinvoicenotes(COInvoice_Id,Description,ContactPerson,MessageType,NotesDate,
			createdAt,createdUserId)
			VALUES(
				${req.coInvoice_Id},
				${this.database.connection.escape(req.description)},
				${this.database.connection.escape(req.contactPerson)},
				${req.messageType ? this.database.connection.escape(req.messageType) : null},
        ${this.database.connection.escape(req.notesDate)},
        UTC_TIMESTAMP,
				${req.userId ? req.userId : null}
			)
		`)
	}

  public async saveCOInvoiceNotes(req : any): Promise<any> {
		let text = '';
		const invoiceFields: any = [
			'coInvoice_Id','description','contactPerson','messageType','notesDate'];
		Object.keys(req).map((key) => {
			if (invoiceFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.database.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.coInvoiceNotesId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
				        coinvoicenotes
                SET
                ${text}
                WHERE
                    Id = ${req.coInvoiceNotesId}
            `);
		} else {
			return null
		}
	}

  public async getCOInvoiceNotesById(invoiceNoteId : any): Promise<any> {
		return this.databaseget.query(`
			select
			description,
			notesDate,
			contactPerson,
			messageType
			from coinvoicenotes
			where Id = ${invoiceNoteId}
		`)
	}

  public async getCOPendingInvoices(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getCoPendingInvoices_snew(
				${req.companyId},
        ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
        ${req.toDate ? this.database.connection.escape(req.toDate) : null},
        ${req.delFromDate ? this.database.connection.escape(req.delFromDate) : null},
        ${req.delToDate ? this.database.connection.escape(req.delToDate) : null},    
        ${req.customerName ? this.database.connection.escape(req.customerName) : null},
        ${req.customer_Id ? req.customer_Id : null}, 
        ${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
        ${req.toCity ? this.database.connection.escape(req.toCity) : null},
        ${req.fromState ? this.database.connection.escape(req.fromState) : null},
        ${req.toState ? this.database.connection.escape(req.toState) : null},
        ${req.invoiceNum ? this.database.connection.escape(req.invoiceNum) : null},
        ${req.carrier_Id ? req.carrier_Id : null}, 
        ${req.referenceNumber ? this.database.connection.escape(req.referenceNumber) : null},
        ${req.pageSize ? req.pageSize : 50},
        ${req.pageIndex ? req.pageIndex : 0},
        ${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
        ${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)`
		);
	}

  public async getCOPendingInvoicesGroupBy(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getCoPendingInvoicesGroupBy_snew(
				${req.companyId},
        ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
        ${req.toDate ? this.database.connection.escape(req.toDate) : null},
        ${req.delFromDate ? this.database.connection.escape(req.delFromDate) : null},
        ${req.delToDate ? this.database.connection.escape(req.delToDate) : null},    
        ${req.customerName ? this.database.connection.escape(req.customerName) : null},
        ${req.customer_Id ? req.customer_Id : null}, 
        ${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
        ${req.toCity ? this.database.connection.escape(req.toCity) : null},
        ${req.fromState ? this.database.connection.escape(req.fromState) : null},
        ${req.toState ? this.database.connection.escape(req.toState) : null},
        ${req.invoiceNum ? this.database.connection.escape(req.invoiceNum) : null},
        ${req.carrier_Id ? req.carrier_Id : null}, 
        ${req.referenceNumber ? this.database.connection.escape(req.referenceNumber) : null},
        ${req.pageSize ? req.pageSize : 50},
        ${req.pageIndex ? req.pageIndex : 0},
        ${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
        ${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)`
		);
	}

  public async getCOCreditedDebitedReport(req: any):
		Promise<any> {
		return this.databaseget.query(`
			CALL getCOCreditedDebitedReport_snew(
				${req.companyId},
				${req.fromDate ? `'${req.fromDate}'` : null},
				${req.toDate ? `'${req.toDate}'` : null},
				${req.brokerName ? this.database.connection.escape(req.brokerName) : null},
				${req.fromCity ? this.database.connection.escape(req.fromCity) : null}, 
				${req.toCity ? this.database.connection.escape(req.toCity) : null},
				${req.fromState ? this.database.connection.escape(req.fromState) : null}, 
				${req.toState ? this.database.connection.escape(req.toState) : null},
				${req.invoiceNumber ? this.database.connection.escape(req.invoiceNumber) : null},
				${req.pageSize ? req.pageSize : 50},
				${req.pageIndex ? req.pageIndex : 0},
				${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
				${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)
		`);
	}

  public async getCOWeeklyInvoiceReport(req: any):
		Promise<any> {			
		return this.databaseget.query(`
			CALL getCOWeeklyInvoiceReport_snew(
				${req.companyId},
				${req.fromDate ? `'${req.fromDate}'` : null},
				${req.toDate ? `'${req.toDate}'` : null}
			)
		`);
	}
}