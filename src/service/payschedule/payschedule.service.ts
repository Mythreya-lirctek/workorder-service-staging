import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class PayScheduleService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public addPaySchedule(req: any): Promise<any> {
		return this.db.query(`
			INSERT INTO payschedule(
				PayScheduleCHId,
                Module,
                Module_Id,
                CheckHQId,
				createdat,
				createduserId                
			)
			VALUES (
				${this.db.connection.escape(req.payScheduleCHId)},
				${this.db.connection.escape(req.module)},
				${req.module_Id},
				${this.db.connection.escape(req.checkHQId)},
				UTC_TIMESTAMP,
				${req.userId}
			)
		`);
	}
	
	public async savePaySchedule(req : any): Promise<any> {
		let text = '';
		const reqFields: any = [
			'payScheduleCHId', 'module','module_Id', 'checkHQId', 'isDeleted'];
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
		if (text && req.payScheduleId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    payschedule
                SET
                    ${text}
                WHERE
                    Id = ${req.payScheduleId}
            `);
		} else {
			return null
		}
	}
	
	public async getPaySchedulebyId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getPaySchedulebyId_snew(${this.db.connection.escape(req.payScheduleId)})`
		);
	}
	
	public async getPayScheduleDetails(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getPayScheduleDetails_snew(${this.db.connection.escape(req.payScheduleCHId)},
                                        ${this.db.connection.escape(req.fromDate)},
                                        ${this.db.connection.escape(req.toDate)})`
		);
	}
	
} 

export default PayScheduleService;