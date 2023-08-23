import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

export default class WorkorderService {
	private database: Database;
	private databaseget: Database;
	constructor() {
		this.database = new Database();
		this.databaseget = new Database(true);
	}

	public getScheduleNotesByTruckId(truckId: number): Promise<any> {
		return this.databaseget.query(`
			CALL getScheduleNotesByTruckId_snew(
				${truckId}	
			);
		`)
	}

	public addSchedulePlanningNotes(req: any): Promise<any> {
		return this.database.query(`
        INSERT INTO scheduleplanningnotes(
            company_Id,
            truck_Id,
            driver_Id,
            city,
            State,
            scheduleDate,
            createdAt,
            createdUserId,
            Notes
        )
        VALUES (
            ${req.companyId},
            ${req.truck_Id},
            ${req.driver_Id ? req?.driver_Id : null},
            ${req.city ? this.database.connection.escape(req.city) :null},
            ${req.state ? this.database.connection.escape(req.state) : null},
            ${req.scheduleDate ? this.database.connection.escape(req.scheduleDate) : null},
            UTC_TIMESTAMP,
            ${req.userId},
            ${req.notes ? this.database.connection.escape(req.notes) : null}
        )
		`)
	}
	
	public async saveSchedulePlanningNotes(req: any): Promise<any> {
		let text = '';
		const driverFields: any = [
			'company_Id', 'truck_Id', 'driver_Id', 'city', 'state', 'scheduleDate', 'notes'];
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
		if (text && req.schedulePlanningNotesId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    scheduleplanningnotes
                SET
                    ${text}
                WHERE
                    Id = ${req.schedulePlanningNotesId}
            `);
		} else {
			return null
		}
	}	
	
}
