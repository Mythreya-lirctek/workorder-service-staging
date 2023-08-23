import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class WOStopService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public addStop(stop: any): Promise<any> {
		return this.db.query(`
			INSERT INTO wostops(
				WorkOrder_Id,
				StopNumber,
				StopType,
				PONumber,
				IsAppRequired,
				AppNumber,
				SealNumber,
				Contact_Id,
				FromDate,
				FromTime,
				ToDate,
				ToTime,
				ArrivedDate,
				LoadedORUnLoadedDate,
				ETA,
				LumperFee,
				Status_Id,
				LumperPaidBy,
				createdAt,
				createdUserId,
				Notes,
				RPType,
				Temperature,
				BlanketNumber,
				BlanketRelNumber,
				FCFS,
				isSealRequired
			)
			VALUES (
				${stop.workOrder_Id ? stop.workOrder_Id : null},
				${stop.stopNumber},
				${this.db.connection.escape(stop.stopType)},
				${stop.poNumber ?  this.db.connection.escape(stop.poNumber) : null},
				${stop.isAppRequired ? stop.isAppRequired : 0},
				${stop.appNumber ? this.db.connection.escape(stop.appNumber) : null},
				${stop.sealNumber ? this.db.connection.escape(stop.sealNumber) : null},
				${stop.contact_Id},
				${stop.fromDate ? this.db.connection.escape(stop.fromDate) : null},
				${stop.fromTime ? this.db.connection.escape(stop.fromTime) : null},
				${stop.toDate ? this.db.connection.escape(stop.toDate) :  null},
				${stop.toTime ? this.db.connection.escape(stop.toTime) : null},
				${stop.arrivedDate ? this.db.connection.escape(stop.arrivedDate) : null},
				${stop.loadedOrUnloadedDate ? this.db.connection.escape(stop.loadedOrUnloadedDate) : null},
				${stop.eta ? this.db.connection.escape(stop.eta) : null},
				${stop.lumperFee ? stop.lumperFee : null},
				${stop.status_Id ? stop.status_Id : null},
				${stop.lumperPaidBy ? this.db.connection.escape(stop.lumperPaidBy) : null},
				UTC_TIMESTAMP,
				${stop.userId},
				${stop.notes ? this.db.connection.escape(stop.notes) : null},
				${stop.rpType ? this.db.connection.escape(stop.rpType) : null},
				${stop.temperature ? this.db.connection.escape(stop.temperature) : null},
				${stop.blanketNumber ? this.db.connection.escape(stop.blanketNumber) : null},
				${stop.blanketRelNumber ? this.db.connection.escape(stop.blanketRelNumber) : null},
				${stop.fcfs ?  stop.fcfs : null},
				${stop.isSealRequired ?  stop.isSealRequired : 0}
			)
		`);
	}
	
	public async saveWOStop(req : any): Promise<any> {
		let text = '';
		const stopFields: any = [
			'workOrder_Id', 'stopNumber', 'stopType', 'poNumber', 'isAppRequired', 'appNumber', 'sealNumber', 'contact_Id', 'fromDate', 'fromTime', 'toDate', 'toTime', 'arrivedDate', 'loadedORUnLoadedDate', 'eta', 'delayReason', 'lumperFee','notes','rpType','temperature','blanketNumber','blanketRelNumber','runningLate','fcfs','dateTimeChangedBy','isDeleted', 'isSealRequired',
			'checkInTime', 'checkOutTime', 'leftDate','hasDetention','detentionDuration'];
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
		if (text && req.woStopId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    wostops
                SET
                    ${text}
                WHERE
                    Id = ${req.woStopId}
            `);
		} else {
			return null
		}
	}
  
	public getStopsByWOId(workOrderId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL getStopsByWOId_snew(${workOrderId}
			);
		`);
	}
	public getStopsWithStopItemsByWoId(req: any): Promise<DatabaseResponse> {
		return this.databaseget.query(`
		
			CALL getStopsWithStopItemsByWoId(
			${req.companyId}, 
			${req.woId}
			);
		`);
	}
	
	public getWOStopDetailsById(woStopId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
		SELECT
		wos.id,
		wos.stopNumber,
		wos.poNumber,
		wos.stopType,
		wos.appNumber,
		wos.sealNumber,
		c.Name facilityName,
		wos.fcfs,
		 DATE_FORMAT(wos.FromDate,"%Y-%m-%d %h:%i %p") fromDate,
		if(wos.ToDate is not null and wos.ToDate != '0000-00-00 00:00:00',DATE_FORMAT(wos.ToDate,"%Y-%m-%d %h:%i %p"),'') toDate,
		if(wos.FromTime is not null and wos.FromTime != '0000-00-00 00:00:00',DATE_FORMAT(wos.FromTime,"%Y-%m-%d %h:%i %p"),'') fromTime,
		if(wos.ToTime is not null and wos.ToTime != '0000-00-00 00:00:00',DATE_FORMAT(wos.ToTime,"%Y-%m-%d %h:%i %p"),'') toTime,
		if(wos.ArrivedDate is not null and wos.ArrivedDate != '0000-00-00 00:00:00',DATE_FORMAT(wos.ArrivedDate,"%Y-%m-%d %h:%i %p"),'') arrivedDate,
		if(wos.LoadedORUnLoadedDate is not null and wos.LoadedORUnLoadedDate != '0000-00-00 00:00:00',DATE_FORMAT(wos.LoadedORUnLoadedDate,"%Y-%m-%d %h:%i %p"),'') loadedORUnLoadedDate,
		CONCAT(a.City,', ',a.State) location, 
		a.address1,
		a.address2,
		a.zip,
		 sum(wsi.Pallets) pallets,
		 sum(wsi.PieceCount) pieceCount,
		 sum(wsi.Length) length,
		 sum(wsi.Weight) weight,
		if(wos.ETA is not null and wos.ETA != '0000-00-00 00:00:00',DATE_FORMAT(wos.ETA,"%Y-%m-%d %h:%i %p"),'') eta,
		wos.delayReason,
		wos.lumperFee,
		wos.lumperPaidBy,
		wos.notes,
		group_concat(concat(wsi.Commodity,' ')) commodity,
		wos.temperature,
		wsi.itemNumber,
		wos.isAppRequired,
		wos.Contact_Id contact,
		if(wos.Stoptype='pickup',c.ShippingHours,c.Receivinghours) shippingHours,
		if(wos.Stoptype='pickup',if(c.ShippingPhone is not null, c.ShippingPhone,c.Phone),if(c.ReceivingPhone is not null, c.ReceivingPhone,c.Phone) ) phone,
		wos.appNumber,
		group_concat(DISTINCT concat('{"id":',
										wsi.id,
									',"itemNumber":"',
												  if(wsi.ItemNumber is not null,wsi.ItemNumber,''),
												  '",',
												  '"stopsId":',
												  if(wos.Id is not null,wos.Id,0),
												  ',',
												  '"commodity":"',
												  if(wsi.Commodity is not null,wsi.Commodity,''),
												  '",',
												  '"weight":',
												  if(wsi.Weight is not null,wsi.Weight,0),
												  ',',
												  '"length":',
												  if(wsi.Length is not null,wsi.Length,0),
												  ',',
												  '"pallets":',
												 if(wsi.Pallets is not null,wsi.Pallets,0),
												  ',',
												  '"pieceCount":',
												  if(wsi.PieceCount is not null,wsi.PieceCount,0),
												  ',',
												  '"temperature":"',
												  if(wos.Temperature is not null,wos.Temperature,''),
												  '",',
												  '"poNumber":"',
												  if(wsi.PONumber IS NOT NULL,
													   wsi.PONumber,
												   ''),
													'",',
													'"coNumber":"',
													if(wsi.CONumber IS NOT NULL,
													wsi.CONumber,
													  ''),
													 '","orderNumber":',
													 wsi.OrderNumber,
												  '}')) stopItems,
												  wos.rpType,
												  wos.blanketNumber,
												  wos.blanketRelNumber,
												  wos.isSealRequired,
												  c.contactPerson,
												  wos.dateTimeChangedBy
		from wostops wos 
		left join wostopitems wsi on wsi.WOStops_Id = wos.Id and wsi.isdeleted = 0
		LEFT JOIN contact c on c.Id = wos.Contact_Id
		left join address a on a.Id = c.Address_Id
		where wos.Id =${woStopId}
		`);
	}
	
	public getWOStopstoAddDOStops(workOrderId: number) : Promise<DatabaseResponse> {
		return this.databaseget.query(`SELECT
		wos.id woStops_Id,
		wos.stopNumber,
		wos.fromDate,
		wos.toDate,
		wos.fromTime,
		wos.toTime,
		wos.arrivedDate,
		wos.loadedORUnLoadedDate,
		 sum(wsi.Pallets) pallets,
		 sum(wsi.PieceCount) pieceCount,
		 sum(wsi.Length) length,
		 sum(wsi.Weight) weight,
		if(wos.ETA,wos.ETA,'') eta,
		group_concat(concat(wsi.Commodity,' ')) commodity,
		wos.temperature
		
		from wostops wos 
		left join wostopitems wsi on wsi.WOStops_Id = wos.Id
		where wos.workorder_Id = ${workOrderId}
		group by wos.Id`);
	}
} 

export default WOStopService;