import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class RateDetailService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public addRateDetail(rateDetail: any): Promise<any> {
		return this.db.query(`
			INSERT INTO ratedetails (
				WorkOrder_Id,
				Description_Id,
				Units,
				PER,
				Amount,
				createdAt,
				createdUserId,
				notes
			) VALUES (
				${rateDetail.workOrder_Id},
				${rateDetail.description_Id},
				${rateDetail.units},
				${rateDetail.per},
				${rateDetail.amount},
				UTC_TIMESTAMP,
				${rateDetail.userId},
				${rateDetail.notes ? this.db.connection.escape(rateDetail.notes) : null}
			)
		`);
	}
	
	public async saveRateDetail(req : any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'workOrder_Id', 'description_Id', 'units', 'per', 'amount', 'notes', 'isDeleted'];
		Object.keys(req).map((key) => {
			if (lineFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.rateDetailId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
					ratedetails
                SET
                    ${text}
                WHERE
                    Id = ${req.rateDetailId}
            `);
		} else {
			return null
		}
	}
  
	public getRateDetailsByWOId(workOrderId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL getRateDetailsByWOId_snew(${workOrderId}
			);
		`);
	}
	
	public updateWOInvoiceamount(workOrderId: any): Promise<DatabaseResponse> {
		return this.db.query(`
			CALL updateWOInvoiceamount_snew(${workOrderId}
			);
		`);
	}

} 

export default RateDetailService;