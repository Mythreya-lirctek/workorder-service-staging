import Database from '../database/database';

class BrokerCheckCallService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public async addBrokerCheckCall(req: any): Promise<any> {
		return this.db.query(`
			INSERT 
			INTO brokercheckcall(
				WorkOrder_Id,
				CallTime,
				CAllType,
				createdUserId,
				createdAt,
				Notes
			)
			VALUES(
				${req.workOrder_Id ? req.workOrder_Id : null}, 
				${req.callTime ? `'${req.callTime}'` : null},
				'${req.callType ? req.callType : ''}',
				${req.userId ? req.userId : null}, 
				UTC_TIMESTAMP,
				'${req.notes ? req.notes : ''}'	
			)
		`)
	};

	public async saveBrokerCheckCall(req : any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'workOrder_Id',
			'callTime',
			'callType',
			'notes',
			'isDeleted'];
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
		if (text && req.brokerCheckCallId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    brokercheckcall
                SET
                    ${text}
                WHERE
                    Id = ${req.brokerCheckCallId}
            `);
		} else {
			return null
		}
	}

	public async getBrokerCheckCallsbyWOId(woId: number): Promise<any> {
		return this.databaseget.query(`
			CALL getBrokercheckcallsbyWOId_snew(
				${woId}	
			);
		`)
	}

	public async getBrokerCheckCallexistReport(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getbrokercheckcallexistreport(
				${req.companyId},
				${req.broker_Id ? req.broker_Id : null},
				${req.woNumber ? this.db.connection.escape(req.woNumber) : null},
				${req.woRefNumber ? this.db.connection.escape(req.woRefNumber) : null},
				${req.fromDate ? this.db.connection.escape(req.fromDate) : null},
				${req.toDate ? this.db.connection.escape(req.toDate) : null},
                ${req.pageSize ? req.pageSize : 50},
                ${req.pageIndex ? req.pageIndex : 0},
                ${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
                ${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}   
			);
		`)
	}

	public async getBrokerCheckCallNotexistReport(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getbrokercheckcallnotexistreport(
				${req.companyId},
				${req.broker_Id ?req.broker_Id : null},
				${req.fromDate ? this.db.connection.escape(req.fromDate) : null},
				${req.toDate ? this.db.connection.escape(req.toDate) : null},
				${req.woNumber ? this.db.connection.escape(req.woNumber) : null},
				${req.refNumber ? this.db.connection.escape(req.refNumber) : null},
                ${req.pageSize ? req.pageSize : 50},
                ${req.pageIndex ? req.pageIndex : 0},
                ${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
                ${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}   	
			);
		`)
	}
}
export default BrokerCheckCallService;