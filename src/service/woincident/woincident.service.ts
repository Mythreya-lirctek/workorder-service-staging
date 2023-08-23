import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class WOIncidentService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public async addWOIncident(req: any): Promise<any> {
		return this.db.query(`
			INSERT 
			INTO woincidents(
				WorkOrder_Id,
				IncidentDate,
				Description,
				createdUserId,
				createdAt,
				IncidentType,
				IsClosed,
				ClosedBy,
				ClosedDate,
				AssignedTo_Id,
				DueDate,
				ClosedBy_Id,
                closedNotes             
			)
			VALUES(
				${req.workOrder_Id ? req.workOrder_Id : null}, 
				${req.incidentDate ? `'${req.incidentDate}'` : null},
				'${req.description ? req.description : ''}',
				${req.userId ? req.userId : null}, 
				UTC_TIMESTAMP,
				'${req.incidentType ? req.incidentType : ''}',
				${req.isClosed},
				'${req.closedBy ? req.closedBy : ''}',
				${req.isClosed ? `UTC_TIMESTAMP` : null},
				${req.assignedTo_Id ? req.assignedTo_Id : null},
				${req.dueDate ? `'${req.dueDate}'` : null},
				${req.closedBy_Id ? req.closedBy_Id : null}	,
				${req.closedNotes ? this.db.connection.escape(req.closedNotes) : null}	       
			)
		`)
	};

	public async saveWOIncident(req : any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'workOrder_Id',
			'incidentDate',
			'description',
			'incidentType',
			'isClosed',
			'closedBy',
			'closedDate',
			'assignedTo_Id',
			'dueDate',
			'closedBy_Id',
			'closedNotes',
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
		if (text && req.woIncidentId) {
			if(req.isClosed) {
				text += ' closedDate = UTC_TIMESTAMP, ';
			}
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    woincidents
                SET
                    ${text}
                WHERE
                    Id = ${req.woIncidentId}
            `);
		} else {
			return null
		}
	}

	public async getWOincidentsReport( woincident: any): Promise<any> {
		return this.databaseget.query(`
		CALL getWOincidentsReport_snew(
			${woincident.companyId},
			${woincident.woNumber ? this.db.connection.escape(woincident.woNumber) : null},
			${woincident.assignedToid ? woincident.assignedToid : null},
			${woincident.createdBy ? woincident.createdBy : null},
			${woincident.isclosed},
			${woincident.closedByid ? woincident.closedByid : null},
			${woincident.fromDate ? this.db.connection.escape(woincident.fromDate) : null},
			${woincident.toDate ? this.db.connection.escape(woincident.toDate) : null},
			${woincident.pageSize ? woincident.pageSize : null},
			${woincident.pageIndex ? woincident.pageIndex : null},
			${woincident.sortExpression ? this.db.connection.escape(woincident.sortExpression) : null},
			${woincident.sortDirection ? this.db.connection.escape(woincident.sortDirection) : null}
		)`
		);
	};

	public async getWoIncidentsCount(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getwoincidentsCount_snew(
				${req.companyId},
				${req.woNumber ? this.db.connection.escape(req.woNumber) : null},
				${req.assignedToid ? req.assignedToid : null},
				${req.createdBy ? req.createdBy : null},
				${req.isclosed},
				${req.closedByid ? req.closedByid : null},
				${req.fromDate ? this.db.connection.escape(req.fromDate) : null},
				${req.toDate ? this.db.connection.escape(req.toDate) : null}
			)`
		);
	}

	public async getWOincidentsbyWOId(woId: number): Promise<any> {
		return this.databaseget.query(`
			CALL getWOincidentsbyWOId_snew(
				${woId}	
			);
		`)
	}
}
export default WOIncidentService;