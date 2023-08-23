import Database from '../database/database';

class CoStopItemService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public addLoadTenderCOStopItem(req: any): Promise<any> {

		if (req.PackagingUnit === 'Cases'){
			req.pieceCount = req.PackagingUnitCount
			req.pallets = 0
		} else {
			req.pallets = req.PackagingUnitCount
			req.pieceCount = 0
		}

		return this.db.query(`
			INSERT INTO costopitems(
				COStops_Id, 
				ItemNumber, 
				Commodity, 
				Weight, 
				Length, 
				Pallets, 
				PieceCount,         
				createdUserId, 
				createdAt,
				PONumber, 
				CONumber,
                linkedCOStops_Id,
                linkedCOSI_Id,
				Height                  
			)
			VALUES (        
				${req.coStops_Id},
				${req.ItemNum ? this.db.connection.escape(req.ItemNum) : null},
				${req.Desc ? this.db.connection.escape(req.Desc) : null},
				${req.Weight ? req.Weight : 0},
				${req.Length ? req.Length : 0},
				${req.pallets ? req.pallets : 0},
				${req.pieceCount ? req.pieceCount : 0},
				${req.userId},
				UTC_TIMESTAMP,
				${req.poNumber ? this.db.connection.escape(req.poNumber) : null},
				${req.coNumber ? this.db.connection.escape(req.coNumber) : null},
                ${req.linkedCOStops_Id ? req.linkedCOStops_Id : null},
                ${req.linkedCOSI_Id ? req.linkedCOSI_Id : null},
				${req.Height ? req.Height : 0}
			)
		`);
	}
	
	public addCOStopItem(req: any): Promise<any> {
		return this.db.query(`
			INSERT INTO costopitems(
				COStops_Id, 
				ItemNumber, 
				Commodity, 
				Weight, 
				Length, 
				Pallets, 
				PieceCount,         
				createdUserId, 
				createdAt,
				PONumber, 
				CONumber,
                linkedCOStops_Id,
                linkedCOSI_Id,
				Height                  
			)
			VALUES (        
				${req.coStops_Id},
				${req.itemNumber ? this.db.connection.escape(req.itemNumber) : null},
				${req.commodity ? this.db.connection.escape(req.commodity) : null},
				${req.weight ? req.weight : 0},
				${req.length ? req.length : 0},
				${req.pallets ? req.pallets : 0},
				${req.pieceCount ? req.pieceCount : 0},
				${req.userId},
				UTC_TIMESTAMP,
				${req.poNumber ? this.db.connection.escape(req.poNumber) : null},
				${req.coNumber ? this.db.connection.escape(req.coNumber) : null},
                ${req.linkedCOStops_Id ? req.linkedCOStops_Id : null},
                ${req.linkedCOSI_Id ? req.linkedCOSI_Id : null},
				${req.height ? req.height : 0}
			)
		`);
	}

	public async saveCOStopItem(req : any): Promise<any> {
		let text = '';
		const stopFields: any = [
			'coStops_Id', 'itemNumber', 'commodity', 'weight', 'length', 'pallets', 'pieceCount', 'poNumber', 'coNumber', 'orderNumber','isDeleted','linkedCOStops_Id','linkedCOSI_Id', 'height'];
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
		if (text && req.coStopItemId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                costopitems
                SET
                    ${text}
                WHERE
                    Id = ${req.coStopItemId}
            `);
		} else {
			return null
		}
	}

	public getCOStopItemsByCOId(cutomerOrderId: number): Promise<any> {
		return this.databaseget.query(`
		SELECT
		wsi.id,
		wsi.coStops_Id,
		wsi.itemNumber,
		wsi.commodity,
		wsi.weight,
		wsi.length,
		wsi.pallets,
		wsi.pieceCount,
		wsi.poNumber,
		wsi.coNumber,
		wsi.orderNumber
		from costops wos 
		right join costopitems wsi on wsi.COStops_Id = wos.Id and wsi.isdeleted = 0
		where wos.customerOrder_Id =${cutomerOrderId} and wos.Isdeleted = 0
		group by wsi.id
		`);
	}

	public copyWoStopItemsToCoStopItems(woStopId: number,coStopId:number): Promise<any> {
		return this.db.query(`
            INSERT INTO costopitems(COStops_Id,
                                    ItemNumber,
                                    Commodity,
                                    Weight,
                                    Length,
                                    Pallets,
                                    PieceCount,
                                    PONumber,
                                    CONumber)
            SELECT ${coStopId},
                   wos.ItemNumber,
                   wos.Commodity,
                   wos.Weight,
                   wos.Length,
                   wos.Pallets,
                   wos.PieceCount,
                   wos.PONumber,
                   wos.CONumber
            FROM wostops
                     LEFT JOIN wostopitems wos
                               ON wostops.Id = wos.WOStops_Id
            WHERE wostops.Id = ${woStopId};
		`);
	}

} 

export default CoStopItemService;