import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

export default class WayPointService {
	private database: Database;
	private databaseget: Database;
	constructor() {
		this.database = new Database();
		this.databaseget = new Database(true);
	}

	public addWaypoint(req: any): Promise<any> {
		return this.database.query(`
        Insert Into waypoints(Address_Id,
            OrderNumber,
            Relay_Id,
            DispatchOrder_Id,
            createdAt,
            createdUserId,
            Odometer,
            StopType,
            PickupDate,
            DOStops_Id)
        values(${req.address_Id},
            ${req.orderNumber},
            ${req.relay_Id ? req.relay_Id : null},
            ${req.dispatchOrder_Id},
            UTC_TIMESTAMP,
            ${req.userId},
            ${req.odometer ? req.odometer : null},
            '${req.stopType}',
            '${req.pickupDate}',
            ${req.doStops_Id ? req.doStops_Id : null})
        `)
	}
	
	public async savewaypoint(req: any): Promise<any> {
		let text = '';
		const relayFields: any = [
			'address_Id',
			'orderNumber',
			'relay_Id',
			'dispatchOrder_Id',
			'odometer',
			'stopType',
			'pickupDate',
			'doStops_Id',
			'isDeleted',
			'miles',
			'legMinutes'
		];
		Object.keys(req).map((key) => {
			if (relayFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.database.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		
		if (text && req.waypointId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    waypoints
                SET
                    ${text}
                WHERE
                    Id = ${req.waypointId}
            `);
		} else if (text && req.doStops_Id) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    waypoints
                SET
                    ${text}
                WHERE
                doStops_Id = ${req.doStops_Id}
            `);
		} else {
			return null;
		}
	}	
	
	public async getWaypointsbyDOIdRelayId(req: any): Promise<any> {
		return this.database.query(`
		call getWayPointsByDOIdRelayId_snew(${req.do_Id} ,${req.relay_Id})`
		);
	}
	
	public async updateWaypointsbyWOStops_Id(req: any): Promise<any> {
		return this.database.query(`
		update waypoints set isdeleted = ${req.isDeleted} where dostops_Id IN (select id from dostops where wostops_Id= ${req.woStopId})`
		);
	}

	public async updateWaypointAddress(req: any): Promise<any> {
		return this.database.query(`
		CALL updateWaypointAddress_snew(
			${req.woStops_Id},
			${req.address1 ? this.database.connection.escape(req.address1) : null},
			${req.address2 ? this.database.connection.escape(req.address2) : null},
			${req.city ? this.database.connection.escape(req.city) : null},
			${req.state ? this.database.connection.escape(req.state) : null},
			${req.zip ? this.database.connection.escape(req.zip) : null}
		)`
		);
	}

	public async getWPstopsbyDORelayId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getWPstopsbyDORelayId_snew(
			${req.do_Id},
			${req.relay_Id ? req.relay_Id : null}
		)`
		);
	}

	public async deleteWaypoints(req: any): Promise<any> {
		return this.database.query(`
		CALL deleteWaypoints_snew(
			${req.dispatchOrderId},
			${req.relay_Id ? req.relay_Id : null}
		)`
		);
	}
}