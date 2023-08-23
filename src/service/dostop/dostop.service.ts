import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class DOStopService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public addDOStop(stop: any): Promise<any> {
		return this.db.query(`
			INSERT INTO dostops(
				DispatchOrder_Id,
                WOStops_Id,
                Pallets,
                PieceCount,
                stopNumber,
                Relay_Id,
                ArrivedDate,
				LoadedORUnLoadedDate,
                ETA,
                delayReason,
                Weight,
                Commodity,
                Temperature,
                AvailableLoad_Id,
                FromDate,
                FromTime,
                ToDate,
                ToTime,
				RunningLate,
				createdat,
				createduserId                
			)
			VALUES (
				${stop.dispatchOrder_Id},
				${stop.woStops_Id},
				${stop.pallets ? stop.pallets : 0},
				${stop.pieceCount ? stop.pieceCount : 0},
				${stop.stopNumber},
                ${stop.relay_Id ? stop.relay_Id : null},
                ${stop.arrivedDate ? this.db.connection.escape(stop.arrivedDate) : null},
				${stop.loadedOrUnloadedDate ? this.db.connection.escape(stop.loadedOrUnloadedDate) : null},
                ${stop.eta ? this.db.connection.escape(stop.eta) : null},
                ${stop.delayReason ? this.db.connection.escape(stop.delayReason) : null},
                ${stop.weight ? this.db.connection.escape(stop.weight) : null},
                ${stop.commodity ? this.db.connection.escape(stop.commodity) : null},
                ${stop.temperature ? this.db.connection.escape(stop.temperature) : null},
                ${stop.availableLoad_Id ? this.db.connection.escape(stop.availableLoad_Id) : null},
                ${stop.fromDate ? this.db.connection.escape(stop.fromDate) : null},
                ${stop.fromTime ? this.db.connection.escape(stop.fromTime) : null},
                ${stop.toDate ? this.db.connection.escape(stop.toDate) : null},
                ${stop.toTime ? this.db.connection.escape(stop.toTime) : null},
				${stop.runningLate ? this.db.connection.escape(stop.runningLate) : 0},
				UTC_TIMESTAMP,
				${stop.userId}
			)
		`);
	}
	
	public async saveDOStop(req : any): Promise<any> {
		let text = '';
		const stopFields: any = [
			'dispatchOrder_Id', 'woStops_Id','stopNumber', 'pallets', 'pieceCount', 'relay_Id','arrivedDate', 'loadedORUnLoadedDate', 'eta', 'delayReason', 'weight', 'commodity', 'availableLoad_Id', 'temperature', 'fromDate','fromTime', 'toDate','toTime', 'runningLate','isDeleted',
				'checkInTime', 'checkOutTime', 'leftDate'];
		Object.keys(req).map((key) => {
			if (stopFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.doStopId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    dostops
                SET
                    ${text}
                WHERE
                    Id = ${req.doStopId}
            `);
		} else if (text && req.woStopId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    dostops
                SET
                    ${text}
                WHERE
				woStops_Id = ${req.woStopId}
            `);
		} else {
			return null
		}
	}
	
	public async getDOStopsByRelayId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDOStopsByRelayId_snew(${req.relay_Id})`
		);
	}
	
	public async getDOStopsByDOId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDOStopsByDOId_snew(${req.do_Id})`
		);
	}
	
	public async getDOStopInfoByDOStopId(doStopId: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDOStopInfoByDOStopId_snew(${doStopId})`
		);
	}

	public async getDoStopsbyDOIdRelayId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDoStopsbyDOIdRelayId_snew(${req.doId}, ${req.relay_Id})`
		);
	}
	
	public async getStopsbyDOIdRelayId(req: any): Promise<any> {
		return this.databaseget.query(`
		select
		dos.id doStopId,
		c.Name facility,
		a.address1,
		a.address2,
		a.city,
		a.state,
		a.zip,
		c.Phone facilityPhone,
		sum(wosi.Pallets) pallets,
		sum(wosi.PieceCount) pieceCount,
		sum(wosi.Length) length,
		sum(wosi.Weight) weight,
		group_concat(concat(wosi.Commodity)) commodity,
		wos.temperature,
		dos.stopNumber,
		wos.stopType,
		date_format(dos.fromDate,'%m/%d/%Y') fromDate,
		date_format(dos.fromTime,'%m/%d/%Y %H:%i:%s') fromTime,
		date_format(dos.toDate,'%m/%d/%Y') toDate,
		date_format(dos.toTime,'%m/%d/%Y %H:%i:%s') toTime
		from dostops dos
		left join wostops wos on wos.Id = dos.WoStops_Id
		left join contact c on c.Id = wos.contact_Id
		left join address a on a.Id = c.Address_Id
		left join wostopitems wosi on wosi.wostops_Id = wos.Id
		where dos.Dispatchorder_Id = ${req.do_Id} ${req.relay_Id ? `and dos.Relay_Id = ${req.relay_Id}` : ' and dos.relay_Id is null '} and dos.isdeleted = 0 and wos.isdeleted = 0 group by dos.Id order by dos.stopNumber`
		);
	}
} 

export default DOStopService;