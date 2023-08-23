import Database from '../database/database';

class CurrentLocationService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public async addCurrentLocation(req: any): Promise<any> {
		return this.db.query(`
			INSERT 
			INTO currentlocation(
				WorkOrder_Id,
                DispatchOrder_Id,
                Relay_Id,                 
				LocationAt,
				Location,
                deviceType,                 
				createdUserId,
				createdAt
			)
			VALUES(
				${req.workOrder_Id ? req.workOrder_Id : null},
                ${req.dispatchOrder_Id ? req.dispatchOrder_Id : null},
                ${req.relay_Id ? req.relay_Id : null},
                ${req.locationAt ? this.db.connection.escape(req.locationAt) : null},
				${req.location ? this.db.connection.escape(req.location) : ''},
				${req.deviceType ? this.db.connection.escape(req.deviceType) : ''},
				${req.userId ? req.userId : null}, 
				UTC_TIMESTAMP
			)
		`)
	};

	public async saveCurrentLocation(req : any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'workOrder_Id',
			'dispatchOrder_Id',
			'relay_Id',
			'locationAt',
			'location',
			'isDeleted',
			'deviceType'];
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
		if (text && req.currentLocationId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    currentlocation
                SET
                    ${text}
                WHERE
                    Id = ${req.currentLocationId}
            `);
		} else {
			return null
		}
	}

	public async getCurrentLocationbyWOId(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getCurrentLocationbyWOId_snew(
				${req.workOrder_Id},
			    ${req.dispatchOrder_Id ? req.dispatchOrder_Id : null},
			    ${req.relay_Id ? req.relay_Id : null},
			    ${req.pageSize},
			    ${req.pageIndex},
			   ${req.sortExpression ? this.databaseget.connection.escape(req.sortExpression) : null},
				${req.sortDirection ? this.databaseget.connection.escape(req.sortDirection) : null}
			);
		`)
	}
}
export default CurrentLocationService;