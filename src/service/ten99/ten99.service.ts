import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class Ten99Service {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public addTen99(req: any): Promise<any> {
		return this.db.query(`
			INSERT INTO ten99history(
				Type,
				Type_Id,
				Year,
				createdAt,
				createdUserId,
				PayersName,
				PayersAddress_Id,
				DispatchFee,
				GrossAmount,
				IsDeductDispatchfee,
				RecepientsName,
				RecepientsAddress_Id,
				RecepientsTIN,
				PayersTIN,
				TotalAmount,
				Company_Id,
				PayersStateTaxId
			)
			VALUES (
				${req.type ? this.db.connection.escape(req.type) : null},
				${req.type_Id},
				${req.year ?  this.db.connection.escape(req.year) : null},
                UTC_TIMESTAMP,
				${req.userId},
				${req.payersName ? this.db.connection.escape(req.payersName) : null},
				${req.payersAddress_Id ? req.payersAddress_Id : null},
				${req.dispatchFee ? req.dispatchFee : null},
				${req.grossAmount ? req.grossAmount : null},
				${req.isDeductDispatchfee},
				${req.recepientsName ? this.db.connection.escape(req.recepientsName) :  null},
				${req.recepientsAddress_Id ? (req.recepientsAddress_Id) : null},
				${req.recepientsTIN ? this.db.connection.escape(req.recepientsTIN) : null},
				${req.payersTIN ? this.db.connection.escape(req.payersTIN) : null},
				${req.totalAmount ? req.totalAmount : null},
				${req.companyId},
				${req.payersStateTaxId ? this.db.connection.escape(req.payersStateTaxId) : null}
			)
		`);
	}
	
	public async saveTen99(req : any): Promise<any> {
		let text = '';
		const reqFields: any = [
			'type', 'type_Id', 'year', 'payersName', 'payersAddress_Id', 'dispatchFee', 'grossAmount', 'isDeductDispatchfee', 'recepientsName', 'recepientsAddress_Id', 'recepientsTIN', 'payersTIN', 'totalAmount', 'payersStateTaxId','isDeleted'];
		Object.keys(req).map((key) => {
			if (reqFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.ten99Id) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                ten99history
                SET
                    ${text}
                WHERE
                    Id = ${req.ten99Id}
            `);
		} else {
			return null
		}
	}
  
	public get1099HistoryNotCreated(req: any): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL get1099HistoryNotCreated_snew(${req.companyId} ,${this.db.connection.escape(req.type)},${req.year},${req.pageSize},${req.pageIndex},${this.db.connection.escape(req.sortExpression)},${this.db.connection.escape(req.sortDirection)}
			);
		`);
	}
	
	public get1099Summary(req: any): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL get1099Summary_snew(${req.companyId},${this.db.connection.escape(req.type)},${req.type_Id},${req.year}
			);
		`);
	}
	
	public get1099History(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL get1099History_snew(
			${req.companyId}, 
			${req.id ? req.id : null},
			${req.type ? this.db.connection.escape(req.type) : null},
			${req.type_Id ? req.type_Id : null},
			${req.year ? req.year : null},
			${req.isBrokerage ? req.isBrokerage : null},
			${req.isDeleted},
			${req.pageSize ? req.pageSize : 50},
			${req.pageIndex ? req.pageIndex : 0},
			${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
			${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}
			);
		`);
	}
	
	public get1099Details(req: any): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL get1099Details_snew(${this.db.connection.escape(req.type)},${req.type_Id},${this.db.connection.escape(req.fromDate)} ,${this.db.connection.escape(req.toDate)}
			);
		`);
	}
} 

export default Ten99Service;