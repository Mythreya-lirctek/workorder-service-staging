import Database from '../database/database';
import { DatabaseResponse } from '../database/database.interface';

class WOStopItemService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public addWOStopItemForLoadTender(req: any, i : number): Promise<any> {

		if (req.PackagingUnit === 'Cases'){
			req.pieceCount = req.PackagingUnitCount
			req.pallets = 0
		} else {
			req.pallets = req.PackagingUnitCount
			req.pieceCount = 0
		}

		return this.db.query(`
			INSERT INTO wostopitems(
				WOStops_Id,
				ItemNumber,
				Commodity,
				Weight,
				Length,
				Pallets,
				PieceCount,
				PONumber,
				CONumber,
                OrderNumber,
                createdAt,
                createdUserId,
				LinkedWOStops_Id,
				linkedWOSI_Id
			)
			VALUES (
				${req.woStops_Id},
				${req.ItemNum ? this.db.connection.escape(req.ItemNum) : null},
				${req.Desc ? this.db.connection.escape(req.Desc) : null},
				${req.Weight ? req.Weight : 0},
				${req.Length ? req.Length : 0},
				${req.pallets ? req.pallets : 0},
				${req.pieceCount ? req.pieceCount : 0},
				${req.PONumber ? this.db.connection.escape(req.PONumber) : null},
				${req.CONumber ? this.db.connection.escape(req.CONumber) : null},
				${i},
				UTC_TIMESTAMP,
				${req.userId},
				${req.linkedWOStops_Id ? req.linkedWOStops_Id : null},
				${req.linkedWOSI_Id ? req.linkedWOSI_Id : null}
			)
		`);
	}

	public addWOStopItem(req: any): Promise<any> {
		return this.db.query(`
			INSERT INTO wostopitems(
				WOStops_Id,
				ItemNumber,
				Commodity,
				Weight,
				Length,
				Pallets,
				PieceCount,
				PONumber,
				CONumber,
                OrderNumber,
                createdAt,
                createdUserId,
				LinkedWOStops_Id,
				linkedWOSI_Id
			)
			VALUES (
				${req.woStops_Id},
				${req.itemNumber ? this.db.connection.escape(req.itemNumber) : null},
				${req.commodity ? this.db.connection.escape(req.commodity) : null},
				${req.weight ? req.weight : 0},
				${req.length ? req.length : 0},
				${req.pallets ? req.pallets : 0},
				${req.pieceCount ? req.pieceCount : 0},
				${req.poNumber ? this.db.connection.escape(req.poNumber) : null},
				${req.coNumber ? this.db.connection.escape(req.coNumber) : null},
				${req.orderNumber},
				UTC_TIMESTAMP,
				${req.userId},
				${req.linkedWOStops_Id ? req.linkedWOStops_Id : null},
				${req.linkedWOSI_Id ? req.linkedWOSI_Id : null}
			)
		`);
	}
	
	public async saveWOStopItem(req : any): Promise<any> {
		let text = '';
		const stopFields: any = [
			'woStops_Id', 'itemNumber', 'commodity', 'weight', 'length', 'pallets', 'pieceCount', 'poNumber', 'coNumber', 'orderNumber','isDeleted','linkedWOStops_Id','linkedWOSI_Id'];
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
		if (text && req.woStopItemId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                wostopitems
                SET
                    ${text}
                WHERE
                    Id = ${req.woStopItemId}
            `);
		} else {
			return null
		}
	}
	
	public getWOStopItemsByWOId(workorderId: number): Promise<any> {
		return this.databaseget.query(`
		SELECT
		wsi.id,
		wsi.woStops_Id,
		wsi.itemNumber,
		wsi.commodity,
		wsi.weight,
		wsi.length,
		wsi.pallets,
		wsi.pieceCount,
		wsi.poNumber,
		wsi.coNumber,
		wsi.orderNumber
		from wostops wos 
		right join wostopitems wsi on wsi.WOStops_Id = wos.Id and wsi.isdeleted = 0
		where wos.workorder_Id =${workorderId} and wos.Isdeleted = 0
		group by wsi.id
		`);
	}
} 

export default WOStopItemService;