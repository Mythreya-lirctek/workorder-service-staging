import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

export default class WOAccountReceivableService {
	private database: Database;
	private databaseget: Database;
	constructor() {
		this.database = new Database();
		this.databaseget = new Database(true);
	}
	
	public async addWOAccountReceivable(req : any): Promise<any> {
		return this.database.query(`
		INSERT INTO woaccountreceivable(WOInvoice_Id,PaymentType,CheckNumber,Amount,createdUserId,
			createdAt,PaidDate,InvoiceNumber,CreditedAmount,DebitedAmount,BankAccount_Id,CurrencyName)
			VALUES(
				${req.woInvoice_Id},
				${req.paymentType ? this.database.connection.escape(req.paymentType) : null},
				${req.checkNumber ? this.database.connection.escape(req.checkNumber) : null},
				${req.amount},
                ${req.userId },
                UTC_TIMESTAMP,
				${req.paidDate ? this.database.connection.escape(req.paidDate) : null},
				${req.invoiceNumber ? this.database.connection.escape(req.invoiceNumber) : null},
				${req.creditedAmount ? req.creditedAmount : 0},
				${req.debitedAmount ? req.debitedAmount : 0},
                ${req.bankAccount_Id ? req.bankAccount_Id : null},
                ${req.currencyName ? this.database.connection.escape(req.currencyName) : null}
			)
		`)
	}
	
	public async saveWOAccountReceivable(req: any): Promise<any> {
		let text = '';
		const driverFields: any = [
			'woInvoice_Id', 'paymentType', 'checkNumber', 'amount', 'paidDate', 'invoiceNumber', 'creditedAmount', 'debitedAmount', 'bankAccount_Id', 'currencyName', 'isDeleted'];
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
		if (text && req.woAccountReceivableId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    woaccountreceivable
                SET
                    ${text}
                WHERE
                    Id = ${req.woAccountReceivableId}
            `);
		} else {
			return null
		}
	}
	
	
	public getAccountReceivablesByWOInvoiceId(woInvoiceId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL getAccountReceivablesByWOInvoiceId_snew(${woInvoiceId}
			);
		`);
	}
}