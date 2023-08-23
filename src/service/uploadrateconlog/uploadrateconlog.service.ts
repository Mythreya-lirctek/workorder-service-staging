import Database from '../database/database';

class UploadRateconLogService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	public async addUploadRateconLog(req: any): Promise<any> {
		return this.db.query(`
			INSERT
				INTO
					uploadrateconlog(
						customerName, refNumber, company_Id,
						createdAt, createdUserId, jsonResponse
					)
				VALUES(
					${req.customerName ? this.db.connection.escape(req.customerName) : null},
					${req.refNumber ? this.db.connection.escape(req.refNumber) : null },
					${req.companyId},
					UTC_TIMESTAMP,
					${req.userId ? req.userId : null},
					${req.jsonResponse ? this.db.connection.escape(req.jsonResponse) : null}
				)				
		`);
	}
	
	public async saveUploadRateconLog(req: any): Promise<any> {
		let text = '';
		const employeeFields: any = ['customerName', 'refNumber', 'company_Id','jsonResponse']
		Object.keys(req).map((key) => {
			if (employeeFields.indexOf(key) > -1) {

				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.uploadRateconLogId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
				UPDATE uploadrateconlog
				SET 
					${text}
				WHERE 
				Id = ${req.uploadRateconLogId}
			`);
		}
		else {
			return null;
		}
	}
	
	public async getUploadRateconLog(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getUploadRateconLog_snew( 
            ${req.companyId},
            ${req.fromDate ? this.db.connection.escape(req.fromDate) : null},
            ${req.toDate ? this.db.connection.escape(req.toDate) : null}, 
            ${req.pageSize ? req.pageSize : null},
			${req.pageIndex ? req.pageIndex : 0},
			${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
			${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}
			)`
		);
	}
}

export default UploadRateconLogService;