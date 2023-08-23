import Database from '../database/database';

class WOStopNotesService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public async addWOStopNotes(req: any): Promise<any> {
		return this.db.query(`
			INSERT 
			INTO wostopnotes(
				WOStops_Id,
				Description,
				NotesDateTime,
				createdUserId,
				createdAt,
				DOStop_Id,
				FileURL
			)
			VALUES(
				${req.woStops_Id ? req.woStops_Id : null}, 
				${req.description ? this.db.connection.escape(req.description) : null},
                ${req.notesDateTime ? this.db.connection.escape(req.notesDateTime) : null},
				${req.userId ? req.userId : null}, 
				UTC_TIMESTAMP,
				${req.doStop_Id ? req.doStop_Id : null},
                ${req.fileURL ? this.db.connection.escape(req.fileURL) : null}
			)
		`)
	};

	public async saveWOStopNotes(req : any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'woStops_Id',
			'description',
			'notesDateTime',
			'doStop_Id',
			'fileURL',
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
		if (text && req.woStopNotesId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    wostopnotes
                SET
                    ${text}
                WHERE
                    Id = ${req.woStopNotesId}
            `);
		} else {
			return null
		}
	}

	public async getWOStopNotesbyWOStopId(woStopsId: number): Promise<any> {
		return this.databaseget.query(`
			CALL getWOStopNotesbyWOStopId_snew(
				${woStopsId}	
			);
		`)
	}
}
export default WOStopNotesService;