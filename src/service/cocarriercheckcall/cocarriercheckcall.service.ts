import Database from '../database/database';

class COCarrierCheckCallService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public async addCOCarrierCheckCall(req: any): Promise<any> {
		return this.db.query(`
			INSERT 
			INTO cocarriercheckcalllog(
				CAllType,
				CallTime,
				Notes,
				createdUserId,
				createdAt,
				Customerorder_Id
			)
			VALUES(
				${req.callType ? this.db.connection.escape(req.callType) : null},
				${req.callTime ? this.db.connection.escape(req.callTime) : null},
				${req.notes ? this.db.connection.escape(req.notes) : null},	
				${req.userId ? req.userId : null}, 
				UTC_TIMESTAMP,
				${req.customerOrder_Id ? req.customerOrder_Id : null}
			)
		`)
	};

	public async saveCOCarrierCheckCall(req : any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'callType',
			'callTime',
			'notes',
			'customerOrder_Id',
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
		if (text && req.coCarrierCheckCallId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
				cocarriercheckcalllog
                SET
                    ${text}
                WHERE
                    Id = ${req.coCarrierCheckCallId}
            `);
		} else {
			return null
		}
	}

	public getCOCarrierCheckcalls(req:any):Promise<any>{
		return this.databaseget.query(`
		select c.id,
		c.callType,
        date_format(c.CallTime, "%m/%d/%Y %H:%i") callTime,
        c.notes,
        c.customerorder_Id as customerOrder_Id,
        date_format(convert_tz(c.createdAt,'UTC',com.timezone), "%m/%d/%Y %H:%i") addedOn,
        concat(u.FirstName,' ', u.LastName) addedBy
        from cocarriercheckcalllog c
        left join user u on u.Id = c.createdUserId
        left join company com on com.Id = u.company_Id
       	where c.Customerorder_Id = ${req.customerOrder_Id}
         order by c.Id desc;
		`)
	}
}
export default COCarrierCheckCallService;