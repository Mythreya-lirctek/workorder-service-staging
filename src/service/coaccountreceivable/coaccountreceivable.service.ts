import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

export default class COAccountReceivableService {
	private database: Database;
	private databaseget: Database;
	constructor() {
		this.database = new Database();
		this.databaseget = new Database(true);
	}
	
	public async addCOAccountReceivable(req : any): Promise<any> {
		return this.database.query(`
		INSERT INTO coaccountreceivable(COInvoice_Id,PaymentType,CheckNumber,Amount,createdUserId,
			createdAt,PaidDate,InvoiceNumber,CreditedAmount,DebitedAmount,BankAccount_Id,CurrencyName)
			VALUES(
				${req.coInvoice_Id},
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
	
	public async saveCOAccountReceivable(req: any): Promise<any> {
		let text = '';
		const driverFields: any = [
			'coInvoice_Id', 'paymentType', 'checkNumber', 'amount', 'paidDate', 'invoiceNumber', 'creditedAmount', 'debitedAmount', 'bankAccount_Id', 'currencyName','isDeleted'];
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
		if (text && req.coAccountReceivableId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    coaccountreceivable
                SET
                    ${text}
                WHERE
                    Id = ${req.coAccountReceivableId}
            `);
		} else {
			return null
		}
	}
	
	
	public getAccountReceivablesByCOInvoiceId(coInvoiceId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL getAccountReceivablesByCOInvoiceId_snew(${coInvoiceId}
			);
		`);
	}
}