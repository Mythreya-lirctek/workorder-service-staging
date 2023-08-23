import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class COStopService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public async addCoStop(req: any): Promise<any> {
		return this.db.query(`
			INSERT 
				INTO
					costops(
						CustomerOrder_Id, Contact_Id, Status_Id, StopNumber, StopType, PONumber, 
						IsAppRequired, SealNumber, FromDate, FromTime, ToDate, ToTime, LumperFee, 
						Notes, Temperature, createdAt, createdUserId, 
						AppNumber, CORelay_Id,checkInTime,checkOutTime,isCOStop
					)
				VALUES(
					${req.customerOrder_Id ? req.customerOrder_Id : null},
					${req.contact_Id ? req.contact_Id : null},
					${req.status_Id ? req.status_Id : null},
					${req.stopNumber ? req.stopNumber : null},
					${req.stopType ? this.db.connection.escape(req.stopType) : null},
					${req.poNumber ? this.db.connection.escape(req.poNumber) : null},
					${req.apptRequired ? req.apptRequired : 0},
					${req.sealNumber ? this.db.connection.escape(req.sealNumber) : null},
					${req.fromDate ? this.db.connection.escape(req.fromDate) : null},
					${req.fromTime ? this.db.connection.escape(req.fromTime) : null},
					${req.toDate ? this.db.connection.escape(req.toDate) : null},
					${req.toTime ? this.db.connection.escape(req.toTime) : null},
					${req.lumperFee ? req.lumperFee : null},
					${req.notes ? this.db.connection.escape(req.notes) : null},
					${req.temperature ? this.db.connection.escape(req.temperature) : null},
					UTC_TIMESTAMP,					
					${req.userId ? req.userId : null},
					${req.appNumber ? this.db.connection.escape(req.appNumber) : null},
					${req.coRelay_Id ? req.coRelay_Id : null},
                    ${req.checkInTime ? this.db.connection.escape(req.checkInTime) : null},
                    ${req.checkOutTime ? this.db.connection.escape(req.checkOutTime) : null},
					${req.isCOStop}  
				)
		`)
	}
	
	public async saveCOStop(req: any): Promise<any> {
		let text = '';
		const coFields: any = ['contact_Id',
		'status_Id',
		'stopNumber',
		'stopType',
		'poNumber',
		'isAppRequired',
		'sealNumber',
		'fromDate',
		'fromTime',
		'toDate',
		'toTime',
		'lumperFee',
		'notes',
		'coRelay_Id',
		'temperature',
		'isDeleted','checkInTime','checkOutTime','appNumber', 'eta', 'arrivedDate', 'leftDate','isCOStop'];
		Object.keys(req).map((key) => {
			if (coFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.coStopId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    costops
                SET
                    ${text}
                WHERE
                    Id = ${req.coStopId}
            `);
		}
	}	
	
	public getCOStopDetailsById(coStopId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
		SELECT
		wos.id,
		wos.stopNumber,
		wos.poNumber,
		wos.stopType,
		wos.sealNumber,
		c.Name facilityName,
		 DATE_FORMAT(wos.FromDate,"%Y-%m-%d %h:%i %p") fromDate,
		if(wos.ToDate,DATE_FORMAT(wos.ToDate,"%Y-%m-%d %h:%i %p"),'') toDate,
		if(wos.FromTime,DATE_FORMAT(wos.FromTime,"%Y-%m-%d %h:%i %p"),'') fromTime,
		if(wos.ToTime,DATE_FORMAT(wos.ToTime,"%Y-%m-%d %h:%i %p"),'') toTime,
		if(wos.ArrivedDate,DATE_FORMAT(wos.ArrivedDate,"%Y-%m-%d %h:%i %p"),'') arrivedDate,
		if(wos.LoadedORUnLoadedDate,DATE_FORMAT(wos.LoadedORUnLoadedDate,"%Y-%m-%d %h:%i %p"),'') loadedORUnLoadedDate,
		CONCAT(a.City,', ',a.State) location, 
		a.address1,
		a.address2,
		a.zip,
		 sum(wsi.Pallets) pallets,
		 sum(wsi.PieceCount) pieceCount,
		 sum(wsi.Length) length,
		 sum(wsi.Weight) weight,
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
		if(wos.checkInTime,DATE_FORMAT(wos.checkInTime,"%Y-%m-%d %h:%i %p"),'') checkInTime,
		if(wos.checkOutTime,DATE_FORMAT(wos.checkOutTime,"%Y-%m-%d %h:%i %p"),'') checkOutTime,
		if(wos.eta,DATE_FORMAT(wos.eta,"%Y-%m-%d %h:%i %p"),'') eta,
		if(wos.leftDate,DATE_FORMAT(wos.leftDate,"%Y-%m-%d %h:%i %p"),'') leftDate,
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
                                                  '"height":',
                                                  if(wsi.Height is not null,wsi.Height,0),
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
												  c.contactPerson
		from costops wos 
		left join costopitems wsi on wsi.COStops_Id = wos.Id and wsi.isdeleted = 0
		LEFT JOIN contact c on c.Id = wos.Contact_Id
		left join address a on a.Id = c.Address_Id
		where wos.Id =${coStopId}
		`);
	}
		
	public async getStopsbyCOIdRelayId(req: any): Promise<any> {
		return this.databaseget.query(`
		select
		dos.id coStopId,
		c.Name facility,
		a.address1,
		a.address2,
		a.city,
		a.state,
		a.zip,
		c.Phone facilityPhone,
		sum(dosi.Pallets) pallets,
		sum(dosi.PieceCount) pieceCount,
		sum(dosi.Length) length,
		sum(dosi.Weight) weight,
		group_concat(concat(dosi.Commodity)) commodity,
		dos.temperature,
		dos.stopNumber,
		dos.stopType,
		date_format(dos.fromDate,'%m/%d/%Y') fromDate,
		date_format(dos.fromTime,'%m/%d/%Y %H:%i:%s') fromTime,
		date_format(dos.toDate,'%m/%d/%Y') toDate,
		date_format(dos.toTime,'%m/%d/%Y %H:%i:%s') toTime
		from costops dos
		left join contact c on c.Id = dos.contact_Id
		left join address a on a.Id = c.Address_Id
		left join costopitems dosi on dosi.costops_Id = dos.Id
		where dos.customerorder_Id = ${req.co_Id} ${req.coRelay_Id ? `and dos.CORelay_Id = ${req.coRelay_Id}` : ''} and dos.isdeleted = 0 group by dos.Id order by dos.stopNumber`
		);
	}
	
	public getCOStopsByCOId(customerOrderId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL getCOStopsByCOId_snew(${customerOrderId}
			);
		`);
	}
	public getStopsWithStopItemsByCoId(req: any): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL getStopsWithStopItemsByCoId(
			    ${req.companyId},
				${req.customerOrder_Id ? req.customerOrder_Id : null},
				${req.coRelay_Id ? req.coRelay_Id : null}
			);
		`);
	}

	public copyWoStopToCoStop(woStopId: number,coId:number): Promise<any> {
		return this.db.query(`
            INSERT INTO costops(CustomerOrder_Id,
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
                                Status_Id,
                                createdAt,
                                updatedAt,
                                updatedUserId,
                                createdUserId,
                                Notes,
                                Temperature,
                                LumperFee)
            SELECT ${coId},
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
                   Status_Id,
                   createdAt,
                   updatedAt,
                   updatedUserId,
                   createdUserId,
                   Notes,
                   Temperature,
                   wostops.LumperFee
            FROM wostops
            WHERE wostops.Id = ${woStopId};
		`);
	}
} 

export default COStopService;