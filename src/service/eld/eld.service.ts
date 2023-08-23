import Database from '../database/database';

export class EldService {

	private db: Database;

	constructor() {
		this.db = new Database(true);
	}

	public getTruckLocationbyTruckId(req: any): Promise<any> {
		return this.db.query(`
		CALL getTruckLocationbyTruckId_snew(
			${req.truck_Id}
			)
		`);
	}

	public getHOSbyDriverId(driverId : string): Promise<any> {
		return this.db.query(`CALL getHOSbyDriverId_snew(${driverId})`);
	}

}