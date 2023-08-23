import Database from '../database/database';

class ActivityLogService {
	private db: Database;
	constructor() {
		this.db = new Database();
	}

	public async addActivityLog(req: any): Promise<any> {
		return this.db.query(`
            INSERT INTO activitylog(Module,Module_Id,Description,ActivityType,DeviceType,createdAt,createdUserId)
            Values(
                ${this.db.connection.escape(req.module)},
                ${req.module_Id}, 
                ${req.description ? this.db.connection.escape(req.description) : null},
                ${req.activityType ? this.db.connection.escape(req.activityType) : null},
                ${req.deviceType ? this.db.connection.escape(req.deviceType) : this.db.connection.escape('Web')},
                UTC_TIMESTAMP,
                ${req.userId ? req.userId : null}
            )
        `);
	}
}
export default ActivityLogService;